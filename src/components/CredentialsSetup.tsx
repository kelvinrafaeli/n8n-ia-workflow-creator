import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Credentials } from '@/types/workflow';
import { testN8nConnection } from '@/lib/n8n-api';
import { LogsPanel } from './LogsPanel';
import { useLogs } from '@/hooks/useLogs';
import { Key, Server, Zap, CheckCircle, XCircle, Loader2, Eye, EyeOff } from 'lucide-react';

interface CredentialsSetupProps {
  onSave: (credentials: Credentials) => void;
  initialCredentials?: Credentials;
}

export function CredentialsSetup({ onSave, initialCredentials }: CredentialsSetupProps) {
  const [credentials, setCredentials] = useState<Credentials>(
    initialCredentials || {
      geminiApiKey: '',
      n8nUrl: '',
      n8nApiKey: '',
    }
  );
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [showKeys, setShowKeys] = useState({
    gemini: false,
    n8n: false,
  });
  const { logs, clearLogs, info, success, error, warning } = useLogs();

  const handleTest = async () => {
    if (!credentials.n8nUrl || !credentials.n8nApiKey) return;
    
    setTesting(true);
    setTestResult(null);
    
    info('Testando conexão com n8n...', `URL: ${credentials.n8nUrl}`);
    
    try {
      const result = await testN8nConnection(credentials.n8nUrl, credentials.n8nApiKey);
      
      if (result.success) {
        success('Conexão com n8n estabelecida!', `Status: ${result.status}`);
        setTestResult('success');
      } else {
        error('Falha ao conectar com n8n', result.error);
        if (result.error?.includes('CORS') || result.error?.includes('Failed to fetch')) {
          warning(
            'Erro de CORS detectado',
            'O n8n está bloqueando requisições do navegador.\n\nSoluções:\n1. Configure CORS no n8n adicionando este header:\n   N8N_EDITOR_BASE_URL=<sua-url>\n   WEBHOOK_URL=<sua-url>\n\n2. Ou use um proxy/backend para fazer as requisições'
          );
        }
        setTestResult('error');
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Erro desconhecido';
      error('Erro ao testar conexão', errorMessage);
      setTestResult('error');
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    info('Salvando credenciais...');
    onSave(credentials);
    success('Credenciais salvas com sucesso!');
  };

  const isValid = credentials.geminiApiKey && credentials.n8nUrl && credentials.n8nApiKey;

  return (
    <div className="w-full max-w-lg mx-auto slide-up space-y-4">
      <div className="gradient-card rounded-2xl border border-border p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4">
            <Zap className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Configurar Credenciais</h2>
          <p className="text-muted-foreground text-sm">
            Configure suas API keys para começar a gerar workflows
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Gemini API Key */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Key className="w-4 h-4 text-primary" />
              Gemini API Key
            </label>
            <div className="relative">
              <Input
                type={showKeys.gemini ? 'text' : 'password'}
                variant="terminal"
                placeholder="AIza..."
                value={credentials.geminiApiKey}
                onChange={(e) =>
                  setCredentials({ ...credentials, geminiApiKey: e.target.value })
                }
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setShowKeys({ ...showKeys, gemini: !showKeys.gemini })}
              >
                {showKeys.gemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Obtenha em{' '}
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Google AI Studio
              </a>
            </p>
          </div>

          {/* n8n URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Server className="w-4 h-4 text-n8n-orange" />
              n8n URL
            </label>
            <Input
              type="url"
              variant="terminal"
              placeholder="https://seu-n8n.app.n8n.cloud"
              value={credentials.n8nUrl}
              onChange={(e) =>
                setCredentials({ ...credentials, n8nUrl: e.target.value })
              }
            />
            <p className="text-xs text-muted-foreground">
              URL da sua instância n8n (cloud ou self-hosted)
            </p>
          </div>

          {/* n8n API Key */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Key className="w-4 h-4 text-n8n-coral" />
              n8n API Key
            </label>
            <div className="relative">
              <Input
                type={showKeys.n8n ? 'text' : 'password'}
                variant="terminal"
                placeholder="n8n_api_..."
                value={credentials.n8nApiKey}
                onChange={(e) =>
                  setCredentials({ ...credentials, n8nApiKey: e.target.value })
                }
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setShowKeys({ ...showKeys, n8n: !showKeys.n8n })}
              >
                {showKeys.n8n ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Crie em Settings → API
              </p>
              {credentials.n8nUrl && credentials.n8nApiKey && (
                <button
                  type="button"
                  onClick={handleTest}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                  disabled={testing}
                >
                  {testing ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : testResult === 'success' ? (
                    <CheckCircle className="w-3 h-3 text-success" />
                  ) : testResult === 'error' ? (
                    <XCircle className="w-3 h-3 text-destructive" />
                  ) : null}
                  Testar conexão
                </button>
              )}
            </div>
          </div>

          <Button
            type="submit"
            variant="glow"
            className="w-full"
            disabled={!isValid}
          >
            <Zap className="w-4 h-4" />
            Começar a Criar
          </Button>
        </form>
      </div>

      {/* Logs Panel */}
      <LogsPanel logs={logs} onClear={clearLogs} />
    </div>
  );
}
