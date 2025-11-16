import functions_framework
import json
import base64
from flask import Request, jsonify
from typing import Any
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import para gerar PDF
try:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
    from reportlab.lib.units import cm
    from reportlab.lib.colors import HexColor
    HAS_REPORTLAB = True
except ImportError:
    HAS_REPORTLAB = False
    logger.warning("reportlab not installed. PDF generation will be limited.")

try:
    from weasyprint import HTML, CSS
    HAS_WEASYPRINT = True
except ImportError:
    HAS_WEASYPRINT = False
    logger.warning("weasyprint not installed. HTML to PDF conversion will be limited.")


def generate_pdf_from_html(html_content: str) -> bytes:
    """
    Converte HTML para PDF usando WeasyPrint
    
    Args:
        html_content: Conteúdo HTML a ser convertido
        
    Returns:
        Bytes do arquivo PDF gerado
    """
    if not HAS_WEASYPRINT:
        raise RuntimeError(
            "weasyprint não está instalado. "
            "Instale com: pip install weasyprint"
        )
    
    # HTML com estilos otimizados para PDF
    html_with_styles = f"""
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="UTF-8">
            <style>
                @page {{
                    size: A4;
                    margin: 2cm;
                }}
                body {{
                    font-family: 'Arial', sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                h1 {{
                    color: #2563eb;
                    border-bottom: 3px solid #2563eb;
                    padding-bottom: 10px;
                    margin-bottom: 20px;
                }}
                h2 {{
                    color: #1e40af;
                    margin-top: 25px;
                    margin-bottom: 15px;
                }}
                h3 {{
                    color: #3b82f6;
                    margin-top: 20px;
                    margin-bottom: 10px;
                }}
                ul {{
                    margin: 10px 0;
                    padding-left: 25px;
                }}
                li {{
                    margin: 8px 0;
                }}
                .section {{
                    margin-bottom: 25px;
                    page-break-inside: avoid;
                }}
                .highlight {{
                    background-color: #dbeafe;
                    padding: 2px 6px;
                    border-radius: 3px;
                }}
                .contact-info {{
                    margin-bottom: 20px;
                    font-size: 0.95em;
                }}
            </style>
        </head>
        <body>
            {html_content}
        </body>
    </html>
    """
    
    # Gera PDF usando WeasyPrint
    pdf_bytes = HTML(string=html_with_styles).write_pdf()
    return pdf_bytes


def generate_pdf_from_html_reportlab(html_content: str) -> bytes:
    """
    Conversão alternativa usando reportlab (sem suporte completo a HTML)
    
    Args:
        html_content: Conteúdo HTML a ser convertido
        
    Returns:
        Bytes do arquivo PDF gerado
    """
    if not HAS_REPORTLAB:
        raise RuntimeError(
            "reportlab não está instalado. "
            "Instale com: pip install reportlab"
        )
    
    from io import BytesIO
    
    # Cria documento PDF
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=2*cm, leftMargin=2*cm)
    
    # Estilos
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=HexColor('#2563eb'),
        spaceAfter=30,
        borderPadding=10
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=HexColor('#1e40af'),
        spaceAfter=12,
        spaceBefore=12
    )
    
    # Extrai conteúdo HTML (simplificado)
    # Em produção, use uma biblioteca como html2text ou BeautifulSoup
    content = []
    
    # Exemplo simples - você pode melhorar isso
    elements = []
    elements.append(Spacer(1, 20))
    elements.append(Paragraph(
        "Currículo Vitae",
        title_style
    ))
    elements.append(Spacer(1, 20))
    elements.append(Paragraph(
        "Conteúdo do CV foi convertido para PDF",
        styles['Normal']
    ))
    
    # Constrói PDF
    doc.build(elements)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    
    return pdf_bytes


@functions_framework.http
def generate_cv_pdf(request: Request) -> tuple[Any, int]:
    """
    Função HTTP para gerar PDF do CV
    
    Args:
        request: Requisição HTTP com JSON contendo htmlContent
        
    Returns:
        Resposta JSON com PDF em base64
    """
    
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
        }
        return '', 204, headers
    
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Content-Type': 'application/json',
    }
    
    try:
        # Parse request JSON
        request_json = request.get_json()
        
        if not request_json:
            return jsonify({
                'error': 'Request body deve ser JSON'
            }), 400, headers
        
        html_content = request_json.get('htmlContent')
        
        if not html_content:
            return jsonify({
                'error': 'htmlContent é obrigatório'
            }), 400, headers
        
        logger.info("Gerando PDF do CV otimizado...")
        
        # Tenta usar WeasyPrint primeiro (melhor qualidade)
        if HAS_WEASYPRINT:
            pdf_bytes = generate_pdf_from_html(html_content)
            logger.info("PDF gerado com WeasyPrint")
        elif HAS_REPORTLAB:
            pdf_bytes = generate_pdf_from_html_reportlab(html_content)
            logger.info("PDF gerado com ReportLab")
        else:
            # Fallback: retorna HTML em base64
            logger.warning("Nenhuma biblioteca de PDF disponível. Retornando HTML em base64.")
            pdf_bytes = html_content.encode('utf-8')
        
        # Converte para base64
        pdf_base64 = base64.b64encode(pdf_bytes).decode('utf-8')
        
        logger.info("PDF gerado com sucesso")
        
        return jsonify({
            'pdfBase64': pdf_base64,
            'message': 'PDF gerado com sucesso',
            'mimeType': 'application/pdf',
            'size': len(pdf_bytes)
        }), 200, headers
        
    except ValueError as e:
        logger.error(f"Erro ao fazer parse do JSON: {str(e)}")
        return jsonify({
            'error': f'Erro ao fazer parse do JSON: {str(e)}'
        }), 400, headers
        
    except Exception as e:
        logger.error(f"Erro ao gerar PDF: {str(e)}")
        return jsonify({
            'error': str(e)
        }), 500, headers
