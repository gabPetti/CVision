# CVision - Development Setup

## 🚀 Quick Start - Rodar Frontend e Backend Juntos

### Pré-requisitos

- Node.js 18+ e npm
- Supabase CLI instalado
- Python 3.9+ (para o backend)

### Instalação

```bash
# 1. Instalar dependências do frontend
npm install

# 2. Instalar dependências do backend
cd supabase/functions/generate-cv-pdf
pip install -r requirements.txt
cd ../../..

# 3. Autenticar Supabase (uma vez)
supabase login
```

### Desenvolvimento

```bash
# Rodar frontend + backend simultaneamente
npm run dev
```

Isto irá iniciar:

- ✅ **Frontend**: http://localhost:8080
- ✅ **Backend (Supabase Functions)**: http://localhost:9000

#### Scripts individuais (se necessário)

```bash
# Apenas frontend
npm run dev:frontend

# Apenas backend
npm run dev:backend

# Build para produção
npm run build

# Preview da build
npm preview
```

## 📁 Estrutura do Projeto

```
CVision/
├── src/                          # Frontend React + TypeScript
│   ├── components/              # Componentes reutilizáveis
│   ├── pages/                   # Páginas da aplicação
│   ├── hooks/                   # React hooks customizados
│   └── services/                # Serviços (API, Auth, etc)
│
├── supabase/
│   └── functions/
│       └── generate-cv-pdf/     # Backend Python
│           ├── main.py          # Função principal
│           ├── requirements.txt # Dependências
│           ├── test_main.py     # Testes
│           └── README.md        # Documentação backend
│
├── vite.config.ts              # Configuração Vite
├── package.json                 # Dependências npm
└── tailwind.config.ts           # Configuração Tailwind CSS
```

## 🔌 Comunicação Frontend ↔ Backend

### Chamadas do Frontend para Backend

```typescript
// src/services/api.ts
const response = await fetch("/functions/v1/generate-cv-pdf", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    htmlContent: "<h1>Meu CV</h1>...",
  }),
});

const data = await response.json();
const pdfBase64 = data.pdfBase64;
```

### Proxy Automático

O Vite está configurado para fazer proxy de requisições:

- Frontend: `http://localhost:8080`
- Requisições para `/functions/*` → `http://localhost:9000`
- Isto permite CORS automático em desenvolvimento

## 🛠️ Desenvolvimento

### Adicionar nova função backend

```bash
# 1. Criar pasta da função
mkdir supabase/functions/minha-funcao

# 2. Criar main.py
touch supabase/functions/minha-funcao/main.py

# 3. Criar requirements.txt
touch supabase/functions/minha-funcao/requirements.txt

# 4. Implementar a função com @functions_framework.http
```

### Adicionar novo componente frontend

```typescript
// src/components/MeuComponente.tsx
import React from "react";

export const MeuComponente: React.FC = () => {
  return <div>{/* Seu componente */}</div>;
};
```

## 🧪 Testes

### Backend (Python)

```bash
# Instalar pytest
pip install pytest pytest-mock

# Rodar testes
cd supabase/functions/generate-cv-pdf
python -m pytest test_main.py -v

# Com cobertura
python -m pytest test_main.py --cov=main
```

### Frontend (TypeScript/ESLint)

```bash
# Lint
npm run lint

# TypeScript check
npx tsc --noEmit
```

## 📦 Build e Deploy

### Build Local

```bash
npm run build
```

Isto vai gerar:

- `dist/` - Frontend otimizado
- Pronto para deploy em qualquer host estático

### Deploy para Produção

#### Frontend

```bash
# Deploy em Vercel, Netlify, GitHub Pages, etc
# Usar arquivo `dist/`
```

#### Backend

```bash
# Deploy Supabase Functions
supabase functions deploy generate-cv-pdf

# Ou todas as funções
supabase functions deploy
```

## 🐛 Troubleshooting

### Porta 8080 já está em uso

```bash
# Mudar porta no vite.config.ts
port: 3000,  # ou outra porta disponível
```

### Backend não conecta

```bash
# Verificar se Supabase está rodando
ps aux | grep supabase

# Verificar logs
supabase functions list
```

### CORS errors

```bash
# O proxy do Vite deve resolver isto automaticamente
# Se persistir, verificar vite.config.ts proxy configuration
```

### Erro de dependências Python

```bash
# Reinstalar
pip install -r supabase/functions/generate-cv-pdf/requirements.txt

# Ou usar requirements com lock
pip install -r requirements.txt --force-reinstall
```

## 📚 Documentação

- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)
- [Supabase Functions](https://supabase.com/docs/guides/functions)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)

## 🤝 Contributing

1. Criar branch: `git checkout -b feature/minha-feature`
2. Commit changes: `git commit -m 'Add minha-feature'`
3. Push to branch: `git push origin feature/minha-feature`
4. Abrir Pull Request

## 📝 License

MIT
