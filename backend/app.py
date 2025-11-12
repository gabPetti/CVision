import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import tempfile
from pathlib import Path
from langchain_google_genai import ChatGoogleGenerativeAI
from functions import summarize_cv

# Load environment variables
load_dotenv()
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = tempfile.gettempdir()
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

llm = ChatGoogleGenerativeAI(
    temperature = 0,
    model = "gemini-2.5-flash",
    api_key = GOOGLE_API_KEY
)

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok'}), 200


@app.route('/api/summarize-cv', methods=['GET'])
def get_summarize_cv():
    """
    Summarize CV in relation to a job description
    
    Expected query parameters:
    - cv_text: The CV content text
    - job_description: The job description
    
    Returns:
    - summary: Summarized matching between CV and job description
    """
    try:
        # Get query parameters
        cv_text = request.args.get('cv_text', '')
        job_description = request.args.get('job_description', '')
        
        # Validate inputs
        if not cv_text or not cv_text.strip():
            return jsonify({'error': 'cv_text parameter is required'}), 400
        
        if not job_description or not job_description.strip():
            return jsonify({'error': 'job_description parameter is required'}), 400
        
        # Call summarize_cv function
        summary = summarize_cv(cv_text, job_description, llm)
        
        return jsonify({
            'summary': summary,
            'status': 'success'
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
