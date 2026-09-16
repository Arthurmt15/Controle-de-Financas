/**
 * @file contexts/EmergencyReserveContext.tsx
 * @description Context para reserva de emergência (única por usuário).
 */

import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { emergencyReserveService } from '../services/data';
import type { EmergencyReserve } from '../types';

interface EmergencyReserveContextValue {
  reserve: EmergencyReserve | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  create: (goalAmount: number, currentAmount?: number) => Promise<EmergencyReserve>;
  updateGoal: (goalAmount: number) => Promise<EmergencyReserve>;
  deposit: (amount: number) => Promise<EmergencyReserve>;
  withdraw: (amount: number) => Promise<EmergencyReserve>;
  remove: () => Promise<void>;
}

const EmergencyReserveContext = createContext<EmergencyReserveContextValue | undefined>(undefined);

export function EmergencyReserveProvider({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const userId = user?.id || '';
  const [reserve, setReserve] = useState<EmergencyReserve | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const data = await emergencyReserveService.get();
      setReserve(data);
      setError(null);
    } catch (e) {
      if (e instanceof Error && e.message.includes('Não autenticado')) {
        logout();
        return;
      }
      // Tabela ainda não existe (migration pendente) — trata como sem reserva, sem erro bloqueante
      if (e instanceof Error && (e.message.includes('Tabela') || e.message.toLowerCase().includes('does not exist') || e.message.toLowerCase().includes('could not find the table'))) {
        console.warn('Reserva: tabela não existe ainda. Execute supabase/migrations/004_add_emergency_reserve.sql no SQL Editor.');
        setReserve(null);
        setError(null);
        return;
      }
      setError('Erro ao carregar reserva');
    } finally {
      setIsLoading(false);
    }
  }, [userId, logout]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(async (goalAmount: number, currentAmount = 0) => {
    const created = await emergencyReserveService.create({ goalAmount, currentAmount });
    setReserve(created);
    return created;
  }, []);

  const updateGoal = useCallback(async (goalAmount: number) => {
    if (!reserve) throw new Error('Sem reserva');
    const updated = await emergencyReserveService.update({ ...reserve, goalAmount });
    setReserve(updated);
    return updated;
  }, [reserve]);

  const deposit = useCallback(async (amount: number) => {
    const updated = await emergencyReserveService.deposit(amount);
    setReserve(updated);
    return updated;
  }, []);

  const withdraw = useCallback(async (amount: number) => {
    const updated = await emergencyReserveService.withdraw(amount);
    setReserve(updated);
    return updated;
  }, []);

  const remove = useCallback(async () => {
    if (!reserve) return;
    await emergencyReserveService.delete(reserve.id);
    setReserve(null);
  }, [reserve]);

  return (
    <EmergencyReserveContext.Provider value={{ reserve, isLoading, error, refresh, create, updateGoal, deposit, withdraw, remove }}>
      {children}
    </EmergencyReserveContext.Provider>
  );
}

export function useEmergencyReserve(): EmergencyReserveContextValue {
  const ctx = useContext(EmergencyReserveContext);
  if (!ctx) throw new Error('useEmergencyReserve deve ser usado dentro de EmergencyReserveProvider');
  return ctx;
}
