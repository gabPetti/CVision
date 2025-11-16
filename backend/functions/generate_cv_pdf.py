"""
CVision - PDF Generator Handler
Converte HTML otimizado para PDF usando WeasyPrint/ReportLab
"""

import logging
from lib import PDFGenerator, encode_base64

logger = logging.getLogger(__name__)

# ============================================================================
# PDF GENERATION HANDLER
# ============================================================================

def generate_pdf_from_html(html_content: str, filename: str = "CV.pdf") -> dict:
    """
    Gera PDF a partir de HTML otimizado
    
    Args:
        html_content: HTML da CV otimizada
        filename: Nome do arquivo (padrão: CV.pdf)
    
    Returns:
        Dict com PDF em base64 e metadados
    """
    try:
        logger.info(f"Gerando PDF: {filename}")
        
        # Gera PDF
        pdf_bytes = PDFGenerator.generate_from_html(html_content, title=filename)
        
        # Codifica em base64
        pdf_base64 = encode_base64(pdf_bytes)
        
        result = {
            'success': True,
            'pdf_base64': pdf_base64,
            'filename': filename,
            'size_bytes': len(pdf_bytes),
            'size_mb': round(len(pdf_bytes) / (1024 * 1024), 2)
        }
        
        logger.info(f"PDF gerado com sucesso: {result['size_mb']}MB")
        return result
    
    except Exception as e:
        logger.error(f"Erro ao gerar PDF: {e}")
        return {
            'success': False,
            'error': str(e)
        }

# ============================================================================
# ALTERNATIVE: Generate PDF from Optimized CV Data
# ============================================================================

def generate_pdf_from_cv_data(cv_data: dict) -> dict:
    """
    Gera PDF a partir dos dados otimizados da CV
    
    Args:
        cv_data: Dict com dados da CV (pode vir de analyze_cv)
    
    Returns:
        Dict com PDF em base64
    """
    try:
        # Extrai HTML otimizado
        html_content = cv_data.get('optimized_cv_html', '')
        
        if not html_content:
            return {
                'success': False,
                'error': 'HTML da CV não encontrado em cv_data'
            }
        
        return generate_pdf_from_html(html_content)
    
    except Exception as e:
        logger.error(f"Erro ao gerar PDF de dados: {e}")
        return {
            'success': False,
            'error': str(e)
        }
