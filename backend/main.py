from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
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
    # "https://www.your-teachers-pet-frontend.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class WorksheetRequest(BaseModel):
    subject: str = Field(..., description="The subject of the worksheet (e.g., 'Arithmetic').")
    topic: list = Field(..., description="The specific topic within the subject (e.g., 'Addition').")
    page_count: int = Field(..., gt=0, description="Number of pages for the worksheet.")
    include_answer_key: bool = Field(False, description="Whether to include an answer key.")
    modifiers: dict = Field({}, description="Dictionary of specific modifiers for problem generation.")

@app.get("/")
async def root():
    """
    A simple endpoint to check if the API is running.
    """
    return {"message": "Teacher's Pet API is running!"}

@app.post("/generate-worksheet")
async def generate_worksheet_endpoint(request_data: WorksheetRequest):
    """
    Generates a customized math worksheet as a PDF.
    """
    subject = request_data.subject
    topic = request_data.topic
    page_count = request_data.page_count
    include_answer_key = request_data.include_answer_key
    modifiers = request_data.modifiers

    num_problems_per_page = 10
    total_problems = page_count * num_problems_per_page

    problems_objects = []
    try:
        if subject == 'Arithmetic':
            problems_objects = generate_arithmetic_problems(topic, total_problems, modifiers)
        else:
            raise HTTPException(status_code=400, detail=f"Subject '{subject}' not supported.")

        problems_data_for_pdf = [p.to_dict() for p in problems_objects]

        pdf_buffer = create_pdf_worksheet(
            problems_data_for_pdf,
            include_answer_key,
            subject,
            topic,
            num_problems_per_page
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