import { supabase } from '../../lib/supabase';
import type { Transaction } from '../../types';
import type { ITransactionRepository } from '../../domain/repositories/IRepository';
import { TransactionEntity } from '../../domain/entities/TransactionEntity';

interface TransactionRow {
  id: string;
  description: string;
  amount: number | string;
  type: 'income' | 'expense';
  date: string;
  category_id: string;
  notes: string | null;
  created_at: string;
}

function mapRow(row: TransactionRow): Transaction {
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

/**
 * Repositório OOP para transações via Supabase.
 * Encapsula acesso a dados e usa entidade para validação.
 */
export class SupabaseTransactionRepository implements ITransactionRepository {
  async getAll(page = 1, limit = 50): Promise<Transaction[]> {
    const offset = (page - 1) * limit;
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw error;
    return (data as TransactionRow[]).map(mapRow);
  }

  async getById(id: string): Promise<Transaction | null> {
    const { data, error } = await supabase.from('transactions').select('*').eq('id', id).single();
    if (error) return null;
    return mapRow(data as TransactionRow);
  }

  async create(dto: Omit<Transaction, 'id'>): Promise<Transaction> {
    // Valida via entidade
    new TransactionEntity({ ...dto, id: 'temp' });
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
        description: dto.description,
        amount: dto.amount,
        type: dto.type,
        date: dto.date,
        category_id: dto.categoryId,
        notes: dto.notes || null,
      })
      .select()
      .single();
    if (error) throw error;
    return mapRow(data as TransactionRow);
  }

  async update(entity: Transaction): Promise<Transaction> {
    new TransactionEntity(entity);
    const { data, error } = await supabase
      .from('transactions')
      .update({
        description: entity.description,
        amount: entity.amount,
        type: entity.type,
        date: entity.date,
        category_id: entity.categoryId,
        notes: entity.notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', entity.id)
      .select()
      .single();
    if (error) throw error;
    return mapRow(data as TransactionRow);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) throw error;
  }
}
