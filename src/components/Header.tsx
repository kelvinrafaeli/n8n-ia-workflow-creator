import { Button } from '@/components/ui/button';
import { Settings, Zap, Github } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
  isConfigured: boolean;
}

export function Header({ onOpenSettings, isConfigured }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center glow-primary">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">
              n8n <span className="text-gradient">Workflow AI</span>
            </h1>
            <p className="text-xs text-muted-foreground">
              Powered by Gemini
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://github.com/czlonkowski/n8n-mcp"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Github className="w-5 h-5" />
            </Button>
          </a>
          <Button
            variant={isConfigured ? "outline" : "glow"}
            size="sm"
            onClick={onOpenSettings}
            className="gap-2"
          >
            <Settings className="w-4 h-4" />
            {isConfigured ? 'Configurações' : 'Configurar'}
          </Button>
        </div>
      </div>
    </header>
  );
}
