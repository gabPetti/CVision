"""
CV Processing module using LangChain
"""
from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import LLMChain
from langchain_openai import OpenAI
from langchain.prompts import PromptTemplate
from typing import List, Dict
import os


class CVProcessor:
    """Process CV files and analyze them using LangChain"""
    
    def __init__(self, openai_api_key: str = None):
        """Initialize CV Processor with OpenAI LLM"""
        if openai_api_key is None:
            openai_api_key = os.getenv('OPENAI_API_KEY')
        
        self.llm = OpenAI(api_key=openai_api_key, temperature=0.7)
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
    
    def extract_cv_text(self, file_path: str) -> str:
        """Extract text from CV file"""
        if file_path.endswith('.pdf'):
            loader = PyPDFLoader(file_path)
            documents = loader.load()
            return '\n'.join([doc.page_content for doc in documents])
        else:
            # Handle other file types (DOC, DOCX)
            # Implement with python-docx or other libraries
            raise NotImplementedError(f"File type not supported yet")
    
    def analyze_cv(self, cv_text: str, job_description: str = None) -> Dict:
        """
        Analyze CV and provide personalized tips
        
        Args:
            cv_text: Extracted CV content
            job_description: Optional job description to match against
        
        Returns:
            Dictionary with tips and analysis
        """
        
        prompt_template = PromptTemplate(
            input_variables=["cv", "job_description"],
            template="""Analyze this CV and provide personalized tips to improve it.
            
CV Content:
{cv}

Job Description:
{job_description}

Please provide:
1. 2-3 strengths
2. 2-3 areas for improvement
3. 2-3 suggestions for matching this job

Format the response as a JSON array with objects containing:
- type: "strength", "improvement", or "suggestion"
- title: Short title
- description: Detailed description

Return only valid JSON."""
        )
        
        chain = LLMChain(llm=self.llm, prompt=prompt_template)
        
        result = chain.run(
            cv=cv_text[:4000],  # Limit to avoid token limits
            job_description=job_description or "General career advancement"
        )
        
        return {
            'tips': self._parse_tips(result),
            'raw_analysis': result
        }
    
    def match_cv_with_jobs(self, cv_text: str, jobs: List[Dict]) -> List[Dict]:
        """
        Match CV against multiple job listings
        
        Args:
            cv_text: Extracted CV content
            jobs: List of job dictionaries with 'id' and 'description'
        
        Returns:
            List of matches with scores
        """
        
        prompt_template = PromptTemplate(
            input_variables=["cv", "job"],
            template="""Given this CV and job description, determine a match score (0-100) and provide a brief explanation.

CV:
{cv}

Job Description:
{job}

Return a JSON object with:
- score: number between 0-100
- match_reasons: array of 2-3 reason strings
- missing_skills: array of skills needed but not in CV"""
        )
        
        chain = LLMChain(llm=self.llm, prompt=prompt_template)
        matches = []
        
        for job in jobs:
            try:
                result = chain.run(
                    cv=cv_text[:3000],
                    job=job.get('description', '')[:2000]
                )
                
                match_data = self._parse_json(result)
                match_data['job_id'] = job.get('id')
                match_data['job_title'] = job.get('title', 'Unknown')
                matches.append(match_data)
            
            except Exception as e:
                print(f"Error processing job {job.get('id')}: {e}")
                continue
        
        return sorted(matches, key=lambda x: x.get('score', 0), reverse=True)
    
    @staticmethod
    def _parse_tips(response: str) -> List[Dict]:
        """Parse LLM response into tips"""
        import json
        try:
            tips = json.loads(response)
            return tips if isinstance(tips, list) else []
        except json.JSONDecodeError:
            return []
    
    @staticmethod
    def _parse_json(response: str) -> Dict:
        """Parse JSON response from LLM"""
        import json
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            return {'score': 0, 'error': 'Failed to parse response'}


# Factory function
def get_cv_processor() -> CVProcessor:
    """Get configured CV processor instance"""
    return CVProcessor()
