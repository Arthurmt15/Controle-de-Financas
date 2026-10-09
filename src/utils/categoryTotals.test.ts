/**
 * @file utils/categoryTotals.test.ts
 * @description Agrupamento de despesas por categoria (pizza + breakdown).
 */
import { groupExpensesByCategory } from './categoryTotals';
import type { Transaction, Category } from '../types';

const mockCategories: Category[] = [
  { id: 'cat-1', name: 'Alimentação', color: '#ef4444', icon: 'FaUtensils', defaultType: 'expense' },
  { id: 'cat-2', name: 'Outros', color: '#6b7280', icon: 'FaTag', defaultType: 'both' },
];

function txMonth(day: number, overrides: Partial<Transaction> = {}): Transaction {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return {
    id: `tx-${day}-${Math.random()}`,
    description: 'X',
    amount: 100,
    type: 'expense',
    date: `${now.getFullYear()}-${mm}-${dd}T12:00:00`,
    categoryId: 'cat-1',
    notes: '',
    ...overrides,
  } as Transaction;
}

describe('categoryTotals - groupExpensesByCategory', () => {
  it('agrupa por categoria e ordena desc', () => {
    const txs = [
      txMonth(5, { categoryId: 'cat-1', amount: 50 }),
      txMonth(6, { categoryId: 'cat-1', amount: 150 }),
      txMonth(7, { categoryId: 'cat-2', amount: 30 }),
    ];
    const result = groupExpensesByCategory(txs, mockCategories);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Alimentação');
    expect(result[0].total).toBe(200);
    expect(result[0].percent).toBeCloseTo((200 / 230) * 100);
  });

  it('unifica categoryIds órfãos num único "Outros"', () => {
    const txs = [
      txMonth(5, { categoryId: 'ghost-1', amount: 40 }),
      txMonth(6, { categoryId: 'ghost-2', amount: 60 }),
    ];
    const result = groupExpensesByCategory(txs, mockCategories);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Outros');
    expect(result[0].total).toBe(100);
    expect(result[0].percent).toBe(100);
  });

  it('ignora receitas e outros meses', () => {
    const now = new Date();
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 10);
    const pdd = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}-10T12:00:00`;
    const txs = [
      txMonth(5, { type: 'income', amount: 9999 }),
      txMonth(6, { date: pdd, amount: 9999 }),
      txMonth(7, { amount: 25 }),
    ];
    const result = groupExpensesByCategory(txs, mockCategories);
    expect(result).toHaveLength(1);
    expect(result[0].total).toBe(25);
  });

  it('lista vazia sem despesas', () => {
    expect(groupExpensesByCategory([], mockCategories)).toEqual([]);
  });
});
