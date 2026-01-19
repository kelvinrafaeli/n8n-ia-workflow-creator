from fastapi import FastAPI, Request, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
import json

app = FastAPI()

# Configuração de CORS para permitir que o frontend acesse o backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/proxy/n8n")
async def proxy_n8n(request: Request):
    try:
        data = await request.json()
        target_url = data.get("url")
        api_key = data.get("apiKey")
        method = data.get("method", "GET")
        body = data.get("body")
        
        if not target_url or not api_key:
            raise HTTPException(status_code=400, detail="Missing URL or API Key")

        headers = {
            "X-N8N-API-KEY": api_key,
            "Accept": "application/json",
            "Content-Type": "application/json"
        }

        if method == "GET":
            response = requests.get(target_url, headers=headers)
        elif method == "POST":
            print(f"DEBUG: POST to {target_url}")
            print(f"DEBUG: Body: {json.dumps(body, indent=2)}")
            response = requests.post(target_url, headers=headers, json=body)
        elif method == "PUT":
            print(f"DEBUG: PUT to {target_url}")
            print(f"DEBUG: Body: {json.dumps(body, indent=2)}")
            response = requests.put(target_url, headers=headers, json=body)
        elif method == "DELETE":
            response = requests.delete(target_url, headers=headers)
        else:
            raise HTTPException(status_code=405, detail="Method not supported")

        return Response(
            content=response.text,
            status_code=response.status_code,
            media_type="application/json"
        )
    except Exception as e:
        return {"error": str(e)}

@app.post("/proxy/ai")
async def proxy_ai(request: Request):
    try:
        data = await request.json()
        target_url = data.get("url")
        api_key = data.get("apiKey")
        method = data.get("method", "POST")
        body = data.get("body")
        
        if not target_url or not api_key:
            raise HTTPException(status_code=400, detail="Missing URL or API Key")

        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json"
        }

        # Se for OpenAI, usa Bearer token
        if "openai.com" in target_url:
            headers["Authorization"] = f"Bearer {api_key}"
        # Gemini usa API key na URL
        elif "googleapis.com" in target_url and "key=" not in target_url:
            if "?" in target_url:
                target_url += f"&key={api_key}"
            else:
                target_url += f"?key={api_key}"

        if method == "POST":
            response = requests.post(target_url, headers=headers, json=body)
        else:
            response = requests.get(target_url, headers=headers)

        return Response(
            content=response.text,
            status_code=response.status_code,
            media_type="application/json"
        )
    except Exception as e:
        return {"error": str(e)}


@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
