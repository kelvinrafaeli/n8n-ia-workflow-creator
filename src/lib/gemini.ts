import { WorkflowData } from '@/types/workflow';
import { N8N_SYSTEM_PROMPT } from './n8n-skills';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export async function generateWorkflow(
  apiKey: string,
  userPrompt: string,
  conversationHistory: { role: string; content: string }[] = []
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

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to generate workflow');
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  // Try to extract JSON workflow from response
  const workflow = extractWorkflowFromResponse(text);

  return { text, workflow };
}

function extractWorkflowFromResponse(text: string): WorkflowData | undefined {
  try {
    // Try to find JSON in code blocks
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1]);
      if (parsed.nodes && parsed.connections) {
        return parsed as WorkflowData;
      }
    }

    // Try to parse the entire text as JSON
    const parsed = JSON.parse(text);
    if (parsed.nodes && parsed.connections) {
      return parsed as WorkflowData;
    }
  } catch (e) {
    // Not valid JSON, return undefined
  }
  return undefined;
}
