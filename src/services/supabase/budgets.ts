import { supabase } from '../../lib/supabase';
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
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .order('month', { ascending: false });

    if (error) throw error;
    return (data as BudgetRow[]).map(mapBudget);
  },

  async create(budget: Omit<Budget, 'id'>): Promise<Budget> {
    const { data: { user } } = await supabase.auth.getUser();
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
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
