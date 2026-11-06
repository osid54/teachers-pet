import os
import random
import re
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

os.environ["DATABASE_URL"] = "postgresql+asyncpg://test:test@localhost/test"
os.environ["SECRET_KEY"] = "test-only-secret-key"

from pydantic import ValidationError
from reportlab.platypus import Paragraph

from schemas import TopicModifiers, TopicSelection, WorksheetHeader, WorksheetRequest, WorksheetSection
from pdf_generator.main import create_pdf_worksheet
from pdf_generator.samples import generate_samples
from problem_generator.worksheet import generate_section_problems, generate_topic_problems


class WorksheetSchemaTests(unittest.TestCase):
    def test_accepts_custom_topic_names_and_optional_instructions(self):
        request = WorksheetRequest.model_validate({"sections": [{"mode": "single", "topics": [{
            "topic_id": "addition", "topic_name": "Warm-up", "instructions": "Show your work.",
        }]}]})
        topic = request.sections[0].topics[0]
        self.assertEqual(topic.topic_name, "Warm-up")
        self.assertEqual(topic.instructions, "Show your work.")
        self.assertEqual(TopicSelection(topic_id="addition").instructions, "")

    def test_instruction_limits_apply_to_headers_sections_and_topics(self):
        for model, values in (
            (WorksheetHeader, {"mode": "header", "title": "Practice"}),
            (WorksheetSection, {"mode": "single", "topics": [{"topic_id": "addition"}]}),
            (TopicSelection, {"topic_id": "addition"}),
        ):
            with self.subTest(model=model.__name__), self.assertRaises(ValidationError):
                model.model_validate({**values, "instructions": "x" * 501})

    def test_preserves_header_order_between_topic_sections(self):
        request = WorksheetRequest.model_validate({
            "sections": [
                {"mode": "single", "topics": [{"topic_id": "addition"}]},
                {"mode": "header", "title": "Fractions and decimals"},
                {"mode": "mixed", "topics": [
                    {"topic_id": "addition"}, {"topic_id": "subtraction"},
                ]},
            ],
        })
        self.assertIsInstance(request.sections[1], WorksheetHeader)
        self.assertEqual(request.sections[1].title, "Fractions and decimals")

    def test_rejects_headers_without_a_following_topic_section(self):
        with self.assertRaises(ValidationError):
            WorksheetRequest.model_validate({"sections": [
                {"mode": "single", "topics": [{"topic_id": "addition"}]},
                {"mode": "header", "title": "End marker"},
            ]})

    def test_accepts_ordered_single_and_mixed_sections(self):
        request = WorksheetRequest.model_validate({
            "answer_key_mode": "inline",
            "seed": 42,
            "sections": [
                {"mode": "single", "topics": [{"topic_id": "addition"}]},
                {"mode": "mixed", "topics": [
                    {"topic_id": "addition"}, {"topic_id": "subtraction"},
                ]},
            ],
        })
        self.assertEqual([section.mode for section in request.sections], ["single", "mixed"])
        self.assertEqual(request.answer_key_mode, "inline")

    def test_rejects_bad_topic_counts_and_options(self):
        invalid_requests = [
            {"sections": [{"mode": "mixed", "topics": [{"topic_id": "addition"}]}]},
            {"sections": [{"mode": "single", "topics": [{"topic_id": "geometry"}]}]},
            {"sections": [{"mode": "single", "topics": [
                {"topic_id": "addition", "modifiers": {"allow_negative_answers": True}},
            ]}]},
        ]
        for request in invalid_requests:
            with self.subTest(request=request), self.assertRaises(ValidationError):
                WorksheetRequest.model_validate(request)
        with self.assertRaises(ValidationError):
            TopicModifiers(division_mode="remainder", decimal_places=2)
        with self.assertRaises(ValidationError):
            TopicModifiers(division_mode="remainder", negative_probability=0.25)


class ArithmeticGenerationTests(unittest.TestCase):
    def test_mixed_quotas_are_balanced_per_page_and_rotate_remainders(self):
        section = WorksheetSection(mode="mixed", topics=[
            TopicSelection(topic_id="addition"), TopicSelection(topic_id="subtraction"),
        ], page_count=2, problems_per_page=3)
        pages = generate_section_problems(section, random.Random(11))
        page_counts = [{topic: sum(problem.topic == topic for problem in page)
            for topic in ("addition", "subtraction")} for page in pages]

        self.assertEqual([sum(counts.values()) for counts in page_counts], [3, 3])
        self.assertEqual(page_counts, [
            {"addition": 2, "subtraction": 1},
            {"addition": 1, "subtraction": 2},
        ])

    def test_strict_digits_preserve_integer_width_and_decimal_places(self):
        modifiers = TopicModifiers(digits=3, digit_mode="strict", decimal_places=2)
        problems = generate_topic_problems("addition", 50, modifiers, random.Random(10))
        self.assertTrue(all(len(item.display_num1.split(".")[0].lstrip("-")) == 3 for item in problems))
        self.assertTrue(all(len(item.display_num1.split(".")[1]) == 2 for item in problems))

    def test_up_to_digits_allows_smaller_integer_parts(self):
        problems = generate_topic_problems("addition", 100,
            TopicModifiers(digits=3, digit_mode="up_to"), random.Random(8))
        self.assertTrue(any(abs(problem.num1) < 100 for problem in problems))

    def test_negative_probability_applies_per_operand(self):
        all_negative = generate_topic_problems("addition", 20,
            TopicModifiers(digits=2, negative_probability=1), random.Random(2))
        none_negative = generate_topic_problems("addition", 20,
            TopicModifiers(digits=2, negative_probability=0), random.Random(2))
        self.assertTrue(all(problem.num1 <= 0 and problem.num2 <= 0 for problem in all_negative))
        self.assertTrue(all(problem.num1 >= 0 and problem.num2 >= 0 for problem in none_negative))

    def test_subtraction_obeys_negative_answer_setting(self):
        positive_only = generate_topic_problems("subtraction", 100,
            TopicModifiers(digits=2), random.Random(3))
        signed = generate_topic_problems("subtraction", 100,
            TopicModifiers(digits=2, allow_negative_answers=True), random.Random(3))
        self.assertTrue(all(problem.answer >= 0 for problem in positive_only))
        self.assertTrue(any(problem.answer < 0 for problem in signed))

    def test_division_modes_are_explicit(self):
        exact = generate_topic_problems("division", 25,
            TopicModifiers(digits=2, division_mode="exact"), random.Random(4))
        remainder = generate_topic_problems("division", 25,
            TopicModifiers(digits=2, division_mode="remainder"), random.Random(5))
        decimal = generate_topic_problems("division", 25,
            TopicModifiers(digits=2, division_mode="decimal", answer_rounding=3), random.Random(6))
        self.assertTrue(all(float(problem.answer).is_integer() for problem in exact))
        self.assertTrue(all(" R " in problem.display_answer for problem in remainder))
        self.assertTrue(all(len(problem.display_answer.partition(".")[2]) == 3 for problem in decimal))


class PdfPaginationTests(unittest.TestCase):
    def test_renders_header_parent_and_topic_instructions_as_literal_text(self):
        sections = [
            {"mode": "header", "title": "Practice", "instructions": "Work independently."},
            {"mode": "mixed", "instructions": "Complete both operations.", "page_count": 1,
                "problems_per_page": 1, "topics": [
                    {"topic_id": "addition", "topic_name": "Sums", "instructions": "Use < and >.\nShow work."},
                    {"topic_id": "subtraction", "instructions": "Check your answer."},
                ], "pages": [[{"question": "1 + 1 =", "answer": 2, "num1": 1, "num2": 1, "symbol": "+"}]]},
        ]
        with patch("pdf_generator.main.Paragraph", wraps=Paragraph) as paragraphs:
            pdf = create_pdf_worksheet(sections, "none").getvalue()
        texts = [call.args[0] for call in paragraphs.call_args_list]
        self.assertIn("Work independently.", texts)
        self.assertIn("Complete both operations.", texts)
        self.assertIn("<b>Sums:</b> Use &lt; and &gt;.<br/>Show work.", texts)
        self.assertIn("<b>Subtraction:</b> Check your answer.", texts)
        self.assertEqual(len(re.findall(rb"/Type\s*/Page\b", pdf)), 1)

    def test_review_samples_have_expected_page_counts(self):
        with tempfile.TemporaryDirectory() as output_directory:
            samples = generate_samples(output_directory)
            self.assertEqual(len(samples), 5)
            for sample in samples:
                with self.subTest(sample=sample["file"]):
                    pdf = (Path(output_directory) / sample["file"]).read_bytes()
                    self.assertTrue(pdf.startswith(b"%PDF-"))
                    self.assertEqual(len(re.findall(rb"/Type\s*/Page\b", pdf)), sample["expected_total_pages"])

    def test_supported_page_densities_do_not_spill_to_extra_pages(self):
        for per_page in (1, 6, 10, 50):
            with self.subTest(problems_per_page=per_page):
                section = {"mode": "single", "topics": [{"topic_id": "addition"}],
                    "page_count": 2, "problems_per_page": per_page,
                    "pages": [[{"question": "12345 + 67890", "answer": 80235, "num1": 12345,
                        "num2": 67890, "symbol": "+"} for _ in range(per_page)] for _ in range(2)]}
                pdf = create_pdf_worksheet([section], "none").getvalue()
                self.assertEqual(len(re.findall(rb"/Type\s*/Page\b", pdf)), 2)

    def test_renders_requested_section_page_count(self):
        section = {"mode": "single", "topics": [{"topic_id": "addition"}], "page_count": 2,
            "problems_per_page": 6, "pages": [
                [{"question": f"{value} + 1", "answer": value + 1, "num1": value, "num2": 1, "symbol": "+"}
                 for value in range(page * 6, page * 6 + 6)] for page in range(2)
            ]}
        pdf = create_pdf_worksheet([section], "none").getvalue()
        page_count = len(re.findall(rb"/Type\s*/Page\b", pdf))

        self.assertEqual(page_count, 2)

    def test_header_before_a_section_does_not_add_a_page(self):
        sections = [
            {"mode": "header", "title": "Number sense"},
            {"mode": "single", "section_number": 1, "topics": [{"topic_id": "addition"}],
                "page_count": 1, "problems_per_page": 1,
                "pages": [[{"question": "1 + 1 =", "answer": 2, "num1": 1, "num2": 1, "symbol": "+"}]]},
        ]
        pdf = create_pdf_worksheet(sections, "none").getvalue()
        self.assertEqual(len(re.findall(rb"/Type\s*/Page\b", pdf)), 1)

    def test_answer_key_modes_preserve_worksheet_pages(self):
        section = {"mode": "single", "topics": [{"topic_id": "addition"}], "page_count": 1,
            "problems_per_page": 6, "pages": [[{"question": "1 + 1 =", "answer": 2,
                "display_answer": "2", "num1": 1, "num2": 1, "symbol": "+"} for _ in range(6)]]}
        for answer_key_mode, expected_pages in (("none", 1), ("inline", 1), ("separate", 2)):
            with self.subTest(answer_key_mode=answer_key_mode):
                pdf = create_pdf_worksheet([section], answer_key_mode).getvalue()
                self.assertEqual(len(re.findall(rb"/Type\s*/Page\b", pdf)), expected_pages)


if __name__ == "__main__":
    unittest.main()