import { WorkflowData, N8nWorkflowResponse } from '@/types/workflow';

export interface TestConnectionResult {
  success: boolean;
  status?: number;
  error?: string;
}

const PROXY_URL = '/proxy/n8n';

export async function testN8nConnection(baseUrl: string, apiKey: string): Promise<TestConnectionResult> {
  try {
    const targetUrl = new URL('/api/v1/workflows', baseUrl).toString();
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: targetUrl,
        apiKey: apiKey,
        method: 'GET'
      }),
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
    return { success: false, error };
  }
}

function cleanWorkflow(workflow: any): any {
  console.log('Original Workflow for cleaning:', workflow);

  // Apenas o ABSOLUTAMENTE necessário para o n8n não reclamar de "additional properties"
  const clean: any = {
    name: workflow.name || 'AI Generated Workflow',
    nodes: workflow.nodes || [],
    connections: workflow.connections || {}
  };

  // Settings é opcional mas permitido
  if (workflow.settings && Object.keys(workflow.settings).length > 0) {
    clean.settings = workflow.settings;
  }

  console.log('Cleaned Workflow for Deploy:', clean);
  return clean;
}

export async function createWorkflow(
  baseUrl: string,
  apiKey: string,
  workflow: WorkflowData
): Promise<N8nWorkflowResponse> {
  const targetUrl = new URL('/api/v1/workflows', baseUrl).toString();

  const response = await fetch(PROXY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: targetUrl,
      apiKey: apiKey,
      method: 'POST',
      body: cleanWorkflow(workflow)
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create workflow' }));
    throw new Error(error.message || 'Failed to create workflow');
  }

  return response.json();
}

export async function updateWorkflow(
  baseUrl: string,
  apiKey: string,
  workflowId: string,
  workflow: WorkflowData
): Promise<N8nWorkflowResponse> {
  const targetUrl = new URL(`/api/v1/workflows/${workflowId}`, baseUrl).toString();

  const response = await fetch(PROXY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: targetUrl,
      apiKey: apiKey,
      method: 'PUT',
      body: cleanWorkflow(workflow)
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to update workflow' }));
    throw new Error(error.message || 'Failed to update workflow');
  }

  return response.json();
}

export async function listWorkflows(
  baseUrl: string,
  apiKey: string
): Promise<N8nWorkflowResponse[]> {
  const targetUrl = new URL('/api/v1/workflows', baseUrl).toString();

  const response = await fetch(PROXY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: targetUrl,
      apiKey: apiKey,
      method: 'GET'
    }),
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
  const targetUrl = new URL(`/api/v1/workflows/${workflowId}/activate`, baseUrl).toString();

  const response = await fetch(PROXY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: targetUrl,
      apiKey: apiKey,
      method: 'POST'
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to activate workflow');
  }
}

export async function getWorkflow(
  baseUrl: string,
  apiKey: string,
  workflowId: string
): Promise<WorkflowData> {
  const targetUrl = new URL(`/api/v1/workflows/${workflowId}`, baseUrl).toString();

  const response = await fetch(PROXY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: targetUrl,
      apiKey: apiKey,
      method: 'GET'
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch workflow' }));
    throw new Error(error.message || 'Failed to fetch workflow');
  }

  return response.json();
}


