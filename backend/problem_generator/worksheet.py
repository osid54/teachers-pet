import random
from decimal import Decimal, ROUND_HALF_UP

from problem_generator.problems import MathProblem
from schemas import TopicModifiers


class GenerationConstraintError(ValueError):
    pass


def _sample_operand(settings: TopicModifiers, rng: random.Random) -> Decimal:
    scale = 10 ** settings.decimal_places
    minimum_integer = 10 ** (settings.digits - 1) if settings.digit_mode == "strict" and settings.digits > 1 else 0
    maximum_integer = (10 ** settings.digits) - 1
    scaled_magnitude = rng.randint(minimum_integer * scale, (maximum_integer + 1) * scale - 1)
    if scaled_magnitude and rng.random() < settings.negative_probability:
        scaled_magnitude = -scaled_magnitude
    return Decimal(scaled_magnitude) / Decimal(scale)


def _format_number(value: Decimal, places: int) -> str:
    return f"{value:.{places}f}"


def _answer_precision(topic_id: str, settings: TopicModifiers) -> int:
    if settings.answer_rounding is not None:
        return settings.answer_rounding
    if topic_id == "multiplication":
        return settings.decimal_places * 2
    if topic_id in ("addition", "subtraction"):
        return settings.decimal_places
    return 2


def _build_problem(topic_id: str, settings: TopicModifiers, rng: random.Random) -> MathProblem:
    symbols = {"addition": "+", "subtraction": "-", "multiplication": "*", "division": "/"}
    symbol = symbols[topic_id]
    answer_places = _answer_precision(topic_id, settings)
    quantum = Decimal(1).scaleb(-answer_places)

    for _ in range(1000):
        first = _sample_operand(settings, rng)
        second = _sample_operand(settings, rng)

        if topic_id == "division":
            if second == 0:
                continue
            if settings.division_mode == "remainder":
                first_integer = int(first)
                second_integer = int(second)
                quotient, remainder = divmod(first_integer, second_integer)
                answer = f"{quotient} R {remainder}"
                display_answer = answer
                answer_value = answer
            elif settings.division_mode == "exact":
                if first % second != 0:
                    continue
                result = first / second
                result = result.quantize(quantum, rounding=ROUND_HALF_UP) if answer_places else result
                display_answer = _format_number(result, answer_places) if answer_places else str(int(result))
                answer_value = int(result) if result == result.to_integral_value() else float(result)
            else:
                result = (first / second).quantize(quantum, rounding=ROUND_HALF_UP)
                display_answer = _format_number(result, answer_places)
                answer_value = float(result)
        else:
            if topic_id == "addition":
                result = first + second
            elif topic_id == "subtraction":
                result = first - second
                if result < 0 and not settings.allow_negative_answers:
                    continue
            else:
                result = first * second
            if answer_places:
                result = result.quantize(quantum, rounding=ROUND_HALF_UP)
            display_answer = _format_number(result, answer_places) if answer_places else str(int(result))
            answer_value = int(result) if result == result.to_integral_value() else float(result)

        first_display = _format_number(first, settings.decimal_places)
        second_display = _format_number(second, settings.decimal_places)
        question = f"{first_display} {symbol} {second_display} ="
        return MathProblem(
            question=question,
            answer=answer_value,
            topic=topic_id,
            num1=float(first),
            num2=float(second),
            symbol=symbol,
            display_num1=first_display,
            display_num2=second_display,
            display_answer=display_answer,
        )

    raise GenerationConstraintError(
        f"Could not generate a valid {topic_id} problem after 1,000 attempts. "
        "Review sign probability and operation constraints."
    )


def generate_topic_problems(topic_id: str, count: int, modifiers: TopicModifiers, rng: random.Random):
    if count < 0:
        raise ValueError("Problem count cannot be negative.")
    if topic_id not in {"addition", "subtraction", "multiplication", "division"}:
        raise ValueError(f"Unsupported arithmetic topic: {topic_id}")
    return [_build_problem(topic_id, modifiers, rng) for _ in range(count)]


def generate_section_problems(section, rng: random.Random):
    topics = section.topics
    base_quota, remainder = divmod(section.problems_per_page, len(topics))
    remainder_cursor = 0
    pages = []

    for _ in range(section.page_count):
        page_problems = []
        for topic_index, topic in enumerate(topics):
            extra = (topic_index - remainder_cursor) % len(topics) < remainder
            quota = base_quota + int(extra)
            page_problems.extend(generate_topic_problems(topic.topic_id, quota, topic.modifiers, rng))
        rng.shuffle(page_problems)
        pages.append(page_problems)
        remainder_cursor = (remainder_cursor + remainder) % len(topics)

    return pages