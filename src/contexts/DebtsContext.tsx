import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { debtService } from '../services/data';
import type { Debt } from '../types';

interface DebtsState {
  debts: Debt[];
  isLoading: boolean;
  error: string | null;
}

type DebtsAction =
  | { type: 'SET_DEBTS'; payload: Debt[] }
  | { type: 'ADD_DEBT'; payload: Debt }
  | { type: 'UPDATE_DEBT'; payload: Debt }
  | { type: 'DELETE_DEBT'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

interface DebtsContextValue extends DebtsState {
  addDebt: (debt: Omit<Debt, 'id'>) => Promise<Debt>;
  updateDebt: (debt: Debt) => Promise<Debt>;
  deleteDebt: (id: string) => Promise<void>;
  advanceDebt: (id: string) => Promise<void>;
}

const initialState: DebtsState = {
  debts: [],
  isLoading: false,
  error: null,
};

function debtsReducer(state: DebtsState, action: DebtsAction): DebtsState {
  switch (action.type) {
    case 'SET_DEBTS':
      return { ...state, debts: action.payload, isLoading: false };
    case 'ADD_DEBT':
      return { ...state, debts: [...state.debts, action.payload] };
    case 'UPDATE_DEBT':
      return {
        ...state,
        debts: state.debts.map((d) => (d.id === action.payload.id ? action.payload : d)),
      };
    case 'DELETE_DEBT':
      return { ...state, debts: state.debts.filter((d) => d.id !== action.payload) };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    default:
      return state;
  }
}

const DebtsContext = createContext<DebtsContextValue | undefined>(undefined);

export function DebtsProvider({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const userId = user?.id || '';
  const [state, dispatch] = useReducer(debtsReducer, initialState);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    const loadData = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const debts = await debtService.getAll(userId);
        if (!cancelled) dispatch({ type: 'SET_DEBTS', payload: debts });
      } catch (error) {
        if (!cancelled) {
          if (error instanceof Error && error.message.includes('Não autenticado')) {
            logout();
            return;
          }
          // Tabela debts ainda não existe (migration 002 pendente) — não bloqueia app
          if (
            error instanceof Error &&
            (error.message.includes('Tabela') ||
              error.message.toLowerCase().includes('does not exist') ||
              error.message.toLowerCase().includes('could not find the table'))
          ) {
            console.warn(
              'Dívidas: tabela debts não existe ainda. Execute supabase/migrations/002_add_debts.sql no SQL Editor.'
            );
            dispatch({ type: 'SET_DEBTS', payload: [] });
            return;
          }
          dispatch({ type: 'SET_ERROR', payload: 'Erro ao carregar dívidas' });
        }
      }
    };
    loadData();
    return () => {
      cancelled = true;
    };
  }, [userId, logout]);

  const addDebt = useCallback(
    async (debt: Omit<Debt, 'id'>) => {
      const newDebt = await debtService.create(debt, userId);
      dispatch({ type: 'ADD_DEBT', payload: newDebt });
      return newDebt;
    },
    [userId]
  );

  const updateDebt = useCallback(async (debt: Debt) => {
    const updated = await debtService.update(debt);
    dispatch({ type: 'UPDATE_DEBT', payload: updated });
    return updated;
  }, []);

  const deleteDebt = useCallback(async (id: string) => {
    await debtService.delete(id);
    dispatch({ type: 'DELETE_DEBT', payload: id });
  }, []);

  const advanceDebt = useCallback(async (id: string) => {
    const updated = await debtService.advance(id);
    dispatch({ type: 'UPDATE_DEBT', payload: updated });
  }, []);

  return (
    <DebtsContext.Provider value={{ ...state, addDebt, updateDebt, deleteDebt, advanceDebt }}>
      {children}
    </DebtsContext.Provider>
  );
}

export function useDebts(): DebtsContextValue {
  const context = useContext(DebtsContext);
  if (!context) throw new Error('useDebts deve ser usado dentro de um DebtsProvider');
  return context;
}
