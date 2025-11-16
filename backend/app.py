import os
import logging
import tempfile
import base64
from pathlib import Path
from flask import Flask, send_file, request
from flask_cors import CORS
from dotenv import load_dotenv
from lib import ResponseBuilder, LLMProvider
from functions.analyze_cv import analyze_cv
from functions.generate_cv import generate_cv
from functions.dtos import RequestValidator
from langchain_community.document_loaders import PyPDFLoader

load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create Flask app
app = Flask(__name__)

# Configuration
UPLOAD_FOLDER = Path(os.getenv('UPLOAD_FOLDER', './uploads'))
UPLOAD_FOLDER.mkdir(exist_ok=True)
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'txt'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

app.config['UPLOAD_FOLDER'] = str(UPLOAD_FOLDER)
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE
app.config['JSON_SORT_KEYS'] = False

# Enable CORS
CORS(app, resources={
    r"/functions/*": {
        "origins": ["http://localhost:8080", "http://localhost:3000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    },
    r"/api/*": {
        "origins": ["http://localhost:8080", "http://localhost:3000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# ============================================================================
# ANALIZAR-CV ENDPOINT - Combina summarize_cv + analyze_cv
# ============================================================================

@app.post('/api/v1/analisar-cv')
def analisar_cv():
    """
    Endpoint completo que:
    1. Extrai e resume o CV (summarize_cv)
    2. Analisa com 3 cadeias LCEL (analyze_cv)
    
    Retorna: resumo + análise completa + HTML otimizado
    """
    try:
        # ====================================================================
        # ETAPA 1: Validação do DTO
        # ====================================================================
        
        file = request.files.get('file', None)
        job_link = request.form.get('job_link', None)
        
        # Valida request com DTO
        request_dto, error_response = RequestValidator.validate_analizar_cv_request(
            file=file,
            job_link=job_link
        )
        
        if error_response:
            return error_response
        
        # ====================================================================
        # ETAPA 2: Analisar CV
        # ====================================================================
        
        cv_summary = None
        try:
            temp_dir = tempfile.gettempdir()
            temp_file_path = os.path.join(temp_dir, file.filename)
            file.save(temp_file_path)
            loader = PyPDFLoader(temp_file_path)
            pages = loader.load()

            logger.info("Etapa 1: Resumindo CV...")
            llm_provider = LLMProvider()
            llm = llm_provider.get_llm()

            # cv_summary = summarize_cv(request_dto.file, llm)

            analysis_result = analyze_cv(pages, request_dto.job_link, llm)

            logger.info("CV analisado com sucesso")
        except Exception as e:
            logger.error(f"Erro ao analisar CV: {e}")
            return ResponseBuilder.error(
                f"Erro ao analisar CV: {str(e)}",
                status_code=500
            )

        # ====================================================================
        # ETAPA 5: Consolidar resposta com DTO
        # ====================================================================
        
        return ResponseBuilder.success(
            data=analysis_result,
        )
    
    except Exception as e:
        logger.error(f"Erro em /api/v1/analizar-cv: {e}")
        return ResponseBuilder.error(
            f"Erro ao analisar CV: {str(e)}",
            status_code=500
        )

@app.post('/api/v1/gerar_cv_otimizado')
def gerar_cv_otimizado():
    """
    Gera um currículo otimizado baseado na análise.
    """
    file = request.files.get('file', None)
    cv_analisys = request.form.get('cv_analisys', None)
    
    try:
        temp_dir = tempfile.gettempdir()
        temp_file_path = os.path.join(temp_dir, file.filename)
        file.save(temp_file_path)
        loader = PyPDFLoader(temp_file_path)
        pages = loader.load()
        llm_provider = LLMProvider()
        llm = llm_provider.get_llm()

        response = generate_cv(pages, cv_analisys, llm)

        logger.info("CV analisado com sucesso")

        # Convert the PDF file to base64
        with open(response, 'rb') as pdf_file:
            pdf_base64 = base64.b64encode(pdf_file.read()).decode('utf-8')
        
        # Return JSON with base64 encoded PDF
        return ResponseBuilder.success(
            data={
                "pdf_base64": pdf_base64,
                "filename": "cv_otimizado.pdf"
            }
        )
    
    except Exception as e:
        logger.error(f"Erro ao gerar CV otimizado: {e}")
        return ResponseBuilder.error(
            f"Erro ao gerar CV otimizado: {str(e)}",
            status_code=500
        )


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.logger.info(f"🚀 Iniciando CVision Backend na porta {port}")

    app.run(port=port, debug=True)
