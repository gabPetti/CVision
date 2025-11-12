# CVision Backend Setup Guide

## Prerequisites

- Python 3.9+
- pip

## Installation

1. **Create virtual environment:**

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies:**

```bash
pip install -r requirements.txt
```

3. **Setup environment variables:**

```bash
cp .env.example .env
# Edit .env and add your OpenAI API key
```

## Running the Backend

```bash
python app.py
```

The backend will start on `http://localhost:5000`

## API Endpoints

### POST /api/analyze-cv

Analyze a CV file and provide personalized tips.

**Request:**

- `file`: PDF, DOC, or DOCX file
- `job_description` (optional): Job description to match against

**Response:**

```json
{
  "tips": [
    {
      "type": "strength|improvement|suggestion",
      "title": "Tip title",
      "description": "Detailed description"
    }
  ],
  "score": 0.85,
  "summary": "Analysis summary"
}
```

### POST /api/match-jobs

Match CV against multiple job listings.

**Request:**

- `file`: CV file
- `jobs`: JSON array of job objects

**Response:**

```json
{
  "matches": [
    {
      "job_id": "123",
      "job_title": "Senior Developer",
      "score": 0.92,
      "match_reasons": [],
      "missing_skills": []
    }
  ]
}
```

## Integration with Frontend

The frontend API client is located at `src/services/cv-api.ts`.

Set the API URL in your environment:

```
REACT_APP_API_URL=http://localhost:5000/api
```

## Development

### Adding your CV processing logic:

1. Implement your functions in `cv_processor.py`
2. Import them in `app.py`:

```python
from cv_processor import process_cv_with_langchain

# In the analyze_cv route:
analysis_result = process_cv_with_langchain(temp_path, job_description)
```

### Using LangChain with different LLMs:

Edit `cv_processor.py` to use different models:

```python
from langchain_community.llms import HuggingFaceHub
from langchain_anthropic import Anthropic

# For Claude
self.llm = Anthropic(api_key=openai_api_key)

# For HuggingFace
self.llm = HuggingFaceHub(repo_id="your-model")
```

## Deployment

See `Dockerfile` for containerized deployment.

To build and run with Docker:

```bash
docker build -t cvision-backend .
docker run -p 5000:5000 -e OPENAI_API_KEY=your_key cvision-backend
```
