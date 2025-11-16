"""
Testes para a função generate_cv_pdf
Execute com: python -m pytest test_main.py
"""

import pytest
import json
import base64
from unittest.mock import Mock, patch, MagicMock
from main import generate_cv_pdf, generate_pdf_from_html, generate_pdf_from_html_reportlab


class TestGenerateCvPdf:
    """Testes para a função principal generate_cv_pdf"""
    
    def test_cors_preflight(self):
        """Testa requisição OPTIONS (CORS preflight)"""
        request = Mock()
        request.method = 'OPTIONS'
        
        response, status, headers = generate_cv_pdf(request)
        
        assert status == 204
        assert headers['Access-Control-Allow-Origin'] == '*'
        assert 'Access-Control-Allow-Methods' in headers
    
    def test_missing_html_content(self):
        """Testa quando htmlContent não é fornecido"""
        request = Mock()
        request.method = 'POST'
        request.get_json.return_value = {}
        
        response_data, status, headers = generate_cv_pdf(request)
        
        assert status == 400
        assert b'htmlContent é obrigatório' in response_data.data
    
    def test_invalid_json(self):
        """Testa quando o body não é JSON válido"""
        request = Mock()
        request.method = 'POST'
        request.get_json.side_effect = ValueError("Invalid JSON")
        
        response_data, status, headers = generate_cv_pdf(request)
        
        assert status == 400
        assert b'Erro ao fazer parse do JSON' in response_data.data
    
    def test_empty_request(self):
        """Testa quando o request não contém JSON"""
        request = Mock()
        request.method = 'POST'
        request.get_json.return_value = None
        
        response_data, status, headers = generate_cv_pdf(request)
        
        assert status == 400
        assert b'Request body deve ser JSON' in response_data.data
    
    @patch('main.HAS_WEASYPRINT', True)
    @patch('main.generate_pdf_from_html')
    def test_successful_generation_weasyprint(self, mock_pdf_gen):
        """Testa geração bem-sucedida com WeasyPrint"""
        mock_pdf_bytes = b'%PDF-1.4 mock pdf content'
        mock_pdf_gen.return_value = mock_pdf_bytes
        
        html_content = '<h1>Meu CV</h1><p>Conteúdo aqui</p>'
        request = Mock()
        request.method = 'POST'
        request.get_json.return_value = {'htmlContent': html_content}
        
        response_data, status, headers = generate_cv_pdf(request)
        
        assert status == 200
        response_json = json.loads(response_data.data)
        assert 'pdfBase64' in response_json
        assert response_json['message'] == 'PDF gerado com sucesso'
        assert response_json['mimeType'] == 'application/pdf'
        mock_pdf_gen.assert_called_once_with(html_content)
    
    @patch('main.HAS_WEASYPRINT', False)
    @patch('main.HAS_REPORTLAB', True)
    @patch('main.generate_pdf_from_html_reportlab')
    def test_successful_generation_reportlab(self, mock_pdf_gen):
        """Testa geração bem-sucedida com ReportLab (fallback)"""
        mock_pdf_bytes = b'%PDF-1.4 mock pdf content'
        mock_pdf_gen.return_value = mock_pdf_bytes
        
        html_content = '<h1>Meu CV</h1>'
        request = Mock()
        request.method = 'POST'
        request.get_json.return_value = {'htmlContent': html_content}
        
        response_data, status, headers = generate_cv_pdf(request)
        
        assert status == 200
        response_json = json.loads(response_data.data)
        assert 'pdfBase64' in response_json
        mock_pdf_gen.assert_called_once()
    
    @patch('main.generate_pdf_from_html')
    def test_pdf_generation_error(self, mock_pdf_gen):
        """Testa tratamento de erro na geração de PDF"""
        mock_pdf_gen.side_effect = Exception("PDF generation failed")
        
        html_content = '<h1>Test</h1>'
        request = Mock()
        request.method = 'POST'
        request.get_json.return_value = {'htmlContent': html_content}
        
        response_data, status, headers = generate_cv_pdf(request)
        
        assert status == 500
        response_json = json.loads(response_data.data)
        assert 'error' in response_json
    
    def test_cors_headers_present(self):
        """Testa se headers CORS estão presentes na resposta"""
        request = Mock()
        request.method = 'POST'
        request.get_json.return_value = {'htmlContent': '<h1>Test</h1>'}
        
        with patch('main.generate_pdf_from_html', return_value=b'pdf'):
            response_data, status, headers = generate_cv_pdf(request)
            
            assert headers['Access-Control-Allow-Origin'] == '*'
            assert 'Access-Control-Allow-Headers' in headers
            assert headers['Content-Type'] == 'application/json'


class TestGeneratePdfFromHtml:
    """Testes para generate_pdf_from_html"""
    
    @patch('main.HTML')
    def test_html_conversion(self, mock_html):
        """Testa conversão de HTML para PDF"""
        mock_pdf_bytes = b'%PDF-1.4 converted content'
        mock_html.return_value.write_pdf.return_value = mock_pdf_bytes
        
        html_content = '<h1>Test CV</h1>'
        result = generate_pdf_from_html(html_content)
        
        assert result == mock_pdf_bytes
        mock_html.assert_called_once()
    
    def test_weasyprint_not_installed(self):
        """Testa erro quando WeasyPrint não está instalado"""
        with patch('main.HAS_WEASYPRINT', False):
            with pytest.raises(RuntimeError, match='weasyprint não está instalado'):
                generate_pdf_from_html('<h1>Test</h1>')


class TestGeneratePdfFromHtmlReportlab:
    """Testes para generate_pdf_from_html_reportlab"""
    
    @patch('main.SimpleDocTemplate')
    def test_reportlab_generation(self, mock_doc):
        """Testa geração com ReportLab"""
        with patch('main.HAS_REPORTLAB', True):
            mock_pdf_bytes = b'%PDF-1.4 reportlab content'
            mock_doc.return_value.build.return_value = None
            
            result = generate_pdf_from_html_reportlab('<h1>Test</h1>')
            
            assert isinstance(result, bytes)
    
    def test_reportlab_not_installed(self):
        """Testa erro quando ReportLab não está instalado"""
        with patch('main.HAS_REPORTLAB', False):
            with pytest.raises(RuntimeError, match='reportlab não está instalado'):
                generate_pdf_from_html_reportlab('<h1>Test</h1>')


class TestBase64Encoding:
    """Testes para encoding base64"""
    
    @patch('main.generate_pdf_from_html')
    def test_base64_encoding(self, mock_pdf_gen):
        """Testa se PDF é corretamente encoded em base64"""
        test_pdf = b'test pdf content'
        mock_pdf_gen.return_value = test_pdf
        
        request = Mock()
        request.method = 'POST'
        request.get_json.return_value = {'htmlContent': '<h1>Test</h1>'}
        
        response_data, status, headers = generate_cv_pdf(request)
        response_json = json.loads(response_data.data)
        
        # Decodifica e verifica
        decoded = base64.b64decode(response_json['pdfBase64'])
        assert decoded == test_pdf


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
