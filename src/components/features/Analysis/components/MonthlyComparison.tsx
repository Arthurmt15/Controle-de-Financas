/**
 * @file components/features/Analysis/components/MonthlyComparison.tsx
 * @description Comparativo mês atual vs anterior com shadcn Card, Badge e lucide (ArrowUp/Down).
 * Grid 2 col com cards internos estilizados via tailwind.
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Scale } from 'lucide-react';
import { formatCurrency, getMonthAbbreviation } from '../../../../utils/formatters';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../ui/card';
import { Badge } from '../../../ui/badge';
import type { Transaction } from '../../../../types';

interface MonthlyComparisonProps {
  transactions: Transaction[];
}

// Comparativo mensal (atual vs anterior)
const MonthlyComparison: React.FC<MonthlyComparisonProps> = ({ transactions }) => {
  const comparison = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentMonthTx = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const prevMonthTx = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
    });

    const currentIncome = currentMonthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const currentExpense = currentMonthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const prevIncome = prevMonthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const prevExpense = prevMonthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    const incomeChange = prevIncome > 0 ? ((currentIncome - prevIncome) / prevIncome) * 100 : 0;
    const expenseChange = prevExpense > 0 ? ((currentExpense - prevExpense) / prevExpense) * 100 : 0;

    return {
      currentMonthName: getMonthAbbreviation(currentMonth),
      prevMonthName: getMonthAbbreviation(prevMonth),
      currentIncome,
      currentExpense,
      incomeChange,
      expenseChange,
    };
  }, [transactions]);

  const cards = [
    {
      label: `Entradas — ${comparison.currentMonthName}`,
      value: comparison.currentIncome,
      change: comparison.incomeChange,
      positiveIsGood: true,
    },
    {
      label: `Saídas — ${comparison.currentMonthName}`,
      value: comparison.currentExpense,
      change: comparison.expenseChange,
      positiveIsGood: false,
    },
  ];

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-sky-50 border border-sky-100 text-sky-600 dark:bg-sky-500/10 dark:border-transparent">
            <Scale className="h-4 w-4" />
          </span>
          <CardTitle className="text-[15px] font-semibold">Comparativo Mensal</CardTitle>
        </div>
        <CardDescription className="text-[13px]">
          {comparison.currentMonthName} vs {comparison.prevMonthName}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {cards.map((c, idx) => {
            const isPositive = c.change >= 0;
            // Para despesas, queda é positiva; para receitas, alta é positiva
            const isGood = c.positiveIsGood ? isPositive : !isPositive;
            return (
              <motion.div
                key={c.label}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                className="rounded-xl border bg-muted/30 p-4 text-center flex flex-col items-center gap-1"
              >
                <span className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">{c.label}</span>
                <span className="text-[20px] font-bold tracking-tight">{formatCurrency(c.value)}</span>
                <Badge
                  variant="outline"
                  className={`mt-1 gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                    isGood
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20'
                      : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/20'
                  }`}
                >
                  {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(c.change).toFixed(1)}% vs {comparison.prevMonthName}
                </Badge>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyComparison;
