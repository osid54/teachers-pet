import problem_generator.problems as problems
import problem_generator.numbers as numbers
import random

def _get_problem_modifiers(modifiers):
    return modifiers.get("problem", {})

def _get_answer_modifiers(modifiers):
    return modifiers.get("answer", {"round": 0})

def _generate_operation_problem(operation_func, symbol, modifiers):
    problem_mods = _get_problem_modifiers(modifiers)
    answer_mods = _get_answer_modifiers(modifiers)

    num1 = numbers.numGen(problem_mods).num
    num2 = numbers.numGen(problem_mods).num

    if symbol == "/" and num2 == 0:
        while num2 == 0:
            num2_gen = numbers.numGen(problem_mods)
            num2 = num2_gen.num

    raw_answer = operation_func(num1, num2)
    round_places = answer_mods.get("round", 0)
    answer = round(raw_answer, round_places)

    formatted_num1 = str(num1)
    if problem_mods.get("dec", 0) == 0 and isinstance(num1, float):
        formatted_num1 = str(int(num1))

    formatted_num2 = str(num2)
    if problem_mods.get("dec", 0) == 0 and isinstance(num2, float):
        formatted_num2 = str(int(num2))

    question = f"{formatted_num1} {symbol} {formatted_num2} = "
    return problems.MathProblem(question, answer)

def addition(modifiers):
    return _generate_operation_problem(lambda a, b: a + b, "+", modifiers)

def subtraction(modifiers):
    return _generate_operation_problem(lambda a, b: a - b, "-", modifiers)

def multiplication(modifiers):
    return _generate_operation_problem(lambda a, b: a * b, "*", modifiers)

def division(modifiers):
    # clean division or remainders
    return _generate_operation_problem(lambda a, b: a / b, "/", modifiers)

def generate_arithmetic_problems(topic_list, count, modifiers):
    problems_generated = []
    
    operation_map = {
        "addition": addition,
        "subtraction": subtraction,
        "multiplication": multiplication,
        "division": division,
    }

    for _ in range(count):
        topic_choice_id = topic_list[random.randint(0, len(topic_list) - 1)]

        if topic_choice_id in operation_map:
            problems_generated.append(operation_map[topic_choice_id](modifiers))
        else:
            problems_generated.append(problems.MathProblem("Unsupported arithmetic topic", "N/A"))
    return problems_generated