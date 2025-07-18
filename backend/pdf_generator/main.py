from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet

import io

def create_pdf_worksheet(all_sections_and_problems_data, overall_include_answer_key):
    """
    Generates a PDF worksheet with multiple sections and an optional combined answer key.

    Args:
        all_sections_and_problems_data (list): A list containing dictionaries.
            Each dictionary can be either:
            - A section header: {"type": "section_header", "subject": "...", "topic_name": "...", "problems_per_page": int}
            - A problem: {"question": "...", "answer": "...", "topic": "..."}
        overall_include_answer_key (bool): True if any section requested an answer key.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter,
                            rightMargin=inch/2, leftMargin=inch/2,
                            topMargin=inch/2, bottomMargin=inch/2)
    styles = getSampleStyleSheet()
    story = []

    all_problems_for_answer_key = []

    current_section_problem_counter = 0
    current_problems_per_page_in_section = 0
    is_first_section = True

    for item in all_sections_and_problems_data:
        if item.get("type") == "section_header":
            if not is_first_section:
                story.append(PageBreak())
            is_first_section = False

            section_subject = item.get("subject", "Worksheet")
            section_topic_name = item.get("topic_name", "General Topic")
            current_problems_per_page_in_section = item.get("problems_per_page", 10)

            story.append(Paragraph(f"{section_subject} Worksheet - {section_topic_name}", styles['h1']))
            story.append(Spacer(1, 0.2 * inch))
            current_section_problem_counter = 0 

        else:
            problem = item
            all_problems_for_answer_key.append(problem)
            current_section_problem_counter += 1

            if current_section_problem_counter > 1 and \
               (current_section_problem_counter - 1) % current_problems_per_page_in_section == 0:
                story.append(PageBreak())

            problem_number_in_section = current_section_problem_counter
            story.append(Paragraph(f"{problem_number_in_section}. {problem['question']}", styles['Normal']))
            story.append(Spacer(1, 0.1 * inch))

    if overall_include_answer_key and len(all_problems_for_answer_key) > 0:
        story.append(PageBreak())
        story.append(Paragraph("--- Combined Answer Key ---", styles['h1']))
        story.append(Spacer(1, 0.2 * inch))

        for i, problem in enumerate(all_problems_for_answer_key):
            story.append(Paragraph(f"{i+1}. {problem['answer']}", styles['Normal']))
            story.append(Spacer(1, 0.1 * inch))

    doc.build(story)
    buffer.seek(0)
    return buffer