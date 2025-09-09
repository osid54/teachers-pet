import textwrap

# The number of questions to generate
num_questions = 54
# The number of official test versions per question
num_versions = 7

# --- BEGIN `sat.py` FILE CONTENT ---

# Print the imports and helper function
print(textwrap.dedent("""\
    import random

    def _create_question_dict(question_number, question_text, question_type, correct_answer, options=None, rng=None):
        if question_type == 'multiple_choice':
            if rng and options:
                rng.shuffle(options)
            correct_answer_index = options.index(correct_answer)
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
"""))

# Loop to generate the code for each of the 54 questions
for i in range(1, num_questions + 1):
    function_name = f"generate_q{i}"
    
    # Generate the match-case block
    match_cases = ""
    for v in range(1, num_versions + 1):
        # Example of a submission question for version 3
        if v == 3:
            match_cases += textwrap.dedent(f"""\
            case {v}:
                question_text = "What is the square root of 64?"
                correct_answer = 8
                options = None
                question_type = "submission"
            """)
        else:
            match_cases += textwrap.dedent(f"""\
            case {v}:
                question_text = "..."
                correct_answer = ...
                options = [...]
                question_type = "multiple_choice"
            """)
    
    # Add a catch-all case to prevent UnboundLocalError
    match_cases += textwrap.dedent(f"""\
        case _:
            raise ValueError(f"Invalid version number for question {i}: {{version}}")
    """)

    # Print the full function definition using the generated match-case block
    print(textwrap.dedent(f"""
    def {function_name}(rng: random.Random):
        version = rng.choice(range(1, {num_versions + 1}))
    
        match version:
            {textwrap.indent(match_cases, ' ' * 12).strip()}

        return _create_question_dict({i}, question_text, question_type, correct_answer, options, rng)
"""))

# --- END `sat.py` FILE CONTENT ---
