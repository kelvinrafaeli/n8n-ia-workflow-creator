# n8n Workflow AI ⚡️

Um assistente inteligente projetado para automatizar a criação e edição de workflows do n8n utilizando Inteligência Artificial de última geração.

## ✨ Funcionalidades

- 🤖 **IA Multi-Provedor**: Suporte nativo para Google Gemini e OpenAI.
- 📂 **Gestão de Histórico**: Sistema de múltiplas sessões de chat para gerenciar diferentes projetos simultaneamente.
- 🛠️ **Edição Inteligente**: Importe workflows existentes (via busca ou link direto) e peça alterações. A IA analisa a estrutura atual e aplica as mudanças preservando sua lógica original.
- 🚀 **Deploy Direto**: Crie ou atualize workflows na sua instância n8n com um único clique.
- 🛡️ **Sanitização de Dados**: Filtros automáticos que removem metadados protegidos do n8n, garantindo deploys sem erros de "additional properties".
- 🔌 **Proxy Integrado**: Backend em Python para contornar problemas de CORS e gerenciar chaves de API com segurança.

## 🚀 Como Iniciar

### 1. Backend (Proxy)

O backend é necessário para realizar as chamadas às APIs do n8n, Gemini e OpenAI com segurança.

```bash
cd backend
pip install -r requirements.txt
python main.py
```
O servidor rodará em `http://localhost:5000`.

### 2. Frontend

Instale as dependências e inicie o ambiente de desenvolvimento:

```bash
# Instalar dependências
npm install

# Iniciar servidor dev
npm run dev
```
O app estará disponível em `http://localhost:8080`.

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React, Vite, TypeScript, Tailwind CSS, shadcn/ui, Lucide Icons.
- **Backend**: FastAPI (Python), Requests, Uvicorn.
- **IA**: Google Gemini API, OpenAI API.
- **Automação**: n8n Public API.

## ⚙️ Configuração

Ao abrir o app, clique em **Configurações** para definir:
1. Sua instância do n8n (URL e API Key).
2. Seu provedor de IA preferido (Gemini ou OpenAI) e a respectiva chave de API.

## 📄 Créditos

Desenvolvido por **Kelvin Rafaeli**.
