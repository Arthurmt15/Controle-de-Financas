import { calculateMetrics } from './transactionMetrics';
import type { Transaction } from '../types';
import { vi } from 'vitest';

const pad = (value: number) => String(value).padStart(2, '0');
const dateOf = (year: number, month: number, day: number) =>
  `${year}-${pad(month + 1)}-${pad(day)}`;

function makeTransaction(
  data: Pick<Transaction, 'amount' | 'type' | 'date'> & Partial<Transaction>
): Transaction {
  return {
    id: Math.random().toString(36).slice(2),
    description: 'Teste',
    categoryId: 'cat-1',
    ...data,
  };
}

describe('calculateMetrics', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('compara o mês atual com o mês anterior, não com a média anual', () => {
    const now = new Date();
    const previous = new Date(now.getFullYear(), now.getMonth() - 1, 15);

    const transactions = [
      makeTransaction({
        amount: 1000,
        type: 'income',
        date: dateOf(now.getFullYear(), now.getMonth(), 10),
      }),
      makeTransaction({
        amount: 400,
        type: 'expense',
        date: dateOf(now.getFullYear(), now.getMonth(), 11),
      }),
      makeTransaction({
        amount: 500,
        type: 'income',
        date: dateOf(previous.getFullYear(), previous.getMonth(), 10),
      }),
      makeTransaction({
        amount: 200,
        type: 'expense',
        date: dateOf(previous.getFullYear(), previous.getMonth(), 12),
      }),
    ];

    const metrics = calculateMetrics(transactions);

    expect(metrics.monthlyIncome).toBe(1000);
    expect(metrics.monthlyExpense).toBe(400);
    expect(metrics.previousMonthIncome).toBe(500);
    expect(metrics.previousMonthExpense).toBe(200);
  });

  it('usa dezembro do ano anterior quando o mês atual é janeiro', () => {
    vi.useFakeTimers().setSystemTime(new Date(2026, 0, 15, 12, 0, 0));

    const transactions = [
      makeTransaction({ amount: 300, type: 'income', date: '2026-01-10' }),
      makeTransaction({ amount: 900, type: 'income', date: '2025-12-10' }),
      makeTransaction({ amount: 150, type: 'expense', date: '2025-12-15' }),
    ];

    const metrics = calculateMetrics(transactions);

    expect(metrics.previousMonthIncome).toBe(900);
    expect(metrics.previousMonthExpense).toBe(150);
  });
});
