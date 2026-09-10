/**
 * @file services/api.ts
 * @description Serviço de comunicação com a API backend (Railway/PostgreSQL).
 * Substitui o uso de localStorage por chamadas HTTP à API.
 */

import type { Transaction, Category, RecurringBill } from '../types';
import type { Budget } from '../types/dashboard';

/** URL base da API (configurada via variável de ambiente) */
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/** Chave do localStorage para o token JWT */
const TOKEN_KEY = 'financas_token';

/** Chave do cookie para o token JWT (backup) */
const TOKEN_COOKIE_KEY = 'financas_token';

/**
 * Define um cookie com valor e expiração em dias
 */
function setCookie(name: string, value: string, days: number): void {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

/**
 * Lê o valor de um cookie pelo nome
 */
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

/**
 * Remove um cookie pelo nome
 */
function removeCookie(name: string): void {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

/** Token JWT para autenticação (restaurado do localStorage ou cookie) */
let authToken: string | null = localStorage.getItem(TOKEN_KEY) || getCookie(TOKEN_COOKIE_KEY);

/**
 * Define o token de autenticação para requisições
 * Salva em localStorage E em cookie (backup para quando cache é limpo)
 * @param token - JWT token
 */
export function setAuthToken(token: string | null): void {
  authToken = token;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    setCookie(TOKEN_COOKIE_KEY, token, 30);
  } else {
    localStorage.removeItem(TOKEN_KEY);
    removeCookie(TOKEN_COOKIE_KEY);
  }
}

/**
 * Verifica se existe um token salvo no localStorage ou cookie
 * @returns true se existe token persistido
 */
export function hasStoredToken(): boolean {
  return !!(localStorage.getItem(TOKEN_KEY) || getCookie(TOKEN_COOKIE_KEY));
}

/**
 * Recupera o token do cookie (usado quando localStorage é limpo)
 */
export function getTokenFromCookie(): string | null {
  return getCookie(TOKEN_COOKIE_KEY);
}

/**
 * Função auxiliar para fazer requisições à API
 * Trata erros e retorna resposta formatada
 * @param endpoint - Caminho do endpoint
 * @param options - Opções do fetch
 * @returns Dados da resposta ou lança erro
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  // Usa token em memória, ou do localStorage, ou do cookie
  const token = authToken || localStorage.getItem(TOKEN_KEY) || getCookie(TOKEN_COOKIE_KEY);
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  let response: Response;
  try {
    response = await fetch(url, config);
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
      setAuthToken(null);
      localStorage.removeItem('financas_user');
      throw new Error('Sessão expirada. Faça login novamente.');
    }
    const errorMsg = (data.details as string) || (data.error as string) || 'Erro na requisição';
    throw new Error(errorMsg);
  }

  return data as T;
}

/**
 * Função para requisições com streaming (SSE)
 * Retorna a Response bruta para leitura do body como stream
 * @param endpoint - Caminho do endpoint
 * @param body - Corpo da requisição
 * @returns Response com body legível como stream
 */
export async function apiStream(
  endpoint: string,
  body: Record<string, unknown>
): Promise<Response> {
  const url = `${API_BASE}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    if (response.status === 401) {
      setAuthToken(null);
      localStorage.removeItem('financas_user');
      throw new Error('Sessão expirada. Faça login novamente.');
    }
    const data = await response.json().catch(() => ({}));
    const errorMsg = (data.details as string) || (data.error as string) || 'Erro na requisição';
    throw new Error(errorMsg);
  }

  return response;
}

/** Interface de resposta da API */
interface ApiResponse<T> {
  success: boolean;
  data: T;
}

/** Interface de resposta com paginação */
interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** Interface de row do banco para transação */
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

/** Interface de row do banco para categoria */
interface CategoryRow {
  id: string;
  name: string;
  color: string;
  icon: string;
  default_type: 'income' | 'expense' | 'both';
}

/** Interface de row do banco para orçamento */
interface BudgetRow {
  id: string;
  category_id: string;
  limit: number | string;
  month: string;
}

/** Interface de usuário retornada pela API */
interface UserData {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

/**
 * Mapeia row do PostgreSQL para Transaction
 * @param row - Row do banco de dados
 * @returns Transaction mapeada
 */
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

/**
 * Mapeia row do PostgreSQL para Category
 * @param row - Row do banco de dados
 * @returns Category mapeada
 */
function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    icon: row.icon,
    defaultType: row.default_type,
  };
}

/**
 * Mapeia row do PostgreSQL para Budget
 * @param row - Row do banco de dados
 * @returns Budget mapeada
 */
function mapBudget(row: BudgetRow): Budget {
  return {
    id: row.id,
    categoryId: row.category_id,
    limit: Number(row.limit),
    month: row.month,
  };
}

/**
 * Serviço de usuários
 */
export const userService = {
  /**
   * Cria ou busca usuário existente
   * @param user - Dados do usuário do Google OAuth
   * @returns Dados do usuário e token JWT
   */
  async createOrFind(user: {
    googleId: string;
    name: string;
    email: string;
    avatar?: string;
  }) {
    const response = await apiRequest<ApiResponse<UserData> & { token: string }>(
      '/users',
      {
        method: 'POST',
        body: JSON.stringify(user),
      }
    );
    setAuthToken(response.token);
    return response.data;
  },

  /**
   * Busca o usuário autenticado atual via JWT
   * Usado para restaurar sessão quando localStorage é limpo mas cookie existe
   */
  async getCurrentUser() {
    const response = await apiRequest<ApiResponse<UserData>>('/users/me');
    return response.data;
  },
};

/**
 * Serviço de transações financeiras
 */
export const transactionService = {
  /**
   * Lista transações do usuário com paginação
   * @param userId - ID do usuário (legado, não usado com auth)
   * @param page - Página atual
   * @param limit - Itens por página
   * @returns Lista de transações
   */
  async getAll(userId: string, page = 1, limit = 50) {
    const response = await apiRequest<PaginatedResponse<TransactionRow>>(
      `/transactions?page=${page}&limit=${limit}`
    );
    return response.data.map(mapTransaction);
  },

  /**
   * Cria uma nova transação
   * @param transaction - Dados da transação (sem ID)
   * @param userId - ID do usuário (legado)
   * @returns Transação criada
   */
  async create(transaction: Omit<Transaction, 'id'>, userId: string) {
    const response = await apiRequest<ApiResponse<TransactionRow>>(
      '/transactions',
      {
        method: 'POST',
        body: JSON.stringify(transaction),
      }
    );
    return mapTransaction(response.data);
  },

  /**
   * Atualiza uma transação existente
   * @param transaction - Transação completa com ID
   * @returns Transação atualizada
   */
  async update(transaction: Transaction) {
    const response = await apiRequest<ApiResponse<TransactionRow>>(
      `/transactions/${transaction.id}`,
      {
        method: 'PUT',
        body: JSON.stringify(transaction),
      }
    );
    return mapTransaction(response.data);
  },

  /**
   * Remove uma transação pelo ID
   * @param id - ID da transação
   */
  async delete(id: string) {
    await apiRequest(`/transactions/${id}`, { method: 'DELETE' });
  },
};

/**
 * Serviço de categorias financeiras
 */
export const categoryService = {
  /**
   * Lista categorias do usuário
   * @param userId - ID do usuário (legado)
   * @returns Lista de categorias
   */
  async getAll(userId: string) {
    const response = await apiRequest<ApiResponse<CategoryRow[]>>(
      '/categories'
    );
    return response.data.map(mapCategory);
  },

  /**
   * Cria uma nova categoria
   * @param category - Dados da categoria (sem ID)
   * @param userId - ID do usuário (legado)
   * @returns Categoria criada
   */
  async create(category: Omit<Category, 'id'>, userId: string) {
    const response = await apiRequest<ApiResponse<CategoryRow>>(
      '/categories',
      {
        method: 'POST',
        body: JSON.stringify(category),
      }
    );
    return mapCategory(response.data);
  },

  /**
   * Remove uma categoria pelo ID
   * @param id - ID da categoria
   */
  async delete(id: string) {
    await apiRequest(`/categories/${id}`, { method: 'DELETE' });
  },
};

/**
 * Serviço de orçamentos mensais
 */
export const budgetService = {
  /**
   * Lista orçamentos do usuário
   * @param userId - ID do usuário (legado)
   * @returns Lista de orçamentos
   */
  async getAll(userId: string) {
    const response = await apiRequest<ApiResponse<BudgetRow[]>>(
      '/budgets'
    );
    return response.data.map(mapBudget);
  },

  /**
   * Cria um novo orçamento
   * @param budget - Dados do orçamento (sem ID)
   * @param userId - ID do usuário (legado)
   * @returns Orçamento criado
   */
  async create(budget: Omit<Budget, 'id'>, userId: string) {
    const response = await apiRequest<ApiResponse<BudgetRow>>(
      '/budgets',
      {
        method: 'POST',
        body: JSON.stringify(budget),
      }
    );
    return mapBudget(response.data);
  },

  /**
   * Remove um orçamento pelo ID
   * @param id - ID do orçamento
   */
  async delete(id: string) {
    await apiRequest(`/budgets/${id}`, { method: 'DELETE' });
  },
};

/**
 * Interface de row do banco para conta recorrente
 */
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

/**
 * Mapeia row do PostgreSQL para RecurringBill
 * @param row - Row do banco de dados
 * @returns RecurringBill mapeada
 */
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

/**
 * Serviço de contas recorrentes
 */
export const recurringBillService = {
  /**
   * Lista contas recorrentes do usuário
   * @param userId - ID do usuário (legado)
   * @returns Lista de contas recorrentes
   */
  async getAll(userId: string) {
    const response = await apiRequest<ApiResponse<RecurringBillRow[]>>(
      '/recurring-bills'
    );
    return response.data.map(mapRecurringBill);
  },

  /**
   * Cria uma nova conta recorrente
   * @param bill - Dados da conta recorrente (sem ID)
   * @param userId - ID do usuário (legado)
   * @returns Conta recorrente criada
   */
  async create(bill: Omit<RecurringBill, 'id'>, userId: string) {
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

  /**
   * Atualiza uma conta recorrente existente
   * @param bill - Conta recorrente completa com ID
   * @returns Conta recorrente atualizada
   */
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

  /**
   * Remove uma conta recorrente pelo ID
   * @param id - ID da conta recorrente
   */
  async delete(id: string) {
    await apiRequest(`/recurring-bills/${id}`, { method: 'DELETE' });
  },

  /**
   * Gera transações automáticas para contas recorrentes do mês
   * @param userId - ID do usuário (legado)
   * @returns Lista de transações criadas
   */
  async generate(userId: string) {
    const response = await apiRequest<ApiResponse<TransactionRow[]>>(
      '/recurring-bills/generate',
      {
        method: 'POST',
      }
    );
    return response.data.map(mapTransaction);
  },
};
