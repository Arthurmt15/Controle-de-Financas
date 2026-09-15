/**
 * @file src/components/features/OpenFinance/ConnectBank/index.tsx
 * @description Widget Pluggy Connect redesenhado com handoff desktop → celular via QR Code.
 * No PC: detecta desktop e exibe QR + instruções para autorizar no app do banco.
 * No celular: abre widget Pluggy diretamente.
 */

import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { PlugZap, Loader2, AlertCircle, ShieldCheck, X, Smartphone, Monitor, QrCode, Copy, Check, ArrowRight, ExternalLink } from 'lucide-react';
import { useOpenFinance } from '../../../../contexts/OpenFinanceContext';
import { getConnectToken } from '../../../../services/openFinanceService';
import { Card, CardContent } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { toast } from 'sonner';

/** Props do ConnectBank */
interface ConnectBankProps {
  onSuccess: () => void;
  onError: (message: string) => void;
  onClose: () => void;
}

/** Detecta se está em desktop (PC) — precisa de QR */
function isDesktopDevice(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const isMobileUA = /Android|iPhone|iPad|iPod|Mobi|Mobile/i.test(ua);
  const isSmallScreen = window.innerWidth < 768;
  // Considera desktop se não é mobile UA e tela >= 768
  return !isMobileUA && !isSmallScreen;
}

/** Widget de conexão com instituição via Pluggy */
const ConnectBank: React.FC<ConnectBankProps> = ({ onSuccess, onError, onClose }) => {
  const { addItem } = useOpenFinance();
  const [connectToken, setConnectToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [showWidget, setShowWidget] = useState(false);
  const [copied, setCopied] = useState(false);

  // URL para QR — mesma rota aberta no celular
  const handoffUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/open-finance`;
  }, []);

  const qrSrc = useMemo(() => {
    if (!handoffUrl) return '';
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(handoffUrl)}&bgcolor=ffffff&color=111a33&margin=10`;
  }, [handoffUrl]);

  /** Detecta desktop ao montar e no resize */
  useEffect(() => {
    const check = () => setIsDesktop(isDesktopDevice());
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Decide se mostra handoff: desktop = true inicial, mobile = vai direto pro widget
  useEffect(() => {
    if (!isDesktop) setShowWidget(true);
    else setShowWidget(false);
  }, [isDesktop]);

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

  /** Injeta script do Pluggy Connect quando widget visível e token disponível */
  useEffect(() => {
    if (!connectToken || !showWidget) return;
    const script = document.createElement('script');
    script.src = 'https://cdn.pluggy.ai/plugin/v2/pluggy-connect.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      try {
        document.body.removeChild(script);
      } catch {}
    };
  }, [connectToken, showWidget]);

  const handleSuccess = async (data: { item: { id: string; connectorId: number; name: string } }) => {
    try {
      await addItem(data.item.id, data.item.connectorId, data.item.name);
      toast.success('Banco conectado com sucesso!');
      onSuccess();
    } catch {
      onError('Erro ao salvar conexão');
    }
  };

  const handleError = (err: { message: string }) => {
    setError(err.message);
    onError(err.message);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(handoffUrl);
      setCopied(true);
      toast.success('Link copiado!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Não foi possível copiar');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm">Carregando conexão segura...</p>
        <Badge variant="secondary" className="rounded-full gap-1.5">
          <ShieldCheck className="h-3 w-3" />
          Conexão segura
        </Badge>
      </div>
    );
  }

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

  // ===== HANDOFF DESKTOP: mostra QR antes do widget =====
  if (isDesktop && !showWidget) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="rounded-full gap-1.5 border-amber-200 text-amber-700 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 dark:text-amber-300">
            <Monitor className="h-3 w-3" />
            Você está no computador
          </Badge>
          <Badge variant="secondary" className="rounded-full gap-1.5">
            <ShieldCheck className="h-3 w-3" />
            Open Finance Brasil
          </Badge>
        </div>

        <Card className="rounded-2xl border-amber-200 bg-amber-50/60 dark:bg-amber-950/10 dark:border-amber-900/50">
          <CardContent className="p-4 flex gap-3">
            <span className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white shrink-0">
              <Smartphone className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold leading-none">Autorize no aplicativo do seu banco</p>
              <p className="text-[13px] leading-relaxed text-muted-foreground mt-1.5">
                Por segurança, o Open Finance exige confirmação no celular. Escaneie o QR Code abaixo e conclua a conexão no seu smartphone.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl overflow-hidden">
          <CardContent className="p-5 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <QrCode className="h-3.5 w-3.5" />
              Escaneie com a câmera do celular
            </div>

            <div className="rounded-2xl bg-white p-3 shadow-sm border">
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <img
                src={qrSrc}
                alt="QR Code para abrir no celular"
                width={200}
                height={200}
                className="h-[200px] w-[200px] object-contain"
                loading="lazy"
              />
            </div>

            <div className="w-full space-y-2">
              <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
                <span className="h-px flex-1 bg-border" />
                Ou copie o link
                <span className="h-px flex-1 bg-border" />
              </div>
              <div className="flex items-center gap-2 rounded-xl border bg-muted/40 px-3 py-2">
                <span className="flex-1 truncate text-xs font-mono text-muted-foreground">{handoffUrl}</span>
                <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={handleCopy} aria-label="Copiar link">
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>

            <ol className="w-full space-y-2 text-[13px] text-muted-foreground">
              <li className="flex gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[11px] font-bold shrink-0">1</span>
                Escaneie o QR Code e abra no celular
              </li>
              <li className="flex gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[11px] font-bold shrink-0">2</span>
                Faça login no app do seu banco e autorize o compartilhamento
              </li>
              <li className="flex gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[11px] font-bold shrink-0">3</span>
                Volte aqui — a conexão aparecerá automaticamente
              </li>
            </ol>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={() => setShowWidget(true)} className="flex-1 rounded-xl gap-1.5">
            Continuar no computador mesmo assim
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            Fechar
          </Button>
        </div>

        <p className="text-[11px] leading-relaxed text-muted-foreground text-center flex items-center justify-center gap-1.5">
          <ExternalLink className="h-3 w-3" />
          Alguns bancos permitem concluir no desktop — mas recomendamos o celular.
        </p>
      </div>
    );
  }

  // ===== WIDGET NORMAL (mobile ou desktop após "continuar") =====
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="rounded-full gap-1.5 border-emerald-200 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20">
          <ShieldCheck className="h-3 w-3" />
          Ambiente seguro Pluggy
        </Badge>
        <Badge variant="secondary" className="rounded-full gap-1.5">
          <PlugZap className="h-3 w-3" />
          Open Finance
        </Badge>
        {isDesktop && (
          <Button variant="ghost" size="sm" className="ml-auto h-7 rounded-full text-xs gap-1" onClick={() => setShowWidget(false)}>
            <QrCode className="h-3 w-3" />
            Ver QR
          </Button>
        )}
      </div>

      <Card className="rounded-2xl overflow-hidden border-dashed bg-muted/20 min-h-[280px]">
        <CardContent className="p-0">
          {connectToken &&
            React.createElement('pluggy-connect' as unknown as string, {
              connectToken,
              onSuccess: handleSuccess,
              onError: handleError,
              language: 'pt',
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
        Ao continuar você concorda em compartilhar dados de forma segura com a Pluggy. Seus dados não são armazenados sem consentimento.
      </p>
    </div>
  );
};

export default ConnectBank;
