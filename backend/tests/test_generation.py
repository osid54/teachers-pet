import os
import re
import unittest

os.environ["DATABASE_URL"] = "postgresql+asyncpg://test:test@localhost/test"
os.environ["SECRET_KEY"] = "test-only-secret-key"

from pydantic import ValidationError

from main import SectionRequest
from pdf_generator.main import create_pdf_worksheet
from problem_generator.problems import MathProblem


class SectionRequestTests(unittest.TestCase):
    def valid_request(self):
        return {
            "subject": "Arithmetic",
            "topic": ["addition"],
            "page_count": 1,
            "problems_per_page": 10,
        }

    def test_accepts_supported_arithmetic_request(self):
        request = SectionRequest.model_validate(self.valid_request())
        self.assertEqual(request.topic, ["addition"])
        self.assertEqual(request.modifiers.problem.digits, 1)

    def test_rejects_unsupported_topic(self):
        request = self.valid_request()
        request["topic"] = ["geometry"]
        with self.assertRaises(ValidationError):
            SectionRequest.model_validate(request)

    def test_rejects_out_of_range_problem_modifiers(self):
        request = self.valid_request()
        request["modifiers"] = {"problem": {"digits": 0}}
        with self.assertRaises(ValidationError):
            SectionRequest.model_validate(request)

    def test_rejects_invalid_mixed_problem_operator(self):
        request = self.valid_request()
        request["topic"] = ["mixed"]
        request["mixed_problems_data"] = [{
            "question": "1 ? 2",
            "answer": 3,
            "num1": 1,
            "num2": 2,
            "symbol": "?",
        }]
        with self.assertRaises(ValidationError):
            SectionRequest.model_validate(request)


class PdfPaginationTests(unittest.TestCase):
    def test_renders_requested_section_page_count(self):
        section = {
            "type": "section_header",
            "subject": "Arithmetic",
            "topic_name": "Addition",
            "page_count": 2,
            "problems_per_page": 6,
        }
        problems = [
            MathProblem(f"{value} + 1", value + 1, num1=value, num2=1, symbol="+").to_dict()
            for value in range(12)
        ]

        pdf = create_pdf_worksheet([section, *problems], False).getvalue()
        page_count = len(re.findall(rb"/Type\s*/Page\b", pdf))

        self.assertEqual(page_count, 2)


if __name__ == "__main__":
    unittest.main()