import random
import visuals as v

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
            bar_values = []

            for i in range(5):
                x = rng.randint(20,50)
                while x in bar_values:
                    x = rng.randint(20,50)
                bar_values[i] = x
                        
            chart_html = v.generate_bar_chart(
                title="Activity",
                x_labels=['1', '2', '3', '4', '5'],
                y_label="Number of students",
                values=bar_values,
                max_y=50
            )
            
            correct_index = rng.randint(1,5)

            question_text = f"""
                <div class="sat-visual">{chart_html}</div>
                <p>A group of students voted on five after-school activities. The bar graph shows the number of students who voted for each of the five activities.</p>
                <p>How many students chose activity {correct_index}?</p>
            """
            
            correct_answer = bar_values[correct_index]
            
            distractors = bar_values.copy()
            distractors.remove(correct_answer)

            rng.shuffle(distractors)

            options = [
                correct_answer, 
                distractors[0],
                distractors[1],
                distractors[2],
            ]
            
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
            
            question_text = f"<p>What percentage of {startNum} is {endNum}?</p>"
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
            nums = [2,3,4,5,6,7,8,9,10,11,12]
            A = rng.choice(nums)
            B = rng.choice(nums) 
            
            raw_latex = f"\\frac{{x^2}}{{{A**2}}} = {B**2}"
            equation_html = v.format_equation(raw_latex)
            
            correct_answer = (A * B)**0.5
            
            question_text = f"""
                {equation_html}
                <p>What is a solution to the given equation?</p>
            """
            
            options = [
                correct_answer, 
                correct_answer**2,
                B//A,
                round((B//A)**.5)
            ]
            
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
            add = rng.randint(1,9)
            mult = rng.randint(2,9)
            x = rng.randint(2,12)
            ans = x * mult + add
            question_text = f"<p>{add} more than {mult} times a number x is equal to {ans}.</p><p>Which equation represents this situation?</p>"
            correct_answer = f"{mult}x + {add} = {ans}"
            options = [correct_answer,
                       f"{add}x + {mult} = {ans}",
                       f"{mult}x = {ans} + {add}",
                       f"({add})({mult})x = {ans}"
                       ]
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
            b = rng.choice([100,200,300,400,500,600,700,800,900])
            m = rng.choice([25,50,75,125,150,175])
            question_text = f"""<p>Hana deposited a fixed amount into her bank
                                account each month. The function f(t) = {b} + {m}t
                                gives the amount, in dollars, in Hana’s bank account
                                after t monthly deposits. What is the best
                                interpretation of {m} in this context? </p>
                                """
            correct_answer = f"With each monthly deposit, the amount in Hana’s bank account increased by ${m}."
            options = [correct_answer,
                       f"Before Hana made any monthly deposits, the amount in her bank account was ${m}.",
                       f"After 1 monthly deposit, the amount in Hana’s bank account was ${m}.",
                       f"Hana made a total of {m} monthly deposits.",
                       ]
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
            price = rng.randint(2,9)
            amount = rng.randint(5,15)
            cost = price * amount
            
            question_text = f"A customer spent ${cost} to purchase oranges at ${price} per pound. How many pounds of oranges did the customer purchase?"
            correct_answer = amount
            options = None
            question_type = "submission"
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
            num = rng.randint(3,12)
            price = rng.randint(5,15)
            total = num * price
            percent = rng.randint(40,60)/100
            coupon = round(percent * total)
            cost = total - coupon
            
            question_text = f"""<p>Nasir bought {num} storage bins that were each the same
                            price. He used a coupon for ${coupon} off the entire
                            purchase. The cost for the entire purchase after using
                            the coupon was ${cost}. What was the original price, in
                            dollars, for 1 storage bin?</p>"""
            correct_answer = price
            options = None
            question_type = "submission"
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
            b_co = rng.choice([1.5,2.5,3.5,4.5])
            r_co = rng.randint(3,7)
            r = rng.randrange(14,22,2)
            rhs = r_co * r

            raw_latex = f"{b_co}b + {r_co}r = {rhs}"
            equation_html = v.format_equation(raw_latex)

            question_text = f"""
                {equation_html}
                <p>The given equation describes the relationship
                between the number of birds, b, and the number of
                reptiles, r, that can be cared for at a pet care business
                on a given day. If the business cares for {r} reptiles on
                a given day, how many birds can it care for on this
                day?</p>
            """
            correct_answer = 0
            options = [correct_answer, r_co, rhs*b_co, rhs//b_co]
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
            rhs = rng.randint(2,9)
            denom = rng.randint(2,9)
            raw_frac1 = f"\\frac{{x}}{{{denom}}} = {rhs}"
            html_frac1 = v.format_equation(raw_frac1, True)

            raw_frac2 = f"\\frac{{{denom}}}{{x}}"
            html_frac2 = v.format_equation(raw_frac2, True)

            question_text = f"<p>If {html_frac1}, what is the value of {html_frac2}?</p>"
            correct_answer = f"1/{rhs}"
            options = None
            question_type = "submission"
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
            c2 = rng.choice([3,4,5,6,8])
            mult = rng.randint(2,5)
            c1 = c2 * mult
            
            x = (c2 - 2) / (mult - 1)
            y = rng.randint(50,100)
            
            r1 = -1 * (y + c1 * x)
            r2 = r1 + (mult - 1) * c2 * x
            
            raw_latex = f"""
                {c1}x + y &= {r1} \\\\
                {c2}x + y &= {r2}
            """
            latex_block = f"\\begin{{aligned}}{raw_latex}\\end{{aligned}}"
            
            system_html = v.format_equation(latex_block)

            question_text = f"""
                {system_html}
                The solution to the given system of equations is (x, y). What is the value of y? 
            """
            correct_answer = y
            options = None
            question_type = "submission"
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
            denom = rng.randint(2,5)
            raw_slope = f"-\\frac{{x}}{{{denom}}}"
            html_slope = v.format_equation(raw_slope, True)

            x = denom * rng.randint(2,5)
            y = x + rng.randint(1,4)

            b = y + x / denom

            raw_ans_1 = f"y={b}x-\\frac{{1}}{{{denom}}}"
            html_ans_1 = v.format_equation(raw_ans_1, True)

            raw_ans_2 = f"y={x}x+\\frac{y}"
            html_ans_2 = v.format_equation(raw_ans_2, True)

            raw_ans_3 = f"y=-\\frac{{x}}{{{3}}}+{y}"
            html_ans_3 = v.format_equation(raw_ans_3, True)

            raw_ans_4 = f"y=-\\frac{{x}}{{{3}}}+{b}"
            html_ans_4 = v.format_equation(raw_ans_4, True)

            question_text = f"<p>Line t in the xy-plane has a slope of {html_slope} and passes through the point ({x}, {y}). Which equation defines line t?</p>"
            correct_answer = f"{html_ans_1}"
            options = [correct_answer, f"{html_ans_2}", f"{html_ans_3}", f"{html_ans_4}"]
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
            A_initial = 100
            B_rate = 1.05
            raw_latex = f"y = {A_initial}({B_rate})^{{x}}"
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

