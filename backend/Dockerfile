FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 5000

# Set environment variables (matching start.sh defaults)
ENV FLASK_ENV=development
ENV DEBUG=True
ENV PORT=5000

# Verify critical imports before starting
RUN python3 -c "import flask; import langchain_core; import langchain_google_genai; import langchain_community; import PyPDF2; import docx; print('✓ All dependencies imported successfully')"

# Run the application (using python3 -m app as in start.sh)
CMD ["python3", "-m", "app"]
