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
    
    def __init__(self, file: Optional[FileStorage] = None, cv_text: Optional[str] = None, job_description: Optional[str] = None):
        self.file = file
        self.cv_text = cv_text
        self.job_description = job_description
    
    def validate(self) -> Tuple[bool, Optional[str]]:
        """
        Valida a requisição
        
        Returns:
            Tuple[bool, Optional[str]]: (é_válido, mensagem_erro)
        """
        # Verifica se tem arquivo ou texto
        if not self.file and not self.cv_text:
            return False, "Arquivo ou texto do CV é obrigatório"
        
        # Valida arquivo se enviado
        if self.file:
            # Verifica nome do arquivo
            if not self.file.filename or self.file.filename == '':
                return False, "Nenhum arquivo selecionado"
            
            # Verifica formato do arquivo
            if not CVTextExtractor.is_valid_file(self.file.filename):
                return False, f"Formato não suportado. Use: {', '.join(CVTextExtractor.SUPPORTED_FORMATS)}"
            
            logger.info(f"Arquivo validado: {self.file.filename}")
        
        # Valida texto se enviado
        if self.cv_text:
            cv_text = self.cv_text.strip()
            if not cv_text:
                return False, "Texto do CV não pode estar vazio"
            self.cv_text = cv_text
            logger.info(f"Texto do CV validado: {len(cv_text)} caracteres")
        
        return True, None
    
    def get_cv_text(self) -> Optional[str]:
        """Extrai texto do CV (arquivo ou texto direto)"""
        try:
            if self.file:
                logger.info(f"Extraindo texto do arquivo: {self.file.filename}")
                file_content = self.file.read()
                cv_text = CVTextExtractor.extract_text(self.file.filename, file_content)
                logger.info(f"Texto extraído: {len(cv_text)} caracteres")
                return cv_text
            elif self.cv_text:
                return self.cv_text
        except Exception as e:
            logger.error(f"Erro ao extrair texto: {e}")
            raise
        
        return None


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
    def validate_analizar_cv_request(file: Optional[FileStorage], cv_text: Optional[str], job_description: Optional[str]) -> Tuple[Optional[AnalizarCvRequest], Optional[Tuple[Dict, int]]]:
        """
        Valida requisição de análise de CV
        
        Returns:
            Tuple[Optional[AnalizarCvRequest], Optional[Tuple[Dict, int]]]:
            - Se válido: (AnalizarCvRequest object, None)
            - Se inválido: (None, (error_response, status_code))
        """
        # Cria DTO
        request_dto = AnalizarCvRequest(file=file, cv_text=cv_text, job_description=job_description)
        
        # Valida
        is_valid, error_message = request_dto.validate()
        
        if not is_valid:
            logger.warning(f"Validação falhou: {error_message}")
            error_response = ResponseBuilder.error(error_message, status_code=400)
            return None, error_response
        
        return request_dto, None
