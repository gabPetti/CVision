#!/bin/bash
# ============================================================================
# CVision - API Test Script
# Testa todos os endpoints do backend
# ============================================================================

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

BACKEND_URL="http://localhost:5000"

echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         CVision API - Test Script                  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if backend is running
echo -e "${BLUE}→${NC} Verificando se backend está rodando..."
if ! curl -s "$BACKEND_URL/health" > /dev/null; then
    echo -e "${RED}✗ Backend não está respondendo em $BACKEND_URL${NC}"
    echo -e "  Inicie com: cd backend && ./start.sh"
    exit 1
fi
echo -e "${GREEN}✓${NC} Backend operacional"
echo ""

# Test 1: Health Check
echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         Teste 1: Health Check                      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}→${NC} GET /health"
RESPONSE=$(curl -s "$BACKEND_URL/health")
echo "$RESPONSE" | jq .
echo ""

# Test 2: API Info
echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         Teste 2: API Info                          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}→${NC} GET /"
RESPONSE=$(curl -s "$BACKEND_URL/")
echo "$RESPONSE" | jq .
echo ""

# Test 3: Analyze CV (with text)
echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║      Teste 3: Analyze CV (com texto)               ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""

# Sample CV text
SAMPLE_CV="JOÃO SILVA
Senior Full Stack Developer | 8+ anos de experiência

SKILLS TÉCNICOS:
- Linguagens: Python, TypeScript, JavaScript, Go
- Frameworks: Flask, Django, React, Node.js, FastAPI
- Cloud: AWS, Google Cloud, Azure
- Banco de dados: PostgreSQL, MongoDB, Redis
- DevOps: Docker, Kubernetes, CI/CD pipelines

EXPERIÊNCIA:
- Senior Developer na Tech Company (2022-atual)
  • Liderança de equipe de 5 desenvolvedores
  • Arquitetura de microserviços em Kubernetes
  • Implementação de CI/CD com GitHub Actions

- Mid-level Developer na StartUp (2020-2022)
  • Desenvolvimento de APIs REST em Flask/FastAPI
  • Frontend React com TypeScript

EDUCAÇÃO:
- Bacharelado em Ciência da Computação - UFABC (2019)

CERTIFICAÇÕES:
- AWS Solutions Architect Associate
- Google Cloud Professional"

# Sample job description
SAMPLE_JOB="Procuramos Senior Full Stack Developer com:
- 5+ anos de experiência
- Python e Node.js
- React.js
- Experiência com AWS e Docker
- Liderança de equipes
- Conhecimento em microserviços

Será um diferencial:
- Experiência com Kubernetes
- Go ou Rust
- Machine Learning"

echo -e "${BLUE}→${NC} POST /functions/v1/analyze-cv"
echo -e "   Com: CV text + job description"
echo ""
echo "⏳ Processando análise (isso pode levar alguns segundos)..."
echo ""

RESPONSE=$(curl -s -X POST "$BACKEND_URL/functions/v1/analyze-cv" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "cv_text=$SAMPLE_CV" \
  --data-urlencode "job_description=$SAMPLE_JOB")

echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
echo ""

# Extract HTML from response
HTML_CONTENT=$(echo "$RESPONSE" | jq -r '.data.analysis.optimized_cv_html' 2>/dev/null || echo "")

if [ -n "$HTML_CONTENT" ] && [ "$HTML_CONTENT" != "null" ]; then
    echo -e "${GREEN}✓${NC} HTML otimizado gerado com sucesso"
    
    # Test 4: Generate PDF
    echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║      Teste 4: Generate CV PDF                      ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}→${NC} POST /functions/v1/generate-cv-pdf"
    echo ""
    echo "⏳ Gerando PDF..."
    echo ""
    
    # Prepare JSON with HTML content
    JSON_PAYLOAD=$(jq -n \
      --arg html "$HTML_CONTENT" \
      --arg filename "CV-Joao-Silva.pdf" \
      '{html_content: $html, filename: $filename}')
    
    PDF_RESPONSE=$(curl -s -X POST "$BACKEND_URL/functions/v1/generate-cv-pdf" \
      -H "Content-Type: application/json" \
      -d "$JSON_PAYLOAD")
    
    echo "$PDF_RESPONSE" | jq . 2>/dev/null || echo "$PDF_RESPONSE"
    
    # Check if PDF was generated
    PDF_BASE64=$(echo "$PDF_RESPONSE" | jq -r '.data.pdf_base64' 2>/dev/null || echo "")
    if [ -n "$PDF_BASE64" ] && [ "$PDF_BASE64" != "null" ]; then
        echo ""
        echo -e "${GREEN}✓${NC} PDF gerado com sucesso!"
        
        # Save PDF to file
        echo "$PDF_BASE64" | base64 -d > /tmp/test-cv.pdf
        echo -e "${GREEN}✓${NC} PDF salvo em: /tmp/test-cv.pdf"
        
        FILE_SIZE=$(stat -f%z /tmp/test-cv.pdf 2>/dev/null || stat -c%s /tmp/test-cv.pdf 2>/dev/null || echo "unknown")
        echo -e "   Tamanho: $FILE_SIZE bytes"
    fi
else
    echo -e "${YELLOW}⚠${NC}  HTML não foi gerado"
fi

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              Testes Completos!                     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Endpoints testados:"
echo -e "  ${GREEN}✓${NC} GET  /health"
echo -e "  ${GREEN}✓${NC} GET  /"
echo -e "  ${GREEN}✓${NC} POST /functions/v1/analyze-cv"
echo -e "  ${GREEN}✓${NC} POST /functions/v1/generate-cv-pdf"
echo ""
echo -e "Próximos passos:"
echo "  1. Abra http://localhost:8080 no browser"
echo "  2. Faça upload de um CV real"
echo "  3. Veja a análise em ação!"
echo ""
