from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List 
import io

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
    "https://teachers-pet-ashen.vercel.app/",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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


@app.get("/")
async def root():
    """
    A simple endpoint to check if the API is running.
    """
    return {"message": "Teacher's Pet API is running!"}

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