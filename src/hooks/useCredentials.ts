import { useState, useEffect } from 'react';
import { Credentials } from '@/types/workflow';

const STORAGE_KEY = 'n8n-workflow-generator-credentials';

export function useCredentials() {
  const [credentials, setCredentials] = useState<Credentials>({
    geminiApiKey: '',
    n8nUrl: '',
    n8nApiKey: '',
  });
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCredentials(parsed);
        setIsConfigured(
          Boolean(parsed.geminiApiKey && parsed.n8nUrl && parsed.n8nApiKey)
        );
      } catch (e) {
        console.error('Failed to parse stored credentials');
      }
    }
  }, []);

  const saveCredentials = (creds: Credentials) => {
    setCredentials(creds);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(creds));
    setIsConfigured(
      Boolean(creds.geminiApiKey && creds.n8nUrl && creds.n8nApiKey)
    );
  };

  const clearCredentials = () => {
    setCredentials({
      geminiApiKey: '',
      n8nUrl: '',
      n8nApiKey: '',
    });
    localStorage.removeItem(STORAGE_KEY);
    setIsConfigured(false);
  };

  return {
    credentials,
    isConfigured,
    saveCredentials,
    clearCredentials,
  };
}
