import { WorkflowData, N8nWorkflowResponse } from '@/types/workflow';

export async function testN8nConnection(baseUrl: string, apiKey: string): Promise<boolean> {
  try {
    const url = new URL('/api/v1/workflows', baseUrl);
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'X-N8N-API-KEY': apiKey,
        'Accept': 'application/json',
      },
    });
    return response.ok;
  } catch (e) {
    return false;
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
