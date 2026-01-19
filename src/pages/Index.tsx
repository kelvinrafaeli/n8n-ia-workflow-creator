import { useState } from 'react';
import { useCredentials } from '@/hooks/useCredentials';
import { useChatHistory } from '@/hooks/useChatHistory';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { CredentialsSetup } from '@/components/CredentialsSetup';
import { WorkflowChat } from '@/components/WorkflowChat';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

const Index = () => {
  const { credentials, isConfigured, saveCredentials, clearCredentials } =
    useCredentials();
  const {
    sessions,
    currentSession,
    setCurrentSessionId,
    createNewSession,
    updateSession,
    deleteSession
  } = useChatHistory();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      {isConfigured && (
        <Sidebar
          sessions={sessions}
          currentSessionId={currentSession?.id || null}
          onSelectSession={setCurrentSessionId}
          onNewChat={createNewSession}
          onDeleteSession={deleteSession}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 bg-background gradient-dark relative">
        <Header
          onOpenSettings={() => setShowSettings(true)}
          isConfigured={isConfigured}
        />

        <main className="flex-1 overflow-hidden relative">
          {isConfigured ? (
            currentSession ? (
              <WorkflowChat
                credentials={credentials}
                messages={currentSession.messages}
                deployedWorkflowId={currentSession.deployedWorkflowId}
                onUpdateSession={(updates) => updateSession(currentSession.id, updates)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-6">
                <div className="w-24 h-24 rounded-3xl gradient-primary flex items-center justify-center glow-strong">
                  <Trash2 className="w-12 h-12 text-primary-foreground opacity-20" />
                </div>
                <h2 className="text-2xl font-bold">Nenhum chat selecionado</h2>
                <Button onClick={createNewSession} variant="glow">
                  Começar novo workflow
                </Button>
              </div>
            )
          ) : (
            <div className="container mx-auto px-4 py-16 overflow-y-auto h-full">
              <CredentialsSetup onSave={saveCredentials} />
            </div>
          )}
        </main>

        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent className="sm:max-w-lg bg-card border-border">
            <DialogHeader>
              <DialogTitle>Configurações</DialogTitle>
            </DialogHeader>
            <CredentialsSetup
              onSave={(creds) => {
                saveCredentials(creds);
                setShowSettings(false);
              }}
              initialCredentials={credentials}
            />
            {isConfigured && (
              <Button
                variant="destructive"
                className="w-full mt-4"
                onClick={() => {
                  clearCredentials();
                  setShowSettings(false);
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Limpar Credenciais
              </Button>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Index;
