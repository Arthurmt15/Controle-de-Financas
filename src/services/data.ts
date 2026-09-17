/**
 * @file services/data.ts
 * @description Facade que mantém API legada mas delega para arquitetura OOP.
 * Princípio OOP: Dependency Inversion - depende de abstrações (FinanceService) não de detalhes.
 * Mantém compatibilidade com contexts existentes enquanto usa classes de domínio.
 */

import { financeService } from '../application/services/FinanceService';
import * as legacyCategory from './supabase/categories';
import * as legacyRecurring from './supabase/recurringBills';
import * as legacyBudget from './supabase/budgets';
import * as legacyFuture from './supabase/futureExpenses';
import * as legacyAuth from './supabase/auth';
import type { Transaction, Category, RecurringBill, Installment, Debt, EmergencyReserve, FutureExpense } from '../types';
import type { Budget } from '../types/dashboard';

// Re-exporta OOP para novos fluxos (parcelado)
export { financeService } from '../application/services/FinanceService';
export { TransactionEntity } from '../domain/entities/TransactionEntity';
export { InstallmentEntity } from '../domain/entities/InstallmentEntity';
export { Money } from '../domain/value-objects/Money';
export { InstallmentPlan } from '../domain/value-objects/InstallmentPlan';

export const transactionService = {
  getAll: (userId: string, page?: number, limit?: number) => financeService.listTransactions(page, limit),
  create: (transaction: Omit<Transaction, 'id'>, userId: string) => financeService.createTransaction(transaction),
  createParcelled: (tx: Omit<Transaction, 'id'>, totalInstallments: number) =>
    financeService.createParcelledTransaction(tx, totalInstallments),
  update: (transaction: Transaction) => financeService.updateTransaction(transaction),
  delete: (id: string) => financeService.deleteTransaction(id),
};

export const categoryService = {
  getAll: (userId: string) => legacyCategory.categoryService.getAll(),
  create: (category: Omit<Category, 'id'>, userId: string) => legacyCategory.categoryService.create(category),
  delete: (id: string) => legacyCategory.categoryService.delete(id),
};

export const recurringBillService = {
  getAll: (userId: string) => legacyRecurring.recurringBillService.getAll(),
  create: (bill: Omit<RecurringBill, 'id'>, userId: string) => legacyRecurring.recurringBillService.create(bill),
  update: (bill: RecurringBill) => legacyRecurring.recurringBillService.update(bill),
  delete: (id: string) => legacyRecurring.recurringBillService.delete(id),
  generate: (userId: string) => legacyRecurring.recurringBillService.generate(),
};

export const budgetService = {
  getAll: (userId: string) => legacyBudget.budgetService.getAll(),
  create: (budget: Omit<Budget, 'id'>, userId: string) => legacyBudget.budgetService.create(budget),
  delete: (id: string) => legacyBudget.budgetService.delete(id),
};

export const installmentService = {
  getAll: (userId: string) => financeService.listInstallments(),
  create: (installment: Omit<Installment, 'id'>, userId: string) => financeService.createInstallment(installment),
  update: (installment: Installment) => financeService.updateInstallment(installment),
  delete: (id: string) => financeService.deleteInstallment(id),
  advance: (id: string) => financeService.advanceInstallment(id),
};

export const debtService = {
  getAll: (userId: string) => financeService.listDebts(),
  create: (debt: Omit<Debt, 'id'>, userId: string) => financeService.createDebt(debt),
  createDivided: (tx: Omit<Transaction, 'id'>, totalInstallments: number) => financeService.createDividedTransaction(tx, totalInstallments),
  createSingle: (tx: Omit<Transaction, 'id'>) => financeService.createDividedTransaction(tx, 1),
  update: (debt: Debt) => financeService.updateDebt(debt),
  delete: (id: string) => financeService.deleteDebt(id),
  advance: (id: string) => financeService.advanceDebt(id),
};

export const emergencyReserveService = {
  get: () => financeService.getEmergencyReserve(),
  getAll: () => financeService.listEmergencyReserves(),
  create: (dto: Omit<EmergencyReserve, 'id'>) => financeService.createEmergencyReserve(dto),
  update: (entity: EmergencyReserve) => financeService.updateEmergencyReserve(entity),
  delete: (id: string) => financeService.deleteEmergencyReserve(id),
  deposit: (amount: number) => financeService.depositEmergencyReserve(amount),
  withdraw: (amount: number) => financeService.withdrawEmergencyReserve(amount),
  setCurrentAmount: (amount: number) => financeService.setEmergencyReserveAmount(amount),
};

export const futureExpenseService = {
  getAll: (userId: string) => legacyFuture.futureExpenseService.getAll(),
  create: (expense: Omit<FutureExpense, 'id'>, userId: string) => legacyFuture.futureExpenseService.create(expense),
  update: (expense: FutureExpense) => legacyFuture.futureExpenseService.update(expense),
  delete: (id: string) => legacyFuture.futureExpenseService.delete(id),
  markAsPaid: (id: string) => legacyFuture.futureExpenseService.markAsPaid(id),
};

export const authService = {
  signInWithGoogle: (..._args: unknown[]) => legacyAuth.authService.signInWithGoogle(),
  signOut: (..._args: unknown[]) => legacyAuth.authService.signOut(),
  getSession: (..._args: unknown[]) => legacyAuth.authService.getSession(),
  getUser: (..._args: unknown[]) => legacyAuth.authService.getUser(),
  onAuthStateChange: (callback: (user: import('../types').User | null) => void) =>
    legacyAuth.authService.onAuthStateChange(callback),
  createOrFind: async (user: { googleId: string; name: string; email: string; avatar?: string }) => {
    const supabaseUser = await legacyAuth.authService.getUser();
    return supabaseUser;
  },
  getCurrentUser: (..._args: unknown[]) => legacyAuth.authService.getUser(),
  setAuthToken: (..._args: unknown[]) => {},
  hasStoredToken: (..._args: unknown[]) => false,
  getTokenFromCookie: (..._args: unknown[]): string | null => null,
};

export const isSupabase = true;
