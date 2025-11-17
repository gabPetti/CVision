"""
CV Summarization Module
Extrai e organiza informações do currículo.
"""

import logging
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.output_parsers import StrOutputParser
from weasyprint import HTML, CSS
from weasyprint.text.fonts import FontConfiguration

logger = logging.getLogger(__name__)

def generate_cv(pages: str, tips: str, llm: ChatGoogleGenerativeAI) -> str:
    prompt_html_cv = ChatPromptTemplate.from_template("""
    Você é um 'Consultor de Carreira'. Sua tarefa é gerar um currículo profissional em formato HTML, incorporando as informações do currículo e aplicando as sugestões estratégicas para otimizá-lo para a vaga.

    Certifique-se de que o HTML seja bem-estruturado, e replique exatamente o estilo do currículo e inclua todas as seções relevantes do currículo. Priorize a clareza e a facilidade de leitura.

    A estilização do HTML deve ser feita inline nos elementos. Utilize flex box ou grid se necessário para garantir que o estilo do cv original seja replicado da forma mais fiel.
                                                      
    No head, coloque esse estilo:
    <style>
        @page {
            margin: 0;
        }
        body {
            margin: 0;
            padding: 0;
        }
    </style>

    **Currículo do Candidato:**
    {cv}

    **Sugestões Estratégicas e Análise de Aderência:**
    {resultado}

    Por favor, forneça apenas o código HTML completo, sem qualquer texto adicional ou explicação. O HTML deve ser pronto para uso.
    """)

    parser_str = StrOutputParser()
    chain_html_cv = prompt_html_cv | llm | parser_str

    html_cv = chain_html_cv.invoke({
        "cv": pages,
        "resultado": tips
    }).replace('```html\n', '').replace('\n```', '')

    font_config = FontConfiguration()
    html = HTML(string=html_cv)
    # css = CSS(string='''body{background:light-blue!important;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;color:#333;line-height:1.6;background-color:#fff;max-width:800px;margin:0 auto;padding:40px}header{text-align:center;padding-bottom:20px;margin-bottom:30px;border-bottom:2px solid #f0f0f0}header h1{font-size:2.6rem;font-weight:700;color:#000;margin-bottom:10px}header p{font-size:0.95rem;color:#555;line-height:1.5}a{color:#0056b3;text-decoration:none}a:hover{text-decoration:underline}section{margin-bottom:25px}h2{font-size:1.5rem;font-weight:600;color:#222;border-bottom:1px solid #ccc;padding-bottom:5px;margin-bottom:20px}h3{font-size:1.2rem;font-weight:600;color:#111;margin-bottom:3px}article{margin-bottom:20px}article > p{font-size:1rem;font-style:italic;color:#555;margin-bottom:15px}ul{list-style-type:disc;margin-left:20px;padding-left:15px}li{font-size:0.95rem;margin-bottom:8px}li > strong,p > strong{font-weight:600;color:#000}''', font_config=font_config)

    html.write_pdf('/tmp/cv_otimizado.pdf')

    return '/tmp/cv_otimizado.pdf'