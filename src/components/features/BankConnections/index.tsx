import { useEffect, useState } from 'react';
import { Building2, Link2, RefreshCw, Unplug } from 'lucide-react';
import { PluggyConnect } from 'react-pluggy-connect';
import { Button } from '../../ui/button';
import { bankConnectionService } from '../../../services/supabase/bankConnections';
import type { BankConnection } from '../../../types';

function formatCurrency(value?: number, currency = 'BRL') {
  if (value == null) return 'Saldo indisponível';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value);
}

export default function BankConnections() {
  const [connections, setConnections] = useState<BankConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [syncingConnectionId, setSyncingConnectionId] = useState<string | null>(null);
  const [connectToken, setConnectToken] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadConnections = async () => {
    setLoading(true);
    try {
      setConnections(await bankConnectionService.getAll());
    } catch {
      setMessage('Não foi possível carregar as contas bancárias.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConnections();
  }, []);

  const sync = async (itemId: string) => {
    const result = await bankConnectionService.sync(itemId);
    setMessage(`${result.imported} transações importadas.`);
    await loadConnections();
  };

  const syncConnection = async (connectionId: string) => {
    setSyncingConnectionId(connectionId);
    try {
      const result = await bankConnectionService.syncConnection(connectionId);
      setMessage(`${result.imported} transações importadas.`);
      await loadConnections();
    } catch {
      setMessage('Não foi possível atualizar esta conta.');
    } finally {
      setSyncingConnectionId(null);
    }
  };

  const connect = async () => {
    setConnecting(true);
    setMessage(null);
    try {
      setConnectToken(await bankConnectionService.createConnectToken());
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Não foi possível iniciar a conexão bancária.'
      );
      setConnecting(false);
    }
  };

  const disconnect = async (connectionId: string) => {
    try {
      await bankConnectionService.disconnect(connectionId);
      setConnections((current) => current.filter((connection) => connection.id !== connectionId));
    } catch {
      setMessage('Não foi possível desconectar a conta.');
    }
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Contas bancárias</h2>
          <p className="text-sm text-muted-foreground">
            Conecte seu banco pelo ambiente seguro do Open Finance.
          </p>
        </div>
        <Button onClick={connect} disabled={connecting} className="gap-2">
          <Link2 className="h-4 w-4" />
          {connecting ? 'Conectando...' : 'Conectar banco'}
        </Button>
      </div>

      {message && (
        <p className="rounded-lg bg-muted px-3 py-2 text-sm" role="status">
          {message}
        </p>
      )}
      {connectToken && (
        <PluggyConnect
          connectToken={connectToken}
          language="pt"
          onSuccess={async ({ item }) => {
            try {
              await sync(item.id);
            } catch {
              setMessage(
                'A conta foi conectada, mas não foi possível importar as transações. Tente sincronizar novamente.'
              );
            } finally {
              setConnectToken(null);
              setConnecting(false);
            }
          }}
          onError={({ message: errorMessage }) => {
            setMessage(errorMessage || 'Não foi possível concluir a conexão com o banco.');
            setConnectToken(null);
            setConnecting(false);
          }}
          onClose={() => {
            setConnectToken(null);
            setConnecting(false);
          }}
          onLoadError={() => {
            setMessage('Não foi possível carregar o Pluggy Connect.');
            setConnectToken(null);
            setConnecting(false);
          }}
        />
      )}
      {loading && <p className="text-sm text-muted-foreground">Carregando contas...</p>}
      {!loading && connections.length === 0 && (
        <p className="rounded-xl border border-dashed p-5 text-sm text-muted-foreground">
          Nenhuma conta conectada.
        </p>
      )}

      <div className="space-y-3">
        {connections.map((connection) => (
          <article key={connection.id} className="rounded-xl border p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <Building2 className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{connection.institutionName ?? 'Banco conectado'}</p>
                  <p className="text-xs text-muted-foreground">Status: {connection.status}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Desconectar conta"
                  onClick={() => disconnect(connection.id)}
                >
                  <Unplug className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {connection.accounts.map((account) => (
                <div key={account.id} className="rounded-lg bg-muted/60 px-3 py-2">
                  <p className="text-sm font-medium">{account.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(account.balance, account.currency)}
                  </p>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 gap-2"
              onClick={() => syncConnection(connection.id)}
              disabled={syncingConnectionId === connection.id}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {syncingConnectionId === connection.id ? 'Atualizando...' : 'Atualizar agora'}
            </Button>
          </article>
        ))}
      </div>
    </section>
  );
}
