/**
 * @file hooks/useTransactions.ts
 * @description Hook principal para gerenciamento de transações financeiras.
 * Coordena CRUD, filtros, métricas e persistência no localStorage.
 */

import { useReducer, useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { transactionReducer } from '../reducers/transactionReducer';
import { generateId } from '../utils/helpers';
import { filterTransactions } from '../utils/transactionFilters';
import { calculateMetrics } from '../utils/transactionMetrics';
import type {
  Transaction,
  Category,
  TransactionFilters,
  TransactionState,
} from '../types';

/**
 * Estado inicial do reducer de transações
 * Contém categorias padrão do sistema
 */
const initialState: TransactionState = {
  transactions: [],
  categories: [
    { id: '1', name: 'Alimentação', color: '#FF6B6B', icon: 'FaUtensils', defaultType: 'expense' },
    { id: '2', name: 'Transporte', color: '#4ECDC4', icon: 'FaCar', defaultType: 'expense' },
    { id: '3', name: 'Moradia', color: '#45B7D1', icon: 'FaHome', defaultType: 'expense' },
    { id: '4', name: 'Lazer', color: '#96CEB4', icon: 'FaGamepad', defaultType: 'expense' },
    { id: '5', name: 'Saúde', color: '#FFEAA7', icon: 'FaHeartbeat', defaultType: 'expense' },
    { id: '6', name: 'Educação', color: '#DDA0DD', icon: 'FaGraduationCap', defaultType: 'expense' },
    { id: '7', name: 'Salário', color: '#00B894', icon: 'FaMoneyBillWave', defaultType: 'income' },
    { id: '8', name: 'Freelance', color: '#6C5CE7', icon: 'FaLaptop', defaultType: 'income' },
    { id: '9', name: 'Investimentos', color: '#FDCB6E', icon: 'FaChartLine', defaultType: 'income' },
    { id: '10', name: 'Outros', color: '#636E72', icon: 'FaEllipsisH', defaultType: 'both' },
  ],
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

/**
 * Hook principal para gerenciamento de transações
 * @returns Objeto com estado, ações e valores computados
 *
 * @example
 * const { transactions, addTransaction, metrics } = useTransactions();
 */
export function useTransactions() {
  // Persistência no localStorage
  const [storedTransactions, setStoredTransactions] = useLocalStorage<Transaction[]>(
    'financas_transactions',
    initialState.transactions
  );
  const [storedCategories, setStoredCategories] = useLocalStorage<Category[]>(
    'financas_categories',
    initialState.categories
  );
  const [storedFilters, setStoredFilters] = useLocalStorage<TransactionFilters>(
    'financas_filters',
    initialState.filters
  );

  // Estado do reducer
  const [state, dispatch] = useReducer(transactionReducer, {
    ...initialState,
    transactions: storedTransactions,
    categories: storedCategories,
    filters: storedFilters,
  });

  /**
   * Adiciona uma nova transação
   * @param {Omit<Transaction, 'id'>} transaction - Dados da transação (sem ID)
   */
  const addTransaction = useCallback(
    (transaction: Omit<Transaction, 'id'>) => {
      const newTransaction: Transaction = {
        ...transaction,
        id: generateId(),
      };
      dispatch({ type: 'ADD_TRANSACTION', payload: newTransaction });
      setStoredTransactions([...state.transactions, newTransaction]);
    },
    [state.transactions, setStoredTransactions]
  );

  /**
   * Atualiza uma transação existente
   * @param {Transaction} transaction - Transação com dados atualizados
   */
  const updateTransaction = useCallback(
    (transaction: Transaction) => {
      dispatch({ type: 'UPDATE_TRANSACTION', payload: transaction });
      const updated = state.transactions.map((t) =>
        t.id === transaction.id ? transaction : t
      );
      setStoredTransactions(updated);
    },
    [state.transactions, setStoredTransactions]
  );

  /**
   * Remove uma transação pelo ID
   * @param {string} transactionId - ID da transação
   */
  const deleteTransaction = useCallback(
    (transactionId: string) => {
      dispatch({ type: 'DELETE_TRANSACTION', payload: transactionId });
      const updated = state.transactions.filter((t) => t.id !== transactionId);
      setStoredTransactions(updated);
    },
    [state.transactions, setStoredTransactions]
  );

  /**
   * Adiciona uma nova categoria
   * @param {Omit<Category, 'id'>} category - Dados da categoria
   */
  const addCategory = useCallback(
    (category: Omit<Category, 'id'>) => {
      const newCategory: Category = { ...category, id: generateId() };
      dispatch({ type: 'ADD_CATEGORY', payload: newCategory });
      setStoredCategories([...state.categories, newCategory]);
    },
    [state.categories, setStoredCategories]
  );

  /**
   * Remove uma categoria pelo ID
   * @param {string} categoryId - ID da categoria
   */
  const deleteCategory = useCallback(
    (categoryId: string) => {
      dispatch({ type: 'DELETE_CATEGORY', payload: categoryId });
      const updated = state.categories.filter((c) => c.id !== categoryId);
      setStoredCategories(updated);
    },
    [state.categories, setStoredCategories]
  );

  /**
   * Atualiza os filtros de transação
   * @param {Partial<TransactionFilters>} filters - Filtros a atualizar
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

  // Transações filtradas (memoizado)
  const filteredTransactions = useMemo(
    () => filterTransactions(state.transactions, state.filters),
    [state.transactions, state.filters]
  );

  // Métricas calculadas (memoizado)
  const metrics = useMemo(
    () => calculateMetrics(state.transactions),
    [state.transactions]
  );

  return {
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
  };
}

export default useTransactions;
