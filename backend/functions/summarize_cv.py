def summarize_cv(cv_text: str, job_description: str, llm) -> str:
    """ Summarize CV in relation to a job description using LangChain LLM """
    from langchain_core.prompts import PromptTemplate

    prompt = PromptTemplate(
        input_variables=["cv_text", "job_description"],
        template=(
            "Given the following CV:\n{cv_text}\n\n"
            "And the job description:\n{job_description}\n\n"
            "Provide a concise summary of how the CV matches the job description."
        )
    )

    # Use the pipe operator instead of LLMChain for newer LangChain versions
    chain = prompt | llm
    result = chain.invoke({"cv_text": cv_text, "job_description": job_description})
    
    # Extract text from response
    if hasattr(result, 'content'):
        return result.content
    return str(result)