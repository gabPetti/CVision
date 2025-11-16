"""
CV Analysis Module
Análise de aderência entre CV e vaga.
"""

import logging
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.output_parsers import JsonOutputParser

logger = logging.getLogger(__name__)

def analyze_cv(cv_file: str, link_vaga: str, llm: ChatGoogleGenerativeAI) -> str:
    prompt_analise = ChatPromptTemplate.from_template("""
    Você é um 'Consultor de Carreira'.
    Faça uma análise de aderência (Gap Analysis) em Markdown comparando o CV do candidato com os dados encontrados da vaga.

    Seja tático e gere um relatório com:
    - **Pontos Fortes**: Onde o CV atende aos requisitos.
    - **Pontos de Melhoria**: Quais requisitos da vaga faltam no CV.
    - **Sugestão Estratégica**: Uma dica de ouro para o CV.
                                                      
    Responda em json com a seguinte estrutura:
    {{
        "pontos_fortes": [...],
        "pontos_melhoria": [...],
        "sugestao_estrategica": "..."
    }}

    **Link da Vaga (JSON):**
    {link_vaga}

    **Currículo (CV) do Candidato:**
    {cv}
    """)

    parser_json = JsonOutputParser()
    chain_analise = prompt_analise | llm | parser_json

    resultado = chain_analise.invoke({
        "link_vaga": link_vaga,
        "cv": cv_file
    })

    return resultado