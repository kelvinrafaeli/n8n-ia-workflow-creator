import { useState } from 'react';
import { useCredentials } from '@/hooks/useCredentials';
import { Header } from '@/components/Header';
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
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="min-h-screen bg-background gradient-dark">
      <Header
        onOpenSettings={() => setShowSettings(true)}
        isConfigured={isConfigured}
      />

      {isConfigured ? (
        <WorkflowChat credentials={credentials} />
      ) : (
        <div className="container mx-auto px-4 py-16">
          <CredentialsSetup onSave={saveCredentials} />
        </div>
      )}

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
  );
};

export default Index;
