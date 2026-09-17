import { supabase } from '../../lib/supabase';
import type { EmergencyReserve } from '../../types';
import type { IEmergencyReserveRepository } from '../../domain/repositories/IRepository';
import { EmergencyReserveEntity } from '../../domain/entities/EmergencyReserveEntity';

interface ReserveRow {
  id: string;
  user_id: string;
  goal_amount: number | string;
  current_amount: number | string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function mapRow(row: ReserveRow): EmergencyReserve {
  return {
    id: row.id,
    goalAmount: Number(row.goal_amount),
    currentAmount: Number(row.current_amount),
    notes: row.notes || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function isTableNotFound(error: any): boolean {
  if (!error) return false;
  const code = error.code || '';
  const msg = (error.message || '').toLowerCase();
  return code === 'PGRST205' || code === '42P01' || code === 'PGRST301' || msg.includes('does not exist') || msg.includes('could not find the table') || msg.includes('schema cache');
}

export class SupabaseEmergencyReserveRepository implements IEmergencyReserveRepository {
  async getAll(): Promise<EmergencyReserve[]> {
    const r = await this.getByUser();
    return r ? [r] : [];
  }

  async getById(id: string): Promise<EmergencyReserve | null> {
    const { data, error } = await supabase.from('emergency_reserves').select('*').eq('id', id).single();
    if (error) {
      if (isTableNotFound(error)) {
        console.warn('Tabela emergency_reserves não existe ainda. Execute a migration 004 em Supabase SQL Editor.');
        return null;
      }
      throw error;
    }
    if (!data) return null;
    return mapRow(data as ReserveRow);
  }

  async getByUser(): Promise<EmergencyReserve | null> {
    const { data, error } = await supabase.from('emergency_reserves').select('*').limit(1).maybeSingle();
    if (error) {
      if (isTableNotFound(error)) {
        console.warn('Tabela emergency_reserves não existe ainda. Execute a migration 004 em Supabase SQL Editor.');
        return null;
      }
      throw error;
    }
    if (!data) return null;
    return mapRow(data as ReserveRow);
  }

  async create(dto: Omit<EmergencyReserve, 'id'>): Promise<EmergencyReserve> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');
    const id = crypto.randomUUID();
    const { data, error } = await supabase.from('emergency_reserves').insert({
      id,
      user_id: user.id,
      goal_amount: dto.goalAmount,
      current_amount: dto.currentAmount,
      notes: dto.notes || null,
    }).select().single();
    if (error) {
      if (isTableNotFound(error)) throw new Error('Tabela emergency_reserves não existe. Execute a migration 004_add_emergency_reserve.sql no Supabase SQL Editor.');
      throw error;
    }
    return mapRow(data as ReserveRow);
  }

  async update(entity: EmergencyReserve): Promise<EmergencyReserve> {
    new EmergencyReserveEntity(entity);
    const { data, error } = await supabase.from('emergency_reserves').update({
      goal_amount: entity.goalAmount,
      current_amount: entity.currentAmount,
      notes: entity.notes || null,
      updated_at: new Date().toISOString(),
    }).eq('id', entity.id).select().single();
    if (error) {
      if (isTableNotFound(error)) throw new Error('Tabela emergency_reserves não existe. Execute a migration 004.');
      throw error;
    }
    return mapRow(data as ReserveRow);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('emergency_reserves').delete().eq('id', id);
    if (error) {
      if (isTableNotFound(error)) {
        console.warn('Tabela emergency_reserves não existe.');
        return;
      }
      throw error;
    }
  }

  async deposit(amount: number): Promise<EmergencyReserve> {
    const current = await this.getByUser();
    if (!current) throw new Error('Reserva não encontrada');
    const entity = new EmergencyReserveEntity(current);
    const updated = entity.deposit(amount);
    return this.update(updated.toDTO());
  }

  async withdraw(amount: number): Promise<EmergencyReserve> {
    const current = await this.getByUser();
    if (!current) throw new Error('Reserva não encontrada');
    const entity = new EmergencyReserveEntity(current);
    const updated = entity.withdraw(amount);
    return this.update(updated.toDTO());
  }

  async setCurrentAmount(amount: number): Promise<EmergencyReserve> {
    const current = await this.getByUser();
    if (!current) throw new Error('Reserva não encontrada');
    const entity = new EmergencyReserveEntity(current);
    const updated = entity.setCurrentAmount(amount);
    return this.update(updated.toDTO());
  }
}
