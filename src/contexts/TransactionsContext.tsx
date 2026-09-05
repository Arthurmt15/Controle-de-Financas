/**
 * @file contexts/TransactionsContext.tsx
 * @description Contexto compartilhado para transações financeiras.
 * Garante que TransactionForm e TransactionList compartilhem o mesmo estado,
 * permitindo atualização automática ao adicionar/editar/excluir transações.
 */

import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
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

/** Estado inicial do reducer de transações */
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

/** Interface do valor do contexto de transações */
interface TransactionsContextValue extends TransactionState {
  filteredTransactions: Transaction[];
  metrics: ReturnType<typeof calculateMetrics>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (transactionId: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  deleteCategory: (categoryId: string) => void;
  setFilters: (filters: Partial<TransactionFilters>) => void;
  clearFilters: () => void;
}

/** Contexto de transações (undefined por padrão) */
const TransactionsContext = createContext<TransactionsContextValue | undefined>(undefined);

/**
 * Provider de transações
 * Compartilha estado entre todos os componentes que usam useTransactions
 */
export function TransactionsProvider({ children }: { children: React.ReactNode }) {
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

  const [state, dispatch] = useReducer(transactionReducer, {
    ...initialState,
    transactions: storedTransactions,
    categories: storedCategories,
    filters: storedFilters,
  });

  /** Adiciona uma nova transação e persiste no localStorage */
  const addTransaction = useCallback(
    (transaction: Omit<Transaction, 'id'>) => {
      const newTransaction: Transaction = { ...transaction, id: generateId() };
      dispatch({ type: 'ADD_TRANSACTION', payload: newTransaction });
      setStoredTransactions([...state.transactions, newTransaction]);
    },
    [state.transactions, setStoredTransactions]
  );

  /** Atualiza uma transação existente */
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

  /** Remove uma transação pelo ID */
  const deleteTransaction = useCallback(
    (transactionId: string) => {
      dispatch({ type: 'DELETE_TRANSACTION', payload: transactionId });
      const updated = state.transactions.filter((t) => t.id !== transactionId);
      setStoredTransactions(updated);
    },
    [state.transactions, setStoredTransactions]
  );

  /** Adiciona uma nova categoria */
  const addCategory = useCallback(
    (category: Omit<Category, 'id'>) => {
      const newCategory: Category = { ...category, id: generateId() };
      dispatch({ type: 'ADD_CATEGORY', payload: newCategory });
      setStoredCategories([...state.categories, newCategory]);
    },
    [state.categories, setStoredCategories]
  );

  /** Remove uma categoria pelo ID */
  const deleteCategory = useCallback(
    (categoryId: string) => {
      dispatch({ type: 'DELETE_CATEGORY', payload: categoryId });
      const updated = state.categories.filter((c) => c.id !== categoryId);
      setStoredCategories(updated);
    },
    [state.categories, setStoredCategories]
  );

  /** Atualiza os filtros de transação */
  const setFilters = useCallback(
    (filters: Partial<TransactionFilters>) => {
      dispatch({ type: 'SET_FILTERS', payload: filters });
      setStoredFilters({ ...state.filters, ...filters });
    },
    [state.filters, setStoredFilters]
  );

  /** Limpa todos os filtros aplicados */
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

  /** Valor do contexto (memoizado para evitar re-renders desnecessários) */
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
 * Garante que todos os componentes compartilhem o mesmo estado
 */
export function useTransactions(): TransactionsContextValue {
  const context = useContext(TransactionsContext);
  if (!context) {
    throw new Error('useTransactions deve ser usado dentro de um TransactionsProvider');
  }
  return context;
}

export default TransactionsContext;
