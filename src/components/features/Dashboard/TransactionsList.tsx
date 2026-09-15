/**
 * @file components/features/Dashboard/TransactionsList.tsx
 * @description Lista de transações recentes redesenhada com shadcn Card + Badge + lucide.
 * Exibe as 5 transações mais recentes com motion e estados vazios bento.
 */

import React, { useMemo } from 'react';
import { ArrowUpRight, ArrowDownRight, Inbox, Clock3, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTransactions } from '../../../hooks/useTransactions';
import { formatCurrency } from '../../../utils/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { buttonVariants } from '../../ui/button';
import { cn } from '../../../lib/utils';

/** Linha individual de transação — tailwind + Badge */
const TransactionRow: React.FC<{
  tx: { id: string; description: string; amount: number; type: 'income' | 'expense'; date: string };
  formatDate: (d: string) => string;
}> = ({ tx, formatDate }) => {
  const isIncome = tx.type === 'income';
  return (
    <div className="flex items-center justify-between gap-3 py-3 border-b last:border-0 border-border/60">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Ícone direcional tonalizado */}
        <span
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
            isIncome
              ? 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:border-transparent'
              : 'bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-500/10 dark:border-transparent'
          }`}
        >
          {isIncome ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium truncate leading-tight">{tx.description}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <Clock3 className="h-3 w-3 opacity-60" />
            {formatDate(tx.date)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Badge variant={isIncome ? 'success' : 'destructive'} className="font-semibold tabular-nums px-2.5 py-1 rounded-full">
          {isIncome ? '+' : '-'}
          {formatCurrency(tx.amount)}
        </Badge>
      </div>
    </div>
  );
};

/** Lista de transações recentes com Card bento */
const TransactionsList: React.FC = () => {
  const { transactions } = useTransactions();

  /** Últimas 5 por data de criação/data */
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  const formatDate = (dateString: string): string => new Date(dateString).toLocaleDateString('pt-BR');

  // Estado vazio
  if (recentTransactions.length === 0) {
    return (
      <Card className="rounded-2xl overflow-hidden">
        <CardHeader className="py-4 px-5 border-b flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-muted">
              <Clock3 className="h-3.5 w-3.5" />
            </span>
            Últimas Transações
          </CardTitle>
        </CardHeader>
        <CardContent className="p-10 flex flex-col items-center justify-center gap-3 text-center">
          <span className="p-3 rounded-2xl bg-muted">
            <Inbox className="h-5 w-5 text-muted-foreground" />
          </span>
          <p className="text-sm font-semibold">Nenhuma transação</p>
          <p className="text-xs text-muted-foreground">Adicione sua primeira transação</p>
          <Link to="/transactions" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'mt-1 rounded-xl')}>
            Ir para transações
            <ChevronRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl overflow-hidden">
      <CardHeader className="py-4 px-5 border-b flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <Clock3 className="h-3.5 w-3.5" />
          </span>
          Últimas Transações
        </CardTitle>
        <Link
          to="/transactions"
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'h-8 rounded-xl text-xs font-medium')}
        >
          Ver todas
          <ChevronRight className="ml-1 h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent className="px-5 py-1">
        {/* Stagger suave nas linhas */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          {recentTransactions.map((tx, idx) => (
            <motion.div key={tx.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
              <TransactionRow tx={tx} formatDate={formatDate} />
            </motion.div>
          ))}
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default TransactionsList;
