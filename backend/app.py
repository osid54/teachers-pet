from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import io
import os

from problem_generator.operations import generate_arithmetic_problems
from pdf_generator.main import create_pdf_worksheet

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return "Worksheet Generator Backend is Running!"

@app.route('/generate-worksheet', methods=['POST'])
def generate_worksheet():
    data = request.json
    subject = data.get('subject')
    topic = data.get('topic')
    page_count = data.get('pageCount')
    include_answer_key = data.get('includeAnswerKey')
    modifiers = data.get('modifiers', {})

    app.logger.info(f"Received request for: Subject={subject}, Topic={topic}, Pages={page_count}, AnswerKey={include_answer_key}, Modifiers={modifiers}")

    num_problems_per_page = 30
    total_problems = page_count * num_problems_per_page

    problems_objects = []

    if subject == 'Arithmetic':
        problems_objects = generate_arithmetic_problems(topic, total_problems, modifiers)

    problems_data_for_pdf = [p.to_dict() for p in problems_objects]

    try:
        pdf_buffer = create_pdf_worksheet(
            problems_data_for_pdf,
            include_answer_key,
            subject,
            topic,
            num_problems_per_page
        )

        return send_file(pdf_buffer, download_name='worksheet.pdf', mimetype='application/pdf')

    except Exception as e:
        app.logger.error(f"Error generating worksheet: {e}", exc_info=True) # exc_info=True adds traceback
        return jsonify({"error": "Failed to generate worksheet", "details": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)