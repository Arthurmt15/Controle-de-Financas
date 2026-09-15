/**
 * @file src/components/features/OpenFinance/ConnectBank/index.tsx
 * @description Widget Pluggy Connect com handoff desktop → celular via QR Code.
 * Mobile vai direto pro widget, com fallback se token demorar.
 */

import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { PlugZap, Loader2, AlertCircle, ShieldCheck, X, Smartphone, Monitor, QrCode, Copy, Check, ArrowRight, ExternalLink, RefreshCw } from 'lucide-react';
import { useOpenFinance } from '../../../../contexts/OpenFinanceContext';
import { getConnectToken } from '../../../../services/openFinanceService';
import { Card, CardContent } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { toast } from 'sonner';

interface ConnectBankProps {
  onSuccess: () => void;
  onError: (message: string) => void;
  onClose: () => void;
}

function isDesktopDevice(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const isMobileUA = /Android|iPhone|iPad|iPod|Mobi|Mobile/i.test(ua);
  const isSmallScreen = window.innerWidth < 768;
  return !isMobileUA && !isSmallScreen;
}

const ConnectBank: React.FC<ConnectBankProps> = ({ onSuccess, onError, onClose }) => {
  const { addItem } = useOpenFinance();
  const [connectToken, setConnectToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(() => isDesktopDevice());
  const [showWidget, setShowWidget] = useState(() => !isDesktopDevice());
  const [copied, setCopied] = useState(false);

  const handoffUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/open-finance`;
  }, []);

  const qrSrc = useMemo(() => {
    if (!handoffUrl) return '';
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(handoffUrl)}&bgcolor=ffffff&color=111a33&margin=10`;
  }, [handoffUrl]);

  useEffect(() => {
    const check = () => {
      const d = isDesktopDevice();
      setIsDesktop(d);
      // não sobrescreve escolha manual do usuário (Ver QR / Continuar)
    };
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadToken() {
      setLoading(true);
      setError(null);
      try {
        // timeout de 10s para não ficar em loading infinito no mobile
        const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000));
        const token = await Promise.race([getConnectToken(), timeout]) as Awaited<ReturnType<typeof getConnectToken>>;
        if (!cancelled) setConnectToken(token.accessToken);
      } catch (e: any) {
        if (!cancelled) {
          const msg = e?.message === 'timeout' ? 'Tempo esgotado ao gerar conexão. Verifique sua internet.' : 'Erro ao gerar token de conexão';
          setError(msg);
          onError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadToken();
    return () => { cancelled = true; };
  }, [onError]);

  useEffect(() => {
    if (!connectToken || !showWidget) return;
    const script = document.createElement('script');
    script.src = 'https://cdn.pluggy.ai/plugin/v2/pluggy-connect.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      try { document.body.removeChild(script); } catch {}
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

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setConnectToken(null);
    // retrigger effect via key: força reload
    getConnectToken().then(t => { setConnectToken(t.accessToken); setLoading(false); }).catch(() => { setError('Erro ao gerar token de conexão'); setLoading(false); });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-3 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm">Carregando conexão segura...</p>
        <p className="text-xs">Isso pode levar alguns segundos no celular</p>
        <Badge variant="secondary" className="rounded-full gap-1.5">
          <ShieldCheck className="h-3 w-3" />
          Conexão segura
        </Badge>
        {/* ação visível mesmo em loading no mobile — evita tela travada */}
        <Button variant="ghost" size="sm" className="mt-2 h-7 text-xs gap-1" onClick={onClose}>
          <X className="h-3 w-3" /> Cancelar
        </Button>
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
        <div className="flex gap-2">
          <Button onClick={handleRetry} className="flex-1 rounded-xl gap-1.5">
            <RefreshCw className="h-4 w-4" /> Tentar novamente
          </Button>
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            <X className="mr-2 h-4 w-4" /> Fechar
          </Button>
        </div>
        {/* No mobile, oferece abrir direto mesmo com erro de token — útil para testar */}
        <p className="text-[11px] text-muted-foreground text-center">Se o erro persistir, verifique sua conexão ou tente em outro navegador.</p>
      </motion.div>
    );
  }

  if (isDesktop && !showWidget) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="rounded-full gap-1.5 border-amber-200 text-amber-700 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 dark:text-amber-300">
            <Monitor className="h-3 w-3" /> Você está no computador
          </Badge>
          <Badge variant="secondary" className="rounded-full gap-1.5">
            <ShieldCheck className="h-3 w-3" /> Open Finance Brasil
          </Badge>
        </div>
        <Card className="rounded-2xl border-amber-200 bg-amber-50/60 dark:bg-amber-950/10 dark:border-amber-900/50">
          <CardContent className="p-4 flex gap-3">
            <span className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white shrink-0">
              <Smartphone className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold leading-none">Autorize no aplicativo do seu banco</p>
              <p className="text-[13px] leading-relaxed text-muted-foreground mt-1.5">Por segurança, o Open Finance exige confirmação no celular. Escaneie o QR Code e conclua no smartphone.</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl overflow-hidden">
          <CardContent className="p-5 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <QrCode className="h-3.5 w-3.5" /> Escaneie com a câmera do celular
            </div>
            <div className="rounded-2xl bg-white p-3 shadow-sm border">
              <img src={qrSrc} alt="QR Code para abrir no celular" width={200} height={200} className="h-[200px] w-[200px] object-contain" loading="lazy" />
            </div>
            <div className="w-full space-y-2">
              <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
                <span className="h-px flex-1 bg-border" /> Ou copie o link <span className="h-px flex-1 bg-border" />
              </div>
              <div className="flex items-center gap-2 rounded-xl border bg-muted/40 px-3 py-2">
                <span className="flex-1 truncate text-xs font-mono text-muted-foreground">{handoffUrl}</span>
                <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={handleCopy} aria-label="Copiar link">
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
            <ol className="w-full space-y-2 text-[13px] text-muted-foreground">
              <li className="flex gap-2.5"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[11px] font-bold shrink-0">1</span>Escaneie o QR Code e abra no celular</li>
              <li className="flex gap-2.5"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[11px] font-bold shrink-0">2</span>Faça login no app do seu banco e autorize</li>
              <li className="flex gap-2.5"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[11px] font-bold shrink-0">3</span>Volte aqui — a conexão aparecerá automaticamente</li>
            </ol>
          </CardContent>
        </Card>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={() => setShowWidget(true)} className="flex-1 rounded-xl gap-1.5">
            Continuar no computador mesmo assim <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={onClose} className="rounded-xl">Fechar</Button>
        </div>
        <p className="text-[11px] leading-relaxed text-muted-foreground text-center flex items-center justify-center gap-1.5">
          <ExternalLink className="h-3 w-3" /> Alguns bancos permitem concluir no desktop — mas recomendamos o celular.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className="rounded-full gap-1.5 border-emerald-200 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20">
          <ShieldCheck className="h-3 w-3" /> Ambiente seguro Pluggy
        </Badge>
        <Badge variant="secondary" className="rounded-full gap-1.5">
          <PlugZap className="h-3 w-3" /> Open Finance
        </Badge>
        {isDesktop && (
          <Button variant="ghost" size="sm" className="ml-auto h-7 rounded-full text-xs gap-1" onClick={() => setShowWidget(false)}>
            <QrCode className="h-3 w-3" /> Ver QR
          </Button>
        )}
      </div>

      {/* CTA explícito no mobile — garante ação visível */}
      {!isDesktop && (
        <Card className="rounded-xl bg-primary/5 border-primary/20">
          <CardContent className="p-3 flex items-center gap-2.5">
            <span className="h-8 w-8 rounded-lg bg-primary text-white flex items-center justify-center shrink-0">
              <Smartphone className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-none">Você está no celular</p>
              <p className="text-xs text-muted-foreground mt-1">Toque abaixo e autorize no app do seu banco</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="rounded-2xl overflow-hidden border-dashed bg-muted/20 min-h-[320px]">
        <CardContent className="p-0">
          {connectToken ? (
            React.createElement('pluggy-connect' as unknown as string, {
              connectToken,
              onSuccess: handleSuccess,
              onError: handleError,
              language: 'pt',
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <p className="text-sm">Preparando conexão...</p>
              <Button size="sm" variant="outline" className="rounded-full mt-2" onClick={handleRetry}>
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Recarregar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botão de ação primário no mobile — Pluggy às vezes não renderiza auto */}
      <Button onClick={() => document.querySelector('pluggy-connect')?.dispatchEvent(new Event('open'))} className="w-full rounded-xl gap-1.5 lg:hidden">
        <PlugZap className="h-4 w-4" /> Conectar banco agora
      </Button>

      <p className="text-[11px] leading-relaxed text-muted-foreground text-center">Ao continuar você concorda em compartilhar dados de forma segura com a Pluggy.</p>
    </div>
  );
};

export default ConnectBank;
