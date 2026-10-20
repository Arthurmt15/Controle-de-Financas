import { supabase } from '../../lib/supabase';
import { requireUserId } from '../../lib/auth';
import type { Budget } from '../../types/dashboard';

interface BudgetRow {
  id: string;
  user_id: string;
  category_id: string;
  budget_limit: number | string;
  month: string;
  created_at: string;
}

function mapBudget(row: BudgetRow): Budget {
  return {
    id: row.id,
    categoryId: row.category_id,
    limit: Number(row.budget_limit),
    month: row.month,
  };
}

export const budgetService = {
  async getAll(): Promise<Budget[]> {
    const userId = await requireUserId();
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .order('month', { ascending: false });

    if (error) throw error;
    return (data as BudgetRow[]).map(mapBudget);
  },

  async create(budget: Omit<Budget, 'id'>): Promise<Budget> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');

    const id = crypto.randomUUID();

    const { data, error } = await supabase
      .from('budgets')
      .insert({
        id,
        user_id: user.id,
        category_id: budget.categoryId,
        budget_limit: budget.limit,
        month: budget.month,
      })
      .select()
      .single();

    if (error) throw error;
    return mapBudget(data as BudgetRow);
  },

  async delete(id: string): Promise<void> {
    const userId = await requireUserId();
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  },
};
