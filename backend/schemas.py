from typing import Literal, Optional, Union

from pydantic import BaseModel, Field, model_validator


ArithmeticTopic = Literal["addition", "subtraction", "multiplication", "division"]
SectionMode = Literal["single", "mixed"]
DigitMode = Literal["strict", "up_to"]
DivisionMode = Literal["exact", "remainder", "decimal"]
AnswerKeyMode = Literal["none", "separate", "inline"]


class TopicModifiers(BaseModel):
    digits: int = Field(2, ge=1, le=5, description="Maximum or exact integer-part digit count.")
    digit_mode: DigitMode = "up_to"
    decimal_places: int = Field(0, ge=0, le=5)
    negative_probability: float = Field(0, ge=0, le=1, description="Independent probability for each operand.")
    allow_negative_answers: bool = False
    division_mode: DivisionMode = "exact"
    answer_rounding: Optional[int] = Field(None, ge=0, le=5)

    @model_validator(mode="after")
    def validate_topic_specific_options(self):
        if self.division_mode == "remainder" and self.decimal_places:
            raise ValueError("Remainder division uses integer operands.")
        if self.division_mode == "remainder" and self.negative_probability:
            raise ValueError("Remainder division currently requires non-negative operands.")
        return self


class TopicSelection(BaseModel):
    topic_id: ArithmeticTopic
    modifiers: TopicModifiers = Field(default_factory=TopicModifiers)


class WorksheetSection(BaseModel):
    mode: SectionMode
    topics: list[TopicSelection] = Field(..., min_length=1, max_length=4)
    page_count: int = Field(1, ge=1, le=50)
    problems_per_page: int = Field(10, ge=1, le=50)

    @model_validator(mode="after")
    def validate_section_mode(self):
        if self.mode == "single" and len(self.topics) != 1:
            raise ValueError("Single-topic sections require exactly one topic instance.")
        if self.mode == "mixed" and len(self.topics) < 2:
            raise ValueError("Mixed sections require at least two topic instances.")
        for topic in self.topics:
            if topic.topic_id != "subtraction" and topic.modifiers.allow_negative_answers:
                raise ValueError("Only subtraction supports negative answers.")
        return self


class WorksheetRequest(BaseModel):
    sections: list[WorksheetSection] = Field(..., min_length=1, max_length=20)
    answer_key_mode: AnswerKeyMode = "none"
    seed: Optional[int] = Field(None, ge=0, le=4_294_967_295)

    @model_validator(mode="after")
    def validate_total_problem_count(self):
        total = sum(section.page_count * section.problems_per_page for section in self.sections)
        if total > 10_000:
            raise ValueError("A worksheet can contain at most 10,000 problems.")
        return self


class GeneratedProblem(BaseModel):
    question: str = Field(max_length=500)
    answer: Union[int, float, str]
    topic: str = Field(default="", max_length=50)
    num1: Optional[float] = Field(None, allow_inf_nan=False)
    num2: Optional[float] = Field(None, allow_inf_nan=False)
    symbol: Optional[Literal["+", "-", "*", "/"]] = None
    display_num1: Optional[str] = Field(None, max_length=40)
    display_num2: Optional[str] = Field(None, max_length=40)
    display_answer: Optional[str] = Field(None, max_length=60)