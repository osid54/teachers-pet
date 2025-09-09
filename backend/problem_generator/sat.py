import random

def _create_question_dict(question_number, question_text, question_type, correct_answer, options=None, rng=None):
    if question_type == 'multiple_choice':
        if rng and options:
            rng.shuffle(options)
        correct_answer_index = options.index(correct_answer) if options else None
        return {
            "question_number": question_number,
            "question_text": question_text,
            "question_type": question_type,
            "options": options,
            "correct_answer_index": correct_answer_index
        }
    elif question_type == 'submission':
        return {
            "question_number": question_number,
            "question_text": question_text,
            "question_type": question_type,
            "correct_answer": correct_answer
        }
    else:
        raise ValueError("Invalid question_type. Must be 'multiple_choice' or 'submission'.")

def generate_q1(rng: random.Random):
    version = rng.choice(range(1, 8))

    match version:
        case 1:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 2:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 3:
            question_text = "What is the square root of 64?"
            correct_answer = 8
            options = None
            question_type = "submission"
        case 4:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 5:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 6:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 7:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case _:
            raise ValueError(f"Invalid version number for question 1: {version}")

    return _create_question_dict(1, question_text, question_type, correct_answer, options, rng)


def generate_q2(rng: random.Random):
    version = rng.choice(range(1, 8))

    match version:
        case 1:
            startNum = rng.randrange(1,11) * 50
            percent = rng.randrange(1,13) * 25
            if percent == 100:
                percent = 75
            endNum = percent/100.0 * startNum
            numDifference = startNum-endNum if startNum>endNum else endNum-startNum
            
            question_text = f"What percentage of {startNum} is {endNum}?"
            correct_answer = percent
            options = [correct_answer, 100/correct_answer, numDifference, 100/numDifference]
            question_type = "multiple_choice"
        case 2:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 3:
            question_text = "What is the square root of 64?"
            correct_answer = 8
            options = None
            question_type = "submission"
        case 4:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 5:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 6:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 7:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case _:
            raise ValueError(f"Invalid version number for question 2: {version}")

    return _create_question_dict(2, question_text, question_type, correct_answer, options, rng)


def generate_q3(rng: random.Random):
    version = rng.choice(range(1, 8))

    match version:
        case 1:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 2:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 3:
            question_text = "What is the square root of 64?"
            correct_answer = 8
            options = None
            question_type = "submission"
        case 4:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 5:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 6:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 7:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case _:
            raise ValueError(f"Invalid version number for question 3: {version}")

    return _create_question_dict(3, question_text, question_type, correct_answer, options, rng)


def generate_q4(rng: random.Random):
    version = rng.choice(range(1, 8))

    match version:
        case 1:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 2:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 3:
            question_text = "What is the square root of 64?"
            correct_answer = 8
            options = None
            question_type = "submission"
        case 4:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 5:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 6:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 7:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case _:
            raise ValueError(f"Invalid version number for question 4: {version}")

    return _create_question_dict(4, question_text, question_type, correct_answer, options, rng)


def generate_q5(rng: random.Random):
    version = rng.choice(range(1, 8))

    match version:
        case 1:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 2:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 3:
            question_text = "What is the square root of 64?"
            correct_answer = 8
            options = None
            question_type = "submission"
        case 4:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 5:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 6:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 7:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case _:
            raise ValueError(f"Invalid version number for question 5: {version}")

    return _create_question_dict(5, question_text, question_type, correct_answer, options, rng)


def generate_q6(rng: random.Random):
    version = rng.choice(range(1, 8))

    match version:
        case 1:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 2:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 3:
            question_text = "What is the square root of 64?"
            correct_answer = 8
            options = None
            question_type = "submission"
        case 4:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 5:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 6:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 7:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case _:
            raise ValueError(f"Invalid version number for question 6: {version}")

    return _create_question_dict(6, question_text, question_type, correct_answer, options, rng)


def generate_q7(rng: random.Random):
    version = rng.choice(range(1, 8))

    match version:
        case 1:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 2:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 3:
            question_text = "What is the square root of 64?"
            correct_answer = 8
            options = None
            question_type = "submission"
        case 4:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 5:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 6:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 7:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case _:
            raise ValueError(f"Invalid version number for question 7: {version}")

    return _create_question_dict(7, question_text, question_type, correct_answer, options, rng)


def generate_q8(rng: random.Random):
    version = rng.choice(range(1, 8))

    match version:
        case 1:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 2:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 3:
            question_text = "What is the square root of 64?"
            correct_answer = 8
            options = None
            question_type = "submission"
        case 4:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 5:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 6:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 7:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case _:
            raise ValueError(f"Invalid version number for question 8: {version}")

    return _create_question_dict(8, question_text, question_type, correct_answer, options, rng)


def generate_q9(rng: random.Random):
    version = rng.choice(range(1, 8))

    match version:
        case 1:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 2:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 3:
            question_text = "What is the square root of 64?"
            correct_answer = 8
            options = None
            question_type = "submission"
        case 4:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 5:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 6:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 7:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case _:
            raise ValueError(f"Invalid version number for question 9: {version}")

    return _create_question_dict(9, question_text, question_type, correct_answer, options, rng)


def generate_q10(rng: random.Random):
    version = rng.choice(range(1, 8))

    match version:
        case 1:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 2:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 3:
            question_text = "What is the square root of 64?"
            correct_answer = 8
            options = None
            question_type = "submission"
        case 4:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 5:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 6:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 7:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case _:
            raise ValueError(f"Invalid version number for question 10: {version}")

    return _create_question_dict(10, question_text, question_type, correct_answer, options, rng)


def generate_q11(rng: random.Random):
    version = rng.choice(range(1, 8))

    match version:
        case 1:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 2:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 3:
            question_text = "What is the square root of 64?"
            correct_answer = 8
            options = None
            question_type = "submission"
        case 4:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 5:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 6:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 7:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case _:
            raise ValueError(f"Invalid version number for question 11: {version}")

    return _create_question_dict(11, question_text, question_type, correct_answer, options, rng)


def generate_q12(rng: random.Random):
    version = rng.choice(range(1, 8))

    match version:
        case 1:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 2:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 3:
            question_text = "What is the square root of 64?"
            correct_answer = 8
            options = None
            question_type = "submission"
        case 4:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 5:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 6:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 7:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case _:
            raise ValueError(f"Invalid version number for question 12: {version}")

    return _create_question_dict(12, question_text, question_type, correct_answer, options, rng)


def generate_q13(rng: random.Random):
    version = rng.choice(range(1, 8))

    match version:
        case 1:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 2:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 3:
            question_text = "What is the square root of 64?"
            correct_answer = 8
            options = None
            question_type = "submission"
        case 4:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 5:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 6:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 7:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case _:
            raise ValueError(f"Invalid version number for question 13: {version}")

    return _create_question_dict(13, question_text, question_type, correct_answer, options, rng)


def generate_q14(rng: random.Random):
    version = rng.choice(range(1, 8))

    match version:
        case 1:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 2:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 3:
            question_text = "What is the square root of 64?"
            correct_answer = 8
            options = None
            question_type = "submission"
        case 4:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 5:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 6:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 7:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case _:
            raise ValueError(f"Invalid version number for question 14: {version}")

    return _create_question_dict(14, question_text, question_type, correct_answer, options, rng)


def generate_q15(rng: random.Random):
    version = rng.choice(range(1, 8))

    match version:
        case 1:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 2:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 3:
            question_text = "What is the square root of 64?"
            correct_answer = 8
            options = None
            question_type = "submission"
        case 4:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 5:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 6:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 7:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case _:
            raise ValueError(f"Invalid version number for question 15: {version}")

    return _create_question_dict(15, question_text, question_type, correct_answer, options, rng)


def generate_q16(rng: random.Random):
    version = rng.choice(range(1, 8))

    match version:
        case 1:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 2:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 3:
            question_text = "What is the square root of 64?"
            correct_answer = 8
            options = None
            question_type = "submission"
        case 4:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 5:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 6:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 7:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case _:
            raise ValueError(f"Invalid version number for question 16: {version}")

    return _create_question_dict(16, question_text, question_type, correct_answer, options, rng)


def generate_q17(rng: random.Random):
    version = rng.choice(range(1, 8))

    match version:
        case 1:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 2:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 3:
            question_text = "What is the square root of 64?"
            correct_answer = 8
            options = None
            question_type = "submission"
        case 4:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 5:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 6:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 7:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case _:
            raise ValueError(f"Invalid version number for question 17: {version}")

    return _create_question_dict(17, question_text, question_type, correct_answer, options, rng)


def generate_q18(rng: random.Random):
    version = rng.choice(range(1, 8))

    match version:
        case 1:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 2:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 3:
            question_text = "What is the square root of 64?"
            correct_answer = 8
            options = None
            question_type = "submission"
        case 4:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 5:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 6:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 7:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case _:
            raise ValueError(f"Invalid version number for question 18: {version}")

    return _create_question_dict(18, question_text, question_type, correct_answer, options, rng)


def generate_q19(rng: random.Random):
    version = rng.choice(range(1, 8))

    match version:
        case 1:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 2:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 3:
            question_text = "What is the square root of 64?"
            correct_answer = 8
            options = None
            question_type = "submission"
        case 4:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 5:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 6:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 7:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case _:
            raise ValueError(f"Invalid version number for question 19: {version}")

    return _create_question_dict(19, question_text, question_type, correct_answer, options, rng)


def generate_q20(rng: random.Random):
    version = rng.choice(range(1, 8))

    match version:
        case 1:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 2:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 3:
            question_text = "What is the square root of 64?"
            correct_answer = 8
            options = None
            question_type = "submission"
        case 4:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 5:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 6:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 7:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case _:
            raise ValueError(f"Invalid version number for question 20: {version}")

    return _create_question_dict(20, question_text, question_type, correct_answer, options, rng)


def generate_q21(rng: random.Random):
    version = rng.choice(range(1, 8))

    match version:
        case 1:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 2:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 3:
            question_text = "What is the square root of 64?"
            correct_answer = 8
            options = None
            question_type = "submission"
        case 4:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 5:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 6:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 7:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case _:
            raise ValueError(f"Invalid version number for question 21: {version}")

    return _create_question_dict(21, question_text, question_type, correct_answer, options, rng)


def generate_q22(rng: random.Random):
    version = rng.choice(range(1, 8))

    match version:
        case 1:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 2:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 3:
            question_text = "What is the square root of 64?"
            correct_answer = 8
            options = None
            question_type = "submission"
        case 4:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 5:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 6:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 7:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case _:
            raise ValueError(f"Invalid version number for question 22: {version}")

    return _create_question_dict(22, question_text, question_type, correct_answer, options, rng)


def generate_q23(rng: random.Random):
    version = rng.choice(range(1, 8))

    match version:
        case 1:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 2:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 3:
            question_text = "What is the square root of 64?"
            correct_answer = 8
            options = None
            question_type = "submission"
        case 4:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 5:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 6:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 7:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case _:
            raise ValueError(f"Invalid version number for question 23: {version}")

    return _create_question_dict(23, question_text, question_type, correct_answer, options, rng)


def generate_q24(rng: random.Random):
    version = rng.choice(range(1, 8))

    match version:
        case 1:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 2:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 3:
            question_text = "What is the square root of 64?"
            correct_answer = 8
            options = None
            question_type = "submission"
        case 4:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 5:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 6:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 7:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case _:
            raise ValueError(f"Invalid version number for question 24: {version}")

    return _create_question_dict(24, question_text, question_type, correct_answer, options, rng)


def generate_q25(rng: random.Random):
    version = rng.choice(range(1, 8))

    match version:
        case 1:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 2:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 3:
            question_text = "What is the square root of 64?"
            correct_answer = 8
            options = None
            question_type = "submission"
        case 4:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 5:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 6:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 7:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case _:
            raise ValueError(f"Invalid version number for question 25: {version}")

    return _create_question_dict(25, question_text, question_type, correct_answer, options, rng)


def generate_q26(rng: random.Random):
    version = rng.choice(range(1, 8))

    match version:
        case 1:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 2:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 3:
            question_text = "What is the square root of 64?"
            correct_answer = 8
            options = None
            question_type = "submission"
        case 4:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 5:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 6:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 7:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case _:
            raise ValueError(f"Invalid version number for question 26: {version}")

    return _create_question_dict(26, question_text, question_type, correct_answer, options, rng)


def generate_q27(rng: random.Random):
    version = rng.choice(range(1, 8))

    match version:
        case 1:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 2:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 3:
            question_text = "What is the square root of 64?"
            correct_answer = 8
            options = None
            question_type = "submission"
        case 4:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 5:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 6:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 7:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case _:
            raise ValueError(f"Invalid version number for question 27: {version}")

    return _create_question_dict(27, question_text, question_type, correct_answer, options, rng)


def generate_q28(rng: random.Random):
    version = rng.choice(range(1, 8))

    match version:
        case 1:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 2:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 3:
            question_text = "What is the square root of 64?"
            correct_answer = 8
            options = None
            question_type = "submission"
        case 4:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 5:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 6:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 7:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case _:
            raise ValueError(f"Invalid version number for question 28: {version}")

    return _create_question_dict(28, question_text, question_type, correct_answer, options, rng)


def generate_q29(rng: random.Random):
    version = rng.choice(range(1, 8))

    match version:
        case 1:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 2:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 3:
            question_text = "What is the square root of 64?"
            correct_answer = 8
            options = None
            question_type = "submission"
        case 4:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 5:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 6:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 7:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case _:
            raise ValueError(f"Invalid version number for question 29: {version}")

    return _create_question_dict(29, question_text, question_type, correct_answer, options, rng)


def generate_q30(rng: random.Random):
    version = rng.choice(range(1, 8))

    match version:
        case 1:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 2:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 3:
            question_text = "What is the square root of 64?"
            correct_answer = 8
            options = None
            question_type = "submission"
        case 4:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 5:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 6:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 7:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case _:
            raise ValueError(f"Invalid version number for question 30: {version}")

    return _create_question_dict(30, question_text, question_type, correct_answer, options, rng)


def generate_q31(rng: random.Random):
    version = rng.choice(range(1, 8))

    match version:
        case 1:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 2:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 3:
            question_text = "What is the square root of 64?"
            correct_answer = 8
            options = None
            question_type = "submission"
        case 4:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 5:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 6:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 7:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case _:
            raise ValueError(f"Invalid version number for question 31: {version}")

    return _create_question_dict(31, question_text, question_type, correct_answer, options, rng)


def generate_q32(rng: random.Random):
    version = rng.choice(range(1, 8))

    match version:
        case 1:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 2:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 3:
            question_text = "What is the square root of 64?"
            correct_answer = 8
            options = None
            question_type = "submission"
        case 4:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 5:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 6:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 7:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case _:
            raise ValueError(f"Invalid version number for question 32: {version}")

    return _create_question_dict(32, question_text, question_type, correct_answer, options, rng)


def generate_q33(rng: random.Random):
    version = rng.choice(range(1, 8))

    match version:
        case 1:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 2:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 3:
            question_text = "What is the square root of 64?"
            correct_answer = 8
            options = None
            question_type = "submission"
        case 4:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 5:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 6:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 7:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case _:
            raise ValueError(f"Invalid version number for question 33: {version}")

    return _create_question_dict(33, question_text, question_type, correct_answer, options, rng)


def generate_q34(rng: random.Random):
    version = rng.choice(range(1, 8))

    match version:
        case 1:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 2:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 3:
            question_text = "What is the square root of 64?"
            correct_answer = 8
            options = None
            question_type = "submission"
        case 4:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 5:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 6:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 7:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case _:
            raise ValueError(f"Invalid version number for question 34: {version}")

    return _create_question_dict(34, question_text, question_type, correct_answer, options, rng)


def generate_q35(rng: random.Random):
    version = rng.choice(range(1, 8))

    match version:
        case 1:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 2:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 3:
            question_text = "What is the square root of 64?"
            correct_answer = 8
            options = None
            question_type = "submission"
        case 4:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 5:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 6:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 7:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case _:
            raise ValueError(f"Invalid version number for question 35: {version}")

    return _create_question_dict(35, question_text, question_type, correct_answer, options, rng)


def generate_q36(rng: random.Random):
    version = rng.choice(range(1, 8))

    match version:
        case 1:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 2:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 3:
            question_text = "What is the square root of 64?"
            correct_answer = 8
            options = None
            question_type = "submission"
        case 4:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 5:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 6:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 7:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case _:
            raise ValueError(f"Invalid version number for question 36: {version}")

    return _create_question_dict(36, question_text, question_type, correct_answer, options, rng)


def generate_q37(rng: random.Random):
    version = rng.choice(range(1, 8))

    match version:
        case 1:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 2:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 3:
            question_text = "What is the square root of 64?"
            correct_answer = 8
            options = None
            question_type = "submission"
        case 4:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 5:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 6:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 7:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case _:
            raise ValueError(f"Invalid version number for question 37: {version}")

    return _create_question_dict(37, question_text, question_type, correct_answer, options, rng)


def generate_q38(rng: random.Random):
    version = rng.choice(range(1, 8))

    match version:
        case 1:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 2:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 3:
            question_text = "What is the square root of 64?"
            correct_answer = 8
            options = None
            question_type = "submission"
        case 4:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 5:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 6:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 7:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case _:
            raise ValueError(f"Invalid version number for question 38: {version}")

    return _create_question_dict(38, question_text, question_type, correct_answer, options, rng)


def generate_q39(rng: random.Random):
    version = rng.choice(range(1, 8))

    match version:
        case 1:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 2:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 3:
            question_text = "What is the square root of 64?"
            correct_answer = 8
            options = None
            question_type = "submission"
        case 4:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 5:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 6:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 7:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case _:
            raise ValueError(f"Invalid version number for question 39: {version}")

    return _create_question_dict(39, question_text, question_type, correct_answer, options, rng)


def generate_q40(rng: random.Random):
    version = rng.choice(range(1, 8))

    match version:
        case 1:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 2:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 3:
            question_text = "What is the square root of 64?"
            correct_answer = 8
            options = None
            question_type = "submission"
        case 4:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 5:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 6:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 7:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case _:
            raise ValueError(f"Invalid version number for question 40: {version}")

    return _create_question_dict(40, question_text, question_type, correct_answer, options, rng)


def generate_q41(rng: random.Random):
    version = rng.choice(range(1, 8))

    match version:
        case 1:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 2:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 3:
            question_text = "What is the square root of 64?"
            correct_answer = 8
            options = None
            question_type = "submission"
        case 4:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 5:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 6:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 7:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case _:
            raise ValueError(f"Invalid version number for question 41: {version}")

    return _create_question_dict(41, question_text, question_type, correct_answer, options, rng)


def generate_q42(rng: random.Random):
    version = rng.choice(range(1, 8))

    match version:
        case 1:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 2:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 3:
            question_text = "What is the square root of 64?"
            correct_answer = 8
            options = None
            question_type = "submission"
        case 4:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 5:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 6:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 7:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case _:
            raise ValueError(f"Invalid version number for question 42: {version}")

    return _create_question_dict(42, question_text, question_type, correct_answer, options, rng)


def generate_q43(rng: random.Random):
    version = rng.choice(range(1, 8))

    match version:
        case 1:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 2:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 3:
            question_text = "What is the square root of 64?"
            correct_answer = 8
            options = None
            question_type = "submission"
        case 4:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 5:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 6:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 7:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case _:
            raise ValueError(f"Invalid version number for question 43: {version}")

    return _create_question_dict(43, question_text, question_type, correct_answer, options, rng)


def generate_q44(rng: random.Random):
    version = rng.choice(range(1, 8))

    match version:
        case 1:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 2:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 3:
            question_text = "What is the square root of 64?"
            correct_answer = 8
            options = None
            question_type = "submission"
        case 4:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 5:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 6:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 7:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case _:
            raise ValueError(f"Invalid version number for question 44: {version}")

    return _create_question_dict(44, question_text, question_type, correct_answer, options, rng)


def generate_q45(rng: random.Random):
    version = rng.choice(range(1, 8))

    match version:
        case 1:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 2:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 3:
            question_text = "What is the square root of 64?"
            correct_answer = 8
            options = None
            question_type = "submission"
        case 4:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 5:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 6:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 7:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case _:
            raise ValueError(f"Invalid version number for question 45: {version}")

    return _create_question_dict(45, question_text, question_type, correct_answer, options, rng)


def generate_q46(rng: random.Random):
    version = rng.choice(range(1, 8))

    match version:
        case 1:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 2:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 3:
            question_text = "What is the square root of 64?"
            correct_answer = 8
            options = None
            question_type = "submission"
        case 4:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 5:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 6:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 7:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case _:
            raise ValueError(f"Invalid version number for question 46: {version}")

    return _create_question_dict(46, question_text, question_type, correct_answer, options, rng)


def generate_q47(rng: random.Random):
    version = rng.choice(range(1, 8))

    match version:
        case 1:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 2:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 3:
            question_text = "What is the square root of 64?"
            correct_answer = 8
            options = None
            question_type = "submission"
        case 4:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 5:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 6:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 7:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case _:
            raise ValueError(f"Invalid version number for question 47: {version}")

    return _create_question_dict(47, question_text, question_type, correct_answer, options, rng)


def generate_q48(rng: random.Random):
    version = rng.choice(range(1, 8))

    match version:
        case 1:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 2:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 3:
            question_text = "What is the square root of 64?"
            correct_answer = 8
            options = None
            question_type = "submission"
        case 4:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 5:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 6:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 7:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case _:
            raise ValueError(f"Invalid version number for question 48: {version}")

    return _create_question_dict(48, question_text, question_type, correct_answer, options, rng)


def generate_q49(rng: random.Random):
    version = rng.choice(range(1, 8))

    match version:
        case 1:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 2:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 3:
            question_text = "What is the square root of 64?"
            correct_answer = 8
            options = None
            question_type = "submission"
        case 4:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 5:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 6:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 7:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case _:
            raise ValueError(f"Invalid version number for question 49: {version}")

    return _create_question_dict(49, question_text, question_type, correct_answer, options, rng)


def generate_q50(rng: random.Random):
    version = rng.choice(range(1, 8))

    match version:
        case 1:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 2:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 3:
            question_text = "What is the square root of 64?"
            correct_answer = 8
            options = None
            question_type = "submission"
        case 4:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 5:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 6:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 7:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case _:
            raise ValueError(f"Invalid version number for question 50: {version}")

    return _create_question_dict(50, question_text, question_type, correct_answer, options, rng)


def generate_q51(rng: random.Random):
    version = rng.choice(range(1, 8))

    match version:
        case 1:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 2:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 3:
            question_text = "What is the square root of 64?"
            correct_answer = 8
            options = None
            question_type = "submission"
        case 4:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 5:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 6:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 7:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case _:
            raise ValueError(f"Invalid version number for question 51: {version}")

    return _create_question_dict(51, question_text, question_type, correct_answer, options, rng)


def generate_q52(rng: random.Random):
    version = rng.choice(range(1, 8))

    match version:
        case 1:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 2:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 3:
            question_text = "What is the square root of 64?"
            correct_answer = 8
            options = None
            question_type = "submission"
        case 4:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 5:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 6:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 7:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case _:
            raise ValueError(f"Invalid version number for question 52: {version}")

    return _create_question_dict(52, question_text, question_type, correct_answer, options, rng)


def generate_q53(rng: random.Random):
    version = rng.choice(range(1, 8))

    match version:
        case 1:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 2:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 3:
            question_text = "What is the square root of 64?"
            correct_answer = 8
            options = None
            question_type = "submission"
        case 4:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 5:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 6:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 7:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case _:
            raise ValueError(f"Invalid version number for question 53: {version}")

    return _create_question_dict(53, question_text, question_type, correct_answer, options, rng)


def generate_q54(rng: random.Random):
    version = rng.choice(range(1, 8))

    match version:
        case 1:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 2:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 3:
            question_text = "What is the square root of 64?"
            correct_answer = 8
            options = None
            question_type = "submission"
        case 4:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 5:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 6:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case 7:
            question_text = "..."
            correct_answer = ...
            options = [...]
            question_type = "multiple_choice"
        case _:
            raise ValueError(f"Invalid version number for question 54: {version}")

    return _create_question_dict(54, question_text, question_type, correct_answer, options, rng)

