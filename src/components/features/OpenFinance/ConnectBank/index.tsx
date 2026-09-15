/**
 * @file src/components/features/OpenFinance/ConnectBank/index.tsx
 * @description Widget Pluggy Connect redesenhado com shadcn + tailwind + lucide.
 * Exibido dentro de Dialog na página Open Finance.
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PlugZap, Loader2, AlertCircle, ShieldCheck, X } from 'lucide-react';
import { useOpenFinance } from '../../../../contexts/OpenFinanceContext';
import { getConnectToken } from '../../../../services/openFinanceService';
import { Card, CardContent } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';

/** Props do ConnectBank */
interface ConnectBankProps {
  onSuccess: () => void;
  onError: (message: string) => void;
  onClose: () => void;
}

/** Widget de conexão com instituição via Pluggy */
const ConnectBank: React.FC<ConnectBankProps> = ({ onSuccess, onError, onClose }) => {
  const { addItem } = useOpenFinance();
  // Token e estados de carregamento/erro
  const [connectToken, setConnectToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** Carrega connect token ao montar */
  useEffect(() => {
    async function loadToken() {
      try {
        const token = await getConnectToken();
        setConnectToken(token.accessToken);
      } catch {
        setError('Erro ao gerar token de conexão');
        onError('Erro ao gerar token de conexão');
      } finally {
        setLoading(false);
      }
    }
    loadToken();
  }, [onError]);

  /** Injeta script do Pluggy Connect quando token estiver disponível */
  useEffect(() => {
    if (!connectToken) return;
    const script = document.createElement('script');
    script.src = 'https://cdn.pluggy.ai/plugin/v2/pluggy-connect.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      try {
        document.body.removeChild(script);
      } catch {}
    };
  }, [connectToken]);

  /** Sucesso ao conectar — salva item e notifica */
  const handleSuccess = async (data: { item: { id: string; connectorId: number; name: string } }) => {
    try {
      await addItem(data.item.id, data.item.connectorId, data.item.name);
      onSuccess();
    } catch {
      onError('Erro ao salvar conexão');
    }
  };

  /** Erro do widget Pluggy */
  const handleError = (err: { message: string }) => {
    setError(err.message);
    onError(err.message);
  };

  // Estado carregando token
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm">Carregando widget de conexão...</p>
        <Badge variant="secondary" className="rounded-full gap-1.5">
          <ShieldCheck className="h-3 w-3" />
          Conexão segura
        </Badge>
      </div>
    );
  }

  // Estado de erro
  if (error) {
    return (
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900">
          <CardContent className="p-4 flex gap-3 items-start">
            <span className="p-1.5 rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30 shrink-0">
              <AlertCircle className="h-4 w-4" />
            </span>
            <p className="text-sm font-medium text-red-700 dark:text-red-300">{error}</p>
          </CardContent>
        </Card>
        <Button variant="outline" onClick={onClose} className="w-full rounded-xl">
          <X className="mr-2 h-4 w-4" />
          Fechar
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Badge de segurança */}
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="rounded-full gap-1.5 border-emerald-200 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20">
          <ShieldCheck className="h-3 w-3" />
          Ambiente seguro Pluggy
        </Badge>
        <Badge variant="secondary" className="rounded-full gap-1.5">
          <PlugZap className="h-3 w-3" />
          Open Finance
        </Badge>
      </div>

      {/* Container do widget Pluggy — elemento customizado */}
      <Card className="rounded-2xl overflow-hidden border-dashed bg-muted/20 min-h-[280px]">
        <CardContent className="p-0">
          {connectToken &&
            React.createElement('pluggy-connect' as unknown as string, {
              connectToken,
              onSuccess: handleSuccess,
              onError: handleError,
              language: 'pt',
              // estilização via CSS vars do pluggy se necessário
            })}
          {!connectToken && (
            <div className="flex items-center justify-center py-16 text-sm text-muted-foreground gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Preparando conexão...
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-[11px] leading-relaxed text-muted-foreground text-center">
        Ao continuar você concorda em compartilhar dados de forma segura com a Pluggy. Seus dados não são armazenados sem
        consentimento.
      </p>
    </div>
  );
};

export default ConnectBank;
