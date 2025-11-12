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
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = tempfile.gettempdir()
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

# Lazy load LLM - only initialize when needed
_llm = None

def get_llm():
    """Get or initialize the LLM instance"""
    global _llm
    if _llm is None:
        if not GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY environment variable is not set")
        _llm = ChatGoogleGenerativeAI(
            temperature=0,
            model="gemini-2.5-flash",
            api_key=GEMINI_API_KEY
        )
    return _llm

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

        # Get LLM instance
        llm = get_llm()

        summary = summarize_cv(cv_text, job_description, llm)
        
        return jsonify({
            'summary': summary,
            'status': 'success'
        }), 200
    
    except ValueError as e:
        return jsonify({'error': f'Configuration error: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
