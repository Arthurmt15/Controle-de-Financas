/**
 * @file contexts/FutureExpensesContext.tsx
 * @description Context para gerenciar despesas futuras previstas.
 * Permite planejar gastos que ainda vão acontecer.
 */

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { futureExpenseService } from '../services/data';
import type { FutureExpense } from '../types';

/** Estado do contexto de despesas futuras */
interface FutureExpensesState {
  futureExpenses: FutureExpense[];
  isLoading: boolean;
  error: string | null;
}

/** Ações do reducer */
type FutureExpensesAction =
  | { type: 'SET_FUTURE_EXPENSES'; payload: FutureExpense[] }
  | { type: 'ADD_FUTURE_EXPENSE'; payload: FutureExpense }
  | { type: 'UPDATE_FUTURE_EXPENSE'; payload: FutureExpense }
  | { type: 'DELETE_FUTURE_EXPENSE'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

/** Valor do contexto */
interface FutureExpensesContextValue extends FutureExpensesState {
  addFutureExpense: (expense: Omit<FutureExpense, 'id'>) => Promise<FutureExpense>;
  updateFutureExpense: (expense: FutureExpense) => Promise<FutureExpense>;
  deleteFutureExpense: (id: string) => Promise<void>;
  markAsPaid: (id: string) => Promise<void>;
}

const initialState: FutureExpensesState = {
  futureExpenses: [],
  isLoading: false,
  error: null,
};

/** Reducer para gerenciar estado das despesas futuras */
function futureExpensesReducer(state: FutureExpensesState, action: FutureExpensesAction): FutureExpensesState {
  switch (action.type) {
    case 'SET_FUTURE_EXPENSES':
      return { ...state, futureExpenses: action.payload, isLoading: false };
    case 'ADD_FUTURE_EXPENSE':
      return { ...state, futureExpenses: [...state.futureExpenses, action.payload] };
    case 'UPDATE_FUTURE_EXPENSE':
      return {
        ...state,
        futureExpenses: state.futureExpenses.map((e) =>
          e.id === action.payload.id ? action.payload : e
        ),
      };
    case 'DELETE_FUTURE_EXPENSE':
      return {
        ...state,
        futureExpenses: state.futureExpenses.filter((e) => e.id !== action.payload),
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    default:
      return state;
  }
}

const FutureExpensesContext = createContext<FutureExpensesContextValue | undefined>(undefined);

/** Provider das despesas futuras */
export function FutureExpensesProvider({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const userId = user?.id || '';
  const [state, dispatch] = useReducer(futureExpensesReducer, initialState);

  /** Carrega despesas futuras ao autenticar */
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    const loadData = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const expenses = await futureExpenseService.getAll(userId);
        if (!cancelled) {
          dispatch({ type: 'SET_FUTURE_EXPENSES', payload: expenses });
        }
      } catch (error) {
        if (!cancelled) {
          if (error instanceof Error && error.message.includes('Não autenticado')) {
            logout();
            return;
          }
          dispatch({ type: 'SET_ERROR', payload: 'Erro ao carregar despesas futuras' });
        }
      }
    };

    loadData();
    return () => { cancelled = true; };
  }, [userId, logout]);

  /** Adiciona uma nova despesa futura */
  const addFutureExpense = useCallback(
    async (expense: Omit<FutureExpense, 'id'>) => {
      const newExpense = await futureExpenseService.create(expense, userId);
      dispatch({ type: 'ADD_FUTURE_EXPENSE', payload: newExpense });
      return newExpense;
    },
    [userId]
  );

  /** Atualiza uma despesa futura existente */
  const updateFutureExpense = useCallback(
    async (expense: FutureExpense) => {
      const updated = await futureExpenseService.update(expense);
      dispatch({ type: 'UPDATE_FUTURE_EXPENSE', payload: updated });
      return updated;
    },
    []
  );

  /** Remove uma despesa futura */
  const deleteFutureExpense = useCallback(
    async (id: string) => {
      await futureExpenseService.delete(id);
      dispatch({ type: 'DELETE_FUTURE_EXPENSE', payload: id });
    },
    []
  );

  /** Marca uma despesa como paga */
  const markAsPaid = useCallback(
    async (id: string) => {
      const updated = await futureExpenseService.markAsPaid(id);
      dispatch({ type: 'UPDATE_FUTURE_EXPENSE', payload: updated });
    },
    []
  );

  return (
    <FutureExpensesContext.Provider
      value={{
        ...state,
        addFutureExpense,
        updateFutureExpense,
        deleteFutureExpense,
        markAsPaid,
      }}
    >
      {children}
    </FutureExpensesContext.Provider>
  );
}

/** Hook para acessar o contexto de despesas futuras */
export function useFutureExpenses(): FutureExpensesContextValue {
  const context = useContext(FutureExpensesContext);
  if (!context) {
    throw new Error('useFutureExpenses deve ser usado dentro de um FutureExpensesProvider');
  }
  return context;
}
