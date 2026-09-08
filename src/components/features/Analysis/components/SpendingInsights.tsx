import React, { useMemo } from 'react';
import { formatCurrency } from '../../../../utils/formatters';
import * as C from '../styles';
import type { Transaction, Category } from '../../../../types';

interface SpendingInsightsProps {
  transactions: Transaction[];
  categories: Category[];
}

interface Insight {
  id: string;
  type: 'warning' | 'tip' | 'info' | 'alert';
  icon: string;
  title: string;
  text: string;
}

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

    const currentExpenses = currentMonthTx.filter(t => t.type === 'expense');
    const currentIncome = currentMonthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const currentExpense = currentExpenses.reduce((s, t) => s + t.amount, 0);

    // Gastos por categoria
    const expensesByCategory: Record<string, number> = {};
    currentExpenses.forEach(t => {
      expensesByCategory[t.categoryId] = (expensesByCategory[t.categoryId] || 0) + t.amount;
    });

    const sortedCategories = Object.entries(expensesByCategory)
      .map(([catId, value]) => ({
        catId,
        value,
        name: categories.find(c => c.id === catId)?.name || 'Outros',
      }))
      .sort((a, b) => b.value - a.value);

    // Insight: categoria com maior gasto
    if (sortedCategories.length > 0) {
      const top = sortedCategories[0];
      const percent = currentExpense > 0 ? ((top.value / currentExpense) * 100).toFixed(0) : '0';
      result.push({
        id: 'top-category',
        type: 'alert',
        icon: '🎯',
        title: `Maior gasto: ${top.name}`,
        text: `${formatCurrency(top.value)} (${percent}% do total) vão para ${top.name}. Considere revisar gastos nessa categoria.`,
      });
    }

    // Insight: saldo negativo
    if (currentIncome > 0 && currentExpense > currentIncome) {
      const deficit = currentExpense - currentIncome;
      result.push({
        id: 'negative-balance',
        type: 'alert',
        icon: '⚠️',
        title: 'Saldo negativo este mês',
        text: `Você gastou ${formatCurrency(deficit)} a mais do que recebeu. Reduza despesas ou aumente a receita para equilibrar.`,
      });
    }

    // Insight: gastos concentrados
    if (sortedCategories.length >= 2) {
      const topTwo = sortedCategories[0].value + sortedCategories[1].value;
      const topTwoPercent = currentExpense > 0 ? (topTwo / currentExpense) * 100 : 0;
      if (topTwoPercent > 60) {
        result.push({
          id: 'concentrated',
          type: 'warning',
          icon: '📊',
          title: 'Gastos concentrados',
          text: `${sortedCategories[0].name} e ${sortedCategories[1].name} representam ${topTwoPercent.toFixed(0)}% dos seus gastos. Diversificar pode reduzir riscos.`,
        });
      }
    }

    // Insight: dica de economia
    if (currentExpense > 0) {
      const maxCategory = sortedCategories[0];
      if (maxCategory) {
        const reduceAmount = maxCategory.value * 0.1;
        result.push({
          id: 'save-tip',
          type: 'tip',
          icon: '💡',
          title: 'Dica: Reduza 10% no maior gasto',
          text: `Se reduzir 10% em ${maxCategory.name}, economiza ${formatCurrency(reduceAmount)} por mês (${formatCurrency(reduceAmount * 12)} por ano).`,
        });
      }
    }

    // Insight: sem receitas
    if (currentIncome === 0 && currentExpenses.length > 0) {
      result.push({
        id: 'no-income',
        type: 'info',
        icon: 'ℹ️',
        title: 'Sem receitas registradas',
        text: 'Registre suas fontes de renda para ter uma visão completa das suas finanças.',
      });
    }

    // Insight: muitas categorias com gasto baixo
    const lowCategories = sortedCategories.filter(c => {
      const percent = currentExpense > 0 ? (c.value / currentExpense) * 100 : 0;
      return percent < 5 && percent > 0;
    });
    if (lowCategories.length >= 3) {
      result.push({
        id: 'many-small',
        type: 'info',
        icon: '📋',
        title: 'Vários gastos pequenos',
        text: `${lowCategories.length} categorias representam menos de 5% cada. Gastos pequenos somam: ${formatCurrency(lowCategories.reduce((s, c) => s + c.value, 0))}.`,
      });
    }

    return result;
  }, [transactions, categories]);

  if (insights.length === 0) {
    return (
      <C.Section>
        <C.SectionTitle>Insights</C.SectionTitle>
        <C.SectionDescription>Análise automática dos seus gastos</C.SectionDescription>
        <C.EmptyState>
          <span>📊</span>
          <p>Adicione transações para gerar insights personalizados</p>
        </C.EmptyState>
      </C.Section>
    );
  }

  return (
    <C.Section>
      <C.SectionTitle>Insights</C.SectionTitle>
      <C.SectionDescription>Análise automática dos seus gastos</C.SectionDescription>
      <C.InsightList>
        {insights.map((insight) => (
          <C.InsightCard key={insight.id} $type={insight.type}>
            <C.InsightIcon $type={insight.type}>{insight.icon}</C.InsightIcon>
            <C.InsightContent>
              <C.InsightTitle>{insight.title}</C.InsightTitle>
              <C.InsightText>{insight.text}</C.InsightText>
            </C.InsightContent>
          </C.InsightCard>
        ))}
      </C.InsightList>
    </C.Section>
  );
};

export default SpendingInsights;
