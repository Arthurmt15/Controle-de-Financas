/**
 * @file components/features/Analysis/components/CategoryBreakdown.tsx
 * @description Breakdown por categoria (mês atual) com shadcn Card, barra animada via framer-motion,
 * Badge e lucide. Tailwind puro, sem styled-components.
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Wallet } from 'lucide-react';
import { formatCurrency } from '../../../../utils/formatters';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../ui/card';
import type { Transaction, Category } from '../../../../types';

interface CategoryBreakdownProps {
  transactions: Transaction[];
  categories: Category[];
}

interface CategoryData {
  id: string;
  name: string;
  color: string;
  total: number;
  percent: number;
}

// Breakdown de gastos por categoria no mês atual
const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({ transactions, categories }) => {
  const data = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const expenses = transactions.filter((t) => {
      if (t.type !== 'expense') return false;
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const totals: Record<string, number> = {};
    expenses.forEach((t) => {
      totals[t.categoryId] = (totals[t.categoryId] || 0) + t.amount;
    });

    const totalExpenses = Object.values(totals).reduce((s, v) => s + v, 0);

    return Object.entries(totals)
      .map(([catId, total]): CategoryData => {
        const cat = categories.find((c) => c.id === catId);
        return {
          id: catId,
          name: cat?.name || 'Outros',
          color: cat?.color || '#6b7280',
          total,
          percent: totalExpenses > 0 ? (total / totalExpenses) * 100 : 0,
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [transactions, categories]);

  if (data.length === 0) {
    return (
      <Card className="rounded-2xl">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 dark:bg-amber-500/10 dark:border-transparent">
              <PieChart className="h-4 w-4" />
            </span>
            <CardTitle className="text-[15px] font-semibold">Para onde vai seu dinheiro</CardTitle>
          </div>
          <CardDescription className="text-[13px]">Gastos do mês por categoria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
            <span className="p-3 rounded-2xl bg-muted">
              <Wallet className="h-5 w-5 text-muted-foreground" />
            </span>
            <p className="text-sm text-muted-foreground">Nenhuma despesa registrada este mês</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 dark:bg-amber-500/10 dark:border-transparent">
            <PieChart className="h-4 w-4" />
          </span>
          <CardTitle className="text-[15px] font-semibold">Para onde vai seu dinheiro</CardTitle>
        </div>
        <CardDescription className="text-[13px]">Gastos do mês por categoria</CardDescription>
      </CardHeader>
      <CardContent className="pt-0 space-y-0">
        {data.map((cat, idx) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.04 }}
            className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_2fr_auto_auto] items-center gap-2 sm:gap-3 py-3 border-b last:border-0 border-border"
          >
            {/* Nome da categoria com bolinha de cor */}
            <div className="flex items-center gap-2 min-w-0 col-span-2 sm:col-span-1">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-[13px] font-medium truncate">{cat.name}</span>
            </div>
            {/* Barra de progresso */}
            <div className="h-1.5 bg-muted rounded-full overflow-hidden w-full order-3 sm:order-none col-span-2 sm:col-span-1">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${cat.percent}%` }}
                transition={{ duration: 0.6, delay: 0.1 + idx * 0.05 }}
                className="h-full rounded-full"
                style={{ backgroundColor: cat.color }}
              />
            </div>
            {/* Valor */}
            <span className="text-[13px] font-semibold text-right whitespace-nowrap">
              {formatCurrency(cat.total)}
            </span>
            {/* Percentual (oculto no mobile) */}
            <span className="hidden sm:block text-xs text-muted-foreground text-right min-w-[36px]">
              {cat.percent.toFixed(0)}%
            </span>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
};

export default CategoryBreakdown;
