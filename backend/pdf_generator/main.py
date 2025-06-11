from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
import io

def create_pdf_worksheet(problems_data, include_answer_key, subject, topic, problems_per_page=10):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    story.append(Paragraph(f"{subject} Worksheet - {topic}", styles['h1']))
    story.append(Spacer(1, 0.2 * inch))

    for i, problem in enumerate(problems_data):
        if i > 0 and i % problems_per_page == 0:
            story.append(Paragraph(f"<br/><br/>--- Page {i // problems_per_page + 1} ---<br/><br/>", styles['Normal'])) # Page break indicator
        story.append(Paragraph(f"{i+1}. {problem['question']}", styles['Normal']))
        story.append(Spacer(1, 0.1 * inch))

    if include_answer_key:
        story.append(Spacer(1, 0.5 * inch))
        story.append(Paragraph("--- Answer Key ---", styles['h2']))
        story.append(Spacer(1, 0.2 * inch))
        for i, problem in enumerate(problems_data):
            story.append(Paragraph(f"{i+1}. {problem['answer']}", styles['Normal']))
            story.append(Spacer(1, 0.1 * inch))

    doc.build(story)
    buffer.seek(0)
    return buffer