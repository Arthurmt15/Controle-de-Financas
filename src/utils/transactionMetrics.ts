/**
 * @file utils/transactionMetrics.ts
 * @description Funções de cálculo de métricas financeiras.
 * Calcula totais, médias e comparativos de transações.
 */

import type { Transaction, DashboardMetrics } from '../types';
import { filterByCurrentMonth, filterByCurrentYear } from './transactionFilters';

/**
 * Calcula métricas financeiras baseadas nas transações
 * @param {Transaction[]} transactions - Lista de transações
 * @returns {DashboardMetrics} Métricas calculadas
 *
 * @example
 * const metrics = calculateMetrics(transactions);
 * console.log(metrics.monthlyIncome); // Total de entradas do mês
 */
export function calculateMetrics(transactions: Transaction[]): DashboardMetrics {
  // Transações do mês atual
  const monthlyTransactions = filterByCurrentMonth(transactions);

  // Transações do ano atual
  const yearlyTransactions = filterByCurrentYear(transactions);

  // Cálculos mensais
  const monthlyIncome = sumByType(monthlyTransactions, 'income');
  const monthlyExpense = sumByType(monthlyTransactions, 'expense');
  const monthlyBalance = monthlyIncome - monthlyExpense;

  // Cálculos anuais
  const yearlyIncome = sumByType(yearlyTransactions, 'income');
  const yearlyExpense = sumByType(yearlyTransactions, 'expense');
  const yearlyBalance = yearlyIncome - yearlyExpense;

  // Médias mensais (baseado nos meses que já passaram)
  const monthsElapsed = new Date().getMonth() + 1;
  const averageMonthlyIncome = yearlyIncome / monthsElapsed;
  const averageMonthlyExpense = yearlyExpense / monthsElapsed;

  return {
    monthlyIncome,
    monthlyExpense,
    monthlyBalance,
    yearlyIncome,
    yearlyExpense,
    yearlyBalance,
    averageMonthlyIncome,
    averageMonthlyExpense,
  };
}

/**
 * Soma valores de um tipo específico (income/expense)
 * @param {Transaction[]} transactions - Lista de transações
 * @param {'income' | 'expense'} type - Tipo a somar
 * @returns {number} Total somado
 *
 * @example
 * const total = sumByType(transactions, 'expense');
 */
function sumByType(transactions: Transaction[], type: 'income' | 'expense'): number {
  return transactions
    .filter((t) => t.type === type)
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Calcula o total de um array de valores
 * @param {number[]} values - Array de valores
 * @returns {number} Soma total
 *
 * @example
 * const total = calculateTotal([100, 200, 300]); // 600
 */
export function calculateTotal(values: number[]): number {
  return values.reduce((acc, curr) => acc + curr, 0);
}

/**
 * Calcula a média de um array de valores
 * @param {number[]} values - Array de valores
 * @returns {number} Média (0 se array vazio)
 *
 * @example
 * const avg = calculateAverage([100, 200, 300]); // 200
 */
export function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  return calculateTotal(values) / values.length;
}

/**
 * Calcula o maior valor de um array
 * @param {number[]} values - Array de valores
 * @returns {number} Maior valor
 *
 * @example
 * const max = findMax([100, 200, 300]); // 300
 */
export function findMax(values: number[]): number {
  return Math.max(...values);
}

/**
 * Calcula o menor valor de um array
 * @param {number[]} values - Array de valores
 * @returns {number} Menor valor
 *
 * @example
 * const min = findMin([100, 200, 300]); // 100
 */
export function findMin(values: number[]): number {
  return Math.min(...values);
}

/**
 * Calcula a variação percentual entre dois valores
 * @param {number} current - Valor atual
 * @param {number} previous - Valor anterior
 * @returns {number} Variação percentual
 *
 * @example
 * const variation = calculatePercentageVariation(150, 100); // 50 (aumento de 50%)
 */
export function calculatePercentageVariation(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Calcula totais por categoria
 * @param {Transaction[]} transactions - Lista de transações
 * @returns {Record<string, number>} Totais por categoryId
 *
 * @example
 * const byCategory = sumByCategory(transactions);
 * // { '1': 500, '2': 300, ... }
 */
export function sumByCategory(transactions: Transaction[]): Record<string, number> {
  return transactions.reduce((acc, t) => {
    acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);
}

/**
 * Calcula totais por mês
 * @param {Transaction[]} transactions - Lista de transações
 * @returns {Record<string, number>} Totais por mês (YYYY-MM)
 *
 * @example
 * const byMonth = sumByMonth(transactions);
 * // { '2026-09': 1500, '2026-08': 2000, ... }
 */
export function sumByMonth(transactions: Transaction[]): Record<string, number> {
  return transactions.reduce((acc, t) => {
    const date = new Date(t.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    acc[key] = (acc[key] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);
}
