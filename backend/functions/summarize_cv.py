def summarize_cv(cv_text: str, job_description: str, llm) -> str:
    """ Summarize CV in relation to a job description using LangChain LLM """
    from langchain.prompts import PromptTemplate
    from langchain.chains import LLMChain

    prompt = PromptTemplate(
        input_variables=["cv_text", "job_description"],
        template=(
            "Given the following CV:\n{cv_text}\n\n"
            "And the job description:\n{job_description}\n\n"
            "Provide a concise summary of how the CV matches the job description."
        )
    )

    chain = LLMChain(llm=llm, prompt=prompt)
    summary = chain.run(cv_text=cv_text, job_description=job_description)
    return summary