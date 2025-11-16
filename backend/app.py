import os
import logging
from pathlib import Path
from werkzeug.utils import secure_filename
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from functions.analyze_cv import create_analyzer
from functions.generate_cv_pdf import generate_pdf_from_html
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
        job_description = request.form.get('job_description', None)
        
        # Valida request com DTO
        request_dto, error_response = RequestValidator.validate_analizar_cv_request(
            file=file,
            cv_text=cv_text,
            job_description=job_description
        )
        
        if error_response:
            return error_response
        
        # ====================================================================
        # ETAPA 2: Extração de texto do CV
        # ====================================================================
        
        try:
            cv_text = request_dto.get_cv_text()
            if not cv_text:
                return ResponseBuilder.error(
                    "CV vazio após processamento",
                    status_code=400
                )
        except Exception as e:
            logger.error(f"Erro ao extrair texto: {e}")
            return ResponseBuilder.error(
                f"Erro ao processar arquivo: {str(e)}",
                status_code=400
            )
        
        # ====================================================================
        # ETAPA 3: Resumir CV
        # ====================================================================
        
        cv_summary = None
        try:
            logger.info("Etapa 1: Resumindo CV...")
            llm_provider = LLMProvider()
            llm = llm_provider.get_llm()
            parser = StrOutputParser()
            
            cv_summary = summarize_cv(cv_text, llm, parser)
            logger.info("CV resumido com sucesso")
        except Exception as e:
            logger.error(f"Erro ao resumir CV: {e}")
            cv_summary = None  # Continue mesmo com erro no resumo
        
        # ====================================================================
        # ETAPA 4: Analisar CV com 3 cadeias LCEL
        # ====================================================================
        
        try:
            logger.info("Etapa 2: Analisando CV com 3 cadeias LCEL...")
            analyzer = create_analyzer()
            analysis_result = analyzer.analyze(cv_text, request_dto.job_description)
            
            if not analysis_result.get('success'):
                return ResponseBuilder.error(
                    analysis_result.get('error', 'Erro ao analisar CV'),
                    status_code=500
                )
            
            logger.info("Análise completa com sucesso")
        except Exception as e:
            logger.error(f"Erro ao analisar CV: {e}")
            return ResponseBuilder.error(
                f"Erro ao analisar CV: {str(e)}",
                status_code=500
            )
        
        # ====================================================================
        # ETAPA 5: Consolidar resposta com DTO
        # ====================================================================
        
        response_dto = AnalizarCvResponse(
            summary=cv_summary,
            analysis=analysis_result.get('analysis'),
            metadata=analysis_result.get('metadata')
        )
        
        return ResponseBuilder.success(
            data=response_dto.to_dict()['data'],
            message="CV analisado com sucesso (resumo + análise completa)"
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
