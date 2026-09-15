/**
 * @file pages/Analysis/index.tsx
 * @description Página de Análise redesenhada com shadcn + tailwind + framer-motion + lucide.
 * Referência visual: Installments (bento, Card, motion, lucide). Métricas preservadas:
 * monthlyIncome/monthlyExpense/monthlyBalance/yearlyBalance. Layout em dois eixos:
 * ContentLayout lg:grid-cols-[1fr_380px] com ChartsColumn (SummaryGrid + Sections + TwoColumns + Insights)
 * e ChatColumn sticky contendo FinancialAdvisor.
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, CalendarRange, BarChart3, Sparkles } from 'lucide-react';
import { useTransactions } from '../../hooks/useTransactions';
import { formatCurrency } from '../../utils/formatters';
import { filterByCurrentMonth, filterByCurrentYear } from '../../utils/transactionFilters';
import MonthlyComparison from '../../components/features/Analysis/components/MonthlyComparison';
import SpendingInsights from '../../components/features/Analysis/components/SpendingInsights';
import CategoryBreakdown from '../../components/features/Analysis/components/CategoryBreakdown';
import MonthlyChart from '../../components/features/Analysis/components/MonthlyChart';
import FinancialAdvisor from '../../components/features/FinancialAdvisor';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';

// Página de Análise - design system shadcn bento
const AnalysisPage: React.FC = () => {
  // Dados de transações e categorias do hook
  const { transactions, categories } = useTransactions();

  // Métricas de resumo (mês atual e ano atual)
  const metrics = useMemo(() => {
    const monthly = filterByCurrentMonth(transactions);
    const yearly = filterByCurrentYear(transactions);

    const monthlyIncome = monthly.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const monthlyExpense = monthly.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const yearlyIncome = yearly.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const yearlyExpense = yearly.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    return {
      monthlyIncome,
      monthlyExpense,
      monthlyBalance: monthlyIncome - monthlyExpense,
      yearlyBalance: yearlyIncome - yearlyExpense,
    };
  }, [transactions]);

  // Config dos 4 cards de resumo com faixa lateral e tom
  const summaryCards = [
    {
      key: 'income',
      tone: 'emerald' as const,
      icon: TrendingUp,
      label: 'Entradas do Mês',
      value: formatCurrency(metrics.monthlyIncome),
      sub: metrics.monthlyIncome > 0 ? 'Receitas do mês atual' : 'Sem receitas no mês',
    },
    {
      key: 'expense',
      tone: 'red' as const,
      icon: TrendingDown,
      label: 'Saídas do Mês',
      value: formatCurrency(metrics.monthlyExpense),
      sub: metrics.monthlyExpense > 0 ? 'Despesas do mês atual' : 'Sem despesas no mês',
    },
    {
      key: 'balance',
      tone: 'violet' as const,
      icon: Wallet,
      label: 'Saldo do Mês',
      value: formatCurrency(metrics.monthlyBalance),
      sub: metrics.monthlyBalance >= 0 ? 'Saldo positivo' : 'Saldo negativo',
      positive: metrics.monthlyBalance >= 0,
    },
    {
      key: 'annual',
      tone: 'slate' as const,
      icon: CalendarRange,
      label: 'Saldo Anual',
      value: formatCurrency(metrics.yearlyBalance),
      sub: `Ano ${new Date().getFullYear()}`,
      positive: metrics.yearlyBalance >= 0,
    },
  ];

  // Gradiente da faixa lateral por tom
  const accentByTone: Record<string, string> = {
    emerald: 'linear-gradient(180deg,#10b981,#06b6d4)',
    red: 'linear-gradient(180deg,#ef4444,#f97316)',
    violet: 'linear-gradient(180deg,#8b5cf6,#6366f1)',
    slate: 'linear-gradient(180deg,#64748b,#475569)',
  };

  // Classes de ícone por tom
  const iconWrapByTone: Record<string, string> = {
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:border-transparent',
    red: 'bg-red-50 border-red-100 text-red-600 dark:bg-red-500/10 dark:border-transparent',
    violet: 'bg-violet-50 border-violet-100 text-violet-600 dark:bg-violet-500/10 dark:border-transparent',
    slate: 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-500/10 dark:border-transparent',
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-6">
      {/* Header bento com título em gradiente */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        <div className="text-center sm:text-left">
          {/* Título principal com gradiente sutil */}
          <h1 className="text-[28px] sm:text-[30px] font-bold tracking-tight leading-none bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Análise
          </h1>
          <p className="mt-2 text-[13.5px] text-muted-foreground sm:text-left text-center leading-relaxed">
            Como estão suas finanças e como melhorar
          </p>
        </div>
      </motion.div>

      {/* Layout principal: 1fr + 380px no desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:items-start mt-6">
        {/* Coluna de gráficos e insights */}
        <div className="flex flex-col gap-5 min-w-0">
          {/* SummaryGrid 4 col com faixa lateral colorida */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5"
          >
            {summaryCards.map((card, idx) => (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + idx * 0.05 }}
              >
                <Card className="relative overflow-hidden rounded-2xl border bg-card shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 min-h-[118px]">
                  {/* Faixa lateral com gradiente por variante */}
                  <span
                    className="absolute left-0 top-0 bottom-0 w-[3px] opacity-90"
                    style={{ background: accentByTone[card.tone] }}
                  />
                  <CardContent className="p-[18px] flex items-center gap-3.5">
                    {/* Ícone com fundo tonalizado */}
                    <span
                      className={`w-[42px] h-[42px] shrink-0 flex items-center justify-center rounded-xl border text-sm ${iconWrapByTone[card.tone]}`}
                    >
                      <card.icon size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="block text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">
                        {card.label}
                      </span>
                      <strong className="block mt-1.5 text-[18px] font-bold tracking-tight leading-none truncate">
                        {card.value}
                      </strong>
                      {/* Subtexto com cor condicional para saldo */}
                      <span
                        className={`mt-1.5 inline-block text-[11px] font-medium px-2 py-0.5 rounded-full ${
                          card.key === 'balance' || card.key === 'annual'
                            ? card.positive
                              ? 'text-emerald-700 bg-emerald-50 border border-emerald-100 dark:text-emerald-300 dark:bg-emerald-500/10 dark:border-emerald-500/20'
                              : 'text-red-700 bg-red-50 border border-red-100 dark:text-red-300 dark:bg-red-500/10 dark:border-red-500/20'
                            : 'text-muted-foreground bg-muted'
                        }`}
                      >
                        {card.sub}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Section: Evolução Mensal */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
          >
            <Card className="rounded-2xl">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-violet-50 border border-violet-100 text-violet-600 dark:bg-violet-500/10 dark:border-transparent">
                    <BarChart3 className="h-4 w-4" />
                  </span>
                  <CardTitle className="text-[15px] font-semibold">Evolução Mensal</CardTitle>
                </div>
                <CardDescription className="text-[13px] mt-1">Últimos 12 meses de entradas vs saídas</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <MonthlyChart transactions={transactions} />
              </CardContent>
            </Card>
          </motion.div>

          {/* TwoColumns: comparativo + breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            <MonthlyComparison transactions={transactions} />
            <CategoryBreakdown transactions={transactions} categories={categories} />
          </motion.div>

          {/* SpendingInsights com stagger */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
            <SpendingInsights transactions={transactions} categories={categories} />
          </motion.div>
        </div>

        {/* ChatColumn sticky no desktop */}
        <div className="w-full lg:sticky lg:top-[80px] lg:self-start">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            {/* Header sutil acima do chat */}
            <div className="hidden lg:flex items-center gap-2 mb-3 text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              <span className="text-[11px] font-semibold tracking-widest uppercase">Assistente IA</span>
            </div>
            <FinancialAdvisor />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPage;
