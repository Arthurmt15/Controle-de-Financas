import { supabase } from '../../lib/supabase';
import { requireUserId } from '../../lib/auth';
import type { Transaction } from '../../types';
import { toLocalDateTime } from '../../utils/dateHelpers';

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
    date: typeof row.date === 'string' ? toLocalDateTime(row.date) : row.date,
    categoryId: row.category_id,
    notes: row.notes || undefined,
    createdAt: row.created_at,
  };
}

export const transactionService = {
  async getAll(page = 1, limit = 50): Promise<Transaction[]> {
    const offset = (page - 1) * limit;
    const userId = await requireUserId();

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return (data as TransactionRow[]).map(mapTransaction);
  },

  async create(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
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
    const userId = await requireUserId();
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
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return mapTransaction(data as TransactionRow);
  },

  async delete(id: string): Promise<void> {
    const userId = await requireUserId();
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  },
};
