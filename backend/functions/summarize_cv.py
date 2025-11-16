"""
CV Summarization Module
Extrai e organiza informações do currículo.
"""

import logging
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.output_parsers import StrOutputParser

logger = logging.getLogger(__name__)

def summarize_cv(pages: str, llm: ChatGoogleGenerativeAI, parser_str: StrOutputParser) -> str:
    """
    Sumariza e organiza as informações do currículo.
    
    Args:
        pages: Texto do currículo extraído
        llm: Instância do LLM (ChatGoogleGenerativeAI)
        parser_str: Parser de saída (StrOutputParser)
    
    Returns:
        String com currículo resumido e organizado
    """
    prompt_sumarizacao = ChatPromptTemplate.from_template("""
    Extraia e organize as informações do currículo abaixo em uma tabela ou lista limpa. Ignore informações irrelevantes ou textos genéricos.

    Estruture a resposta assim:
        Cargos/Título Principais:
        Tempo de Experiência: (Calcule o tempo total baseado nas datas)
        Empresas Anteriores: (Liste apenas os nomes)
        Educação:
        Projetos:
        Idiomas:
        Stack Tecnológico/Ferramentas:

    Currículo: {cv}
    """)

    chain_sumarizacao = prompt_sumarizacao | llm | parser_str

    cv_resumido = chain_sumarizacao.invoke({
        "cv": pages
    })

    return cv_resumido