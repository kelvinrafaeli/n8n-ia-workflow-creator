import { Message, WorkflowData } from '@/types/workflow';
import { User, Bot, Copy, Check, Rocket, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface ChatMessageProps {
  message: Message;
  onDeploy?: (workflow: WorkflowData) => void;
}

export function ChatMessage({ message, onDeploy }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    const textToCopy = message.workflow
      ? JSON.stringify(message.workflow, null, 2)
      : message.content;
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatContent = (content: string) => {
    // Remove JSON blocks for display if there's a workflow
    if (message.workflow) {
      return content.replace(/```(?:json)?[\s\S]*?```/g, '').trim();
    }
    return content;
  };

  const renderContent = (content: string) => {
    const text = formatContent(content);
    // Simple markdown link parser for [text](url)
    const parts = text.split(/(\[.*?\]\(.*?\))/g);

    return parts.map((part, i) => {
      const match = part.match(/\[(.*?)\]\((.*?)\)/);
      if (match) {
        return (
          <a
            key={i}
            href={match[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-1 font-medium bg-primary/10 px-2 py-0.5 rounded-md"
          >
            {match[1]}
            <Rocket className="w-3 h-3" />
          </a>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div
      className={`flex gap-4 slide-up ${isUser ? 'flex-row-reverse' : ''
        }`}
    >
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${isUser
            ? 'bg-secondary'
            : 'gradient-primary'
          }`}
      >
        {isUser ? (
          <User className="w-5 h-5 text-secondary-foreground" />
        ) : (
          <Bot className="w-5 h-5 text-primary-foreground" />
        )}
      </div>

      <div
        className={`flex-1 max-w-[80%] space-y-3 ${isUser ? 'text-right' : ''
          }`}
      >
        <div
          className={`inline-block rounded-2xl px-4 py-3 ${isUser
              ? 'bg-primary text-primary-foreground rounded-tr-sm'
              : 'bg-card border border-border rounded-tl-sm shadow-sm'
            }`}
        >
          <div className="text-sm whitespace-pre-wrap text-left leading-relaxed">
            {renderContent(message.content)}
          </div>
        </div>

        {message.workflow && (
          <div className="space-y-2">
            <div className="bg-card border border-primary/30 rounded-xl p-4 card-glow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary pulse-glow" />
                  <span className="text-sm font-medium text-primary">
                    {message.workflow.name}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowJson(!showJson)}
                    className="h-8 px-2"
                  >
                    <Code className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="h-8 px-2"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-success" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {message.workflow.nodes.map((node) => (
                  <span
                    key={node.id}
                    className="text-xs px-2 py-1 rounded-md bg-secondary text-secondary-foreground font-mono"
                  >
                    {node.name}
                  </span>
                ))}
              </div>

              {showJson && (
                <pre className="text-xs bg-background rounded-lg p-3 overflow-x-auto max-h-64 custom-scrollbar font-mono text-muted-foreground">
                  {JSON.stringify(message.workflow, null, 2)}
                </pre>
              )}

              {onDeploy && (
                <Button
                  variant="glow"
                  size="sm"
                  className="w-full mt-3"
                  onClick={() => onDeploy(message.workflow!)}
                >
                  <Rocket className="w-4 h-4" />
                  Deploy para n8n
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
