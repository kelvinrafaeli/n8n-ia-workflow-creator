# n8n Workflow AI ⚡️

An intelligent assistant designed to automate the creation and editing of n8n workflows using state-of-the-art Artificial Intelligence.

## ✨ Features

- 🤖 **Multi-Provider AI**: Native support for Google Gemini and OpenAI.
- 📂 **Chat History Management**: Multi-session chat system to manage different projects simultaneously.
- 🛠️ **Smart Editing**: Import existing workflows (via search or direct link) and request changes. The AI analyzes the current structure and applies changes while preserving the original logic.
- 🚀 **Direct Deploy**: Create or update workflows in your n8n instance with a single click.
- 🛡️ **Data Sanitization**: Automatic filters that remove protected n8n metadata, ensuring error-free deploys by avoiding "additional properties" issues.
- 🔌 **Integrated Proxy**: Python-based backend to bypass CORS issues and securely manage API keys.

## 🚀 Getting Started

### 1. Backend (Proxy)

The backend is required to securely proxy requests to the n8n, Gemini, and OpenAI APIs.

```bash
cd backend
pip install -r requirements.txt
python main.py
```
The server will run at `http://localhost:5000`.

### 2. Frontend

Install dependencies and start the development environment:

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```
The app will be available at `http://localhost:8080`.

## 🛠️ Technologies Used

- **Frontend**: React, Vite, TypeScript, Tailwind CSS, shadcn/ui, Lucide Icons.
- **Backend**: FastAPI (Python), Requests, Uvicorn.
- **AI**: Google Gemini API, OpenAI API.
- **Automation**: n8n Public API.

## ⚙️ Configuration

Once the app is open, click on **Settings** to configure:
1. Your n8n instance (URL and API Key).
2. Your preferred AI provider (Gemini or OpenAI) and the respective API key.

## 📄 Credits

Developed by **Kelvin Rafaeli**.
