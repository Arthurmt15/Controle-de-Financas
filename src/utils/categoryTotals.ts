/**
 * @file utils/categoryTotals.ts
 * @description Agrupa despesas do mês por categoria com IDs desconhecidos
 * unificados num único balde "Outros" (antes cada categoryId órfão gerava
 * uma linha/fatia "Outros" duplicada, somando errado na pizza e no breakdown).
 */

import type { Transaction, Category } from '../types';

export interface CategoryTotal {
  /** ID da categoria; 'unknown' para o balde unificado de órfãs */
  id: string;
  name: string;
  color: string;
  total: number;
  percent: number;
}

/**
 * Totais de despesa do mês de referência por categoria, ordenados desc.
 * @param month mês 0-11 e ano de referência (padrão: mês atual)
 */
export function groupExpensesByCategory(
  transactions: Transaction[],
  categories: Category[],
  fallbackColor = '#6b7280',
  ref?: { month: number; year: number }
): CategoryTotal[] {
  const month = ref?.month ?? new Date().getMonth();
  const year = ref?.year ?? new Date().getFullYear();

  const expenses = transactions.filter((t) => {
    if (t.type !== 'expense') return false;
    const d = new Date(t.date);
    return d.getMonth() === month && d.getFullYear() === year;
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
