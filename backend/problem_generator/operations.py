import problem_generator.problems as problems
import problem_generator.numbers as numbers
import random

def addition(modifiers):
    num1 = numbers.numGen(modifiers.get("problem", "")).num
    num2 = numbers.numGen(modifiers.get("problem", "")).num

    question = f"{num1} + {num2} = "
    answer = round(num1 + num2, modifiers.get("answer",{"round":2}).get("round",2))
    return problems.MathProblem(question, answer)

def subtraction(modifiers):
    num1 = numbers.numGen(modifiers.get("problem", "")).num
    num2 = numbers.numGen(modifiers.get("problem", "")).num

    question = f"{num1} - {num2} = "
    answer = round(num1 - num2, modifiers.get("answer",{"round":2}).get("round",2))
    return problems.MathProblem(question, answer)

def multiplication(modifiers):
    num1 = numbers.numGen(modifiers.get("problem", "")).num
    num2 = numbers.numGen(modifiers.get("problem", "")).num

    question = f"{num1} * {num2} = "
    answer = round(num1 * num2, modifiers.get("answer",{"round":2}).get("round",2))
    return problems.MathProblem(question, answer)

def division(modifiers):
    num1 = numbers.numGen(modifiers.get("problem", "")).num
    num2 = numbers.numGen(modifiers.get("problem", "")).num

    question = f"{num1} / {num2} = "
    answer = round(num1 / num2, modifiers.get("answer",{"round":2}).get("round",2))
    return problems.MathProblem(question, answer)

def generate_arithmetic_problems(topic, count, modifiers):
    problems = []
    for _ in range(count):
        topicChoice = topic[random.randint(0,len(topic)-1)]
        match topicChoice:
            case "addition":
                problems.append(addition(modifiers))
            case "subtraction":
                problems.append(subtraction(modifiers))
            case "multiplication":
                problems.append(multiplication(modifiers))
            case "division":
                problems.append(division(modifiers))
            case _:
                problems.append({"question": "Unsupported arithmetic topic", "answer": "N/A"})
    return problems