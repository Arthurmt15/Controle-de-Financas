import { supabase } from '../../lib/supabase';
import type { Installment } from '../../types';
import type { IInstallmentRepository } from '../../domain/repositories/IRepository';
import { InstallmentEntity } from '../../domain/entities/InstallmentEntity';
import { InstallmentPlan } from '../../domain/value-objects/InstallmentPlan';

interface InstallmentRow {
  id: string; user_id: string; description: string; total_amount: number | string;
  installment_amount: number | string; total_installments: number; current_installment: number;
  start_date: string; category_id: string; notes: string | null; source: 'manual' | 'openfinance';
  created_at: string; updated_at: string;
}

function mapRow(row: InstallmentRow): Installment {
  return {
    id: row.id, description: row.description, totalAmount: Number(row.total_amount),
    installmentAmount: Number(row.installment_amount), totalInstallments: row.total_installments,
    currentInstallment: row.current_installment, startDate: row.start_date, categoryId: row.category_id,
    notes: row.notes || undefined, source: row.source, createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

/**
 * Repositório OOP para parcelados.
 * Usa Value Object InstallmentPlan para validar cálculo.
 */
export class SupabaseInstallmentRepository implements IInstallmentRepository {
  async getAll(): Promise<Installment[]> {
    const { data, error } = await supabase.from('installments').select('*').order('start_date', { ascending: false });
    if (error) throw error;
    return (data as InstallmentRow[]).map(mapRow);
  }

  async getById(id: string): Promise<Installment | null> {
    const { data } = await supabase.from('installments').select('*').eq('id', id).single();
    if (!data) return null;
    return mapRow(data as InstallmentRow);
  }

  async create(dto: Omit<Installment, 'id'>): Promise<Installment> {
    // Valida plano via Value Object
    const plan = new InstallmentPlan(dto.totalAmount, dto.totalInstallments);
    if (Math.abs(plan.installmentAmount.amount - dto.installmentAmount) > 0.01) throw new Error('Valor da parcela inconsistente');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');
    const id = crypto.randomUUID();
    const { data, error } = await supabase.from('installments').insert({
      id, user_id: user.id, description: dto.description, total_amount: dto.totalAmount,
      installment_amount: dto.installmentAmount, total_installments: dto.totalInstallments,
      current_installment: dto.currentInstallment, start_date: dto.startDate, category_id: dto.categoryId,
      notes: dto.notes || null, source: dto.source,
    }).select().single();
    if (error) throw error;
    return mapRow(data as InstallmentRow);
  }

  async update(entity: Installment): Promise<Installment> {
    new InstallmentEntity(entity);
    const { data, error } = await supabase.from('installments').update({
      description: entity.description, total_amount: entity.totalAmount, installment_amount: entity.installmentAmount,
      total_installments: entity.totalInstallments, current_installment: entity.currentInstallment,
      start_date: entity.startDate, category_id: entity.categoryId, notes: entity.notes || null,
      source: entity.source, updated_at: new Date().toISOString(),
    }).eq('id', entity.id).select().single();
    if (error) throw error;
    return mapRow(data as InstallmentRow);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('installments').delete().eq('id', id);
    if (error) throw error;
  }

  async advance(id: string): Promise<Installment> {
    const current = await this.getById(id);
    if (!current) throw new Error('Parcelado não encontrado');
    const entity = new InstallmentEntity(current);
    const advanced = entity.advance();
    return this.update(advanced.toDTO());
  }
}
