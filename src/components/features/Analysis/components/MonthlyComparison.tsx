import React, { useMemo } from 'react';
import { formatCurrency } from '../../../../utils/formatters';
import { getMonthAbbreviation } from '../../../../utils/formatters';
import * as C from '../styles';
import type { Transaction } from '../../../../types';

interface MonthlyComparisonProps {
  transactions: Transaction[];
}

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

    const currentIncome = currentMonthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const currentExpense = currentMonthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const prevIncome = prevMonthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const prevExpense = prevMonthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    const incomeChange = prevIncome > 0 ? ((currentIncome - prevIncome) / prevIncome) * 100 : 0;
    const expenseChange = prevExpense > 0 ? ((currentExpense - prevExpense) / prevExpense) * 100 : 0;

    return {
      currentMonthName: getMonthAbbreviation(currentMonth),
      prevMonthName: getMonthAbbreviation(prevMonth),
      currentIncome,
      currentExpense,
      prevIncome,
      prevExpense,
      incomeChange,
      expenseChange,
    };
  }, [transactions]);

  return (
    <C.Section>
      <C.SectionTitle>Comparativo Mensal</C.SectionTitle>
      <C.SectionDescription>
        {comparison.currentMonthName} vs {comparison.prevMonthName}
      </C.SectionDescription>
      <C.ComparisonGrid>
        <C.ComparisonCard>
          <C.ComparisonLabel>Entradas - {comparison.currentMonthName}</C.ComparisonLabel>
          <C.ComparisonValue>{formatCurrency(comparison.currentIncome)}</C.ComparisonValue>
          <C.ComparisonChange $positive={comparison.incomeChange >= 0}>
            {comparison.incomeChange >= 0 ? '↑' : '↓'} {Math.abs(comparison.incomeChange).toFixed(1)}% vs {comparison.prevMonthName}
          </C.ComparisonChange>
        </C.ComparisonCard>
        <C.ComparisonCard>
          <C.ComparisonLabel>Saídas - {comparison.currentMonthName}</C.ComparisonLabel>
          <C.ComparisonValue>{formatCurrency(comparison.currentExpense)}</C.ComparisonValue>
          <C.ComparisonChange $positive={comparison.expenseChange <= 0}>
            {comparison.expenseChange >= 0 ? '↑' : '↓'} {Math.abs(comparison.expenseChange).toFixed(1)}% vs {comparison.prevMonthName}
          </C.ComparisonChange>
        </C.ComparisonCard>
      </C.ComparisonGrid>
    </C.Section>
  );
};

export default MonthlyComparison;
