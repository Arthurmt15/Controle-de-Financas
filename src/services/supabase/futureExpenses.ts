/**
 * @file services/supabase/futureExpenses.ts
 * @description Service para gerenciar despesas futuras no Supabase.
 * Permite planejar gastos que ainda vão acontecer.
 */

import { supabase } from '../../lib/supabase';
import type { FutureExpense } from '../../types';

/** Interface da linha bruta do banco de dados */
interface FutureExpenseRow {
  id: string;
  user_id: string;
  description: string;
  amount: number | string;
  expected_date: string;
  category_id: string;
  notes: string | null;
  status: 'pending' | 'paid' | 'cancelled';
  created_at: string;
  updated_at: string;
}

/** Converte linha do banco para o tipo FutureExpense */
function mapFutureExpense(row: FutureExpenseRow): FutureExpense {
  return {
    id: row.id,
    description: row.description,
    amount: Number(row.amount),
    expectedDate: row.expected_date,
    categoryId: row.category_id,
    notes: row.notes || undefined,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const futureExpenseService = {
  /** Lista todas as despesas futuras do usuário */
  async getAll(): Promise<FutureExpense[]> {
    const { data, error } = await supabase
      .from('future_expenses')
      .select('*')
      .order('expected_date', { ascending: true });

    if (error) throw error;
    return (data as FutureExpenseRow[]).map(mapFutureExpense);
  },

  /** Lista despesas futuras pendentes */
  async getPending(): Promise<FutureExpense[]> {
    const { data, error } = await supabase
      .from('future_expenses')
      .select('*')
      .eq('status', 'pending')
      .order('expected_date', { ascending: true });

    if (error) throw error;
    return (data as FutureExpenseRow[]).map(mapFutureExpense);
  },

  /** Cria uma nova despesa futura */
  async create(expense: Omit<FutureExpense, 'id'>): Promise<FutureExpense> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');

    const id = crypto.randomUUID();
    const { data, error } = await supabase
      .from('future_expenses')
      .insert({
        id,
        user_id: user.id,
        description: expense.description,
        amount: expense.amount,
        expected_date: expense.expectedDate,
        category_id: expense.categoryId,
        notes: expense.notes || null,
        status: expense.status,
      })
      .select()
      .single();

    if (error) throw error;
    return mapFutureExpense(data as FutureExpenseRow);
  },

  /** Atualiza uma despesa futura existente */
  async update(expense: FutureExpense): Promise<FutureExpense> {
    const { data, error } = await supabase
      .from('future_expenses')
      .update({
        description: expense.description,
        amount: expense.amount,
        expected_date: expense.expectedDate,
        category_id: expense.categoryId,
        notes: expense.notes || null,
        status: expense.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', expense.id)
      .select()
      .single();

    if (error) throw error;
    return mapFutureExpense(data as FutureExpenseRow);
  },

  /** Remove uma despesa futura */
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('future_expenses').delete().eq('id', id);

    if (error) throw error;
  },

  /** Marca uma despesa como paga */
  async markAsPaid(id: string): Promise<FutureExpense> {
    const { data, error } = await supabase
      .from('future_expenses')
      .update({
        status: 'paid',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapFutureExpense(data as FutureExpenseRow);
  },
};
