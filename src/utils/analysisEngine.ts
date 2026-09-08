/**
 * @file utils/analysisEngine.ts
 * @description Motor de análise financeira para o Chat Rápido.
 * Gera resumos e análises rápidas baseadas nas transações do usuário.
 */

import type { Transaction, Category } from '../types';
import { filterByCurrentMonth, filterByCurrentYear } from './transactionFilters';
import { getMonthAbbreviation } from './formatters';

/**
 * Formata valor para moeda brasileira (atalho)
 */
function currency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Gera resumo rápido do mês atual
 */
export function generateSummary(
  transactions: Transaction[],
  categories: Category[],
): string {
  const monthly = filterByCurrentMonth(transactions);
  const now = new Date();
  const monthName = getMonthAbbreviation(now.getMonth());

  if (monthly.length === 0) {
    return `📊 Nenhuma transação encontrada para ${monthName}. Adicione uma transação primeiro!`;
  }

  const income = monthly
    .filter(t => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);
  const expense = monthly
    .filter(t => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;

  const balanceIcon = balance >= 0 ? '💚' : '🔴';
  const balanceText = balance >= 0 ? 'Saldo positivo' : 'Saldo negativo';

  return (
    `📊 Resumo de ${monthName}\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `📈 Entradas: ${currency(income)}\n` +
    `📉 Saídas: ${currency(expense)}\n` +
    `${balanceIcon} Saldo: ${currency(balance)} (${balanceText})\n` +
    `📝 ${monthly.length} transação(ões) no período`
  );
}

/**
 * Gera análise completa dos gastos
 */
export function generateAnalysis(
  transactions: Transaction[],
  categories: Category[],
): string {
  const monthly = filterByCurrentMonth(transactions);
  const yearly = filterByCurrentYear(transactions);
  const now = new Date();
  const monthName = getMonthAbbreviation(now.getMonth());

  if (monthly.length === 0) {
    return `📊 Nenhuma transação encontrada para ${monthName}. Adicione transações para ver a análise!`;
  }

  const income = monthly
    .filter(t => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);
  const expense = monthly
    .filter(t => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;

  // Gastos por categoria
  const expensesByCategory: Record<string, number> = {};
  monthly
    .filter(t => t.type === 'expense')
    .forEach(t => {
      expensesByCategory[t.categoryId] = (expensesByCategory[t.categoryId] || 0) + t.amount;
    });

  const sortedCategories = Object.entries(expensesByCategory)
    .map(([catId, total]) => {
      const cat = categories.find(c => c.id === catId);
      return {
        name: cat?.name || 'Outros',
        color: cat?.color || '#6b7280',
        total,
        percent: expense > 0 ? (total / expense) * 100 : 0,
      };
    })
    .sort((a, b) => b.total - a.total);

  // Top 5 categorias
  const topCategories = sortedCategories.slice(0, 5);
  const categoryBars = topCategories.map(cat => {
    const barLength = Math.round(cat.percent / 5);
    const bar = '█'.repeat(barLength) + '░'.repeat(20 - barLength);
    return `  ${cat.name.padEnd(14)} ${bar} ${cat.percent.toFixed(0)}% — ${currency(cat.total)}`;
  }).join('\n');

  // Insights automáticos
  const insights: string[] = [];

  // Maior gasto
  if (sortedCategories.length > 0) {
    const top = sortedCategories[0];
    insights.push(`🎯 Maior gasto: ${top.name} (${top.percent.toFixed(0)}% do total)`);
  }

  // Saldo negativo
  if (income > 0 && expense > income) {
    insights.push(`⚠️ Saldo negativo! Gastos superam receitas em ${currency(expense - income)}`);
  }

  // Gastos concentrados
  if (sortedCategories.length >= 2) {
    const topTwo = sortedCategories[0].total + sortedCategories[1].total;
    const topTwoPercent = expense > 0 ? (topTwo / expense) * 100 : 0;
    if (topTwoPercent > 60) {
      insights.push(`📊 Gastos concentrados: ${sortedCategories[0].name} + ${sortedCategories[1].name} = ${topTwoPercent.toFixed(0)}%`);
    }
  }

  // Dica de economia
  if (sortedCategories.length > 0) {
    const top = sortedCategories[0];
    const saveAmount = top.total * 0.1;
    insights.push(`💡 Se reduzir 10% em ${top.name}, economiza ${currency(saveAmount)}/mês`);
  }

  const insightsText = insights.length > 0
    ? `\n\n💡 Insights:\n${insights.map(i => `  ${i}`).join('\n')}`
    : '';

  const yearlyIncome = yearly
    .filter(t => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);
  const yearlyExpense = yearly
    .filter(t => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);

  return (
    `📊 Análise de ${monthName}\n` +
    `━━━━━━━━━━━━━━━━━━\n\n` +
    `📈 Entradas: ${currency(income)}\n` +
    `📉 Saídas: ${currency(expense)}\n` +
    `💰 Saldo: ${currency(balance)}\n\n` +
    `📂 Gastos por categoria:\n${categoryBars}\n` +
    `${insightsText}\n\n` +
    `📅 Acumulado do ano:\n` +
    `  Entradas: ${currency(yearlyIncome)}\n` +
    `  Saídas: ${currency(yearlyExpense)}\n` +
    `  Saldo: ${currency(yearlyIncome - yearlyExpense)}`
  );
}

/**
 * Gera análise de tendências (mês atual vs anterior)
 */
export function generateTrendAnalysis(
  transactions: Transaction[],
  categories: Category[],
): string {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const currentMonthTx = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const prevMonthTx = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
  });

  const currentIncome = currentMonthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const currentExpense = currentMonthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const prevIncome = prevMonthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const prevExpense = prevMonthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const incomeChange = prevIncome > 0 ? ((currentIncome - prevIncome) / prevIncome) * 100 : 0;
  const expenseChange = prevExpense > 0 ? ((currentExpense - prevExpense) / prevExpense) * 100 : 0;

  const currentName = getMonthAbbreviation(currentMonth);
  const prevName = getMonthAbbreviation(prevMonth);

  const incomeArrow = incomeChange >= 0 ? '📈' : '📉';
  const expenseArrow = expenseChange >= 0 ? '📈' : '📉';
  const incomeSign = incomeChange >= 0 ? '+' : '';
  const expenseSign = expenseChange >= 0 ? '+' : '';

  return (
    `📊 Comparativo: ${currentName} vs ${prevName}\n` +
    `━━━━━━━━━━━━━━━━━━\n\n` +
    `📈 Entradas ${currentName}: ${currency(currentIncome)}\n` +
    `   ${incomeArrow} ${incomeSign}${incomeChange.toFixed(1)}% vs ${prevName}\n\n` +
    `📉 Saídas ${currentName}: ${currency(currentExpense)}\n` +
    `   ${expenseArrow} ${expenseSign}${expenseChange.toFixed(1)}% vs ${prevName}`
  );
}
