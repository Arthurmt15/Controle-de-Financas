import { supabase } from '../../lib/supabase';
import type { Debt } from '../../types';
import type { IDebtRepository } from '../../domain/repositories/IRepository';
import { DebtEntity } from '../../domain/entities/DebtEntity';
import { InstallmentPlan } from '../../domain/value-objects/InstallmentPlan';

interface DebtRow {
  id: string;
  user_id: string;
  description: string;
  total_amount: number | string;
  installment_amount: number | string;
  total_installments: number;
  current_installment: number;
  start_date: string;
  category_id: string;
  notes: string | null;
  source: 'manual';
  created_at: string;
  updated_at: string;
}

function mapRow(row: DebtRow): Debt {
  return {
    id: row.id,
    description: row.description,
    totalAmount: Number(row.total_amount),
    installmentAmount: Number(row.installment_amount),
    totalInstallments: row.total_installments,
    currentInstallment: row.current_installment,
    startDate: row.start_date,
    categoryId: row.category_id,
    notes: row.notes || undefined,
    source: row.source,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function isTableNotFoundDebt(error: any): boolean {
  if (!error) return false;
  const code = error.code || '';
  const msg = (error.message || '').toLowerCase();
  return (
    code === 'PGRST205' ||
    code === '42P01' ||
    code === 'PGRST301' ||
    msg.includes('does not exist') ||
    msg.includes('could not find the table') ||
    msg.includes('schema cache')
  );
}

export class SupabaseDebtRepository implements IDebtRepository {
  async getAll(): Promise<Debt[]> {
    const { data, error } = await supabase
      .from('debts')
      .select('*')
      .order('start_date', { ascending: false });
    if (error) {
      if (isTableNotFoundDebt(error)) {
        console.warn(
          'Tabela debts não existe ainda. Execute a migration 002 em Supabase SQL Editor.'
        );
        return [];
      }
      throw error;
    }
    return (data as DebtRow[]).map(mapRow);
  }
  async getById(id: string): Promise<Debt | null> {
    const { data, error } = await supabase.from('debts').select('*').eq('id', id).single();
    if (error) {
      if (isTableNotFoundDebt(error)) return null;
      return null;
    }
    if (!data) return null;
    return mapRow(data as DebtRow);
  }
  async create(dto: Omit<Debt, 'id'>): Promise<Debt> {
    const plan = new InstallmentPlan(dto.totalAmount, dto.totalInstallments);
    if (Math.abs(plan.installmentAmount.amount - dto.installmentAmount) > 0.01)
      throw new Error('Valor da parcela inconsistente');
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');
    const id = crypto.randomUUID();
    const { data, error } = await supabase
      .from('debts')
      .insert({
        id,
        user_id: user.id,
        description: dto.description,
        total_amount: dto.totalAmount,
        installment_amount: dto.installmentAmount,
        total_installments: dto.totalInstallments,
        current_installment: dto.currentInstallment,
        start_date: dto.startDate,
        category_id: dto.categoryId,
        notes: dto.notes || null,
        source: dto.source,
      })
      .select()
      .single();
    if (error) {
      if (isTableNotFoundDebt(error))
        throw new Error(
          'Tabela debts não existe. Execute a migration 002_add_debts.sql no Supabase SQL Editor.'
        );
      throw error;
    }
    return mapRow(data as DebtRow);
  }
  async update(entity: Debt): Promise<Debt> {
    new DebtEntity(entity);
    const { data, error } = await supabase
      .from('debts')
      .update({
        description: entity.description,
        total_amount: entity.totalAmount,
        installment_amount: entity.installmentAmount,
        total_installments: entity.totalInstallments,
        current_installment: entity.currentInstallment,
        start_date: entity.startDate,
        category_id: entity.categoryId,
        notes: entity.notes || null,
        source: entity.source,
        updated_at: new Date().toISOString(),
      })
      .eq('id', entity.id)
      .select()
      .single();
    if (error) {
      if (isTableNotFoundDebt(error))
        throw new Error('Tabela debts não existe. Execute a migration 002.');
      throw error;
    }
    return mapRow(data as DebtRow);
  }
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('debts').delete().eq('id', id);
    if (error) {
      if (isTableNotFoundDebt(error)) {
        console.warn('Tabela debts não existe.');
        return;
      }
      throw error;
    }
  }
  async advance(id: string): Promise<Debt> {
    const current = await this.getById(id);
    if (!current) throw new Error('Dívida não encontrada');
    const entity = new DebtEntity(current);
    const advanced = entity.advance();
    return this.update(advanced.toDTO());
  }
}
