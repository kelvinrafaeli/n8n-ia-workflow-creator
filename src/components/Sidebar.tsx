import { Button } from '@/components/ui/button';
import { Plus, MessageSquare, Trash2, Clock, Zap } from 'lucide-react';
import { ChatSession } from '@/hooks/useChatHistory';

interface SidebarProps {
    sessions: ChatSession[];
    currentSessionId: string | null;
    onSelectSession: (id: string) => void;
    onNewChat: () => void;
    onDeleteSession: (id: string) => void;
}

export function Sidebar({
    sessions,
    currentSessionId,
    onSelectSession,
    onNewChat,
    onDeleteSession,
}: SidebarProps) {
    return (
        <aside className="w-80 border-r border-border bg-card/30 backdrop-blur-xl flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-border bg-background/40">
                <Button
                    onClick={onNewChat}
                    className="w-full gap-2 gradient-primary shadow-lg hover:shadow-primary/20 transition-all duration-300"
                >
                    <Plus className="w-4 h-4" />
                    Novo Workflow
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                {sessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-muted-foreground p-4 text-center">
                        <Zap className="w-8 h-8 mb-2 opacity-20" />
                        <p className="text-sm">Nenhum chat ainda. Comece um novo!</p>
                    </div>
                ) : (
                    sessions.map((session) => (
                        <div
                            key={session.id}
                            className={`group flex items-center gap-2 p-3 rounded-xl transition-all duration-200 cursor-pointer border ${currentSessionId === session.id
                                    ? 'bg-primary/15 border-primary/30 text-primary shadow-sm'
                                    : 'hover:bg-secondary border-transparent text-muted-foreground hover:text-foreground'
                                }`}
                            onClick={() => onSelectSession(session.id)}
                        >
                            <MessageSquare className={`w-4 h-4 flex-shrink-0 ${currentSessionId === session.id ? 'text-primary' : 'opacity-50'
                                }`} />

                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                    {session.messages[0]?.content.substring(0, 40) || 'Novo Workflow'}
                                </p>
                                <div className="flex items-center gap-1.5 opacity-60">
                                    <Clock className="w-3 h-3" />
                                    <span className="text-[10px]">
                                        {new Date(session.lastUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteSession(session.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-destructive/20 hover:text-destructive rounded-md transition-all"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))
                )}
            </div>

            <div className="p-4 border-t border-border bg-background/20">
                <div className="flex items-center gap-3 px-2 py-1">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Sistema Ativo</span>
                </div>
            </div>
        </aside>
    );
}
