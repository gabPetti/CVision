"""
Data Transfer Objects (DTOs) e validadores para API
"""

import logging
from typing import Optional, Tuple, Dict, Any
from werkzeug.datastructures import FileStorage
from lib import CVTextExtractor, ResponseBuilder

logger = logging.getLogger(__name__)

# ============================================================================
# DTOs - Data Transfer Objects
# ============================================================================

class AnalizarCvRequest:
    """DTO para requisição de análise de CV"""
    
    def __init__(self, file: Optional[FileStorage] = None, job_link: Optional[str] = None):
        self.file = file
        self.job_link = job_link
    
    def validate(self) -> Tuple[bool, Optional[str]]:
        """
        Valida a requisição
        
        Returns:
            Tuple[bool, Optional[str]]: (é_válido, mensagem_erro)
        """
        
        # Verifica se arquivo foi enviado
        if not self.file:
            return False, "Arquivo do CV é obrigatório"
        
        # Verifica nome do arquivo
        if not self.file.filename or self.file.filename == '':
            return False, "Nenhum arquivo selecionado"
        
        # Verifica formato do arquivo
        if not CVTextExtractor.is_valid_file(self.file.filename):
            return False, f"Formato não suportado. Use: {', '.join(CVTextExtractor.SUPPORTED_FORMATS)}"
        
        logger.info(f"Arquivo validado: {self.file.filename}")
        
        # Verifica job_link se enviado
        if self.job_link:
            job_link = self.job_link.strip()
            if not job_link:
                return False, "Job link não pode estar vazio"
            self.job_link = job_link
            logger.info(f"Job link validado: {job_link}")
        
        return True, None


class AnalizarCvResponse:
    """DTO para resposta de análise de CV"""
    
    def __init__(self, summary: Optional[str] = None, analysis: Optional[Dict[str, Any]] = None, metadata: Optional[Dict[str, Any]] = None):
        self.summary = summary
        self.analysis = analysis
        self.metadata = metadata
    
    def to_dict(self) -> Dict[str, Any]:
        """Converte para dicionário"""
        return {
            'success': True,
            'data': {
                'summary': self.summary,
                'analysis': self.analysis,
                'metadata': self.metadata
            }
        }


# ============================================================================
# Validadores
# ============================================================================

class RequestValidator:
    """Validador centralizado para requisições"""
    
    @staticmethod
    def validate_analizar_cv_request(file: Optional[FileStorage], job_link: Optional[str]) -> Tuple[Optional[AnalizarCvRequest], Optional[Tuple[Dict, int]]]:
        """
        Valida requisição de análise de CV
        
        Returns:
            Tuple[Optional[AnalizarCvRequest], Optional[Tuple[Dict, int]]]:
            - Se válido: (AnalizarCvRequest object, None)
            - Se inválido: (None, (error_response, status_code))
        """
        # Cria DTO
        request_dto = AnalizarCvRequest(file=file, job_link=job_link)
        
        # Valida
        is_valid, error_message = request_dto.validate()
        
        if not is_valid:
            logger.warning(f"Validação falhou: {error_message}")
            error_response = ResponseBuilder.error(error_message, status_code=400)
            return None, error_response
        
        return request_dto, None
