import { supabase } from '../../lib/supabase';
import type { RecurringBill, Transaction } from '../../types';

interface RecurringBillRow {
  id: string;
  user_id: string;
  name: string;
  amount: number | string;
  type: 'income' | 'expense';
  day_of_month: number;
  category_id: string;
  active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface TransactionRow {
  id: string;
  description: string;
  amount: number | string;
  type: 'income' | 'expense';
  date: string;
  category_id: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function mapRecurringBill(row: RecurringBillRow): RecurringBill {
  return {
    id: row.id,
    name: row.name,
    amount: Number(row.amount),
    type: row.type,
    dayOfMonth: row.day_of_month,
    categoryId: row.category_id,
    active: row.active,
    notes: row.notes || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    description: row.description,
    amount: Number(row.amount),
    type: row.type,
    date: typeof row.date === 'string' ? row.date.split('T')[0] : row.date,
    categoryId: row.category_id,
    notes: row.notes || undefined,
    createdAt: row.created_at,
  };
}

export const recurringBillService = {
  async getAll(): Promise<RecurringBill[]> {
    const { data, error } = await supabase
      .from('recurring_bills')
      .select('*')
      .order('name');

    if (error) throw error;
    return (data as RecurringBillRow[]).map(mapRecurringBill);
  },

  async create(bill: Omit<RecurringBill, 'id'>): Promise<RecurringBill> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');

    const id = crypto.randomUUID();

    const { data, error } = await supabase
      .from('recurring_bills')
      .insert({
        id,
        user_id: user.id,
        name: bill.name,
        amount: bill.amount,
        type: bill.type,
        day_of_month: bill.dayOfMonth,
        category_id: bill.categoryId,
        active: bill.active,
        notes: bill.notes || null,
      })
      .select()
      .single();

    if (error) throw error;
    return mapRecurringBill(data as RecurringBillRow);
  },

  async update(bill: RecurringBill): Promise<RecurringBill> {
    const { data, error } = await supabase
      .from('recurring_bills')
      .update({
        name: bill.name,
        amount: bill.amount,
        type: bill.type,
        day_of_month: bill.dayOfMonth,
        category_id: bill.categoryId,
        active: bill.active,
        notes: bill.notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bill.id)
      .select()
      .single();

    if (error) throw error;
    return mapRecurringBill(data as RecurringBillRow);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('recurring_bills')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async generate(): Promise<Transaction[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');

    const now = new Date();
    const currentDay = now.getDate();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const { data: bills, error: billsError } = await supabase
      .from('recurring_bills')
      .select('*')
      .eq('user_id', user.id)
      .eq('active', true)
      .lte('day_of_month', currentDay);

    if (billsError) throw billsError;

    if (!bills || bills.length === 0) return [];

    const newTransactions: Transaction[] = [];

    for (const bill of bills as RecurringBillRow[]) {
      const { data: existing } = await supabase
        .from('transactions')
        .select('id')
        .eq('user_id', user.id)
        .eq('description', bill.name)
        .gte('date', `${currentMonth}-01`)
        .lte('date', `${currentMonth}-31`)
        .limit(1);

      if (existing && existing.length > 0) continue;

      const transactionDate = `${currentMonth}-${String(bill.day_of_month).padStart(2, '0')}`;

      const { data: tx, error: txError } = await supabase
        .from('transactions')
        .insert({
          id: crypto.randomUUID(),
          user_id: user.id,
          description: bill.name,
          amount: bill.amount,
          type: bill.type,
          date: transactionDate,
          category_id: bill.category_id,
          notes: bill.notes,
        })
        .select()
        .single();

      if (txError) throw txError;
      newTransactions.push(mapTransaction(tx as TransactionRow));
    }

    return newTransactions;
  },
};
