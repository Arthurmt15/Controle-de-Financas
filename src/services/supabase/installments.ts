/**
 * @file services/supabase/installments.ts
 * @description Service para gerenciar compras parceladas no Supabase.
 * Controla prestações pagas e pendentes de compras parceladas.
 */

import { supabase } from '../../lib/supabase';
import type { Installment } from '../../types';

/** Interface da linha bruta do banco de dados */
interface InstallmentRow {
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

/** Converte linha do banco para o tipo Installment */
function mapInstallment(row: InstallmentRow): Installment {
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

export const installmentService = {
  /** Lista todos os parcelados do usuário */
  async getAll(): Promise<Installment[]> {
    const { data, error } = await supabase
      .from('installments')
      .select('*')
      .order('start_date', { ascending: false });

    if (error) throw error;
    return (data as InstallmentRow[]).map(mapInstallment);
  },

  /** Cria um novo parcelado */
  async create(installment: Omit<Installment, 'id'>): Promise<Installment> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');

    const id = crypto.randomUUID();
    const { data, error } = await supabase
      .from('installments')
      .insert({
        id,
        user_id: user.id,
        description: installment.description,
        total_amount: installment.totalAmount,
        installment_amount: installment.installmentAmount,
        total_installments: installment.totalInstallments,
        current_installment: installment.currentInstallment,
        start_date: installment.startDate,
        category_id: installment.categoryId,
        notes: installment.notes || null,
        source: installment.source,
      })
      .select()
      .single();

    if (error) throw error;
    return mapInstallment(data as InstallmentRow);
  },

  /** Atualiza um parcelado existente */
  async update(installment: Installment): Promise<Installment> {
    const { data, error } = await supabase
      .from('installments')
      .update({
        description: installment.description,
        total_amount: installment.totalAmount,
        installment_amount: installment.installmentAmount,
        total_installments: installment.totalInstallments,
        current_installment: installment.currentInstallment,
        start_date: installment.startDate,
        category_id: installment.categoryId,
        notes: installment.notes || null,
        source: installment.source,
        updated_at: new Date().toISOString(),
      })
      .eq('id', installment.id)
      .select()
      .single();

    if (error) throw error;
    return mapInstallment(data as InstallmentRow);
  },

  /** Remove um parcelado */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('installments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /** Avança para a próxima parcela */
  async advanceInstallment(id: string): Promise<Installment> {
    const { data: current } = await supabase
      .from('installments')
      .select('*')
      .eq('id', id)
      .single();

    if (!current) throw new Error('Parcelado não encontrado');

    const row = current as InstallmentRow;
    const nextInstallment = Math.min(row.current_installment + 1, row.total_installments);

    const { data, error } = await supabase
      .from('installments')
      .update({
        current_installment: nextInstallment,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapInstallment(data as InstallmentRow);
  },
};
