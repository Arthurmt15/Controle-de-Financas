/**
 * @file services/data.ts
 * @description Camada de abstração que alterna entre backend Express e Supabase
 * baseado na variável REACT_APP_USE_SUPABASE.
 */

import { transactionService as supabaseTransactionService } from './supabase/transactions';
import { categoryService as supabaseCategoryService } from './supabase/categories';
import { recurringBillService as supabaseRecurringBillService } from './supabase/recurringBills';
import { budgetService as supabaseBudgetService } from './supabase/budgets';
import { authService as supabaseAuthService } from './supabase/auth';

import {
  transactionService as apiTransactionService,
  categoryService as apiCategoryService,
  recurringBillService as apiRecurringBillService,
  budgetService as apiBudgetService,
  userService as apiUserService,
} from './api/index';

import type { Transaction, Category, RecurringBill } from '../types';
import type { Budget } from '../types/dashboard';

const USE_SUPABASE = process.env.REACT_APP_USE_SUPABASE === 'true';

export const transactionService = {
  getAll: (userId: string, page?: number, limit?: number) =>
    USE_SUPABASE
      ? supabaseTransactionService.getAll(page, limit)
      : apiTransactionService.getAll(userId, page, limit),
  create: (transaction: Omit<Transaction, 'id'>, userId: string) =>
    USE_SUPABASE
      ? supabaseTransactionService.create(transaction)
      : apiTransactionService.create(transaction, userId),
  update: (transaction: Transaction) =>
    USE_SUPABASE
      ? supabaseTransactionService.update(transaction)
      : apiTransactionService.update(transaction),
  delete: (id: string) =>
    USE_SUPABASE
      ? supabaseTransactionService.delete(id)
      : apiTransactionService.delete(id),
};

export const categoryService = {
  getAll: (userId: string) =>
    USE_SUPABASE
      ? supabaseCategoryService.getAll()
      : apiCategoryService.getAll(userId),
  create: (category: Omit<Category, 'id'>, userId: string) =>
    USE_SUPABASE
      ? supabaseCategoryService.create(category)
      : apiCategoryService.create(category, userId),
  delete: (id: string) =>
    USE_SUPABASE
      ? supabaseCategoryService.delete(id)
      : apiCategoryService.delete(id),
};

export const recurringBillService = {
  getAll: (userId: string) =>
    USE_SUPABASE
      ? supabaseRecurringBillService.getAll()
      : apiRecurringBillService.getAll(userId),
  create: (bill: Omit<RecurringBill, 'id'>, userId: string) =>
    USE_SUPABASE
      ? supabaseRecurringBillService.create(bill)
      : apiRecurringBillService.create(bill, userId),
  update: (bill: RecurringBill) =>
    USE_SUPABASE
      ? supabaseRecurringBillService.update(bill)
      : apiRecurringBillService.update(bill),
  delete: (id: string) =>
    USE_SUPABASE
      ? supabaseRecurringBillService.delete(id)
      : apiRecurringBillService.delete(id),
  generate: (userId: string) =>
    USE_SUPABASE
      ? supabaseRecurringBillService.generate()
      : apiRecurringBillService.generate(userId),
};

export const budgetService = {
  getAll: (userId: string) =>
    USE_SUPABASE
      ? supabaseBudgetService.getAll()
      : apiBudgetService.getAll(userId),
  create: (budget: Omit<Budget, 'id'>, userId: string) =>
    USE_SUPABASE
      ? supabaseBudgetService.create(budget)
      : apiBudgetService.create(budget, userId),
  delete: (id: string) =>
    USE_SUPABASE
      ? supabaseBudgetService.delete(id)
      : apiBudgetService.delete(id),
};

export const authService = {
  async signInWithGoogle() {
    if (USE_SUPABASE) {
      return supabaseAuthService.signInWithGoogle();
    }
    throw new Error('Login local deve ser feito via Google Identity Services');
  },

  async signOut() {
    if (USE_SUPABASE) {
      return supabaseAuthService.signOut();
    }
    localStorage.removeItem('financas_user');
    localStorage.removeItem('financas_token');
  },

  async getSession() {
    if (USE_SUPABASE) {
      return supabaseAuthService.getSession();
    }
    return null;
  },

  async getUser() {
    if (USE_SUPABASE) {
      return supabaseAuthService.getUser();
    }
    const stored = localStorage.getItem('financas_user');
    return stored ? JSON.parse(stored) : null;
  },

  onAuthStateChange(callback: (user: import('../types').User | null) => void) {
    if (USE_SUPABASE) {
      return supabaseAuthService.onAuthStateChange(callback);
    }
    return { data: { subscription: { unsubscribe: () => {} } } };
  },

  async createOrFind(user: { googleId: string; name: string; email: string; avatar?: string }) {
    if (USE_SUPABASE) {
      const supabaseUser = await supabaseAuthService.getUser();
      return supabaseUser;
    }
    return apiUserService.createOrFind(user);
  },

  async getCurrentUser() {
    if (USE_SUPABASE) {
      return supabaseAuthService.getUser();
    }
    return apiUserService.getCurrentUser();
  },

  setAuthToken(token: string | null) {
    if (!USE_SUPABASE) {
      const TOKEN_KEY = 'financas_token';
      const TOKEN_COOKIE_KEY = 'financas_token';
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
        const expires = new Date(Date.now() + 30 * 864e5).toUTCString();
        document.cookie = `${TOKEN_COOKIE_KEY}=${encodeURIComponent(token)}; expires=${expires}; path=/; SameSite=Lax`;
      } else {
        localStorage.removeItem(TOKEN_KEY);
        document.cookie = `${TOKEN_COOKIE_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      }
    }
  },

  hasStoredToken(): boolean {
    if (USE_SUPABASE) return false;
    const TOKEN_KEY = 'financas_token';
    const TOKEN_COOKIE_KEY = 'financas_token';
    return !!(localStorage.getItem(TOKEN_KEY) || document.cookie.match(new RegExp('(^| )' + TOKEN_COOKIE_KEY + '=([^;]+)')));
  },

  getTokenFromCookie(): string | null {
    if (USE_SUPABASE) return null;
    const TOKEN_COOKIE_KEY = 'financas_token';
    const match = document.cookie.match(new RegExp('(^| )' + TOKEN_COOKIE_KEY + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  },
};

export const isSupabase = USE_SUPABASE;
