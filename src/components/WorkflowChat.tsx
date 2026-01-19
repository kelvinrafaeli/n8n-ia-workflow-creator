import { useState, useRef, useEffect } from 'react';
import { Message, WorkflowData, Credentials } from '@/types/workflow';
import { generateWorkflow } from '@/lib/ai-service';
import { createWorkflow, updateWorkflow, getWorkflow, listWorkflows } from '@/lib/n8n-api';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { useToast } from '@/hooks/use-toast';
import { Zap, MessageSquare, ExternalLink, Search, ListRestart, FileJson } from 'lucide-react';
import { N8nWorkflowResponse } from '@/types/workflow';

interface WorkflowChatProps {
  credentials: Credentials;
  messages: Message[];
  deployedWorkflowId: string | null;
  onUpdateSession: (updates: { messages?: Message[]; deployedWorkflowId?: string | null }) => void;
}

export function WorkflowChat({
  credentials,
  messages,
  deployedWorkflowId,
  onUpdateSession
}: WorkflowChatProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [availableWorkflows, setAvailableWorkflows] = useState<N8nWorkflowResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFetchingWorkflows, setIsFetchingWorkflows] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) {
      loadWorkflows();
    }
  }, [messages.length]);

  const loadWorkflows = async () => {
    setIsFetchingWorkflows(true);
    try {
      const data = await listWorkflows(credentials.n8nUrl, credentials.n8nApiKey);
      setAvailableWorkflows(data);
    } catch (e) {
      console.error('Failed to load workflows', e);
    } finally {
      setIsFetchingWorkflows(false);
    }
  };

  const handleSelectWorkflow = async (workflow: N8nWorkflowResponse) => {
    setIsLoading(true);
    try {
      toast({
        title: 'Importando workflow',
        description: `Buscando dados de "${workflow.name}"`,
      });

      const fullWorkflow = await getWorkflow(
        credentials.n8nUrl,
        credentials.n8nApiKey,
        workflow.id
      );

      const systemMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `📂 **Workflow Selecionado:** [${workflow.name}](${credentials.n8nUrl.replace(/\/$/, '')}/workflow/${workflow.id})
        
Estou pronto para ajudar você a editar este workflow. O que você gostaria de mudar?`,
        workflow: fullWorkflow,
        timestamp: new Date(),
      };

      onUpdateSession({
        messages: [systemMessage],
        deployedWorkflowId: workflow.id
      });

      toast({
        title: 'Pronto!',
        description: 'Workflow importado com sucesso.',
      });
    } catch (e) {
      toast({
        title: 'Erro ao importar',
        description: 'Não foi possível carregar os detalhes do workflow.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredWorkflows = availableWorkflows.filter(w =>
    w.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5);

  const handleSend = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    onUpdateSession({ messages: newMessages });
    setIsLoading(true);

    try {
      let finalPrompt = content;

      // Detect n8n workflow URL
      const n8nUrlRegex = /https?:\/\/[^\s]+?\/workflow\/([a-zA-Z0-9]+)/;
      const urlMatch = content.match(n8nUrlRegex);

      let currentWorkflowId = deployedWorkflowId;

      if (urlMatch) {
        const workflowIdFromUrl = urlMatch[1];
        try {
          toast({
            title: 'Lendo workflow...',
            description: `Buscando dados do workflow ${workflowIdFromUrl}`,
          });

          const existingWorkflow = await getWorkflow(
            credentials.n8nUrl,
            credentials.n8nApiKey,
            workflowIdFromUrl
          );

          currentWorkflowId = workflowIdFromUrl;
          onUpdateSession({ deployedWorkflowId: workflowIdFromUrl });

          finalPrompt = `Você está em MODO EDIÇÃO. O usuário quer alterar um workflow n8n já existente.
          
JSON ATUAL DO WORKFLOW:
${JSON.stringify(existingWorkflow, null, 2)}

SOLICITAÇÃO DE MUDANÇA: "${content}"

REGRAS CRÍTICAS DE PRESERVAÇÃO:
1. MANTENHA todos os nós, parâmetros e conexões que NÃO foram citados na alteração.
2. NÃO remova ou simplifique nós complexos (AI Agents, ferramentas MCP, scripts funcionais) a menos que explicitamente solicitado.
3. Se o usuário pediu para trocar um destino (ex: trocar WhatsApp por Telegram), remova o nó antigo e insira o novo mantendo as conexões de entrada.
4. Garanta que o JSON retornado seja um workflow VÁLIDO e COMPLETO.`;

        } catch (e) {
          console.error('Erro ao buscar workflow por URL:', e);
        }
      } else if (currentWorkflowId) {
        // Se já temos um ID no estado mas não veio URL na mensagem atual
        try {
          const existingWorkflow = await getWorkflow(
            credentials.n8nUrl,
            credentials.n8nApiKey,
            currentWorkflowId
          );

          finalPrompt = `CONTINUANDO EDIÇÃO do workflow:
          
ESTRUTURA ATUAL:
${JSON.stringify(existingWorkflow, null, 2)}

NOVA SOLICITAÇÃO: "${content}"

INSTRUÇÃO: Não crie um novo. Aplique esta nova alteração sobre a estrutura anterior, preservando o que já estava configurado.`;
        } catch (e) {
          console.error('Erro ao buscar workflow atual:', e);
        }
      }

      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const { text, workflow } = await generateWorkflow(
        credentials,
        finalPrompt,
        history
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: text,
        workflow,
        timestamp: new Date(),
      };

      onUpdateSession({ messages: [...newMessages, assistantMessage] });
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
    console.log('Deploy requested for workflow:', workflow);
    setIsLoading(true);
    try {
      let result;
      let isUpdate = false;

      if (deployedWorkflowId) {
        result = await updateWorkflow(
          credentials.n8nUrl,
          credentials.n8nApiKey,
          deployedWorkflowId,
          workflow
        );
        isUpdate = true;
      } else {
        result = await createWorkflow(
          credentials.n8nUrl,
          credentials.n8nApiKey,
          workflow
        );
        onUpdateSession({ deployedWorkflowId: result.id });
      }

      const workflowUrl = `${credentials.n8nUrl.replace(/\/$/, '')}/workflow/${result.id}`;

      toast({
        title: isUpdate ? 'Workflow atualizado!' : 'Workflow criado!',
        description: `"${result.name}" foi ${isUpdate ? 'atualizado' : 'adicionado'} ao seu n8n`,
      });

      const deployMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `✅ Workflow "${result.name}" foi ${isUpdate ? 'atualizado' : 'criado'} com sucesso!
        
[Abrir no n8n](${workflowUrl})`,
        timestamp: new Date(),
      };

      onUpdateSession({ messages: [...messages, deployMessage] });
    } catch (error) {
      toast({
        title: 'Erro no deploy',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 max-w-4xl mx-auto py-10">
            <div className="w-20 h-20 rounded-3xl gradient-primary flex items-center justify-center mb-6 glow-strong">
              <Zap className="w-10 h-10 text-primary-foreground" />
            </div>
            <h2 className="text-3xl font-bold mb-2">
              Crie ou <span className="text-gradient">Edite Workflows</span>
            </h2>
            <p className="text-muted-foreground max-w-md mb-10">
              Descreva um novo workflow ou selecione um existente da sua instância n8n para modificar.
            </p>

            <div className="w-full max-w-2xl space-y-6">
              {/* Workflow Picker */}
              <div className="bg-card/50 border border-border rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4 text-left">
                  <ListRestart className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Editar um workflow existente</h3>
                </div>

                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Pesquisar workflows no seu n8n..."
                    className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-primary transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  {isFetchingWorkflows ? (
                    <div className="py-8 animate-pulse text-sm text-muted-foreground">Carregando workflows...</div>
                  ) : filteredWorkflows.length > 0 ? (
                    filteredWorkflows.map((w) => (
                      <button
                        key={w.id}
                        onClick={() => handleSelectWorkflow(w)}
                        className="flex items-center justify-between p-3 rounded-xl border border-border bg-background hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-secondary group-hover:bg-primary/10 transition-colors">
                            <FileJson className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{w.name}</p>
                            <p className="text-[10px] text-muted-foreground">ID: {w.id}</p>
                          </div>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${w.active ? 'bg-success' : 'bg-muted'}`} />
                      </button>
                    ))
                  ) : (
                    <div className="py-4 text-sm text-muted-foreground">
                      {searchTerm ? 'Nenhum workflow encontrado.' : 'Comece a digitar para pesquisar...'}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => setSearchTerm(item.title)}
                  >
                    <h3 className="font-semibold mb-1 text-sm">{item.title}</h3>
                    <p className="text-[11px] text-muted-foreground leading-tight">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
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
