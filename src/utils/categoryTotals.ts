/**
 * @file utils/categoryTotals.ts
 * @description Agrupa despesas do mês por categoria com IDs desconhecidos
 * unificados num único balde "Outros" (antes cada categoryId órfão gerava
 * uma linha/fatia "Outros" duplicada, somando errado na pizza e no breakdown).
 */

import type { Transaction, Category } from '../types';
import { parseLocalDate } from './dateHelpers';

export interface CategoryTotal {
  /** ID da categoria; 'unknown' para o balde unificado de órfãs */
  id: string;
  name: string;
  color: string;
  total: number;
  percent: number;
}

export type CategoryPeriod = 'month' | 'quarter' | { year: number; month: number };

/** Início (mês/ano) dos N meses terminando no mês atual, ex. trimestre = 3. */
function startOfTrailingMonths(n: number, now = new Date()): { month: number; year: number } {
  const d = new Date(now.getFullYear(), now.getMonth() - (n - 1), 1);
  return { month: d.getMonth(), year: d.getFullYear() };
}

/** Matcher de período para despesas: mês atual, mês específico ou últimos 3 meses. */
export function periodMatcher(period: CategoryPeriod, now = new Date()): (d: Date) => boolean {
  if (typeof period === 'object') {
    const m = period.month;
    const y = period.year;
    return (d: Date) => d.getMonth() === m && d.getFullYear() === y;
  }
  if (period === 'quarter') {
    const start = startOfTrailingMonths(3, now);
    const startIdx = start.year * 12 + start.month;
    const endIdx = now.getFullYear() * 12 + now.getMonth();
    return (d: Date) => {
      const idx = d.getFullYear() * 12 + d.getMonth();
      return idx >= startIdx && idx <= endIdx;
    };
  }
  const m = now.getMonth();
  const y = now.getFullYear();
  return (d: Date) => d.getMonth() === m && d.getFullYear() === y;
}

/**
 * Totais de despesa no período por categoria, ordenados desc.
 * @param match filtro de data (padrão: mês atual)
 */
export function groupExpensesByCategory(
  transactions: Transaction[],
  categories: Category[],
  fallbackColor = '#6b7280',
  match: (d: Date) => boolean = periodMatcher('month')
): CategoryTotal[] {

  const expenses = transactions.filter((t) => {
    if (t.type !== 'expense') return false;
    return match(parseLocalDate(t.date));
  });

  const totals = new Map<string, number>();
  for (const t of expenses) {
    const cat = categories.find((c) => c.id === t.categoryId);
    const key = cat ? cat.id : 'unknown';
    totals.set(key, (totals.get(key) || 0) + t.amount);
  }

  const grand = [...totals.values()].reduce((s, v) => s + v, 0);

  const result: CategoryTotal[] = [];
  for (const [key, total] of totals) {
    if (key === 'unknown') {
      result.push({
        id: 'unknown',
        name: 'Outros',
        color: categories.find((c) => c.name.toLowerCase() === 'outros')?.color || fallbackColor,
        total,
        percent: grand > 0 ? (total / grand) * 100 : 0,
      });
    } else {
      const cat = categories.find((c) => c.id === key)!;
      result.push({
        id: key,
        name: cat.name,
        color: cat.color,
        total,
        percent: grand > 0 ? (total / grand) * 100 : 0,
      });
    }
  }
  return result.sort((a, b) => b.total - a.total);
}
