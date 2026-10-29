from fastapi import FastAPI, HTTPException, Depends, status, Query, Request
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
from typing import Literal, Optional, List, Union
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from sqlalchemy.future import select
from sqlalchemy import func, cast, or_
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import joinedload
from sqlalchemy import and_, Table
from passlib.context import CryptContext
from datetime import datetime, timedelta
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.security.utils import get_authorization_scheme_param
from jose import JWTError, jwt
from starlette.concurrency import run_in_threadpool
import logging
import os
import sys
from pathlib import Path

backend_path = Path(__file__).parent
sys.path.append(str(backend_path))  

from database import get_db
from models import User, Template, user_likes_template, user_favorites_template
from problem_generator.operations import generate_arithmetic_problems
from pdf_generator.main import create_pdf_worksheet

app = FastAPI(
    title="Teacher's Pet API",
    description="API for generating educational worksheets.",
    version="0.1.0"
)

logger = logging.getLogger(__name__)

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

class TemplateBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    settings_json: dict = Field(..., description="JSON representation of worksheet settings")
    is_public: bool = Field(False)
    tags: List[str] = Field(default_factory=list, description="List of predefined tags for the template")

    @field_validator("name")
    @classmethod
    def validate_name(cls, name):
        name = name.strip()
        if not name:
            raise ValueError("Template name cannot be blank.")
        return name

class TemplateCreate(TemplateBase):
    pass

class TemplateUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    settings_json: Optional[dict] = None
    is_public: Optional[bool] = None
    tags: Optional[List[str]] = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, name):
        if name is None:
            raise ValueError("Template name cannot be null.")
        name = name.strip()
        if not name:
            raise ValueError("Template name cannot be blank.")
        return name

    @field_validator("settings_json", "is_public", "tags")
    @classmethod
    def validate_non_nullable_update_fields(cls, value):
        if value is None:
            raise ValueError("This field cannot be null.")
        return value

class TemplateResponse(TemplateBase):
    id: int
    user_id: int
    likes_count: int
    created_at: datetime
    updated_at: datetime

    owner_username: Optional[str] = None

    class Config:
        from_attributes = True

    @classmethod
    def from_orm_with_owner(cls, template_obj: Template, user_obj: Optional[User] = None):
        data = cls.model_validate(template_obj).model_dump()
        if user_obj: 
            data["owner_username"] = user_obj.username
        else:
            data["owner_username"] = None 
        return data

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8, max_length=72)
    email: str = Field(..., description="User's email address")

    @field_validator("password")
    @classmethod
    def validate_password_bytes(cls, password):
        if len(password.encode("utf-8")) > 72:
            raise ValueError("Password must be at most 72 UTF-8 bytes.")
        return password

class UserResponse(BaseModel): 
    id: int
    username: str
    email: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True 

class ProblemModifiers(BaseModel):
    digits: int = Field(1, ge=1, le=5)
    dec: int = Field(0, ge=0, le=5)
    neg: int = Field(0, ge=0, le=4)
    frac: bool = Field(False)

class AnswerModifiers(BaseModel):
    round: int = Field(0, ge=0, le=5)

class ModifierSettings(BaseModel):
    problem: ProblemModifiers = Field(default_factory=ProblemModifiers)
    answer: AnswerModifiers = Field(default_factory=AnswerModifiers)

class GeneratedProblem(BaseModel):
    question: str = Field(max_length=500)
    answer: Union[int, float]
    topic: str = Field(default="", max_length=50)
    num1: Optional[float] = Field(None, allow_inf_nan=False)
    num2: Optional[float] = Field(None, allow_inf_nan=False)
    symbol: Optional[Literal["+", "-", "*", "/"]] = None

class SectionRequest(BaseModel):
    subject: Literal["Arithmetic"]
    topic: list[str] = Field(..., min_length=1, max_length=4)
    page_count: int = Field(..., gt=0, le=50, description="Number of pages for this section.")
    include_answer_key: bool = Field(False, description="Whether to include an answer key for this section.")
    problems_per_page: int = Field(10, gt=0, le=50, description="Number of problems per page for this section.")
    modifiers: ModifierSettings = Field(default_factory=ModifierSettings)
    mixed_problems_data: Optional[list[GeneratedProblem]] = Field(None, max_length=2500)

    @field_validator("topic")
    @classmethod
    def validate_topics(cls, topics):
        valid_topics = {"addition", "subtraction", "multiplication", "division"}
        if topics == ["mixed"]:
            return topics
        if "mixed" in topics or any(topic not in valid_topics for topic in topics):
            raise ValueError("Topics must be supported arithmetic operations.")
        return topics

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY must be configured")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")

async def get_token_optional(request: Request) -> Optional[str]:
    auth = request.headers.get("Authorization")
    if auth:
        scheme, token = get_authorization_scheme_param(auth)
        if scheme.lower() == "bearer":
            return token
    return None

def create_access_token(data: dict, expires_delta: Optional[int] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + timedelta(minutes=expires_delta)
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_user_from_db(db: AsyncSession, username: str):
    result = await db.execute(select(User).filter(User.username == username))
    return result.scalar_one_or_none()

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
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
        if user is None or not user.is_active:
            raise credentials_exception
        return user
    except JWTError:
        raise credentials_exception

async def get_optional_current_user(
    token: Optional[str] = Depends(get_token_optional),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    if token is None:
        return None
    try:
        user = await get_current_user(token=token, db=db)
        return user
    except HTTPException:
        return None
    
async def _handle_template_action(
    template_id: int,
    current_user: User,
    db: AsyncSession,
    action_table: Table,
    action_type: str
):
    template_result = await db.execute(
        select(Template).filter(Template.id == template_id).with_for_update()
    )
    template = template_result.scalar_one_or_none()

    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")

    if not template.is_public and template.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this template")

    user_action_exists = await db.scalar(
        select(action_table).filter(
            and_(action_table.c.user_id == current_user.id, action_table.c.template_id == template_id)
        )
    )

    if user_action_exists:
        await db.execute(
            action_table.delete().where(
                and_(action_table.c.user_id == current_user.id, action_table.c.template_id == template_id)
            )
        )
        if action_type == "like":
            template.likes_count = max(0, template.likes_count - 1)
        await db.commit()
        await db.refresh(template)
        return {"message": f"Template un{action_type}d successfully", "likes_count": template.likes_count}
    else:
        insert_stmt = action_table.insert().values(user_id=current_user.id, template_id=template_id)
        await db.execute(insert_stmt)
        if action_type == "like":
            template.likes_count += 1
        await db.commit()
        await db.refresh(template)
        return {"message": f"Template {action_type}d successfully", "likes_count": template.likes_count}

@app.get("/")
async def root():
    """
    A simple endpoint to check if the API is running.
    """
    return {"status": "ok"}

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

    hashed_password = await run_in_threadpool(pwd_context.hash, user.password)

    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username or email already registered",
        )
    await db.refresh(db_user)

    return db_user

@app.post("/token")
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).filter(User.username == form_data.username))
    user = result.scalar_one_or_none()

    password_matches = user and user.is_active and await run_in_threadpool(
        pwd_context.verify, form_data.password, user.hashed_password
    )
    if not password_matches:
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

@app.get("/templates/me", response_model=List[TemplateResponse])
async def get_my_templates(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Template).filter(Template.user_id == current_user.id).order_by(Template.created_at.desc())
    )
    my_templates = result.scalars().all()
    return [TemplateResponse.from_orm_with_owner(t, current_user) for t in my_templates]

@app.get("/templates/public", response_model=List[TemplateResponse])
async def get_public_templates(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    q: Optional[str] = Query(None, description="Search query for template name or description"),
    tags: Optional[List[str]] = Query(None, description="Filter by list of tags"),
    sort_by: str = Query("created_at", regex="^(created_at|likes_count)$"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
    db: AsyncSession = Depends(get_db),
    #current_user: Optional[User] = Depends(get_optional_current_user)
):
    query = select(Template).options(joinedload(Template.owner)).filter(Template.is_public == True)

    if q: 
        search_pattern = f"%{q.lower()}%"
        query = query.filter(
            (func.lower(Template.name).like(search_pattern)) |
            (func.lower(Template.description).like(search_pattern))
        )

    if tags:
        query = query.filter(cast(Template.tags, JSONB).contains(tags))

    if sort_by == "created_at":
        if sort_order == "desc":
            query = query.order_by(Template.created_at.desc())
        else:
            query = query.order_by(Template.created_at.asc())
    elif sort_by == "likes_count":
        if sort_order == "desc":
            query = query.order_by(Template.likes_count.desc())
        else:
            query = query.order_by(Template.likes_count.asc())

    query = query.offset(skip).limit(limit)

    result = await db.execute(query)
    public_templates = result.scalars().all()

    return [
        TemplateResponse.from_orm_with_owner(t, t.owner) for t in public_templates
    ]

@app.get("/templates/saved", response_model=List[TemplateResponse])
async def get_saved_templates(
    current_user: User = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    q: Optional[str] = Query(None, description="Search query for template name or description"),
    tags: Optional[List[str]] = Query(None, description="Filter by list of tags"),
    sort_by: str = Query("created_at", regex="^(created_at|likes_count)$"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
    db: AsyncSession = Depends(get_db)
):
    query = select(Template).join(user_favorites_template).filter(
        user_favorites_template.c.user_id == current_user.id,
        or_(Template.is_public.is_(True), Template.user_id == current_user.id),
    ).options(joinedload(Template.owner))

    if q:
        search_pattern = f"%{q.lower()}%"
        query = query.filter(
            (func.lower(Template.name).like(search_pattern)) |
            (func.lower(Template.description).like(search_pattern))
        )
    if tags:
        query = query.filter(cast(Template.tags, JSONB).contains(tags))

    if sort_by == "created_at":
        if sort_order == "desc":
            query = query.order_by(Template.created_at.desc())
        else:
            query = query.order_by(Template.created_at.asc())
    elif sort_by == "likes_count":
        if sort_order == "desc":
            query = query.order_by(Template.likes_count.desc())
        else:
            query = query.order_by(Template.likes_count.asc())

    query = query.offset(skip).limit(limit)

    result = await db.execute(query)
    saved_templates = result.scalars().all()

    return [
        TemplateResponse.from_orm_with_owner(t, t.owner) for t in saved_templates
    ]

@app.get("/templates/{template_id}", response_model=TemplateResponse)
async def get_template_by_id(
    template_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    result = await db.execute(
        select(Template).filter(Template.id == template_id)
    )
    template = result.scalar_one_or_none()

    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")

    if not template.is_public and (not current_user or template.user_id != current_user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this template")

    owner_user = None
    if template.user_id:
        owner_user_result = await db.execute(select(User).filter(User.id == template.user_id))
        owner_user = owner_user_result.scalar_one_or_none()

    return TemplateResponse.from_orm_with_owner(template, owner_user)


@app.post("/templates/", response_model=TemplateResponse, status_code=status.HTTP_201_CREATED)
async def create_template(
    template: TemplateCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    db_template = Template(
        user_id=current_user.id,
        name=template.name,
        description=template.description,
        settings_json=template.settings_json,
        is_public=template.is_public,
        likes_count=0,
        tags=template.tags
    )
    db.add(db_template)
    await db.commit()
    await db.refresh(db_template)
    return TemplateResponse.from_orm_with_owner(db_template, current_user)


@app.put("/templates/{template_id}", response_model=TemplateResponse)
async def update_template(
    template_id: int,
    template_update: TemplateUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Template).filter(Template.id == template_id)
    )
    db_template = result.scalar_one_or_none()

    if not db_template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")

    if db_template.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this template")

    update_data = template_update.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(db_template, key, value)

    db_template.updated_at = datetime.utcnow() 

    await db.commit()
    await db.refresh(db_template)

    owner_user_result = await db.execute(select(User).filter(User.id == db_template.user_id))
    owner_user = owner_user_result.scalar_one_or_none()
    return TemplateResponse.from_orm_with_owner(db_template, owner_user)


@app.delete("/templates/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_template(
    template_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Template).filter(Template.id == template_id)
    )
    db_template = result.scalar_one_or_none()

    if not db_template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")

    if db_template.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this template")

    await db.delete(db_template)
    await db.commit()
    return 


@app.post("/templates/{template_id}/like", response_model=dict)
async def like_template(
    template_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await _handle_template_action(template_id, current_user, db, user_likes_template, "like")


@app.post("/templates/{template_id}/favorite", response_model=dict)
async def favorite_template(
    template_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await _handle_template_action(template_id, current_user, db, user_favorites_template, "favorite")


@app.post("/get-problems", response_model=List[dict])
async def get_problems_endpoint(request_data: SectionRequest):
    """
    Generates and returns a list of raw problem dictionaries based on the request, without creating a PDF.
    """
    subject = request_data.subject
    topic_ids = request_data.topic
    if topic_ids == ["mixed"]:
        raise HTTPException(status_code=422, detail="Mixed topics are only valid for worksheet generation.")
    total_problems = request_data.page_count * request_data.problems_per_page
    modifiers = request_data.modifiers.model_dump()

    problems_objects = []
    try:
        if subject == 'Arithmetic':
            problems_objects = await run_in_threadpool(
                generate_arithmetic_problems,
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
    except Exception:
        logger.exception("Raw problem generation failed")
        raise HTTPException(status_code=500, detail="Failed to generate problems.")

@app.post("/generate-worksheet")
async def generate_worksheet_endpoint(requests_list: list[SectionRequest]):
    if not requests_list:
        raise HTTPException(status_code=422, detail="At least one worksheet section is required.")

    if len(requests_list) > 20:
        raise HTTPException(status_code=422, detail="A worksheet can contain at most 20 sections.")

    input_problem_count = sum(
        len(request.mixed_problems_data)
        if request.mixed_problems_data is not None
        else request.page_count * request.problems_per_page
        for request in requests_list
    )
    if input_problem_count > 10_000:
        raise HTTPException(status_code=422, detail="A worksheet can contain at most 10,000 problems.")

    all_problems_data_for_pdf = []
    overall_include_answer_key = False

    for request_data in requests_list:
        modifiers = request_data.modifiers.model_dump()

        # PATH A: Mixed Problems
        if request_data.topic == ["mixed"]:
            if not request_data.mixed_problems_data:
                raise HTTPException(status_code=422, detail="Mixed worksheets require generated problem data.")

            all_problems_data_for_pdf.append({
                "type": "section_header",
                "subject": request_data.subject,
                "topic_name": "Mixed Problems",
                "page_count": request_data.page_count,
                "problems_per_page": request_data.problems_per_page,
                "modifiers": modifiers
            })
            all_problems_data_for_pdf.extend(
                problem.model_dump() for problem in request_data.mixed_problems_data
            )

        # PATH B: Fresh Generation
        else:
            if request_data.mixed_problems_data is not None:
                raise HTTPException(status_code=422, detail="Mixed problem data requires the mixed topic.")

            total_problems = request_data.page_count * request_data.problems_per_page
            
            # Pass our sanitized 'modifiers' dict to your operations logic
            problems_objects = await run_in_threadpool(
                generate_arithmetic_problems,
                request_data.topic, 
                total_problems, 
                modifiers
            )
            
            section_problems_data = [p.to_dict() for p in problems_objects]

            all_problems_data_for_pdf.append({
                "type": "section_header",
                "subject": request_data.subject,
                "topic_name": ", ".join(t.capitalize() for t in request_data.topic),
                "page_count": request_data.page_count,
                "problems_per_page": request_data.problems_per_page,
                "modifiers": modifiers
            })
            all_problems_data_for_pdf.extend(section_problems_data)

        if request_data.include_answer_key:
            overall_include_answer_key = True

    try:
        # Generate the PDF
        pdf_buffer = await run_in_threadpool(
            create_pdf_worksheet,
            all_problems_data_for_pdf,
            overall_include_answer_key,
        )
        pdf_buffer.seek(0)

        return StreamingResponse(
            pdf_buffer, 
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=worksheet.pdf"}
        )

    except Exception:
        logger.exception("Worksheet PDF generation failed")
        raise HTTPException(status_code=500, detail="Failed to generate worksheet PDF.")
    
if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 5000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)