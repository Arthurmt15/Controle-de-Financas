/**
 * @file pages/Analysis/index.tsx
 * @description Análise redesenhada com 2 estilos distintos: DESKTOP (bento premium, sticky advisor) e MOBILE (stack compacto, cards 2x2, chart reduzido).
 * Métricas preservadas: monthlyIncome/monthlyExpense/monthlyBalance/yearlyBalance.
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, CalendarRange, BarChart3, Sparkles, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useTransactions } from '../../hooks/useTransactions';
import { formatCurrency } from '../../utils/formatters';
import { filterByCurrentMonth, filterByCurrentYear } from '../../utils/transactionFilters';
import MonthlyComparison from '../../components/features/Analysis/components/MonthlyComparison';
import SpendingInsights from '../../components/features/Analysis/components/SpendingInsights';
import CategoryBreakdown from '../../components/features/Analysis/components/CategoryBreakdown';
import MonthlyChart from '../../components/features/Analysis/components/MonthlyChart';
import FinancialAdvisor from '../../components/features/FinancialAdvisor';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

const AnalysisPage: React.FC = () => {
  const { transactions, categories } = useTransactions();

  const metrics = useMemo(() => {
    const monthly = filterByCurrentMonth(transactions);
    const yearly = filterByCurrentYear(transactions);
    const monthlyIncome = monthly.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const monthlyExpense = monthly.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const yearlyIncome = yearly.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const yearlyExpense = yearly.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { monthlyIncome, monthlyExpense, monthlyBalance: monthlyIncome - monthlyExpense, yearlyBalance: yearlyIncome - yearlyExpense };
  }, [transactions]);

  const summaryCards = [
    { key: 'income', tone: 'emerald' as const, icon: TrendingUp, label: 'Entradas do Mês', value: formatCurrency(metrics.monthlyIncome), sub: metrics.monthlyIncome > 0 ? 'Receitas do mês' : 'Sem receitas' },
    { key: 'expense', tone: 'red' as const, icon: TrendingDown, label: 'Saídas do Mês', value: formatCurrency(metrics.monthlyExpense), sub: metrics.monthlyExpense > 0 ? 'Despesas do mês' : 'Sem despesas' },
    { key: 'balance', tone: 'violet' as const, icon: Wallet, label: 'Saldo do Mês', value: formatCurrency(metrics.monthlyBalance), sub: metrics.monthlyBalance >= 0 ? 'Saldo positivo' : 'Saldo negativo', positive: metrics.monthlyBalance >= 0 },
    { key: 'annual', tone: 'slate' as const, icon: CalendarRange, label: 'Saldo Anual', value: formatCurrency(metrics.yearlyBalance), sub: `Ano ${new Date().getFullYear()}`, positive: metrics.yearlyBalance >= 0 },
  ];

  const accentByTone: Record<string, string> = {
    emerald: 'linear-gradient(180deg,#10b981,#06b6d4)',
    red: 'linear-gradient(180deg,#ef4444,#f97316)',
    violet: 'linear-gradient(180deg,#8b5cf6,#6366f1)',
    slate: 'linear-gradient(180deg,#64748b,#475569)',
  };
  const iconWrapByTone: Record<string, string> = {
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:border-transparent',
    red: 'bg-red-50 border-red-100 text-red-600 dark:bg-red-500/10 dark:border-transparent',
    violet: 'bg-violet-50 border-violet-100 text-violet-600 dark:bg-violet-500/10 dark:border-transparent',
    slate: 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-500/10 dark:border-transparent',
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 py-5 sm:py-6">
      {/* HEADER - desktop alinhado à esquerda com badge, mobile centrado */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        {/* Desktop header */}
        <div className="hidden lg:flex items-end justify-between gap-4">
          <div>
            <h1 className="text-[30px] font-bold tracking-tight leading-none bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Análise
            </h1>
            <p className="mt-2 text-[13.5px] text-muted-foreground leading-relaxed">Como estão suas finanças e como melhorar</p>
          </div>
          <Badge variant="outline" className="rounded-full gap-1.5 px-3 py-1.5 bg-card shadow-sm hidden xl:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Atualizado agora
          </Badge>
        </div>
        {/* Mobile header */}
        <div className="lg:hidden text-center">
          <h1 className="text-[24px] font-bold tracking-tight leading-none">Análise</h1>
          <p className="mt-1.5 text-[13px] text-muted-foreground">Como estão suas finanças</p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <Badge variant="secondary" className="rounded-full gap-1.5 text-xs">
              <BarChart3 className="h-3 w-3" />
              {transactions.length} transações
            </Badge>
            <Badge variant="outline" className="rounded-full gap-1 text-xs">
              <Sparkles className="h-3 w-3 text-violet-500" /> IA
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* ================= DESKTOP LAYOUT (lg+) — bento premium ================= */}
      <div className="hidden lg:grid grid-cols-[1fr_400px] gap-6 items-start mt-7">
        <div className="flex flex-col gap-5 min-w-0">
          {/* Summary 4 col desktop — cards altos com hover lift */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="grid grid-cols-4 gap-3.5">
            {summaryCards.map((card, idx) => (
              <motion.div key={card.key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 + idx * 0.04 }}>
                <Card className="relative overflow-hidden rounded-2xl border bg-card shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 min-h-[132px] group">
                  <span className="absolute left-0 top-0 bottom-0 w-[3px] opacity-90 group-hover:opacity-100 transition-opacity" style={{ background: accentByTone[card.tone] }} />
                  <CardContent className="p-5 flex gap-3.5">
                    <span className={`w-11 h-11 shrink-0 flex items-center justify-center rounded-xl border ${iconWrapByTone[card.tone]}`}>
                      <card.icon size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="block text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">{card.label}</span>
                      <strong className="block mt-1.5 text-[19px] font-bold tracking-tight leading-none truncate">{card.value}</strong>
                      <span
                        className={`mt-2 inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full border ${
                          card.key === 'balance' || card.key === 'annual'
                            ? card.positive
                              ? 'text-emerald-700 bg-emerald-50 border-emerald-100 dark:text-emerald-300 dark:bg-emerald-500/10 dark:border-emerald-500/20'
                              : 'text-red-700 bg-red-50 border-red-100 dark:text-red-300 dark:bg-red-500/10 dark:border-red-500/20'
                            : 'text-muted-foreground bg-muted border-transparent'
                        }`}
                      >
                        {(card.key === 'balance' || card.key === 'annual') && (card.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />)}
                        {card.sub}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
            <Card className="rounded-2xl overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-violet-50 border border-violet-100 text-violet-600 dark:bg-violet-500/10 dark:border-transparent">
                    <BarChart3 className="h-4 w-4" />
                  </span>
                  <CardTitle className="text-[15px] font-semibold">Evolução Mensal</CardTitle>
                </div>
                <CardDescription className="text-[13px] mt-1">Últimos 12 meses — entradas vs saídas</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <MonthlyChart transactions={transactions} height={320} />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="grid grid-cols-2 gap-5">
            <MonthlyComparison transactions={transactions} />
            <CategoryBreakdown transactions={transactions} categories={categories} />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
            <SpendingInsights transactions={transactions} categories={categories} />
          </motion.div>
        </div>

        {/* Advisor sticky desktop */}
        <div className="sticky top-[84px] self-start">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
            <div className="flex items-center gap-2 mb-3 text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-violet-500" />
              <span className="text-[11px] font-semibold tracking-widest uppercase">Assistente IA</span>
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] text-muted-foreground">online</span>
            </div>
            <FinancialAdvisor />
          </motion.div>
        </div>
      </div>

      {/* ================= MOBILE LAYOUT (base→lg) — stack compacto ================= */}
      <div className="lg:hidden flex flex-col gap-4 mt-6">
        {/* Summary 2x2 compacto — altura reduzida, tipografia menor */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="grid grid-cols-2 gap-3">
          {summaryCards.map((card, idx) => (
            <motion.div key={card.key} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.08 + idx * 0.04 }}>
              <Card className="relative overflow-hidden rounded-2xl border bg-card shadow-sm active:scale-[0.98] transition-transform min-h-[108px]">
                <span className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: accentByTone[card.tone] }} />
                <CardContent className="p-3.5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-8 h-8 flex items-center justify-center rounded-lg border ${iconWrapByTone[card.tone]}`}>
                      <card.icon size={14} />
                    </span>
                    <span className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground leading-none">{card.label}</span>
                  </div>
                  <strong className="block text-[15px] font-bold tracking-tight leading-none truncate">{card.value}</strong>
                  <span
                    className={`mt-1.5 inline-flex text-[10px] font-medium px-2 py-0.5 rounded-full border leading-none ${
                      card.key === 'balance' || card.key === 'annual'
                        ? card.positive
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-100 dark:text-emerald-300 dark:bg-emerald-500/10 dark:border-emerald-500/20'
                          : 'text-red-700 bg-red-50 border-red-100 dark:text-red-300 dark:bg-red-500/10 dark:border-red-500/20'
                        : 'text-muted-foreground bg-muted border-transparent'
                    }`}
                  >
                    {card.sub}
                  </span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Evolução — card full-width com chart menor */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
          <Card className="rounded-2xl overflow-hidden">
            <CardHeader className="pb-2 px-4 pt-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-violet-50 border border-violet-100 text-violet-600 dark:bg-violet-500/10 dark:border-transparent">
                  <BarChart3 className="h-3.5 w-3.5" />
                </span>
                <CardTitle className="text-[14px] font-semibold">Evolução Mensal</CardTitle>
              </div>
              <CardDescription className="text-[12px]">12 meses • entradas vs saídas</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 px-2 pb-3">
              <MonthlyChart transactions={transactions} height={220} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Comparativo + Breakdown empilhados full-width */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
          <MonthlyComparison transactions={transactions} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
          <CategoryBreakdown transactions={transactions} categories={categories} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <SpendingInsights transactions={transactions} categories={categories} />
        </motion.div>

        {/* Advisor mobile — full width, altura fixa menor, sem sticky */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
          <div className="flex items-center gap-2 mb-2 px-1">
            <Sparkles className="h-3.5 w-3.5 text-violet-500" />
            <span className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">Assistente IA</span>
            <Badge variant="secondary" className="ml-auto rounded-full text-[10px] px-2 py-0">mobile</Badge>
          </div>
          <FinancialAdvisor />
        </motion.div>
      </div>
    </div>
  );
};

export default AnalysisPage;
