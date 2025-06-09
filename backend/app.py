from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import io
import os

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    """A simple route to check if the backend is running."""
    return "Worksheet Generator Backend is Running!"

@app.route('/generate-worksheet', methods=['POST'])
def generate_worksheet():
    """
    Handles the request to generate a worksheet.
    Expects JSON data with subject, topic, pageCount, includeAnswerKey, and modifiers.
    """
    data = request.json
    subject = data.get('subject')
    topic = data.get('topic')
    page_count = data.get('pageCount')
    include_answer_key = data.get('includeAnswerKey')
    modifiers = data.get('modifiers', {})

    app.logger.info(f"Received request for: Subject={subject}, Topic={topic}, Pages={page_count}, AnswerKey={include_answer_key}, Modifiers={modifiers}")

    try:
        from reportlab.pdfgen import canvas
        buffer = io.BytesIO()
        p = canvas.Canvas(buffer)
        p.drawString(100, 750, f"Worksheet: {subject} - {topic}")
        p.drawString(100, 730, f"Page Count: {page_count}")
        if include_answer_key:
            p.drawString(100, 710, "Answer Key Included")
        p.drawString(100, 690, f"Modifiers: {modifiers}")
        p.drawString(100, 650, "This is a placeholder worksheet!")
        p.showPage()
        p.save()
        buffer.seek(0)

        return send_file(buffer, download_name='worksheet.pdf', mimetype='application/pdf')

    except Exception as e:
        app.logger.error(f"Error generating worksheet: {e}")
        return jsonify({"error": "Failed to generate worksheet", "details": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)