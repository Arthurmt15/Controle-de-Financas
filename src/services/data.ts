/**
 * @file services/data.ts
 * @description Camada de dados - agora 100% Supabase.
 * Railway/Express foi removido. Todas as operações usam Supabase diretamente.
 */

import { transactionService as supabaseTransactionService } from './supabase/transactions';
import { categoryService as supabaseCategoryService } from './supabase/categories';
import { recurringBillService as supabaseRecurringBillService } from './supabase/recurringBills';
import { budgetService as supabaseBudgetService } from './supabase/budgets';
import { installmentService as supabaseInstallmentService } from './supabase/installments';
import { futureExpenseService as supabaseFutureExpenseService } from './supabase/futureExpenses';
import { authService as supabaseAuthService } from './supabase/auth';

import type { Transaction, Category, RecurringBill, Installment, FutureExpense } from '../types';
import type { Budget } from '../types/dashboard';

export const transactionService = {
  getAll: (userId: string, page?: number, limit?: number) => supabaseTransactionService.getAll(page, limit),
  create: (transaction: Omit<Transaction, 'id'>, userId: string) => supabaseTransactionService.create(transaction),
  update: (transaction: Transaction) => supabaseTransactionService.update(transaction),
  delete: (id: string) => supabaseTransactionService.delete(id),
};

export const categoryService = {
  getAll: (userId: string) => supabaseCategoryService.getAll(),
  create: (category: Omit<Category, 'id'>, userId: string) => supabaseCategoryService.create(category),
  delete: (id: string) => supabaseCategoryService.delete(id),
};

export const recurringBillService = {
  getAll: (userId: string) => supabaseRecurringBillService.getAll(),
  create: (bill: Omit<RecurringBill, 'id'>, userId: string) => supabaseRecurringBillService.create(bill),
  update: (bill: RecurringBill) => supabaseRecurringBillService.update(bill),
  delete: (id: string) => supabaseRecurringBillService.delete(id),
  generate: (userId: string) => supabaseRecurringBillService.generate(),
};

export const budgetService = {
  getAll: (userId: string) => supabaseBudgetService.getAll(),
  create: (budget: Omit<Budget, 'id'>, userId: string) => supabaseBudgetService.create(budget),
  delete: (id: string) => supabaseBudgetService.delete(id),
};

export const installmentService = {
  getAll: (userId: string) => supabaseInstallmentService.getAll(),
  create: (installment: Omit<Installment, 'id'>, userId: string) => supabaseInstallmentService.create(installment),
  update: (installment: Installment) => supabaseInstallmentService.update(installment),
  delete: (id: string) => supabaseInstallmentService.delete(id),
  advance: (id: string) => supabaseInstallmentService.advanceInstallment(id),
};

export const futureExpenseService = {
  getAll: (userId: string) => supabaseFutureExpenseService.getAll(),
  create: (expense: Omit<FutureExpense, 'id'>, userId: string) => supabaseFutureExpenseService.create(expense),
  update: (expense: FutureExpense) => supabaseFutureExpenseService.update(expense),
  delete: (id: string) => supabaseFutureExpenseService.delete(id),
  markAsPaid: (id: string) => supabaseFutureExpenseService.markAsPaid(id),
};

export const authService = {
  signInWithGoogle: (..._args: unknown[]) => supabaseAuthService.signInWithGoogle(),
  signOut: (..._args: unknown[]) => supabaseAuthService.signOut(),
  getSession: (..._args: unknown[]) => supabaseAuthService.getSession(),
  getUser: (..._args: unknown[]) => supabaseAuthService.getUser(),
  onAuthStateChange: (callback: (user: import('../types').User | null) => void) =>
    supabaseAuthService.onAuthStateChange(callback),
  createOrFind: async (user: { googleId: string; name: string; email: string; avatar?: string }) => {
    const supabaseUser = await supabaseAuthService.getUser();
    return supabaseUser;
  },
  getCurrentUser: (..._args: unknown[]) => supabaseAuthService.getUser(),
  setAuthToken: (..._args: unknown[]) => {},
  hasStoredToken: (..._args: unknown[]) => false,
  getTokenFromCookie: (..._args: unknown[]): string | null => null,
};

export const isSupabase = true;
