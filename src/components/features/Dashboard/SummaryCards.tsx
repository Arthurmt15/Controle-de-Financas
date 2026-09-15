/**
 * @file components/features/Dashboard/SummaryCards.tsx
 * @description Cards de resumo do Dashboard redesenhados com shadcn Card + tailwind + framer-motion.
 * Faixa lateral por tom (emerald/rose/violet/slate), ícones lucide e motion stagger — espelho de Installments.
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, CalendarDays, MoreHorizontal } from 'lucide-react';
import { useTransactions } from '../../../hooks/useTransactions';
import { formatCurrency } from '../../../utils/formatters';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';

// Gradiente da faixa lateral por tom
const stripeByTone: Record<string, string> = {
  emerald: 'linear-gradient(180deg,#10b981,#06b6d4)',
  rose: 'linear-gradient(180deg,#f43f5e,#f97316)',
  violet: 'linear-gradient(180deg,#8b5cf6,#6366f1)',
  slate: 'linear-gradient(180deg,#64748b,#475569)',
};

// Classes do ícone por tom
const iconToneClass: Record<string, string> = {
  emerald: 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:border-transparent',
  rose: 'bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-500/10 dark:border-transparent',
  violet: 'bg-violet-50 border-violet-100 text-violet-600 dark:bg-violet-500/10 dark:border-transparent',
  slate: 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-500/10 dark:border-transparent',
};

/** SummaryCards — 4 KPIs com visual bento e stagger */
const SummaryCards: React.FC = () => {
  const { metrics } = useTransactions();

  /** Variação percentual formatada com sinal */
  const getVariation = (current: number, previous: number): string => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const variation = ((current - previous) / previous) * 100;
    return `${variation >= 0 ? '+' : ''}${variation.toFixed(1)}%`;
  };

  /** Dados dos 4 cards — label, valor e tom */
  const cards = useMemo(
    () => [
      {
        key: 'income' as const,
        Icon: TrendingUp,
        label: 'Entradas do Mês',
        value: formatCurrency(metrics.monthlyIncome),
        subtext: getVariation(metrics.monthlyIncome, metrics.averageMonthlyIncome),
        tone: 'emerald' as const,
      },
      {
        key: 'expense' as const,
        Icon: TrendingDown,
        label: 'Saídas do Mês',
        value: formatCurrency(metrics.monthlyExpense),
        subtext: getVariation(metrics.monthlyExpense, metrics.averageMonthlyExpense),
        tone: 'rose' as const,
      },
      {
        key: 'balance' as const,
        Icon: Wallet,
        label: 'Saldo do Mês',
        value: formatCurrency(metrics.monthlyBalance),
        subtext: metrics.monthlyBalance >= 0 ? 'Fluxo positivo' : 'Atenção ao fluxo',
        tone: 'violet' as const,
      },
      {
        key: 'annual' as const,
        Icon: CalendarDays,
        label: 'Saldo Anual',
        value: formatCurrency(metrics.yearlyBalance),
        subtext: `Acumulado ${new Date().getFullYear()}`,
        tone: 'slate' as const,
      },
    ],
    [metrics]
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {cards.map(({ key, Icon, label, value, subtext, tone }, idx) => (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.06, duration: 0.35 }}
        >
          <Card className="relative overflow-hidden rounded-2xl border bg-card shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 min-h-[118px]">
            {/* Faixa lateral colorida por tom */}
            <span className="absolute left-0 top-0 bottom-0 w-[3px] opacity-90" style={{ background: stripeByTone[tone] }} />
            <CardContent className="p-[18px] flex items-center gap-3.5">
              {/* Ícone com fundo tonalizado */}
              <span
                className={`w-[42px] h-[42px] shrink-0 flex items-center justify-center rounded-xl border ${iconToneClass[tone]}`}
              >
                <Icon size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <span className="block text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">{label}</span>
                <strong className="block mt-1.5 text-[19px] font-bold tracking-tight leading-none truncate">{value}</strong>
                {/* Subtexto como pill tonalizado */}
                <span
                  className={`mt-1.5 inline-block text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                    tone === 'emerald'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-transparent'
                      : tone === 'rose'
                        ? 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:border-transparent'
                        : tone === 'violet'
                          ? 'bg-violet-50 text-violet-700 border-violet-100 dark:bg-violet-500/10 dark:text-violet-300 dark:border-transparent'
                          : 'bg-muted text-muted-foreground border-transparent'
                  }`}
                >
                  {subtext}
                </span>
              </div>
              {/* Botão discreto no canto */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 h-7 w-7 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
                aria-label="mais opções"
              >
                <MoreHorizontal size={14} />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default SummaryCards;
