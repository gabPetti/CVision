import os
import logging
from pathlib import Path
from werkzeug.utils import secure_filename
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from typing import Optional, Dict, Any
from lib import ResponseBuilder, LLMProvider
from functions.analyze_cv import analyze_cv
from functions.summarize_cv import summarize_cv
from functions.dtos import AnalizarCvRequest, AnalizarCvResponse, RequestValidator
from langchain_core.output_parsers import StrOutputParser

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

@app.post('/api/v1/analizar-cv')
def analizar_cv():
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
        # ETAPA 2: Resumir e analizar CV
        # ====================================================================
        
        cv_summary = None
        try:
            logger.info("Etapa 1: Resumindo CV...")
            llm_provider = LLMProvider()
            llm = llm_provider.get_llm()

            # cv_summary = summarize_cv(request_dto.file, llm)

            analysis_result = analyze_cv(cv_summary, request_dto.job_link, llm)

            logger.info("CV analisado com sucesso")
        except Exception as e:
            logger.error(f"Erro ao analisado CV: {e}")
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


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.logger.info(f"🚀 Iniciando CVision Backend na porta {port}")

    app.run(port=port, debug=True)
