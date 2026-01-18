import { WorkflowData, N8nWorkflowResponse } from '@/types/workflow';

export interface TestConnectionResult {
  success: boolean;
  status?: number;
  error?: string;
}

export async function testN8nConnection(baseUrl: string, apiKey: string): Promise<TestConnectionResult> {
  try {
    const url = new URL('/api/v1/workflows', baseUrl);
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'X-N8N-API-KEY': apiKey,
        'Accept': 'application/json',
      },
    });
    
    if (response.ok) {
      return { success: true, status: response.status };
    } else {
      const errorData = await response.json().catch(() => ({}));
      return { 
        success: false, 
        status: response.status,
        error: `HTTP ${response.status}: ${errorData.message || response.statusText}`
      };
    }
  } catch (e) {
    const error = e instanceof Error ? e.message : 'Erro desconhecido';
    
    // Detecta erro de CORS/rede
    if (error === 'Failed to fetch' || error.includes('NetworkError')) {
      return {
        success: false,
        error: `CORS/Network Error: O navegador não conseguiu acessar ${baseUrl}. Isso geralmente acontece porque:\n\n1. O servidor n8n não permite requisições do navegador (CORS bloqueado)\n2. A URL está incorreta ou o servidor está offline\n3. Há um firewall bloqueando a conexão\n\nPara resolver, você precisa configurar CORS no n8n ou usar um proxy backend.`
      };
    }
    
    return { success: false, error };
  }
}

export async function createWorkflow(
  baseUrl: string,
  apiKey: string,
  workflow: WorkflowData
): Promise<N8nWorkflowResponse> {
  const url = new URL('/api/v1/workflows', baseUrl);
  
  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'X-N8N-API-KEY': apiKey,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(workflow),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create workflow' }));
    throw new Error(error.message || 'Failed to create workflow');
  }

  return response.json();
}

export async function listWorkflows(
  baseUrl: string,
  apiKey: string
): Promise<N8nWorkflowResponse[]> {
  const url = new URL('/api/v1/workflows', baseUrl);
  
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'X-N8N-API-KEY': apiKey,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch workflows');
  }

  const data = await response.json();
  return data.data || [];
}

export async function activateWorkflow(
  baseUrl: string,
  apiKey: string,
  workflowId: string
): Promise<void> {
  const url = new URL(`/api/v1/workflows/${workflowId}/activate`, baseUrl);
  
  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'X-N8N-API-KEY': apiKey,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to activate workflow');
  }
}
