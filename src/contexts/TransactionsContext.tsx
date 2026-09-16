/**
 * @file contexts/TransactionsContext.tsx
 * @description Contexto compartilhado para transações financeiras.
 * Suporta backend Express (local) e Supabase (produção).
 */

import React, { createContext, useContext, useReducer, useCallback, useMemo, useEffect, useRef } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from './AuthContext';
import { transactionService, categoryService, recurringBillService } from '../services/data';
import { transactionReducer } from '../reducers/transactionReducer';
import { filterTransactions } from '../utils/transactionFilters';
import { calculateMetrics } from '../utils/transactionMetrics';
import type {
  Transaction,
  Category,
  RecurringBill,
  Installment,
  Debt,
  FutureExpense,
  TransactionFilters,
  TransactionState,
} from '../types';

const initialState: TransactionState = {
  transactions: [],
  categories: [],
  recurringBills: [],
  installments: [],
  debts: [],
  futureExpenses: [],
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

interface TransactionsContextValue extends TransactionState {
  filteredTransactions: Transaction[];
  metrics: ReturnType<typeof calculateMetrics>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<Transaction>;
  updateTransaction: (transaction: Transaction) => Promise<Transaction>;
  deleteTransaction: (transactionId: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<Category>;
  deleteCategory: (categoryId: string) => Promise<void>;
  addRecurringBill: (bill: Omit<RecurringBill, 'id'>) => Promise<RecurringBill>;
  updateRecurringBill: (bill: RecurringBill) => Promise<RecurringBill>;
  deleteRecurringBill: (billId: string) => Promise<void>;
  generateRecurringTransactions: () => Promise<Transaction[]>;
  setFilters: (filters: Partial<TransactionFilters>) => void;
  clearFilters: () => void;
  installments: Installment[];
  debts: Debt[];
  futureExpenses: FutureExpense[];
}

const TransactionsContext = createContext<TransactionsContextValue | undefined>(undefined);

export function TransactionsProvider({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const userId = user?.id || '';

  const loadingCountRef = useRef(0);

  const [storedFilters, setStoredFilters] = useLocalStorage<TransactionFilters>(
    'financas_filters',
    initialState.filters
  );

  const [state, dispatch] = useReducer(transactionReducer, {
    ...initialState,
    filters: storedFilters,
  });

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

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    const loadData = async () => {
      setLoading(true);
      try {
        const [transactions, categories, recurringBills] = await Promise.all([
          transactionService.getAll(userId),
          categoryService.getAll(userId),
          recurringBillService.getAll(userId),
        ]);

        if (!cancelled) {
          dispatch({ type: 'SET_TRANSACTIONS', payload: transactions });
          dispatch({ type: 'SET_CATEGORIES', payload: categories });
          dispatch({ type: 'SET_RECURRING_BILLS', payload: recurringBills });

          if (categories.length === 0) {
            dispatch({ type: 'SET_ERROR', payload: 'Nenhuma categoria encontrada' });
          } else {
            dispatch({ type: 'SET_ERROR', payload: null });
          }
        }
      } catch (error) {
        if (!cancelled) {
          if (error instanceof Error &&
              (error.message.includes('Sessão expirada') ||
               error.message.includes('Autenticação necessária') ||
               error.message.includes('Faça login novamente') ||
               error.message.includes('Não autenticado'))) {
            logout();
            return;
          }
          console.error('Erro ao carregar dados:', error);
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

  const addTransaction = useCallback(
    async (transaction: Omit<Transaction, 'id'>) => {
      setLoading(true);
      try {
        const newTransaction = await transactionService.create(transaction, userId);
        dispatch({ type: 'ADD_TRANSACTION', payload: newTransaction });
        return newTransaction;
      } catch (error) {
        if (error instanceof Error &&
            (error.message.includes('Sessão expirada') || error.message.includes('Faça login') || error.message.includes('Não autenticado'))) {
          logout();
          throw error;
        }
        dispatch({ type: 'SET_ERROR', payload: 'Erro ao salvar transação' });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [userId, setLoading, logout]
  );

  const updateTransaction = useCallback(
    async (transaction: Transaction) => {
      setLoading(true);
      try {
        const updated = await transactionService.update(transaction);
        dispatch({ type: 'UPDATE_TRANSACTION', payload: updated });
        return updated;
      } catch (error) {
        if (error instanceof Error &&
            (error.message.includes('Sessão expirada') || error.message.includes('Faça login') || error.message.includes('Não autenticado'))) {
          logout();
          throw error;
        }
        dispatch({ type: 'SET_ERROR', payload: 'Erro ao atualizar transação' });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, logout]
  );

  const deleteTransaction = useCallback(
    async (transactionId: string) => {
      setLoading(true);
      try {
        await transactionService.delete(transactionId);
        dispatch({ type: 'DELETE_TRANSACTION', payload: transactionId });
      } catch (error) {
        if (error instanceof Error &&
            (error.message.includes('Sessão expirada') || error.message.includes('Faça login') || error.message.includes('Não autenticado'))) {
          logout();
          throw error;
        }
        dispatch({ type: 'SET_ERROR', payload: 'Erro ao remover transação' });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, logout]
  );

  const addCategory = useCallback(
    async (category: Omit<Category, 'id'>) => {
      setLoading(true);
      try {
        const newCategory = await categoryService.create(category, userId);
        dispatch({ type: 'ADD_CATEGORY', payload: newCategory });
        return newCategory;
      } catch (error) {
        if (error instanceof Error &&
            (error.message.includes('Sessão expirada') || error.message.includes('Faça login') || error.message.includes('Não autenticado'))) {
          logout();
          throw error;
        }
        dispatch({ type: 'SET_ERROR', payload: 'Erro ao salvar categoria' });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [userId, setLoading, logout]
  );

  const deleteCategory = useCallback(
    async (categoryId: string) => {
      setLoading(true);
      try {
        await categoryService.delete(categoryId);
        dispatch({ type: 'DELETE_CATEGORY', payload: categoryId });
      } catch (error) {
        if (error instanceof Error &&
            (error.message.includes('Sessão expirada') || error.message.includes('Faça login') || error.message.includes('Não autenticado'))) {
          logout();
          throw error;
        }
        dispatch({ type: 'SET_ERROR', payload: 'Erro ao remover categoria' });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, logout]
  );

  const addRecurringBill = useCallback(
    async (bill: Omit<RecurringBill, 'id'>) => {
      setLoading(true);
      try {
        const newBill = await recurringBillService.create(bill, userId);
        dispatch({ type: 'ADD_RECURRING_BILL', payload: newBill });
        return newBill;
      } catch (error) {
        if (error instanceof Error &&
            (error.message.includes('Sessão expirada') || error.message.includes('Faça login') || error.message.includes('Não autenticado'))) {
          logout();
          throw error;
        }
        dispatch({ type: 'SET_ERROR', payload: 'Erro ao salvar conta recorrente' });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [userId, setLoading, logout]
  );

  const updateRecurringBill = useCallback(
    async (bill: RecurringBill) => {
      setLoading(true);
      try {
        const updated = await recurringBillService.update(bill);
        dispatch({ type: 'UPDATE_RECURRING_BILL', payload: updated });
        return updated;
      } catch (error) {
        if (error instanceof Error &&
            (error.message.includes('Sessão expirada') || error.message.includes('Faça login') || error.message.includes('Não autenticado'))) {
          logout();
          throw error;
        }
        dispatch({ type: 'SET_ERROR', payload: 'Erro ao atualizar conta recorrente' });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, logout]
  );

  const deleteRecurringBill = useCallback(
    async (billId: string) => {
      setLoading(true);
      try {
        await recurringBillService.delete(billId);
        dispatch({ type: 'DELETE_RECURRING_BILL', payload: billId });
      } catch (error) {
        if (error instanceof Error &&
            (error.message.includes('Sessão expirada') || error.message.includes('Faça login') || error.message.includes('Não autenticado'))) {
          logout();
          throw error;
        }
        dispatch({ type: 'SET_ERROR', payload: 'Erro ao remover conta recorrente' });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, logout]
  );

  const generateRecurringTransactions = useCallback(
    async () => {
      setLoading(true);
      try {
        const newTransactions = await recurringBillService.generate(userId);
        for (const tx of newTransactions) {
          dispatch({ type: 'ADD_TRANSACTION', payload: tx });
        }
        return newTransactions;
      } catch (error) {
        if (error instanceof Error &&
            (error.message.includes('Sessão expirada') || error.message.includes('Faça login') || error.message.includes('Não autenticado'))) {
          logout();
          throw error;
        }
        dispatch({ type: 'SET_ERROR', payload: 'Erro ao gerar transações automáticas' });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [userId, setLoading, logout]
  );

  const setFilters = useCallback(
    (filters: Partial<TransactionFilters>) => {
      dispatch({ type: 'SET_FILTERS', payload: filters });
      setStoredFilters((prev: TransactionFilters) => ({ ...prev, ...filters }));
    },
    [setStoredFilters]
  );

  const clearFilters = useCallback(() => {
    dispatch({ type: 'CLEAR_FILTERS' });
    setStoredFilters(initialState.filters);
  }, [setStoredFilters]);

  const filteredTransactions = useMemo(
    () => filterTransactions(state.transactions, state.filters),
    [state.transactions, state.filters]
  );

  const metrics = useMemo(
    () => calculateMetrics(state.transactions),
    [state.transactions]
  );

  const value = useMemo<TransactionsContextValue>(
    () => ({
      transactions: state.transactions,
      categories: state.categories,
      recurringBills: state.recurringBills,
      installments: state.installments,
      debts: state.debts,
      futureExpenses: state.futureExpenses,
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
      addRecurringBill,
      updateRecurringBill,
      deleteRecurringBill,
      generateRecurringTransactions,
      setFilters,
      clearFilters,
    }),
    [
      state.transactions, state.categories, state.recurringBills,
      state.installments, state.debts, state.futureExpenses, state.filters,
      state.isLoading, state.error,
      filteredTransactions, metrics,
      addTransaction, updateTransaction, deleteTransaction,
      addCategory, deleteCategory,
      addRecurringBill, updateRecurringBill, deleteRecurringBill,
      generateRecurringTransactions,
      setFilters, clearFilters,
    ]
  );

  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  );
}

export function useTransactions(): TransactionsContextValue {
  const context = useContext(TransactionsContext);
  if (!context) {
    throw new Error('useTransactions deve ser usado dentro de um TransactionsProvider');
  }
  return context;
}

export default TransactionsContext;
