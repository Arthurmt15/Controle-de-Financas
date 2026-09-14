/**
 * @file services/api/index.ts
 * @description Serviço de comunicação com a API backend local (Express).
 */

import type { Transaction, Category, RecurringBill, Installment, FutureExpense } from '../../types';
import type { Budget } from '../../types/dashboard';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const TOKEN_KEY = 'financas_token';
const TOKEN_COOKIE_KEY = 'financas_token';

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) || getCookie(TOKEN_COOKIE_KEY);
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch {
    throw new Error('Falha de conexão com o servidor');
  }

  let data: Record<string, unknown>;
  try {
    data = await response.json();
  } catch {
    throw new Error(`Servidor retornou resposta inválida (status ${response.status})`);
  }

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('financas_user');
      throw new Error('Sessão expirada. Faça login novamente.');
    }
    const errorMsg = (data.details as string) || (data.error as string) || 'Erro na requisição';
    throw new Error(errorMsg);
  }

  return data as T;
}

export async function apiStream(
  endpoint: string,
  body: Record<string, unknown>
): Promise<Response> {
  const url = `${API_BASE}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('financas_user');
      throw new Error('Sessão expirada. Faça login novamente.');
    }
    const data = await response.json().catch(() => ({}));
    const errorMsg = (data.details as string) || (data.error as string) || 'Erro na requisição';
    throw new Error(errorMsg);
  }

  return response;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface TransactionRow {
  id: string;
  description: string;
  amount: number | string;
  type: 'income' | 'expense';
  date: string;
  category_id: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface CategoryRow {
  id: string;
  name: string;
  color: string;
  icon: string;
  default_type: 'income' | 'expense' | 'both';
}

interface BudgetRow {
  id: string;
  category_id: string;
  budget_limit: number | string;
  month: string;
}

function mapTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    description: row.description,
    amount: Number(row.amount),
    type: row.type,
    date: typeof row.date === 'string' ? row.date.split('T')[0] : row.date,
    categoryId: row.category_id,
    notes: row.notes || undefined,
    createdAt: row.created_at,
  };
}

function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    icon: row.icon,
    defaultType: row.default_type,
  };
}

function mapBudget(row: BudgetRow): Budget {
  return {
    id: row.id,
    categoryId: row.category_id,
    limit: Number(row.budget_limit),
    month: row.month,
  };
}

interface RecurringBillRow {
  id: string;
  name: string;
  amount: number | string;
  type: 'income' | 'expense';
  day_of_month: number;
  category_id: string;
  active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function mapRecurringBill(row: RecurringBillRow): RecurringBill {
  return {
    id: row.id,
    name: row.name,
    amount: Number(row.amount),
    type: row.type,
    dayOfMonth: row.day_of_month,
    categoryId: row.category_id,
    active: row.active,
    notes: row.notes || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const transactionService = {
  async getAll(_userId: string, page = 1, limit = 50) {
    const response = await apiRequest<PaginatedResponse<TransactionRow>>(
      `/transactions?page=${page}&limit=${limit}`
    );
    return response.data.map(mapTransaction);
  },

  async create(transaction: Omit<Transaction, 'id'>, _userId: string) {
    const response = await apiRequest<ApiResponse<TransactionRow>>(
      '/transactions',
      { method: 'POST', body: JSON.stringify(transaction) }
    );
    return mapTransaction(response.data);
  },

  async update(transaction: Transaction) {
    const response = await apiRequest<ApiResponse<TransactionRow>>(
      `/transactions/${transaction.id}`,
      { method: 'PUT', body: JSON.stringify(transaction) }
    );
    return mapTransaction(response.data);
  },

  async delete(id: string) {
    await apiRequest(`/transactions/${id}`, { method: 'DELETE' });
  },
};

export const categoryService = {
  async getAll(_userId: string) {
    const response = await apiRequest<ApiResponse<CategoryRow[]>>('/categories');
    return response.data.map(mapCategory);
  },

  async create(category: Omit<Category, 'id'>, _userId: string) {
    const response = await apiRequest<ApiResponse<CategoryRow>>(
      '/categories',
      { method: 'POST', body: JSON.stringify(category) }
    );
    return mapCategory(response.data);
  },

  async delete(id: string) {
    await apiRequest(`/categories/${id}`, { method: 'DELETE' });
  },
};

export const budgetService = {
  async getAll(_userId: string) {
    const response = await apiRequest<ApiResponse<BudgetRow[]>>('/budgets');
    return response.data.map(mapBudget);
  },

  async create(budget: Omit<Budget, 'id'>, _userId: string) {
    const response = await apiRequest<ApiResponse<BudgetRow>>(
      '/budgets',
      { method: 'POST', body: JSON.stringify(budget) }
    );
    return mapBudget(response.data);
  },

  async delete(id: string) {
    await apiRequest(`/budgets/${id}`, { method: 'DELETE' });
  },
};

export const recurringBillService = {
  async getAll(_userId: string) {
    const response = await apiRequest<ApiResponse<RecurringBillRow[]>>('/recurring-bills');
    return response.data.map(mapRecurringBill);
  },

  async create(bill: Omit<RecurringBill, 'id'>, _userId: string) {
    const response = await apiRequest<ApiResponse<RecurringBillRow>>(
      '/recurring-bills',
      {
        method: 'POST',
        body: JSON.stringify({
          name: bill.name,
          amount: bill.amount,
          type: bill.type,
          dayOfMonth: bill.dayOfMonth,
          categoryId: bill.categoryId,
          notes: bill.notes,
        }),
      }
    );
    return mapRecurringBill(response.data);
  },

  async update(bill: RecurringBill) {
    const response = await apiRequest<ApiResponse<RecurringBillRow>>(
      `/recurring-bills/${bill.id}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          name: bill.name,
          amount: bill.amount,
          type: bill.type,
          dayOfMonth: bill.dayOfMonth,
          categoryId: bill.categoryId,
          active: bill.active,
          notes: bill.notes,
        }),
      }
    );
    return mapRecurringBill(response.data);
  },

  async delete(id: string) {
    await apiRequest(`/recurring-bills/${id}`, { method: 'DELETE' });
  },

  async generate(_userId: string) {
    const response = await apiRequest<ApiResponse<TransactionRow[]>>(
      '/recurring-bills/generate',
      { method: 'POST' }
    );
    return response.data.map(mapTransaction);
  },
};

export const userService = {
  async createOrFind(user: { googleId: string; name: string; email: string; avatar?: string }) {
    const response = await apiRequest<ApiResponse<{ id: string; name: string; email: string; avatar: string | null }> & { token: string }>(
      '/users',
      { method: 'POST', body: JSON.stringify(user) }
    );
    return { ...response.data, token: response.token };
  },

  async getCurrentUser() {
    const response = await apiRequest<ApiResponse<{ id: string; name: string; email: string; avatar: string | null }>>('/users/me');
    return response.data;
  },
};

// ============================================
// INSTALLMENTS (PARCELADOS)
// ============================================

/** Interface da linha de parcelado no banco */
interface InstallmentRow {
  id: string;
  description: string;
  total_amount: number | string;
  installment_amount: number | string;
  total_installments: number;
  current_installment: number;
  start_date: string;
  category_id: string;
  notes: string | null;
  source: 'manual' | 'openfinance';
  created_at: string;
  updated_at: string;
}

/** Converte linha do banco para tipo Installment */
function mapInstallment(row: InstallmentRow): Installment {
  return {
    id: row.id,
    description: row.description,
    totalAmount: Number(row.total_amount),
    installmentAmount: Number(row.installment_amount),
    totalInstallments: row.total_installments,
    currentInstallment: row.current_installment,
    startDate: row.start_date,
    categoryId: row.category_id,
    notes: row.notes || undefined,
    source: row.source,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const installmentService = {
  async getAll(_userId: string) {
    const response = await apiRequest<ApiResponse<InstallmentRow[]>>('/installments');
    return response.data.map(mapInstallment);
  },

  async create(installment: Omit<Installment, 'id'>, _userId: string) {
    const response = await apiRequest<ApiResponse<InstallmentRow>>(
      '/installments',
      { method: 'POST', body: JSON.stringify(installment) }
    );
    return mapInstallment(response.data);
  },

  async update(installment: Installment) {
    const response = await apiRequest<ApiResponse<InstallmentRow>>(
      `/installments/${installment.id}`,
      { method: 'PUT', body: JSON.stringify(installment) }
    );
    return mapInstallment(response.data);
  },

  async delete(id: string) {
    await apiRequest(`/installments/${id}`, { method: 'DELETE' });
  },

  async advanceInstallment(id: string) {
    const response = await apiRequest<ApiResponse<InstallmentRow>>(
      `/installments/${id}/advance`,
      { method: 'POST' }
    );
    return mapInstallment(response.data);
  },
};

// ============================================
// FUTURE EXPENSES (GASTOS FUTUROS)
// ============================================

/** Interface da linha de despesa futura no banco */
interface FutureExpenseRow {
  id: string;
  description: string;
  amount: number | string;
  expected_date: string;
  category_id: string;
  notes: string | null;
  status: 'pending' | 'paid' | 'cancelled';
  created_at: string;
  updated_at: string;
}

/** Converte linha do banco para tipo FutureExpense */
function mapFutureExpense(row: FutureExpenseRow): FutureExpense {
  return {
    id: row.id,
    description: row.description,
    amount: Number(row.amount),
    expectedDate: row.expected_date,
    categoryId: row.category_id,
    notes: row.notes || undefined,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const futureExpenseService = {
  async getAll(_userId: string) {
    const response = await apiRequest<ApiResponse<FutureExpenseRow[]>>('/future-expenses');
    return response.data.map(mapFutureExpense);
  },

  async create(expense: Omit<FutureExpense, 'id'>, _userId: string) {
    const response = await apiRequest<ApiResponse<FutureExpenseRow>>(
      '/future-expenses',
      { method: 'POST', body: JSON.stringify(expense) }
    );
    return mapFutureExpense(response.data);
  },

  async update(expense: FutureExpense) {
    const response = await apiRequest<ApiResponse<FutureExpenseRow>>(
      `/future-expenses/${expense.id}`,
      { method: 'PUT', body: JSON.stringify(expense) }
    );
    return mapFutureExpense(response.data);
  },

  async delete(id: string) {
    await apiRequest(`/future-expenses/${id}`, { method: 'DELETE' });
  },

  async markAsPaid(id: string) {
    const response = await apiRequest<ApiResponse<FutureExpenseRow>>(
      `/future-expenses/${id}/pay`,
      { method: 'POST' }
    );
    return mapFutureExpense(response.data);
  },
};
