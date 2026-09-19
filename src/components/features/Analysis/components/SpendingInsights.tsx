/**
 * @file components/features/Analysis/components/SpendingInsights.tsx
 * @description Lista de insights gerados a partir de transações (heurísticas).
 * Cada insight usa Card + ícone lucide + tailwind com variação por tipo (warning/tip/info/alert).
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Lightbulb, Info, AlertCircle, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../../../utils/formatters';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../ui/card';
import type { Transaction, Category } from '../../../../types';

interface SpendingInsightsProps {
  transactions: Transaction[];
  categories: Category[];
}

interface Insight {
  id: string;
  type: 'warning' | 'tip' | 'info' | 'alert';
  title: string;
  text: string;
}

// Mapeia tipo para ícone lucide e classes tailwind
const typeConfig: Record<
  Insight['type'],
  { icon: React.ElementType; wrap: string; iconColor: string; border: string; bg: string }
> = {
  warning: {
    icon: AlertTriangle,
    wrap: 'bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20',
    iconColor: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-500/20',
    bg: 'bg-amber-50/60 dark:bg-amber-500/5',
  },
  tip: {
    icon: Lightbulb,
    wrap: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-500/20',
    bg: 'bg-emerald-50/60 dark:bg-emerald-500/5',
  },
  info: {
    icon: Info,
    wrap: 'bg-sky-50 border-sky-200 dark:bg-sky-500/10 dark:border-sky-500/20',
    iconColor: 'text-sky-600 dark:text-sky-400',
    border: 'border-sky-200 dark:border-sky-500/20',
    bg: 'bg-sky-50/60 dark:bg-sky-500/5',
  },
  alert: {
    icon: AlertCircle,
    wrap: 'bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/20',
    iconColor: 'text-red-600 dark:text-red-400',
    border: 'border-red-200 dark:border-red-500/20',
    bg: 'bg-red-50/60 dark:bg-red-500/5',
  },
};

const SpendingInsights: React.FC<SpendingInsightsProps> = ({ transactions, categories }) => {
  const insights = useMemo(() => {
    const result: Insight[] = [];
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentMonthTx = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const currentExpenses = currentMonthTx.filter((t) => t.type === 'expense');
    const currentIncome = currentMonthTx
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);
    const currentExpense = currentExpenses.reduce((s, t) => s + t.amount, 0);

    const expensesByCategory: Record<string, number> = {};
    currentExpenses.forEach((t) => {
      expensesByCategory[t.categoryId] = (expensesByCategory[t.categoryId] || 0) + t.amount;
    });

    const sortedCategories = Object.entries(expensesByCategory)
      .map(([catId, value]) => ({
        catId,
        value,
        name: categories.find((c) => c.id === catId)?.name || 'Outros',
      }))
      .sort((a, b) => b.value - a.value);

    if (sortedCategories.length > 0) {
      const top = sortedCategories[0];
      const percent = currentExpense > 0 ? ((top.value / currentExpense) * 100).toFixed(0) : '0';
      result.push({
        id: 'top-category',
        type: 'alert',
        title: `Maior gasto: ${top.name}`,
        text: `${formatCurrency(top.value)} (${percent}% do total) vão para ${top.name}. Considere revisar gastos nessa categoria.`,
      });
    }

    if (currentIncome > 0 && currentExpense > currentIncome) {
      const deficit = currentExpense - currentIncome;
      result.push({
        id: 'negative-balance',
        type: 'alert',
        title: 'Saldo negativo este mês',
        text: `Você gastou ${formatCurrency(deficit)} a mais do que recebeu. Reduza despesas ou aumente a receita para equilibrar.`,
      });
    }

    if (sortedCategories.length >= 2) {
      const topTwo = sortedCategories[0].value + sortedCategories[1].value;
      const topTwoPercent = currentExpense > 0 ? (topTwo / currentExpense) * 100 : 0;
      if (topTwoPercent > 60) {
        result.push({
          id: 'concentrated',
          type: 'warning',
          title: 'Gastos concentrados',
          text: `${sortedCategories[0].name} e ${sortedCategories[1].name} representam ${topTwoPercent.toFixed(0)}% dos seus gastos. Diversificar pode reduzir riscos.`,
        });
      }
    }

    if (currentExpense > 0) {
      const maxCategory = sortedCategories[0];
      if (maxCategory) {
        const reduceAmount = maxCategory.value * 0.1;
        result.push({
          id: 'save-tip',
          type: 'tip',
          title: 'Dica: Reduza 10% no maior gasto',
          text: `Se reduzir 10% em ${maxCategory.name}, economiza ${formatCurrency(reduceAmount)} por mês (${formatCurrency(reduceAmount * 12)} por ano).`,
        });
      }
    }

    if (currentIncome === 0 && currentExpenses.length > 0) {
      result.push({
        id: 'no-income',
        type: 'info',
        title: 'Sem receitas registradas',
        text: 'Registre suas fontes de renda para ter uma visão completa das suas finanças.',
      });
    }

    const lowCategories = sortedCategories.filter((c) => {
      const percent = currentExpense > 0 ? (c.value / currentExpense) * 100 : 0;
      return percent < 5 && percent > 0;
    });
    if (lowCategories.length >= 3) {
      result.push({
        id: 'many-small',
        type: 'info',
        title: 'Vários gastos pequenos',
        text: `${lowCategories.length} categorias representam menos de 5% cada. Gastos pequenos somam: ${formatCurrency(lowCategories.reduce((s, c) => s + c.value, 0))}.`,
      });
    }

    return result;
  }, [transactions, categories]);

  if (insights.length === 0) {
    return (
      <Card className="rounded-2xl">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-violet-50 border border-violet-100 text-violet-600 dark:bg-violet-500/10 dark:border-transparent">
              <Sparkles className="h-4 w-4" />
            </span>
            <CardTitle className="text-[15px] font-semibold">Insights</CardTitle>
          </div>
          <CardDescription className="text-[13px]">
            Análise automática dos seus gastos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-center text-muted-foreground">
            <span className="p-3 rounded-2xl bg-muted">
              <Sparkles className="h-5 w-5" />
            </span>
            <p className="text-sm">Adicione transações para gerar insights personalizados</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-violet-50 border border-violet-100 text-violet-600 dark:bg-violet-500/10 dark:border-transparent">
            <Sparkles className="h-4 w-4" />
          </span>
          <CardTitle className="text-[15px] font-semibold">Insights</CardTitle>
        </div>
        <CardDescription className="text-[13px]">
          Análise automática dos seus gastos
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col gap-2.5">
          {insights.map((insight, idx) => {
            const cfg = typeConfig[insight.type];
            const Icon = cfg.icon;
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`flex gap-3 p-3.5 rounded-xl border ${cfg.bg} ${cfg.border}`}
              >
                <span
                  className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-lg border ${cfg.wrap} ${cfg.iconColor}`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold leading-tight">{insight.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                    {insight.text}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default SpendingInsights;
