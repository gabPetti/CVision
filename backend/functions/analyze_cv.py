"""
CVision - CV Analyzer
Análise com 3 cadeias LCEL:
  1. Tech Recruiter: Extrai skills e requisitos técnicos
  2. Career Consultant: Analisa gaps e oportunidades
  3. CV Optimizer: Gera HTML otimizado do CV
"""

import json
import logging
from typing import Optional
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from lib import LLMProvider

logger = logging.getLogger(__name__)

# ============================================================================
# CV ANALYZER - Main Class
# ============================================================================

class CVisionAnalyzer:
    """Analisador de CV com 3 cadeias LCEL"""
    
    def __init__(self):
        """Inicializa analyzer com LLM provider"""
        self.llm_provider = LLMProvider()
        self.llm = self.llm_provider.get_llm()
    
    def analyze(self, cv_text: str, job_description: Optional[str] = None) -> dict:
        """
        Analisa CV com 3 cadeias LCEL
        
        Args:
            cv_text: Texto extraído do CV
            job_description: Descrição de vaga (opcional)
        
        Returns:
            Dict com análise completa
        """
        try:
            logger.info("Iniciando análise do CV...")
            
            # Cadeia 1: Tech Recruiter - Extrai skills técnicos
            logger.info("Cadeia 1: Tech Recruiter...")
            skills_analysis = self._chain_tech_recruiter(cv_text)
            
            # Cadeia 2: Career Consultant - Analisa gaps
            logger.info("Cadeia 2: Career Consultant...")
            gap_analysis = self._chain_career_consultant(cv_text, job_description)
            
            # Cadeia 3: CV Optimizer - Gera HTML otimizado
            logger.info("Cadeia 3: CV Optimizer...")
            optimized_cv_html = self._chain_cv_optimizer(cv_text, skills_analysis)
            
            # Consolida resultado
            result = {
                'success': True,
                'analysis': {
                    'skills': skills_analysis,
                    'gaps': gap_analysis,
                    'optimized_cv_html': optimized_cv_html
                },
                'metadata': {
                    'cv_length': len(cv_text),
                    'chains_executed': 3
                }
            }
            
            logger.info("Análise do CV concluída com sucesso")
            return result
        
        except Exception as e:
            logger.error(f"Erro ao analisar CV: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    # ========================================================================
    # CADEIA 1: TECH RECRUITER - Extrai Skills e Requisitos Técnicos
    # ========================================================================
    
    def _chain_tech_recruiter(self, cv_text: str) -> dict:
        """
        Cadeia 1: Tech Recruiter
        Extrai skills técnicos, linguagens, frameworks, experiência
        """
        prompt = ChatPromptTemplate.from_template("""
Você é um recrutador técnico experiente. Analise o CV abaixo e extraia:

1. **Skills Técnicos**: Linguagens de programação, frameworks, bibliotecas
2. **Experiência**: Anos de experiência por skill
3. **Nível de Proficiência**: Junior, Pleno, Sênior por skill
4. **Certificações**: Certifications relevantes encontradas
5. **Tecnologias Emergentes**: Skills em tecnologias modernas (AI, Cloud, etc)

CV:
{cv_text}

Retorne um JSON bem estruturado com os campos acima.
Seja específico e quantifique quando possível.
""")
        
        chain = prompt | self.llm | StrOutputParser()
        response = chain.invoke({'cv_text': cv_text})
        
        try:
            # Tenta extrair JSON da resposta
            return json.loads(response)
        except json.JSONDecodeError:
            logger.warning("Resposta não é JSON válido, retornando como texto")
            return {
                'raw_response': response,
                'parse_error': 'Response is not valid JSON'
            }
    
    # ========================================================================
    # CADEIA 2: CAREER CONSULTANT - Análise de Gaps e Oportunidades
    # ========================================================================
    
    def _chain_career_consultant(self, cv_text: str, job_description: Optional[str] = None) -> dict:
        """
        Cadeia 2: Career Consultant
        Analisa gaps de skills, oportunidades de crescimento, recomendações
        """
        if job_description:
            template = """
Você é um consultor de carreira experiente. Analise o CV e a descrição da vaga.

CV:
{cv_text}

Descrição da Vaga:
{job_description}

Identifique:
1. **Skills Faltando**: Requisitos da vaga que não estão no CV
2. **Fit Score**: De 0-100, qual o match entre CV e vaga
3. **Gaps Críticos**: Skills essenciais faltando
4. **Recomendações**: Como melhorar o perfil para a vaga
5. **Diferenciais**: Pontos positivos do candidato para a vaga

Retorne um JSON bem estruturado.
"""
            variables = {'cv_text': cv_text, 'job_description': job_description}
        else:
            template = """
Você é um consultor de carreira experiente. Analise o CV e identifique:

CV:
{cv_text}

1. **Pontos Fortes**: Maiores competências do candidato
2. **Gaps Identificados**: Skills relevantes que faltam
3. **Próximos Passos**: Recomendações para evolução profissional
4. **Trajetória Ideal**: Possíveis caminhos de carreira
5. **Score de Competitividade**: De 0-100

Retorne um JSON bem estruturado.
"""
            variables = {'cv_text': cv_text}
        
        prompt = ChatPromptTemplate.from_template(template)
        chain = prompt | self.llm | StrOutputParser()
        response = chain.invoke(variables)
        
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            logger.warning("Resposta Career Consultant não é JSON válido")
            return {
                'raw_response': response,
                'parse_error': 'Response is not valid JSON'
            }
    
    # ========================================================================
    # CADEIA 3: CV OPTIMIZER - Gera HTML Otimizado do CV
    # ========================================================================
    
    def _chain_cv_optimizer(self, cv_text: str, skills_analysis: dict) -> str:
        """
        Cadeia 3: CV Optimizer
        Gera versão otimizada e visual do CV em HTML
        """
        skills_context = json.dumps(skills_analysis, ensure_ascii=False, indent=2) if isinstance(skills_analysis, dict) else str(skills_analysis)
        
        prompt = ChatPromptTemplate.from_template("""
Você é um especialista em otimização de CVs. Transforme o CV abaixo em um HTML profissional e moderno.

CV Original:
{cv_text}

Análise de Skills (para referência):
{skills_analysis}

Crie um HTML bem estruturado com:
1. **Header**: Nome, título profissional, contato (links formatados)
2. **Seções**: Sobre, Experiência, Educação, Skills, Projetos
3. **Design**: CSS inline, cores profissionais, boa tipografia
4. **Responsividade**: Funcione bem em mobile e desktop
5. **Destaque**: Hightlight dos skills mais importantes

IMPORTANTE:
- Retorne APENAS o HTML puro (sem markdown, sem ```html```)
- CSS deve estar embutido no style="" ou em <style> tags
- Use cores profissionais (azul, cinza, branco)
- Fonte: sans-serif
- Melhor legibilidade possível

Comece direto com <!DOCTYPE html> e termine com </html>
""")
        
        chain = prompt | self.llm | StrOutputParser()
        response = chain.invoke({
            'cv_text': cv_text,
            'skills_analysis': skills_context
        })
        
        # Limpa resposta se tiver markdown markers
        if response.startswith('```'):
            response = response.strip('```').replace('html', '', 1).strip()
        
        logger.info("HTML do CV gerado com sucesso")
        return response

# ============================================================================
# HELPER FUNCTION
# ============================================================================

def create_analyzer() -> CVisionAnalyzer:
    """Factory function para criar analyzer"""
    return CVisionAnalyzer()
