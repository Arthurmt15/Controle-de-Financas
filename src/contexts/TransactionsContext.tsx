/**
 * @file contexts/TransactionsContext.tsx
 * @description Contexto compartilhado para transações financeiras.
 * Usa API backend (Railway/PostgreSQL) para persistir dados.
 */

import React, { createContext, useContext, useReducer, useCallback, useMemo, useEffect, useRef } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from './AuthContext';
import { transactionService, categoryService } from '../services/api';
import { transactionReducer } from '../reducers/transactionReducer';
import { filterTransactions } from '../utils/transactionFilters';
import { calculateMetrics } from '../utils/transactionMetrics';
import type {
  Transaction,
  Category,
  TransactionFilters,
  TransactionState,
} from '../types';

/** Estado inicial do reducer de transações */
const initialState: TransactionState = {
  transactions: [],
  categories: [],
  filters: {
    startDate: null,
    endDate: null,
    type: 'both',
    categoryId: null,
    searchTerm: '',
    sortBy: 'date',
    sortOrder: 'desc',
  },
  isLoading: false,
  error: null,
};

/** Interface do valor do contexto de transações */
interface TransactionsContextValue extends TransactionState {
  filteredTransactions: Transaction[];
  metrics: ReturnType<typeof calculateMetrics>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<Transaction>;
  updateTransaction: (transaction: Transaction) => Promise<Transaction>;
  deleteTransaction: (transactionId: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<Category>;
  deleteCategory: (categoryId: string) => Promise<void>;
  setFilters: (filters: Partial<TransactionFilters>) => void;
  clearFilters: () => void;
}

/** Contexto de transações */
const TransactionsContext = createContext<TransactionsContextValue | undefined>(undefined);

/**
 * Provider de transações
 * Carrega dados da API ao montar e sincroniza mudanças
 */
export function TransactionsProvider({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const userId = user?.id || '';

  /** Contador de operações em andamento para evitar race condition */
  const loadingCountRef = useRef(0);

  /** Filtros permanecem no localStorage */
  const [storedFilters, setStoredFilters] = useLocalStorage<TransactionFilters>(
    'financas_filters',
    initialState.filters
  );

  const [state, dispatch] = useReducer(transactionReducer, {
    ...initialState,
    filters: storedFilters,
  });

  /**
   * Incrementa/decrementa contador de loading
   * Evita race condition quando múltiplas operações acontecem
   */
  const setLoading = useCallback((loading: boolean) => {
    if (loading) {
      loadingCountRef.current += 1;
      dispatch({ type: 'SET_LOADING', payload: true });
    } else {
      loadingCountRef.current = Math.max(0, loadingCountRef.current - 1);
      if (loadingCountRef.current === 0) {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }
  }, []);

  /**
   * Carrega dados do banco quando o usuário está autenticado
   */
  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    const loadData = async () => {
      setLoading(true);
      try {
        const [transactions, categories] = await Promise.all([
          transactionService.getAll(userId),
          categoryService.getAll(userId),
        ]);

        if (!cancelled) {
          dispatch({ type: 'SET_TRANSACTIONS', payload: transactions });
          dispatch({ type: 'SET_CATEGORIES', payload: categories });

          if (categories.length === 0) {
            dispatch({ type: 'SET_ERROR', payload: 'Nenhuma categoria encontrada' });
          } else {
            dispatch({ type: 'SET_ERROR', payload: null });
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        if (!cancelled) {
          if (error instanceof Error && 
              (error.message === 'Autenticação necessária' || 
               error.message === 'Sessão expirada. Faça login novamente.')) {
            logout();
            return;
          }
          dispatch({ type: 'SET_ERROR', payload: 'Erro ao carregar dados do servidor' });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadData();
    return () => { cancelled = true; };
  }, [userId, setLoading, logout]);

  /**
   * Adiciona uma nova transação via API
   */
  const addTransaction = useCallback(
    async (transaction: Omit<Transaction, 'id'>) => {
      setLoading(true);
      try {
        const newTransaction = await transactionService.create(transaction, userId);
        dispatch({ type: 'ADD_TRANSACTION', payload: newTransaction });
        return newTransaction;
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Erro ao salvar transação' });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [userId, setLoading]
  );

  /**
   * Atualiza uma transação existente via API
   */
  const updateTransaction = useCallback(
    async (transaction: Transaction) => {
      setLoading(true);
      try {
        const updated = await transactionService.update(transaction);
        dispatch({ type: 'UPDATE_TRANSACTION', payload: updated });
        return updated;
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Erro ao atualizar transação' });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setLoading]
  );

  /**
   * Remove uma transação via API
   */
  const deleteTransaction = useCallback(
    async (transactionId: string) => {
      setLoading(true);
      try {
        await transactionService.delete(transactionId);
        dispatch({ type: 'DELETE_TRANSACTION', payload: transactionId });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Erro ao remover transação' });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setLoading]
  );

  /**
   * Adiciona uma nova categoria via API
   */
  const addCategory = useCallback(
    async (category: Omit<Category, 'id'>) => {
      setLoading(true);
      try {
        const newCategory = await categoryService.create(category, userId);
        dispatch({ type: 'ADD_CATEGORY', payload: newCategory });
        return newCategory;
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Erro ao salvar categoria' });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [userId, setLoading]
  );

  /**
   * Remove uma categoria via API
   */
  const deleteCategory = useCallback(
    async (categoryId: string) => {
      setLoading(true);
      try {
        await categoryService.delete(categoryId);
        dispatch({ type: 'DELETE_CATEGORY', payload: categoryId });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Erro ao remover categoria' });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setLoading]
  );

  /**
   * Atualiza os filtros de transação
   */
  const setFilters = useCallback(
    (filters: Partial<TransactionFilters>) => {
      dispatch({ type: 'SET_FILTERS', payload: filters });
      setStoredFilters((prev: TransactionFilters) => ({ ...prev, ...filters }));
    },
    [setStoredFilters]
  );

  /**
   * Limpa todos os filtros aplicados
   */
  const clearFilters = useCallback(() => {
    dispatch({ type: 'CLEAR_FILTERS' });
    setStoredFilters(initialState.filters);
  }, [setStoredFilters]);

  /** Transações filtradas (memoizado) */
  const filteredTransactions = useMemo(
    () => filterTransactions(state.transactions, state.filters),
    [state.transactions, state.filters]
  );

  /** Métricas calculadas (memoizado) */
  const metrics = useMemo(
    () => calculateMetrics(state.transactions),
    [state.transactions]
  );

  /** Valor do contexto (memoizado) */
  const value = useMemo<TransactionsContextValue>(
    () => ({
      transactions: state.transactions,
      categories: state.categories,
      filters: state.filters,
      isLoading: state.isLoading,
      error: state.error,
      filteredTransactions,
      metrics,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addCategory,
      deleteCategory,
      setFilters,
      clearFilters,
    }),
    [
      state.transactions, state.categories, state.filters,
      state.isLoading, state.error,
      filteredTransactions, metrics,
      addTransaction, updateTransaction, deleteTransaction,
      addCategory, deleteCategory, setFilters, clearFilters,
    ]
  );

  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  );
}

/**
 * Hook para acessar o contexto de transações
 */
export function useTransactions(): TransactionsContextValue {
  const context = useContext(TransactionsContext);
  if (!context) {
    throw new Error('useTransactions deve ser usado dentro de um TransactionsProvider');
  }
  return context;
}

export default TransactionsContext;
