import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import tempfile
from pathlib import Path

# Import your LangChain CV processing logic here
# from cv_processor import process_cv_with_langchain

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = tempfile.gettempdir()
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE


def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok'}), 200


@app.route('/api/analyze-cv', methods=['POST'])
def analyze_cv():
    """
    Analyze CV file and return personalized tips
    
    Expected request:
    - File: multipart/form-data with 'file' field
    - job_description: Optional JSON string with job details
    """
    try:
        # Check if file is present in request
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not allowed. Supported: PDF, DOC, DOCX'}), 400
        
        # Get optional job description
        job_description = request.form.get('job_description', '')
        
        # Save file temporarily
        temp_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(temp_path)
        
        try:
            # Process CV with LangChain
            # Replace this with your actual function
            # analysis_result = process_cv_with_langchain(temp_path, job_description)
            
            # Mock response for now
            analysis_result = {
                'tips': [
                    {
                        'type': 'strength',
                        'title': 'Exemplo de análise',
                        'description': 'Seu CV foi recebido com sucesso'
                    }
                ],
                'score': 0.85,
                'summary': 'Análise do seu currículo'
            }
            
            return jsonify(analysis_result), 200
        
        finally:
            # Clean up temporary file
            if os.path.exists(temp_path):
                os.remove(temp_path)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/match-jobs', methods=['POST'])
def match_jobs():
    """
    Match CV against job listings
    
    Expected request:
    - File: multipart/form-data with 'file' field
    - jobs: JSON array of job listings
    """
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not allowed'}), 400
        
        # Save file temporarily
        temp_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(temp_path)
        
        try:
            # Process matching with LangChain
            # Replace this with your actual function
            # matches = match_cv_with_jobs(temp_path, jobs)
            
            # Mock response
            matches = {
                'matches': [],
                'total': 0
            }
            
            return jsonify(matches), 200
        
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
