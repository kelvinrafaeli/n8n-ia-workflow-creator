export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  workflow?: WorkflowData;
  timestamp: Date;
}

export interface WorkflowData {
  name: string;
  nodes: WorkflowNode[];
  connections: Record<string, any>;
  settings?: Record<string, any>;
}

export interface WorkflowNode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters: Record<string, any>;
  credentials?: Record<string, any>;
}

export interface Credentials {
  aiProvider: 'gemini' | 'openai';
  geminiApiKey?: string;
  openaiApiKey?: string;
  n8nUrl: string;
  n8nApiKey: string;
}


export interface N8nWorkflowResponse {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
