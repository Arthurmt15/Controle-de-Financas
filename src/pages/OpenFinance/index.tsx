/**
 * @file src/pages/OpenFinance/index.tsx
 * @description Página principal do Open Finance Brasil redesenhada com shadcn + tailwind + framer-motion.
 * Visual gold alinhado a Installments: header gradiente, Cards com borda, EmptyState dashed, Dialog.
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Wallet,
  ArrowLeftRight,
  Sparkles,
  PlugZap,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { useOpenFinance } from '../../contexts/OpenFinanceContext';
import { useInstallments } from '../../contexts/InstallmentsContext';
import { useTransactions } from '../../hooks/useTransactions';
import ConnectBank from '../../components/features/OpenFinance/ConnectBank';
import AccountList from '../../components/features/OpenFinance/AccountList';
import TransactionList from '../../components/features/OpenFinance/TransactionList';
import { detectInstallments, toInstallments } from '../../utils/installmentDetector';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';

/** Página do Open Finance Brasil — gerenciamento via Pluggy */
const OpenFinancePage: React.FC = () => {
  const {
    accounts,
    items,
    transactions: openFinanceTransactions,
    loading,
    error,
    selectedAccountId,
    loadItems,
    loadAllAccounts,
    selectAccount,
  } = useOpenFinance();

  const { addInstallment } = useInstallments();
  const { categories } = useTransactions();

  // Controle do Dialog de conexão e detecção de parcelados
  const [showConnectWidget, setShowConnectWidget] = useState(false);
  const [detectingInstallments, setDetectingInstallments] = useState(false);

  /** Carrega itens e contas ao montar */
  useEffect(() => {
    loadItems();
    loadAllAccounts();
  }, [loadItems, loadAllAccounts]);

  /** Sucesso na conexão — fecha dialog e recarrega */
  const handleConnectSuccess = () => {
    setShowConnectWidget(false);
    loadItems();
    loadAllAccounts();
  };

  /** Erro na conexão — loga no console */
  const handleConnectError = (errorMessage: string) => {
    console.error('Erro na conexão:', errorMessage);
  };

  /** Detecta e importa parcelados das transações Open Finance */
  const handleDetectInstallments = async () => {
    if (openFinanceTransactions.length === 0) {
      alert('Nenhuma transação disponível para análise. Selecione uma conta primeiro.');
      return;
    }
    setDetectingInstallments(true);
    try {
      // Busca categoria de despesa padrão
      const expenseCategory = categories.find((c) => c.defaultType === 'expense' || c.defaultType === 'both');
      if (!expenseCategory) {
        alert('Nenhuma categoria de despesa encontrada. Crie uma categoria primeiro.');
        return;
      }
      const detected = detectInstallments(openFinanceTransactions);
      if (detected.length === 0) {
        alert('Nenhum parcelado detectado nas transações.');
        return;
      }
      const confirm = window.confirm(`Foram detectados ${detected.length} parcelado(s). Deseja importá-los?`);
      if (confirm) {
        const installments = toInstallments(detected, expenseCategory.id);
        for (const installment of installments) {
          await addInstallment(installment);
        }
        alert(`${installments.length} parcelado(s) importado(s) com sucesso!`);
      }
    } catch (err) {
      console.error('Erro ao detectar parcelados:', err);
      alert('Erro ao detectar parcelados. Tente novamente.');
    } finally {
      setDetectingInstallments(false);
    }
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-6">
      {/* Cabeçalho com gradiente e ações principais */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
          <div className="min-w-0">
            <h1 className="text-[28px] sm:text-[30px] font-bold tracking-tight leading-none bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Open Finance Brasil
            </h1>
            <p className="mt-2 text-[13.5px] text-muted-foreground max-w-[560px] leading-relaxed">
              Conecte suas instituições, importe contas e transações via Pluggy e detecte parcelados automaticamente.
            </p>
          </div>
          <div className="flex gap-2 shrink-0 flex-wrap">
            <Button variant="outline" onClick={() => setShowConnectWidget(true)} disabled={loading} className="rounded-xl">
              <PlugZap className="mr-2 h-4 w-4" />
              {loading ? 'Carregando...' : 'Conectar banco'}
            </Button>
          </div>
        </div>

        {/* Hint informativo */}
        <Card className="border-dashed bg-muted/30">
          <CardContent className="p-3 flex gap-2.5 items-start">
            <span className="mt-0.5 p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
              <ShieldCheck className="h-3.5 w-3.5" />
            </span>
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              Suas credenciais são processadas pela Pluggy em ambiente seguro. Conexões ativas sincronizam contas e
              transações automaticamente.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Erro global */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4">
            <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex gap-2.5 items-start">
                  <span className="p-1.5 rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30 shrink-0">
                    <AlertTriangle className="h-4 w-4" />
                  </span>
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">{error}</p>
                </div>
                {!showConnectWidget && (
                  <Button size="sm" variant="destructive" onClick={() => setShowConnectWidget(true)} disabled={loading}>
                    Conectar banco
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Seção: Conexões Ativas */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08 }}
        className="mt-5"
      >
        <Card className="rounded-2xl">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-600 flex items-center justify-center border border-violet-100 dark:border-transparent">
                  <Building2 className="h-4 w-4" />
                </span>
                <h2 className="text-[15px] font-semibold tracking-tight">Conexões ativas</h2>
              </div>
              <Badge variant="outline" className="rounded-full px-2.5 py-1 text-xs">
                <Wallet className="mr-1 h-3 w-3" />
                {items.length} {items.length === 1 ? 'instituição' : 'instituições'}
              </Badge>
            </div>

            {items.length > 0 ? (
              <AccountList
                accounts={accounts}
                loading={loading}
                onSelectAccount={selectAccount}
                selectedAccountId={selectedAccountId}
              />
            ) : (
              <Card className="border-dashed bg-muted/20">
                <CardContent className="p-8 text-center">
                  <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                    <Building2 className="h-5 w-5" />
                  </span>
                  <p className="text-sm font-semibold">Nenhuma instituição conectada</p>
                  <p className="mt-1 text-[13px] text-muted-foreground">
                    Conecte seu banco para importar contas e transações automaticamente.
                  </p>
                  <Button onClick={() => setShowConnectWidget(true)} className="mt-4 rounded-xl" size="sm">
                    <PlugZap className="mr-2 h-4 w-4" />
                    Conectar agora
                  </Button>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Seção: Transações */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.12 }}
        className="mt-4"
      >
        <Card className="rounded-2xl">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-100 dark:border-transparent">
                  <ArrowLeftRight className="h-4 w-4" />
                </span>
                <h2 className="text-[15px] font-semibold tracking-tight">Transações</h2>
              </div>
              {selectedAccountId && (
                <Badge variant="outline" className="rounded-full text-[11px] hidden sm:inline-flex">
                  Conta selecionada
                </Badge>
              )}
            </div>

            {selectedAccountId ? (
              <TransactionList accountId={selectedAccountId} />
            ) : (
              <Card className="border-dashed bg-muted/20">
                <CardContent className="p-8 text-center">
                  <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                    <Wallet className="h-5 w-5" />
                  </span>
                  <p className="text-sm font-semibold">Selecione uma conta para ver as transações</p>
                  <p className="mt-1 text-[13px] text-muted-foreground">Clique em “Ver Transações” em uma das contas acima.</p>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Seção: Importação Automática */}
      <AnimatePresence>
        {openFinanceTransactions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="mt-4"
          >
            <Card className="rounded-2xl border-dashed">
              <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex gap-3">
                  <span className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-100 dark:border-transparent shrink-0">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="text-[14px] font-semibold">Importação automática</h2>
                    <p className="text-[13px] text-muted-foreground leading-relaxed mt-0.5">
                      Analise suas transações para detectar compras parceladas automaticamente.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleDetectInstallments}
                  disabled={detectingInstallments}
                  isLoading={detectingInstallments}
                  className="rounded-xl shrink-0"
                >
                  {detectingInstallments ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Analisando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Detectar parcelados
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dialog de conexão bancária */}
      <Dialog open={showConnectWidget} onOpenChange={setShowConnectWidget}>
        <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-2">
              <PlugZap className="h-4 w-4 text-primary" />
              Conectar instituição
            </DialogTitle>
            <DialogDescription>Autentique com segurança via Pluggy para importar seus dados.</DialogDescription>
          </DialogHeader>
          <div className="p-6 pt-4">
            <ConnectBank
              onSuccess={handleConnectSuccess}
              onError={handleConnectError}
              onClose={() => setShowConnectWidget(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Botão secundário quando dialog fechado removido — já no header, mas mantém atalho flutuante em mobile */}
      <div className="mt-6 flex sm:hidden">
        <Button variant="outline" onClick={() => setShowConnectWidget(true)} disabled={loading} className="w-full rounded-xl">
          <PlugZap className="mr-2 h-4 w-4" />
          {loading ? 'Carregando...' : 'Conectar nova instituição'}
        </Button>
      </div>
    </div>
  );
};

export default OpenFinancePage;
