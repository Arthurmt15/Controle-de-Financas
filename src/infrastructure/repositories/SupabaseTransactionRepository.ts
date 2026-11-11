import { supabase } from '../../lib/supabase';
import { requireUserId } from '../../lib/auth';
import type { Transaction } from '../../types';
import type { ITransactionRepository } from '../../domain/repositories/IRepository';
import { TransactionEntity } from '../../domain/entities/TransactionEntity';
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
}

function mapRow(row: TransactionRow): Transaction {
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

/**
 * Repositório OOP para transações via Supabase.
 * Encapsula acesso a dados e usa entidade para validação.
 */
export class SupabaseTransactionRepository implements ITransactionRepository {
  async getAll(page?: number, limit?: number): Promise<Transaction[]> {
    if (page && limit) {
      return this.getPage(page, limit);
    }

    // Dashboard and reports need the complete ledger; fetch every page instead
    // of silently treating the first 50 records as the user's full history.
    const allTransactions: Transaction[] = [];
    const pageSize = 1000;
    let currentPage = 1;

    while (true) {
      const transactions = await this.getPage(currentPage, pageSize);
      allTransactions.push(...transactions);
      if (transactions.length < pageSize) return allTransactions;
      currentPage += 1;
    }
  }

  private async getPage(page: number, limit: number): Promise<Transaction[]> {
    const offset = (page - 1) * limit;
    const userId = await requireUserId();
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw error;
    return (data as TransactionRow[]).map(mapRow);
  }

  async getById(id: string): Promise<Transaction | null> {
    const userId = await requireUserId();
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
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
    const userId = await requireUserId();
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
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;
    return mapRow(data as TransactionRow);
  }

  async delete(id: string): Promise<void> {
    const userId = await requireUserId();
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw error;
  }
}
