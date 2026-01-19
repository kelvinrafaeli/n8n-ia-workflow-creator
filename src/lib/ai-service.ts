import { WorkflowData, Credentials } from '@/types/workflow';
import { N8N_SYSTEM_PROMPT } from './n8n-skills';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const PROXY_URL = 'http://localhost:5000/proxy/ai';

export async function generateWorkflow(
    credentials: Credentials,
    userPrompt: string,
    conversationHistory: { role: string; content: string }[] = []
): Promise<{ text: string; workflow?: WorkflowData }> {

    if (credentials.aiProvider === 'gemini') {
        return generateWithGemini(credentials.geminiApiKey!, userPrompt, conversationHistory);
    } else {
        return generateWithOpenAI(credentials.openaiApiKey!, userPrompt, conversationHistory);
    }
}

async function generateWithGemini(
    apiKey: string,
    userPrompt: string,
    conversationHistory: { role: string; content: string }[]
): Promise<{ text: string; workflow?: WorkflowData }> {
    const contents = [
        {
            role: 'user',
            parts: [{ text: N8N_SYSTEM_PROMPT }]
        },
        {
            role: 'model',
            parts: [{ text: 'I understand. I will create valid n8n workflow JSON following these rules. Please describe the workflow you need.' }]
        },
        ...conversationHistory.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        })),
        {
            role: 'user',
            parts: [{ text: userPrompt }]
        }
    ];

    // Usando o proxy para evitar CORS
    const response = await fetch(PROXY_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            url: GEMINI_API_URL,
            apiKey: apiKey,
            method: 'POST',
            body: {
                contents,
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 8192,
                }
            }
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to generate workflow with Gemini');
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const workflow = extractWorkflowFromResponse(text);

    return { text, workflow };
}

async function generateWithOpenAI(
    apiKey: string,
    userPrompt: string,
    conversationHistory: { role: string; content: string }[]
): Promise<{ text: string; workflow?: WorkflowData }> {
    const messages = [
        {
            role: 'system',
            content: N8N_SYSTEM_PROMPT
        },
        ...conversationHistory.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
        })),
        {
            role: 'user',
            content: userPrompt
        }
    ];

    // Chamada via proxy para evitar problemas de CORS com OpenAI
    const response = await fetch(PROXY_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            url: OPENAI_API_URL,
            apiKey: apiKey,
            method: 'POST',
            body: {
                model: 'gpt-4o',
                messages,
                temperature: 0.7,
            }
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate workflow with OpenAI');
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    const workflow = extractWorkflowFromResponse(text);

    return { text, workflow };
}

function extractWorkflowFromResponse(text: string): WorkflowData | undefined {
    try {
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[1]);
            if (parsed.nodes && parsed.connections) {
                return parsed as WorkflowData;
            }
        }

        const parsed = JSON.parse(text);
        if (parsed.nodes && parsed.connections) {
            return parsed as WorkflowData;
        }
    } catch (e) {
        // Silent
    }
    return undefined;
}
