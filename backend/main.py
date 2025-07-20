from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
import io
import os
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from passlib.context import CryptContext
from datetime import datetime, timedelta
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm 
from jose import JWTError, jwt

import sys
from pathlib import Path

backend_path = Path(__file__).parent
sys.path.append(str(backend_path))

from database import get_db
from models import User
from problem_generator.operations import generate_arithmetic_problems
from pdf_generator.main import create_pdf_worksheet

app = FastAPI(
    title="Teacher's Pet API",
    description="API for generating educational worksheets.",
    version="0.1.0"
)

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://teachers-pet-ashen.vercel.app",
    "https://www.teachers-pet.site",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8)
    email: str = Field(..., description="User's email address")

class UserResponse(BaseModel): 
    id: int
    username: str
    email: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True 


class ProblemModifiers(BaseModel):
    digits: int = Field(1, gt=0)
    dec: int = Field(0, ge=0)
    neg: int = Field(0, ge=0, le=4)
    frac: bool = Field(False)

class AnswerModifiers(BaseModel):
    round: int = Field(0, ge=0)

class SectionRequest(BaseModel):
    subject: str = Field(..., description="The subject (e.g., 'Arithmetic').")
    topic: list[str] = Field(..., description="List of specific topic IDs within the subject (e.g., ['addition', 'multiplication']).")
    page_count: int = Field(..., gt=0, description="Number of pages for this section.")
    include_answer_key: bool = Field(False, description="Whether to include an answer key for this section.")
    problems_per_page: int = Field(10, gt=0, description="Number of problems per page for this section.")
    modifiers: dict = Field({}, description="Dictionary of specific modifiers for this section's problem generation.")
    mixed_problems_data: Optional[list[dict]] = Field(None, description="Pre-generated, mixed problem data for a mixed worksheet.")

# CHANGE IN PRODUCTION.
SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-key-that-should-be-at-least-32-chars-long")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def create_access_token(data: dict, expires_delta: Optional[int] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + timedelta(minutes=expires_delta)
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# Helper function to get user from DB
async def get_user_from_db(db: AsyncSession, username: str):
    result = await db.execute(select(User).filter(User.username == username))
    return result.scalar_one_or_none()

# --- NEW: Dependency to get current authenticated user ---
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise credentials_exception
        user = await get_user_from_db(db, username=username)
        if user is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    return user

@app.get("/")
async def root():
    """
    A simple endpoint to check if the API is running.
    """
    return {"message": "Teacher's Pet API is running!"}

@app.post("/register", response_model=UserResponse)
async def register_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).filter(User.username == user.username))
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )

    result = await db.execute(select(User).filter(User.email == user.email))
    existing_email_user = result.scalar_one_or_none()
    if existing_email_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    hashed_password = pwd_context.hash(user.password)

    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)

    return db_user

@app.post("/token")
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).filter(User.username == form_data.username))
    user = result.scalar_one_or_none()

    if not user or not pwd_context.verify(form_data.password, getattr(user, "hashed_password", None)):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = ACCESS_TOKEN_EXPIRE_MINUTES
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.post("/get-problems", response_model=List[dict])
async def get_problems_endpoint(request_data: SectionRequest):
    """
    Generates and returns a list of raw problem dictionaries based on the request, without creating a PDF.
    """
    subject = request_data.subject
    topic_ids = request_data.topic
    total_problems = request_data.page_count * request_data.problems_per_page
    modifiers = request_data.modifiers

    problems_objects = []
    try:
        if subject == 'Arithmetic':
            problems_objects = generate_arithmetic_problems(
                topic_ids,
                total_problems,
                modifiers
            )
        else:
            raise HTTPException(status_code=400, detail=f"Subject '{subject}' not supported for problem generation.")

        problems_data = [p.to_dict() for p in problems_objects]
        return JSONResponse(content=problems_data)

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate raw problems: {str(e)}")

@app.post("/generate-worksheet")
async def generate_worksheet_endpoint(requests_list: list[SectionRequest]):
    """
    Generates a customized math worksheet as a PDF from multiple sections.
    Can handle pre-mixed problems from the frontend.
    """

    all_problems_data_for_pdf = []
    overall_include_answer_key = False

    for request_data in requests_list:
        if request_data.topic == ["mixed"] and request_data.mixed_problems_data is not None:
            section_subject = request_data.subject
            section_topic_name = "Mixed Problems"
            problems_for_section = request_data.mixed_problems_data

            all_problems_data_for_pdf.append({
                "type": "section_header",
                "subject": section_subject,
                "topic_name": section_topic_name,
                "page_count": request_data.page_count,
                "problems_per_page": request_data.problems_per_page,
                "modifiers": request_data.modifiers
            })
            all_problems_data_for_pdf.extend(problems_for_section)

        else:
            subject = request_data.subject
            topic_ids = request_data.topic
            page_count = request_data.page_count
            modifiers = request_data.modifiers
            problems_per_page = request_data.problems_per_page

            total_problems_for_section = page_count * problems_per_page

            problems_objects_for_section = []
            if subject == 'Arithmetic':
                problems_objects_for_section = generate_arithmetic_problems(
                    topic_ids,
                    total_problems_for_section,
                    modifiers
                )
            else:
                raise HTTPException(status_code=400, detail=f"Subject '{subject}' not supported.")

            section_problems_data = [p.to_dict() for p in problems_objects_for_section]

            all_problems_data_for_pdf.append({
                "type": "section_header",
                "subject": subject,
                "topic_name": ", ".join(t.capitalize() for t in topic_ids),
                "page_count": page_count,
                "problems_per_page": problems_per_page,
                "modifiers": modifiers
            })
            all_problems_data_for_pdf.extend(section_problems_data)

        if request_data.include_answer_key:
            overall_include_answer_key = True

    try:
        pdf_buffer = create_pdf_worksheet(
            all_problems_data_for_pdf,
            overall_include_answer_key,
        )

        return StreamingResponse(
            io.BytesIO(pdf_buffer.getvalue()),
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=worksheet.pdf"}
        )

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate worksheet: {str(e)}")