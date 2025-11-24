"""
CV Analysis Module
Análise de aderência entre CV e vaga.
"""

import logging
import base64
from werkzeug.datastructures import FileStorage
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.output_parsers import JsonOutputParser

logger = logging.getLogger(__name__)

def analyze_cv(pages, link_vaga: str, llm: ChatGoogleGenerativeAI) -> dict:
    prompt_analise = ChatPromptTemplate.from_template("""
    Você é um 'Consultor de Carreira'.
    
    Por favor, analise este currículo e faça uma análise de aderência (Gap Analysis) 
    comparando-o com os dados encontrados da vaga.

    Seja tático e gere um relatório com:
    - **Pontos Fortes**: Onde o CV atende aos requisitos.
    - **Pontos de Melhoria**: Quais requisitos da vaga faltam no CV.
    - **Sugestão Estratégica**: Uma dica de ouro para o CV.
                                                      
    Quando fizer os pontos, use <b></b> para destacar os títulos, não use asteriscos duplos.
                                                      
    Responda em json com a seguinte estrutura:
    {{
        "pontos_fortes": [...],
        "pontos_melhoria": [...],
        "sugestao_estrategica": "..."
    }}

    **Link da Vaga (JSON):**
    {link_vaga}

    **Arquivo do Currículo:**
    {cv_file}
    """)

    parser_json = JsonOutputParser()
    chain_analise = prompt_analise | llm | parser_json

    resultado = chain_analise.invoke({
        "link_vaga": link_vaga,
        "cv_file": pages,
    })

    return resultado