import { supabase } from '../../lib/supabase';
import type { Category } from '../../types';

interface CategoryRow {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  default_type: 'income' | 'expense' | 'both';
  created_at: string;
}

function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    icon: row.icon,
    defaultType: row.default_type,
  };
}

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const { data, error } = await supabase.from('categories').select('*').order('name');

    if (error) throw error;
    return (data as CategoryRow[]).map(mapCategory);
  },

  async create(category: Omit<Category, 'id'>): Promise<Category> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');

    const id = crypto.randomUUID();

    const { data, error } = await supabase
      .from('categories')
      .insert({
        id,
        user_id: user.id,
        name: category.name,
        color: category.color,
        icon: category.icon,
        default_type: category.defaultType,
      })
      .select()
      .single();

    if (error) throw error;
    return mapCategory(data as CategoryRow);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('categories').delete().eq('id', id);

    if (error) throw error;
  },
};
