import React, { useMemo } from 'react';
import { formatCurrency } from '../../../../utils/formatters';
import * as C from '../styles';
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
      <C.Section>
        <C.SectionTitle>Para onde vai seu dinheiro</C.SectionTitle>
        <C.SectionDescription>Gastos do mês por categoria</C.SectionDescription>
        <C.EmptyState>
          <span>💸</span>
          <p>Nenhuma despesa registrada este mês</p>
        </C.EmptyState>
      </C.Section>
    );
  }

  return (
    <C.Section>
      <C.SectionTitle>Para onde vai seu dinheiro</C.SectionTitle>
      <C.SectionDescription>Gastos do mês por categoria</C.SectionDescription>
      {data.map((cat) => (
        <C.CategoryBar key={cat.id}>
          <C.CategoryName>{cat.name}</C.CategoryName>
          <C.BarContainer>
            <C.BarFill $width={cat.percent} $color={cat.color} />
          </C.BarContainer>
          <C.CategoryValue>{formatCurrency(cat.total)}</C.CategoryValue>
          <C.CategoryPercent>{cat.percent.toFixed(0)}%</C.CategoryPercent>
        </C.CategoryBar>
      ))}
    </C.Section>
  );
};

export default CategoryBreakdown;
