/**
 * @file contexts/InstallmentsContext.tsx
 * @description Context para gerenciar compras parceladas.
 * Controla prestações pagas e pendentes de parcelados.
 */

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { installmentService } from '../services/data';
import type { Installment } from '../types';

/** Estado do contexto de parcelados */
interface InstallmentsState {
  installments: Installment[];
  isLoading: boolean;
  error: string | null;
}

/** Ações do reducer */
type InstallmentsAction =
  | { type: 'SET_INSTALLMENTS'; payload: Installment[] }
  | { type: 'ADD_INSTALLMENT'; payload: Installment }
  | { type: 'UPDATE_INSTALLMENT'; payload: Installment }
  | { type: 'DELETE_INSTALLMENT'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

/** Valor do contexto */
interface InstallmentsContextValue extends InstallmentsState {
  addInstallment: (installment: Omit<Installment, 'id'>) => Promise<Installment>;
  updateInstallment: (installment: Installment) => Promise<Installment>;
  deleteInstallment: (id: string) => Promise<void>;
  advanceInstallment: (id: string) => Promise<void>;
}

const initialState: InstallmentsState = {
  installments: [],
  isLoading: false,
  error: null,
};

/** Reducer para gerenciar estado dos parcelados */
function installmentsReducer(state: InstallmentsState, action: InstallmentsAction): InstallmentsState {
  switch (action.type) {
    case 'SET_INSTALLMENTS':
      return { ...state, installments: action.payload, isLoading: false };
    case 'ADD_INSTALLMENT':
      return { ...state, installments: [...state.installments, action.payload] };
    case 'UPDATE_INSTALLMENT':
      return {
        ...state,
        installments: state.installments.map((i) =>
          i.id === action.payload.id ? action.payload : i
        ),
      };
    case 'DELETE_INSTALLMENT':
      return {
        ...state,
        installments: state.installments.filter((i) => i.id !== action.payload),
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    default:
      return state;
  }
}

const InstallmentsContext = createContext<InstallmentsContextValue | undefined>(undefined);

/** Provider dos parcelados */
export function InstallmentsProvider({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const userId = user?.id || '';
  const [state, dispatch] = useReducer(installmentsReducer, initialState);

  /** Carrega parcelados ao autenticar */
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    const loadData = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const installments = await installmentService.getAll(userId);
        if (!cancelled) {
          dispatch({ type: 'SET_INSTALLMENTS', payload: installments });
        }
      } catch (error) {
        if (!cancelled) {
          if (error instanceof Error && error.message.includes('Não autenticado')) {
            logout();
            return;
          }
          dispatch({ type: 'SET_ERROR', payload: 'Erro ao carregar parcelados' });
        }
      }
    };

    loadData();
    return () => { cancelled = true; };
  }, [userId, logout]);

  /** Adiciona um novo parcelado */
  const addInstallment = useCallback(
    async (installment: Omit<Installment, 'id'>) => {
      const newInstallment = await installmentService.create(installment, userId);
      dispatch({ type: 'ADD_INSTALLMENT', payload: newInstallment });
      return newInstallment;
    },
    [userId]
  );

  /** Atualiza um parcelado existente */
  const updateInstallment = useCallback(
    async (installment: Installment) => {
      const updated = await installmentService.update(installment);
      dispatch({ type: 'UPDATE_INSTALLMENT', payload: updated });
      return updated;
    },
    []
  );

  /** Remove um parcelado */
  const deleteInstallment = useCallback(
    async (id: string) => {
      await installmentService.delete(id);
      dispatch({ type: 'DELETE_INSTALLMENT', payload: id });
    },
    []
  );

  /** Avança para a próxima parcela */
  const advanceInstallment = useCallback(
    async (id: string) => {
      const updated = await installmentService.advance(id);
      dispatch({ type: 'UPDATE_INSTALLMENT', payload: updated });
    },
    []
  );

  return (
    <InstallmentsContext.Provider
      value={{
        ...state,
        addInstallment,
        updateInstallment,
        deleteInstallment,
        advanceInstallment,
      }}
    >
      {children}
    </InstallmentsContext.Provider>
  );
}

/** Hook para acessar o contexto de parcelados */
export function useInstallments(): InstallmentsContextValue {
  const context = useContext(InstallmentsContext);
  if (!context) {
    throw new Error('useInstallments deve ser usado dentro de um InstallmentsProvider');
  }
  return context;
}
