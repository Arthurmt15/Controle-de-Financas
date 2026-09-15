/**
 * @file src/components/features/OpenFinance/TransactionList/index.tsx
 * @description Lista de transações com shadcn + tailwind + framer-motion + lucide.
 * Filtros com Input shadcn, itens animados e badges.
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Tag, ArrowUpRight, ArrowDownRight, Loader2, SearchX } from 'lucide-react';
import { useOpenFinance } from '../../../../contexts/OpenFinanceContext';
import { Card, CardContent } from '../../../ui/card';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Badge } from '../../../ui/badge';

/** Props da lista de transações */
interface TransactionListProps {
  accountId: string;
}

/** Formata moeda BRL */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
}

/** Formata data ISO para pt-BR */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR');
}

/** Lista de transações — filtros e itens com shadcn */
const TransactionList: React.FC<TransactionListProps> = ({ accountId }) => {
  const { transactions, loading, loadTransactions } = useOpenFinance();
  // Filtros de período
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  /** Carrega transações quando conta ou filtros mudam */
  useEffect(() => {
    if (accountId) {
      loadTransactions(accountId, fromDate || undefined, toDate || undefined);
    }
  }, [accountId, fromDate, toDate, loadTransactions]);

  // Estado carregando
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12 text-muted-foreground gap-2 text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        Carregando transações...
      </div>
    );
  }

  // Estado vazio
  if (transactions.length === 0) {
    return (
      <Card className="border-dashed bg-muted/20">
        <CardContent className="p-8 text-center">
          <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <SearchX className="h-5 w-5" />
          </span>
          <p className="text-sm font-semibold">Nenhuma transação encontrada</p>
          <p className="mt-1 text-xs text-muted-foreground">Ajuste o período ou selecione outra conta.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Filtros de data — Card com Input shadcn */}
      <Card className="rounded-xl bg-muted/30">
        <CardContent className="p-3.5 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="from-date" className="text-xs text-muted-foreground flex items-center gap-1.5">
              <CalendarDays className="h-3 w-3" /> De
            </Label>
            <Input id="from-date" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="h-9 rounded-xl" />
          </div>
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="to-date" className="text-xs text-muted-foreground flex items-center gap-1.5">
              <CalendarDays className="h-3 w-3" /> Até
            </Label>
            <Input id="to-date" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="h-9 rounded-xl" />
          </div>
          <div className="hidden sm:flex items-end pb-0.5">
            <Badge variant="outline" className="rounded-full px-3 py-1.5 text-xs">
              {transactions.length} {transactions.length === 1 ? 'transação' : 'transações'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Lista de transações — Card container com linhas */}
      <Card className="rounded-2xl overflow-hidden">
        <CardContent className="p-0 divide-y">
          {transactions.map((transaction, idx) => {
            const isPositive = transaction.amount >= 0;
            return (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02, duration: 0.25 }}
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/40 transition-colors group"
              >
                {/* Ícone direcional */}
                <span
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                    isPositive
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:border-transparent'
                      : 'bg-red-50 border-red-100 text-red-600 dark:bg-red-500/10 dark:border-transparent'
                  }`}
                >
                  {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                </span>

                {/* Descrição e categoria */}
                <div className="flex-1 min-w-0">
                  <span className="block text-[13.5px] font-medium truncate leading-none">{transaction.description}</span>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <Badge variant="secondary" className="rounded-full bg-muted text-muted-foreground text-[11px] font-normal px-2 py-0">
                      <Tag className="mr-1 h-3 w-3" />
                      {transaction.category || 'Sem categoria'}
                    </Badge>
                  </div>
                </div>

                {/* Valor e data */}
                <div className="text-right shrink-0">
                  <div className={`text-[14px] font-bold tracking-tight ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                    {isPositive ? '+' : ''}
                    {formatCurrency(transaction.amount)}
                  </div>
                  <div className="mt-1 flex items-center justify-end gap-1 text-[11px] text-muted-foreground">
                    <CalendarDays className="h-3 w-3" />
                    {formatDate(transaction.date)}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionList;
