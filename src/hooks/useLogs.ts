import { useState, useCallback } from 'react';
import { LogEntry } from '@/components/LogsPanel';

export function useLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = useCallback((
    type: LogEntry['type'],
    message: string,
    details?: string
  ) => {
    const entry: LogEntry = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      type,
      message,
      details,
    };
    setLogs((prev) => [entry, ...prev]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return {
    logs,
    addLog,
    clearLogs,
    info: (message: string, details?: string) => addLog('info', message, details),
    success: (message: string, details?: string) => addLog('success', message, details),
    warning: (message: string, details?: string) => addLog('warning', message, details),
    error: (message: string, details?: string) => addLog('error', message, details),
  };
}
