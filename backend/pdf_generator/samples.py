import argparse
import json
import random
from pathlib import Path

from pdf_generator.main import create_pdf_worksheet
from problem_generator.operations import generate_arithmetic_problems


def generate_samples(output_directory):
    output_directory = Path(output_directory)
    output_directory.mkdir(parents=True, exist_ok=True)
    scenarios = [
        ("addition-10", [("Addition", ["addition"], 1, 10, {})], False),
        ("dense-50-with-answers", [("Addition", ["addition"], 2, 50,
          {"problem": {"digits": 5}})], True),
        ("decimals-negatives", [("Decimal Subtraction", ["subtraction"], 1, 10,
          {"problem": {"digits": 5, "dec": 5, "neg": 4}, "answer": {"round": 5}})], True),
        ("mixed-operations", [("Mixed Problems", ["addition", "subtraction", "multiplication", "division"], 2, 15,
          {"problem": {"digits": 2}, "answer": {"round": 3}})], True),
        ("multiple-sections", [
            ("Multiplication", ["multiplication"], 1, 6, {"problem": {"digits": 2}}),
            ("Division", ["division"], 1, 6, {"problem": {"digits": 2}, "answer": {"round": 2}}),
        ], True),
    ]
    manifest = []
    random_state = random.getstate()
    try:
        random.seed(54)
        for name, sections, include_answers in scenarios:
            data = []
            expected_worksheet_pages = 0
            total_problems = 0
            for title, topics, page_count, per_page, modifiers in sections:
                data.append({"type": "section_header", "subject": "Arithmetic", "topic_name": title,
                             "page_count": page_count, "problems_per_page": per_page})
                data.extend(problem.to_dict() for problem in generate_arithmetic_problems(
                    topics, page_count * per_page, modifiers))
                expected_worksheet_pages += page_count
                total_problems += page_count * per_page
            filename = f"{name}.pdf"
            (output_directory / filename).write_bytes(create_pdf_worksheet(data, include_answers).getvalue())
            manifest.append({"file": filename, "worksheet_pages": expected_worksheet_pages,
                             "expected_total_pages": expected_worksheet_pages + int(include_answers),
                             "problem_count": total_problems, "answer_key": include_answers})
    finally:
        random.setstate(random_state)

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