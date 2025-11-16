#!/bin/bash
# ============================================================================
# CVision Backend - Startup Script
# ============================================================================

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       CVision Backend - Pure Python Backend       ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════╝${NC}"

# Load environment variables
if [ -f .env ]; then
    echo -e "${GREEN}✓${NC} Carregando .env"
    export $(cat .env | grep -v '^#' | xargs)
else
    echo -e "${YELLOW}⚠${NC}  Arquivo .env não encontrado"
    echo -e "${YELLOW}    Usando variáveis de ambiente padrão${NC}"
fi

# Check Python version
PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
echo -e "${GREEN}✓${NC} Python ${PYTHON_VERSION}"

# Install dependencies if needed
if [ ! -d "venv" ]; then
    echo -e "${BLUE}→${NC} Criando virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo -e "${BLUE}→${NC} Ativando virtual environment..."
source venv/bin/activate

# Install/update dependencies
echo -e "${BLUE}→${NC} Instalando dependências..."
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt

# Verify critical imports
echo -e "${BLUE}→${NC} Verificando imports críticos..."
python3 -c "
import sys
try:
    import flask
    import langchain_core
    import langchain_google_genai
    import langchain_community
    import PyPDF2
    import docx
    print('  ✓ Todas as dependências importadas com sucesso')
except ImportError as e:
    print(f'  ✗ Erro ao importar: {e}')
    sys.exit(1)
"

# Set default environment variables if not set
export FLASK_ENV=${FLASK_ENV:-development}
export DEBUG=${DEBUG:-True}
export PORT=${PORT:-5000}

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                 Configuração                       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo -e "  Flask Environment: ${FLASK_ENV}"
echo -e "  Debug Mode: ${DEBUG}"
echo -e "  Port: ${PORT}"
echo ""

# Check GEMINI_API_KEY
if [ -z "$GEMINI_API_KEY" ]; then
    echo -e "${YELLOW}⚠${NC}  GEMINI_API_KEY não configurada!"
    echo -e "   Configure em .env ou como variável de ambiente"
    echo ""
fi

echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              Iniciando Backend...                  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""

# Start the backend
python3 -m app

# Alternative: python3 app.py
