/**
 * @file contexts/TransactionsContext.tsx
 * @description Contexto compartilhado para transações financeiras.
 * Usa API backend (Railway/PostgreSQL) para persistir dados.
 * Filtros permanecem no localStorage (são estado de UI).
 */

import React, { createContext, useContext, useReducer, useCallback, useMemo, useEffect } from 'react';
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
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (transactionId: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
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
  const { user } = useAuth();
  const userId = user?.id || '';

  // Filtros permanecem no localStorage (estado de UI)
  const [storedFilters, setStoredFilters] = useLocalStorage<TransactionFilters>(
    'financas_filters',
    initialState.filters
  );

  const [state, dispatch] = useReducer(transactionReducer, {
    ...initialState,
    filters: storedFilters,
  });

  /**
   * Carrega dados do banco quando o usuário está autenticado
   * Busca transações e categorias da API
   */
  useEffect(() => {
    if (!userId) return;

    const loadData = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        // Busca transações e categorias em paralelo
        const [transactions, categories] = await Promise.all([
          transactionService.getAll(userId),
          categoryService.getAll(userId),
        ]);

        dispatch({ type: 'SET_TRANSACTIONS', payload: transactions });
        dispatch({ type: 'SET_CATEGORIES', payload: categories });
        dispatch({ type: 'SET_ERROR', payload: null });
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Erro ao carregar dados do servidor' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadData();
  }, [userId]);

  /**
   * Adiciona uma nova transação via API
   * Atualiza estado local after sucesso no servidor
   */
  const addTransaction = useCallback(
    async (transaction: Omit<Transaction, 'id'>) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const newTransaction = await transactionService.create(transaction, userId);
        dispatch({ type: 'ADD_TRANSACTION', payload: newTransaction });
      } catch (error) {
        console.error('Erro ao adicionar transação:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Erro ao salvar transação' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    [userId]
  );

  /**
   * Atualiza uma transação existente via API
   */
  const updateTransaction = useCallback(
    async (transaction: Transaction) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const updated = await transactionService.update(transaction);
        dispatch({ type: 'UPDATE_TRANSACTION', payload: updated });
      } catch (error) {
        console.error('Erro ao atualizar transação:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Erro ao atualizar transação' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    []
  );

  /**
   * Remove uma transação via API
   */
  const deleteTransaction = useCallback(
    async (transactionId: string) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        await transactionService.delete(transactionId);
        dispatch({ type: 'DELETE_TRANSACTION', payload: transactionId });
      } catch (error) {
        console.error('Erro ao remover transação:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Erro ao remover transação' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    []
  );

  /**
   * Adiciona uma nova categoria via API
   */
  const addCategory = useCallback(
    async (category: Omit<Category, 'id'>) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const newCategory = await categoryService.create(category, userId);
        dispatch({ type: 'ADD_CATEGORY', payload: newCategory });
      } catch (error) {
        console.error('Erro ao adicionar categoria:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Erro ao salvar categoria' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    [userId]
  );

  /**
   * Remove uma categoria via API
   */
  const deleteCategory = useCallback(
    async (categoryId: string) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        await categoryService.delete(categoryId);
        dispatch({ type: 'DELETE_CATEGORY', payload: categoryId });
      } catch (error) {
        console.error('Erro ao remover categoria:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Erro ao remover categoria' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    []
  );

  /**
   * Atualiza os filtros de transação (salvo no localStorage)
   */
  const setFilters = useCallback(
    (filters: Partial<TransactionFilters>) => {
      dispatch({ type: 'SET_FILTERS', payload: filters });
      setStoredFilters({ ...state.filters, ...filters });
    },
    [state.filters, setStoredFilters]
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
