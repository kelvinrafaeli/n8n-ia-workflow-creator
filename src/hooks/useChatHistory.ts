import { useState, useEffect } from 'react';
import { Message, Credentials } from '@/types/workflow';

const STORAGE_KEY = 'n8n-workflow-generator-chats';

export interface ChatSession {
    id: string;
    title: string;
    messages: Message[];
    deployedWorkflowId: string | null;
    lastUpdate: number;
}

export function useChatHistory() {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setSessions(parsed);
                if (parsed.length > 0) {
                    setCurrentSessionId(parsed[0].id);
                }
            } catch (e) {
                console.error('Failed to parse chat history');
            }
        }
    }, []);

    useEffect(() => {
        if (sessions.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
        }
    }, [sessions]);

    const createNewSession = () => {
        const newSession: ChatSession = {
            id: Date.now().toString(),
            title: 'Novo Chat',
            messages: [],
            deployedWorkflowId: null,
            lastUpdate: Date.now(),
        };
        setSessions((prev) => [newSession, ...prev]);
        setCurrentSessionId(newSession.id);
        return newSession;
    };

    const updateSession = (id: string, updates: Partial<ChatSession>) => {
        setSessions((prev) =>
            prev.map((s) => (s.id === id ? { ...s, ...updates, lastUpdate: Date.now() } : s))
        );
    };

    const deleteSession = (id: string) => {
        setSessions((prev) => {
            const filtered = prev.filter((s) => s.id !== id);
            if (currentSessionId === id) {
                setCurrentSessionId(filtered.length > 0 ? filtered[0].id : null);
            }
            return filtered;
        });
    };

    const currentSession = sessions.find((s) => s.id === currentSessionId);

    return {
        sessions,
        currentSessionId,
        setCurrentSessionId,
        currentSession,
        createNewSession,
        updateSession,
        deleteSession,
    };
}
