import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Loader2, Sparkles } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, isLoading, placeholder }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const suggestions = [
    "Webhook que salva dados no Google Sheets",
    "Agendador que envia relatório por email",
    "API que processa dados e envia para Slack",
  ];

  return (
    <div className="space-y-3">
      {!input && (
        <div className="flex flex-wrap gap-2 justify-center fade-in">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setInput(suggestion)}
              className="text-xs px-3 py-1.5 rounded-full border border-border bg-card hover:border-primary hover:text-primary transition-colors"
            >
              <Sparkles className="w-3 h-3 inline mr-1" />
              {suggestion}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-end gap-2 bg-card border border-border rounded-2xl p-2 focus-within:border-primary focus-within:glow-primary transition-all">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || "Descreva o workflow que você quer criar..."}
            className="flex-1 bg-transparent border-none outline-none resize-none text-sm px-2 py-2 min-h-[44px] max-h-[200px] custom-scrollbar placeholder:text-muted-foreground"
            rows={1}
            disabled={isLoading}
          />
          <Button
            type="submit"
            variant="glow"
            size="icon"
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-center text-muted-foreground mt-2">
          Shift + Enter para nova linha
        </p>
      </form>
    </div>
  );
}
