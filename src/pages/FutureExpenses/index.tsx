/**
 * @file pages/FutureExpenses/index.tsx
 * @description Página de despesas futuras redesenhada com shadcn + tailwind + framer-motion.
 * Espelha o layout bento de Installments: heading gradiente, hint, métricas e formulário animado.
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, CheckCircle2, Plus, X, Info } from 'lucide-react';
import FutureExpenseForm from '../../components/features/FutureExpenses/Form';
import FutureExpenseList from '../../components/features/FutureExpenses/List';
import { useFutureExpenses } from '../../contexts/FutureExpensesContext';
import { formatCurrency } from '../../utils/formatters';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

/** Página de Despesas Futuras - design system shadcn */
const FutureExpensesPage: React.FC = () => {
  // Controla visibilidade do formulário
  const [showForm, setShowForm] = useState(false);
  // Dados para métricas resumidas
  const { futureExpenses } = useFutureExpenses();

  /** Métricas: total pendente e total pago */
  const metrics = useMemo(() => {
    const totalPending = futureExpenses
      .filter((e) => e.status === 'pending')
      .reduce((sum, e) => sum + Number(e.amount), 0);
    const totalPaid = futureExpenses
      .filter((e) => e.status === 'paid')
      .reduce((sum, e) => sum + Number(e.amount), 0);
    const pendingCount = futureExpenses.filter((e) => e.status === 'pending').length;
    const paidCount = futureExpenses.filter((e) => e.status === 'paid').length;
    return { totalPending, totalPaid, pendingCount, paidCount, total: futureExpenses.length };
  }, [futureExpenses]);

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-6">
      {/* Cabeçalho bento */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
          <div className="min-w-0">
            <h1 className="text-[28px] sm:text-[30px] font-bold tracking-tight leading-none bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Despesas Futuras
            </h1>
            <p className="mt-2 text-[13.5px] text-muted-foreground max-w-[560px] leading-relaxed">
              Planeje seus gastos que ainda vão acontecer e mantenha o fluxo sob controle
            </p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="shrink-0 rounded-xl shadow-sm">
            {showForm ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
            {showForm ? 'Fechar' : 'Nova despesa futura'}
          </Button>
        </div>

        {/* Hint */}
        <Card className="border-dashed bg-muted/30">
          <CardContent className="p-3 flex gap-2.5 items-start">
            <span className="mt-0.5 p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
              <Info className="h-3.5 w-3.5" />
            </span>
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              Cadastre gastos previstos (ex: IPVA, matrícula, viagem) e acompanhe por status: pendente, pago ou cancelado.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Métricas resumidas - 2 cards + total */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-5"
      >
        {/* Card pendente */}
        <Card className="relative overflow-hidden rounded-2xl border bg-card shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
          <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-amber-500 to-orange-500" />
          <CardContent className="p-[18px] flex items-center gap-3.5">
            <span className="w-[42px] h-[42px] flex items-center justify-center rounded-xl border bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-500/10 dark:border-transparent">
              <Wallet size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <span className="block text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">
                Pendente
              </span>
              <strong className="block mt-1.5 text-[18px] font-bold tracking-tight">{formatCurrency(metrics.totalPending)}</strong>
              <span className="mt-1.5 inline-block text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {metrics.pendingCount} itens
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card pago */}
        <Card className="relative overflow-hidden rounded-2xl border bg-card shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
          <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-emerald-500 to-teal-500" />
          <CardContent className="p-[18px] flex items-center gap-3.5">
            <span className="w-[42px] h-[42px] flex items-center justify-center rounded-xl border bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:border-transparent">
              <CheckCircle2 size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <span className="block text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">Pago</span>
              <strong className="block mt-1.5 text-[18px] font-bold tracking-tight">{formatCurrency(metrics.totalPaid)}</strong>
              <span className="mt-1.5 inline-block text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {metrics.paidCount} itens
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card total */}
        <Card className="relative overflow-hidden rounded-2xl border bg-card shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
          <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-slate-500 to-slate-600" />
          <CardContent className="p-[18px] flex items-center gap-3.5">
            <span className="w-[42px] h-[42px] flex items-center justify-center rounded-xl border bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-500/10 dark:border-transparent">
              <Info size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <span className="block text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">Total cadastrado</span>
              <strong className="block mt-1.5 text-[18px] font-bold tracking-tight">{metrics.total} despesas</strong>
              <span className="mt-1.5 inline-block text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                Gerencie por abas abaixo
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Formulário animado */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-5 overflow-hidden"
          >
            <Card className="rounded-2xl border shadow-sm">
              <CardContent className="p-6">
                <FutureExpenseForm onClose={() => setShowForm(false)} />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 }} className="mt-5">
        <FutureExpenseList />
      </motion.div>
    </div>
  );
};

export default FutureExpensesPage;
