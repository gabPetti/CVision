# Generate CV PDF - Supabase Function (Python)

Função Python para gerar PDF otimizado de Currículo Vitae a partir de conteúdo HTML.

## Features

- ✅ Conversão HTML → PDF de alta qualidade
- ✅ Suporte a múltiplas bibliotecas (WeasyPrint, ReportLab)
- ✅ Fallback automático se biblioteca não disponível
- ✅ CORS habilitado
- ✅ Logging estruturado
- ✅ Tratamento robusto de erros

## Requisitos

- Python 3.9+
- Supabase CLI
- pip (gerenciador de pacotes Python)

## Instalação

### 1. Instalar dependências localmente (opcional para testes)

```bash
pip install -r requirements.txt
```

### 2. Deploy para Supabase

```bash
# Deploy a função para Supabase
supabase functions deploy generate-cv-pdf

# Ou com mais verbosidade
supabase functions deploy generate-cv-pdf --verbose
```

## Uso

### Request

```bash
curl -X POST https://your-project.supabase.co/functions/v1/generate-cv-pdf \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "htmlContent": "<h1>Meu Currículo</h1><p>Conteúdo do CV...</p>"
  }'
```

### Response

```json
{
  "pdfBase64": "JVBERi0xLjQKJeLj...",
  "message": "PDF gerado com sucesso",
  "mimeType": "application/pdf",
  "size": 12345
}
```

## Bibliotecas de PDF

### WeasyPrint (Recomendado)

- ✅ Melhor qualidade de conversão HTML→PDF
- ✅ Suporte completo a CSS
- ✅ Paginação automática
- ⚠️ Requer dependências do sistema (libpango, libcairo)

### ReportLab (Fallback)

- ✅ Conversão mais rápida
- ✅ Sem dependências do sistema
- ⚠️ Suporte limitado a HTML complexo

## Variáveis de Ambiente

Adicione em `supabase/functions/generate-cv-pdf/.env`:

```env
ENVIRONMENT=production
LOG_LEVEL=INFO
```

## Arquitetura

```
┌─────────────────┐
│   Cliente Web   │
└────────┬────────┘
         │ POST /functions/v1/generate-cv-pdf
         ↓
┌──────────────────────────────┐
│  Supabase Edge Function      │
│  (Python/Flask)              │
└────────┬─────────────────────┘
         │
         ├─→ WeasyPrint (HTML→PDF)
         │
         └─→ ReportLab (Fallback)
         │
         ↓
┌─────────────────────────────────┐
│  PDF Base64 + Metadata          │
│  Content-Type: application/json │
└─────────────────────────────────┘
```

## Troubleshooting

### Erro: "weasyprint not installed"

```bash
# Install localmente para testes
pip install weasyprint

# Ou use apenas ReportLab
# ReportLab é incluído por padrão no requirements.txt
```

### Erro: "Cannot import functions_framework"

```bash
pip install functions-framework
```

### PDF gerado, mas com layout ruim

1. Verifique se o HTML está bem formado
2. Use estilos inline CSS (melhor compatibilidade)
3. Considere aumentar margins/padding

## Development

### Testar localmente

```bash
# Instale as dependências
pip install -r requirements.txt

# Execute com functions-framework
functions-framework --target=generate_cv_pdf --debug

# Teste com curl
curl -X POST http://localhost:8080 \
  -H "Content-Type: application/json" \
  -d '{"htmlContent": "<h1>Test</h1>"}'
```

### Estrutura do projeto

```
generate-cv-pdf/
├── main.py              # Função principal
├── requirements.txt     # Dependências Python
├── supabase.yaml       # Configuração Supabase
├── README.md           # Este arquivo
└── .env                # Variáveis de ambiente (não commitar)
```

## Performance

- ⚡ **Tempo de execução**: ~1-2s (WeasyPrint) ou ~500ms (ReportLab)
- 📦 **Tamanho máximo PDF**: ~50MB (limite do Supabase)
- 💾 **Requisição máxima**: 10MB de conteúdo HTML

## Segurança

- ✅ CORS habilitado apenas para origens necessárias (configurar em produção)
- ✅ Validação de input obrigatória
- ✅ Logging de todas as operações
- ⚠️ Em produção, usar JWT/API Keys válidas

## Melhorias Futuras

- [ ] Suporte a templates HTML pré-definidos
- [ ] Cache de PDFs gerados
- [ ] Webhook de notificação após geração
- [ ] Conversão de múltiplos CVs em batch
- [ ] Assinatura digital do PDF
- [ ] Compressão de imagens no PDF

## Licença

MIT
