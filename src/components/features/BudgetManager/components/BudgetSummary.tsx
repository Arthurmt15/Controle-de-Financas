/**
 * @file components/features/BudgetManager/components/BudgetSummary.tsx
 * @description Resumo do orçamento com shadcn + tailwind + framer-motion + lucide.
 * Grid com 4 métricas e barra de progresso animada.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingDown, PiggyBank, BarChart3 } from 'lucide-react';
import { formatCurrency } from '../../../../utils/formatters';
import { Card, CardContent } from '../../../ui/card';
import { Badge } from '../../../ui/badge';

/** Props do resumo */
interface BudgetSummaryProps {
  totalBudget: number;
  totalSpent: number;
}

/** Calcula porcentagem 0-100 */
const getPercentage = (budget: number, spent: number): number => {
  if (budget === 0) return 0;
  return Math.min((spent / budget) * 100, 100);
};

/** Cor via porcentagem */
const getPercentageColor = (percentage: number): string => {
  if (percentage >= 90) return '#ef4444';
  if (percentage >= 70) return '#f59e0b';
  return '#10b981';
};

/** Resumo do orçamento — shadcn */
const BudgetSummary: React.FC<BudgetSummaryProps> = ({ totalBudget, totalSpent }) => {
  const percentage = getPercentage(totalBudget, totalSpent);
  const color = getPercentageColor(percentage);
  const remaining = totalBudget - totalSpent;

  // Itens do resumo com ícone e tom
  const items = [
    {
      icon: Wallet,
      label: 'Orçamento total',
      value: formatCurrency(totalBudget),
      tone: 'slate' as const,
      sub: 'Limite do mês',
    },
    {
      icon: TrendingDown,
      label: 'Total gasto',
      value: formatCurrency(totalSpent),
      tone: 'red' as const,
      sub: `${percentage.toFixed(0)}% do limite`,
      danger: true,
    },
    {
      icon: PiggyBank,
      label: 'Disponível',
      value: formatCurrency(remaining),
      tone: remaining >= 0 ? ('emerald' as const) : ('red' as const),
      sub: remaining >= 0 ? 'Saldo restante' : 'Estourado',
      danger: remaining < 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {items.map((it, idx) => (
        <motion.div key={it.label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
          <Card className="rounded-2xl h-full">
            <CardContent className="p-4 flex items-center gap-3">
              <span
                className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${
                  it.tone === 'emerald'
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:border-transparent'
                    : it.tone === 'red'
                      ? 'bg-red-50 border-red-100 text-red-600 dark:bg-red-500/10 dark:border-transparent'
                      : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-500/10 dark:border-transparent'
                }`}
              >
                <it.icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <span className="block text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">{it.label}</span>
                <strong className={`block mt-1 text-[16px] font-bold tracking-tight leading-none truncate ${it.danger ? 'text-red-600' : ''}`}>
                  {it.value}
                </strong>
                <Badge variant="secondary" className="mt-1.5 rounded-full bg-muted text-muted-foreground text-[11px] font-normal px-2 py-0">
                  {it.sub}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}

      {/* Card de progresso — ocupa a 4ª coluna */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card className="rounded-2xl h-full">
          <CardContent className="p-4 flex flex-col justify-center gap-2 h-full">
            <div className="flex items-center gap-2">
              <span className="w-9 h-9 rounded-xl bg-violet-500/10 text-violet-600 flex items-center justify-center border border-violet-100 dark:border-transparent shrink-0">
                <BarChart3 className="h-4 w-4" />
              </span>
              <span className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">Progresso</span>
            </div>
            <div className="mt-1 w-full h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: color }}
              />
            </div>
            <span className="text-xs font-medium" style={{ color }}>
              {percentage.toFixed(0)}% utilizado
            </span>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default BudgetSummary;
