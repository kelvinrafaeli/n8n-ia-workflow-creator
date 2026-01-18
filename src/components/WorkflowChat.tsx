import { useState, useRef, useEffect } from 'react';
import { Message, WorkflowData, Credentials } from '@/types/workflow';
import { generateWorkflow } from '@/lib/gemini';
import { createWorkflow } from '@/lib/n8n-api';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { useToast } from '@/hooks/use-toast';
import { Zap, MessageSquare } from 'lucide-react';

interface WorkflowChatProps {
  credentials: Credentials;
}

export function WorkflowChat({ credentials }: WorkflowChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const { text, workflow } = await generateWorkflow(
        credentials.geminiApiKey,
        content,
        history
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: text,
        workflow,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      toast({
        title: 'Erro ao gerar workflow',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeploy = async (workflow: WorkflowData) => {
    try {
      const result = await createWorkflow(
        credentials.n8nUrl,
        credentials.n8nApiKey,
        workflow
      );

      toast({
        title: 'Workflow criado com sucesso!',
        description: `"${result.name}" foi adicionado ao seu n8n`,
      });

      const deployMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `✅ Workflow "${result.name}" foi criado com sucesso no seu n8n! Você pode acessá-lo e ativá-lo diretamente na interface do n8n.`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, deployMessage]);
    } catch (error) {
      toast({
        title: 'Erro ao criar workflow',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-20 h-20 rounded-3xl gradient-primary flex items-center justify-center mb-6 glow-strong">
              <Zap className="w-10 h-10 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              Crie workflows <span className="text-gradient">com IA</span>
            </h2>
            <p className="text-muted-foreground max-w-md mb-8">
              Descreva o que você quer automatizar e eu vou gerar um workflow n8n
              pronto para usar. Você pode fazer deploy direto para sua instância!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
              {[
                {
                  title: 'Webhooks',
                  description: 'Receba dados de APIs externas',
                },
                {
                  title: 'Automações',
                  description: 'Agende tarefas recorrentes',
                },
                {
                  title: 'Integrações',
                  description: 'Conecte apps e serviços',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors"
                >
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onDeploy={message.workflow ? handleDeploy : undefined}
              />
            ))}
            {isLoading && (
              <div className="flex gap-4 slide-up">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-primary-foreground animate-pulse" />
                </div>
                <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-border bg-background/80 backdrop-blur-xl p-4">
        <div className="container mx-auto max-w-3xl">
          <ChatInput onSend={handleSend} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
