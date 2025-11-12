# CVision

## 🚀 Visão Geral

O CVision é uma ferramenta de PLN que atua como um consultor de RH digital. Em vez de uma análise de currículo genérica, este projeto foca em resolver um problema do mundo real que toda pessoa que já entrou no mercado de trabalho já se perguntou: "Meu currículo está bom para esta vaga?"

O usuário fornece dois inputs de texto:

- O texto completo do seu Currículo (CV).
- O texto completo da Descrição da Vaga (ex: copiado do LinkedIn, Vagas.com).

A ferramenta, então, gera uma análise de aderência (Gap Analysis) tática, informando os pontos fortes, as lacunas (o que falta) e sugestões estratégicas para o candidato se destacar.

## ✨ Features

- **Gap Analysis**: Compara o CV do usuário com os requisitos da vaga.
- **Extração de Requisitos**: Identifica e extrai automaticamente as hard skills e soft skills mais importantes da descrição da vaga.
- **Relatório Tático**: Gera um relatório simples em markdown com:
  - Pontos Fortes: Onde o seu CV brilha para esta vaga.
  - Pontos de Melhoria: Quais requisitos da vaga não estão claros no seu CV.
  - Sugestão Estratégica: Uma dica de ouro para destacar na sua carta de apresentação ou entrevista.

## 🛠️ Arquitetura e Uso Criativo do LangChain

Aqui está o núcleo do projeto, utilizando o LangChain e múltiplas técnicas de PLN para alcançar as features descritas acima.

Em vez de um prompt único, o projeto usa a LCEL (LangChain Expression Language) para orquestrar um pipeline de duas etapas que simula o raciocínio de um recrutador. A pipeline consiste na utilização das tecnicas de Extração de Entidades encadeado de Sumarização Comparativa.

Cadeia 1: Extração de Requisitos

- Input: O `texto_vaga`.
- Processo: O texto passa por um `PromptTemplate` que instrui o LLM a atuar como um "Tech Recruiter".
- Técnica: O LLM (Gemini) extrai as skills essenciais.
- Output: Um `JsonOutputParser` força o LLM a retornar um JSON estruturado com as `hard_skills` e `soft_skills`.

Cadeia 2: Análise de Aderência

- Input: O texto_cv do usuário + o JSON gerado pela Cadeia 1.
- Processo: Um PromptTemplate instrui o LLM a atuar como "Consultor de Carreira".
- Técnica: O LLM (Gemini) recebe ambos os inputs e deve comparar os dois, gerando a análise de aderência (gap analysis).
- Output: Um `StrOutputParser` retorna o relatório final em texto (Markdown).

O RunnablePassthrough do LangChain é usado para gerenciar e rotear esses múltiplos inputs (CV, Vaga) através do pipeline de forma eficiente.

## ✅ Atendimento aos Critérios de Avaliação

- Uso do LangChain: Uso da LCEL para orquestrar um pipeline sequencial, gerenciar múltiplos inputs e usar parsers.
- Uso de um LLM: Uso do Gemini 2.5 Flash para ambas as etapas de PLN.
- Uso de Página Web (Corpus): O corpus é o texto de uma vaga de emprego real (ex: LinkedIn, Vagas.com), um dado não-estruturado do "mundo real" que o usuário fornece.
- Github: O projeto está disponível [link-para-seu-github-aqui].
- Criatividade: A criatividade reside na arquitetura de duas etapas, que simula o raciocínio de um recrutador (primeiro entende a vaga, depois analisa o CV), ao invés de usar um prompt único e simplista. Este projeto exala criatividade e inovação

## 🔧 Tecnologias Utilizadas

- Linguagem: Python
- Plataforma: Google Colab
- Framework: LangChain (LCEL, langchain-google-genai, langchain-core)
- LLM: Google Gemini 2.5 Flash
