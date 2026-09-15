/**
 * @file src/components/features/Dashboard/OpenFinanceSummary.tsx
 * @description Resumo Open Finance redesenhado com shadcn Card + tailwind + lucide + framer-motion.
 * Mostra total de bancos conectados e saldo consolidado; estados: loading, vazio e com dados.
 */

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Landmark, Wallet, ShieldCheck, ArrowUpRight, Loader2, Unlink } from 'lucide-react';
import { useOpenFinance } from '../../../contexts/OpenFinanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { buttonVariants } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { cn } from '../../../lib/utils';

/** Formata moeda BRL */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

/** Resumo Open Finance no Dashboard — Card bento */
const OpenFinanceSummary: React.FC = () => {
  const { accounts, items, loading, loadItems, loadAllAccounts } = useOpenFinance();

  // Carrega dados ao montar
  useEffect(() => {
    loadItems();
    loadAllAccounts();
  }, [loadItems, loadAllAccounts]);

  const totalBalance = accounts.reduce((sum, account) => sum + (Number(account.balance) || 0), 0);
  const hasItems = items.length > 0;

  // Loading
  if (loading) {
    return (
      <Card className="rounded-2xl h-full">
        <CardHeader className="py-4 px-5 border-b">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Landmark className="h-3.5 w-3.5" />
            </span>
            Open Finance
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 flex flex-col items-center justify-center gap-3 text-center min-h-[180px]">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Carregando contas...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <Card className="rounded-2xl h-full overflow-hidden flex flex-col">
        <CardHeader className="py-4 px-5 border-b flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Landmark className="h-3.5 w-3.5" />
            </span>
            Open Finance
          </CardTitle>
          {hasItems && (
            <Badge variant="outline" className="rounded-full text-xs font-medium gap-1 px-2.5 py-1">
              <ShieldCheck className="h-3 w-3 text-emerald-500" />
              Conectado
            </Badge>
          )}
        </CardHeader>

        <CardContent className="p-5 flex-1 flex flex-col">
          {!hasItems ? (
            // Vazio — CTA para conectar
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center py-4">
              <span className="p-3 rounded-2xl bg-muted">
                <Unlink className="h-5 w-5 text-muted-foreground" />
              </span>
              <div>
                <p className="text-sm font-semibold">Nenhuma instituição conectada</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[220px]">
                  Conecte seu banco para consolidar saldos automaticamente.
                </p>
              </div>
              <Link to="/open-finance" className={cn(buttonVariants({ size: 'sm' }), 'mt-1 rounded-xl')}>
                Conectar banco
                <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <>
              {/* Valor principal */}
              <div className="flex items-start gap-3">
                <span className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:border-transparent shrink-0">
                  <Wallet className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">Saldo consolidado</p>
                  <p className="text-[26px] font-bold tracking-tight leading-none mt-1 break-all">{formatCurrency(totalBalance)}</p>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                    <Landmark className="h-3 w-3 opacity-60" />
                    {items.length} {items.length === 1 ? 'banco' : 'bancos'} conectado{items.length !== 1 && 's'} •{' '}
                    {accounts.length} {accounts.length === 1 ? 'conta' : 'contas'}
                  </p>
                </div>
              </div>

              {/* Mini lista de instituições (máx 3) */}
              {items.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {items.slice(0, 3).map((item) => (
                    <Badge key={item.id} variant="secondary" className="rounded-full text-xs font-medium px-2.5 py-1">
                      {item.institution_name || 'Banco'}
                    </Badge>
                  ))}
                  {items.length > 3 && (
                    <Badge variant="outline" className="rounded-full text-xs">
                      +{items.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* Ação */}
              <Link
                to="/open-finance"
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'mt-auto w-full rounded-xl justify-center gap-1.5')}
              >
                Ver detalhes
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>

              <p className="text-[11px] text-muted-foreground text-center mt-2 flex items-center justify-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                Dados criptografados e sincronizados
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default OpenFinanceSummary;
