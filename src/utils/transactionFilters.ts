/**
 * @file utils/transactionFilters.ts
 * @description Funções de filtragem e ordenação de transações.
 * Separa a lógica de filtros para manter o código organizado.
 */

import type { Transaction, TransactionFilters } from '../types';

/**
 * Filtra transações com base nos filtros aplicados
 * @param {Transaction[]} transactions - Lista de transações
 * @param {TransactionFilters} filters - Filtros a aplicar
 * @returns {Transaction[]} Lista filtrada e ordenada
 *
 * @example
 * const filtered = filterTransactions(transactions, { type: 'income', searchTerm: 'salário' });
 */
export function filterTransactions(
  transactions: Transaction[],
  filters: TransactionFilters
): Transaction[] {
  let result = [...transactions];

  // Filtro por período inicial
  if (filters.startDate) {
    result = result.filter((t) => new Date(t.date) >= new Date(filters.startDate!));
  }

  // Filtro por período final
  if (filters.endDate) {
    result = result.filter((t) => new Date(t.date) <= new Date(filters.endDate!));
  }

  // Filtro por tipo (entrada/saída)
  if (filters.type !== 'both') {
    result = result.filter((t) => t.type === filters.type);
  }

  // Filtro por categoria
  if (filters.categoryId) {
    result = result.filter((t) => t.categoryId === filters.categoryId);
  }

  // Filtro por termo de busca na descrição
  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    result = result.filter((t) => t.description.toLowerCase().includes(term));
  }

  // Ordenação
  result.sort((a, b) => {
    let comparison = 0;

    switch (filters.sortBy) {
      case 'date':
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      case 'amount':
        comparison = a.amount - b.amount;
        break;
      case 'description':
        comparison = a.description.localeCompare(b.description);
        break;
    }

    return filters.sortOrder === 'desc' ? -comparison : comparison;
  });

  return result;
}

/**
 * Filtra transações por período específico
 * @param {Transaction[]} transactions - Lista de transações
 * @param {string} startDate - Data inicial (YYYY-MM-DD)
 * @param {string} endDate - Data final (YYYY-MM-DD)
 * @returns {Transaction[]} Transações do período
 *
 * @example
 * const monthly = filterByPeriod(transactions, '2026-09-01', '2026-09-30');
 */
export function filterByPeriod(
  transactions: Transaction[],
  startDate: string,
  endDate: string
): Transaction[] {
  return transactions.filter((t) => {
    const date = new Date(t.date);
    return date >= new Date(startDate) && date <= new Date(endDate);
  });
}

/**
 * Filtra transações do mês atual
 * @param {Transaction[]} transactions - Lista de transações
 * @returns {Transaction[]} Transações do mês atual
 *
 * @example
 * const thisMonth = filterByCurrentMonth(transactions);
 */
export function filterByCurrentMonth(transactions: Transaction[]): Transaction[] {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return transactions.filter((t) => {
    const date = new Date(t.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });
}

/**
 * Filtra transações do ano atual
 * @param {Transaction[]} transactions - Lista de transações
 * @returns {Transaction[]} Transações do ano atual
 *
 * @example
 * const thisYear = filterByCurrentYear(transactions);
 */
export function filterByCurrentYear(transactions: Transaction[]): Transaction[] {
  const currentYear = new Date().getFullYear();

  return transactions.filter((t) => {
    const date = new Date(t.date);
    return date.getFullYear() === currentYear;
  });
}

/**
 * Filtra apenas entradas
 * @param {Transaction[]} transactions - Lista de transações
 * @returns {Transaction[]} Apenas entradas
 */
export function filterIncomeOnly(transactions: Transaction[]): Transaction[] {
  return transactions.filter((t) => t.type === 'income');
}

/**
 * Filtra apenas saídas
 * @param {Transaction[]} transactions - Lista de transações
 * @returns {Transaction[]} Apenas saídas
 */
export function filterExpenseOnly(transactions: Transaction[]): Transaction[] {
  return transactions.filter((t) => t.type === 'expense');
}
