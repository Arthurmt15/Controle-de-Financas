import { supabase } from '../../lib/supabase';
import type { Transaction } from '../../types';

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

export const transactionService = {
  async getAll(page = 1, limit = 50): Promise<Transaction[]> {
    const offset = (page - 1) * limit;

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return (data as TransactionRow[]).map(mapTransaction);
  },

  async create(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');

    const id = crypto.randomUUID();

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        id,
        user_id: user.id,
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
        date: transaction.date,
        category_id: transaction.categoryId,
        notes: transaction.notes || null,
      })
      .select()
      .single();

    if (error) throw error;
    return mapTransaction(data as TransactionRow);
  },

  async update(transaction: Transaction): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .update({
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
        date: transaction.date,
        category_id: transaction.categoryId,
        notes: transaction.notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', transaction.id)
      .select()
      .single();

    if (error) throw error;
    return mapTransaction(data as TransactionRow);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
