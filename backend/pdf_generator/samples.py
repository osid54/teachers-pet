import argparse
import json
import random
from pathlib import Path

from pdf_generator.main import create_pdf_worksheet
from problem_generator.worksheet import generate_section_problems
from schemas import TopicModifiers, TopicSelection, WorksheetSection


def generate_samples(output_directory):
    output_directory = Path(output_directory)
    output_directory.mkdir(parents=True, exist_ok=True)
    basic = TopicModifiers(digits=2)
    scenarios = [
        ("addition-10", [WorksheetSection(mode="single", topics=[TopicSelection(topic_id="addition", modifiers=basic)],
            page_count=1, problems_per_page=10)], "none"),
        ("dense-50-with-answers", [WorksheetSection(mode="single", topics=[TopicSelection(topic_id="addition",
            modifiers=TopicModifiers(digits=5))], page_count=2, problems_per_page=50)], "separate"),
        ("decimals-negatives", [WorksheetSection(mode="single", topics=[TopicSelection(topic_id="subtraction",
            modifiers=TopicModifiers(digits=5, digit_mode="strict", decimal_places=5,
                negative_probability=0.25, allow_negative_answers=True, answer_rounding=5))],
            page_count=1, problems_per_page=10)], "inline"),
        ("mixed-operations", [WorksheetSection(mode="mixed", topics=[
            TopicSelection(topic_id=topic, modifiers=basic) for topic in
            ("addition", "subtraction", "multiplication", "division")],
            page_count=2, problems_per_page=15)], "separate"),
        ("multiple-sections", [
            WorksheetSection(mode="single", topics=[TopicSelection(topic_id="multiplication", modifiers=basic)],
                page_count=1, problems_per_page=6),
            WorksheetSection(mode="single", topics=[TopicSelection(topic_id="division",
                modifiers=TopicModifiers(digits=2, division_mode="decimal", answer_rounding=2))],
                page_count=1, problems_per_page=6),
        ], "separate"),
    ]
    manifest = []
    for name, sections, answer_key_mode in scenarios:
        data = []
        expected_worksheet_pages = 0
        total_problems = 0
        rng = random.Random(54)
        for section_index, section in enumerate(sections, start=1):
            pages = generate_section_problems(section, rng)
            data.append({"section_number": section_index, "mode": section.mode,
                "topics": [topic.model_dump() for topic in section.topics],
                "page_count": section.page_count, "problems_per_page": section.problems_per_page,
                "pages": [[problem.to_dict() for problem in page] for page in pages]})
            expected_worksheet_pages += section.page_count
            total_problems += section.page_count * section.problems_per_page
        filename = f"{name}.pdf"
        (output_directory / filename).write_bytes(create_pdf_worksheet(data, answer_key_mode).getvalue())
        manifest.append({"file": filename, "worksheet_pages": expected_worksheet_pages,
            "expected_total_pages": expected_worksheet_pages + int(answer_key_mode == "separate"),
            "problem_count": total_problems, "answer_key_mode": answer_key_mode})

    (output_directory / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    (output_directory / "README.txt").write_text(
        "Synthetic PDF review samples, generated without API or database access.\n"
        "See manifest.json for expected page and problem counts.\n"
        "Inspect operand clipping, decimal alignment, operators, writing space, section breaks,\n"
        "question numbering, and matching answer keys. Automated checks do not certify visual quality.\n",
        encoding="utf-8",
    )
    return manifest


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate synthetic worksheet PDFs without a database.")
    parser.add_argument("--output-dir", default="artifacts/pdf-samples")
    arguments = parser.parse_args()
    for sample in generate_samples(arguments.output_dir):
        print(sample["file"])