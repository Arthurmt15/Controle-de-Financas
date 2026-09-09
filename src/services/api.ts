/**
 * @file services/api.ts
 * @description Serviço de comunicação com a API backend (Railway/PostgreSQL).
 * Substitui o uso de localStorage por chamadas HTTP à API.
 */

import type { Transaction, Category } from '../types';
import type { Budget } from '../types/dashboard';

/** URL base da API (configurada via variável de ambiente) */
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Função auxiliar para fazer requisições à API
 * Trata erros e retorna resposta formatada
 * @param endpoint - Caminho do endpoint (ex: '/transactions')
 * @param options - Opções do fetch (method, body, etc)
 * @returns Dados da resposta ou lança erro
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  let response: Response;
  try {
    response = await fetch(url, config);
  } catch (fetchError: any) {
    console.error(`❌ Falha de rede ao acessar ${url}:`, fetchError.message);
    throw new Error(`Falha de conexão com o servidor. Verifique sua internet e tente novamente.`);
  }

  let data: any;
  try {
    data = await response.json();
  } catch {
    console.error(`❌ Resposta inválida de ${url} (status ${response.status})`);
    throw new Error(`Servidor retornou uma resposta inválida (status ${response.status}).`);
  }

  if (!response.ok) {
    const errorMsg = data.details || data.error || `Erro na requisição à API (status ${response.status})`;
    console.error(`❌ Erro HTTP ${response.status} em ${url}:`, data);
    throw new Error(errorMsg);
  }

  return data;
}

// ============================================
// SERVIÇO DE USUÁRIOS
// ============================================

/**
 * Serviço de usuários
 * Gerencia criação e busca de usuários autenticados via Google
 */
export const userService = {
  /**
   * Cria ou busca um usuário existente
   * @param user - Dados do usuário do Google OAuth
   * @returns Dados do usuário no banco de dados
   */
  async createOrFind(user: {
    googleId: string;
    name: string;
    email: string;
    avatar?: string;
  }) {
    const response = await apiRequest<{ success: boolean; data: any }>(
      '/users',
      {
        method: 'POST',
        body: JSON.stringify(user),
      }
    );
    return response.data;
  },

  /**
   * Busca um usuário pelo ID
   * @param id - ID do usuário (Google ID)
   * @returns Dados do usuário
   */
  async getById(id: string) {
    const response = await apiRequest<{ success: boolean; data: any }>(
      `/users/${id}`
    );
    return response.data;
  },
};

// ============================================
// SERVIÇO DE TRANSAÇÕES
// ============================================

/** Mapeia snake_case do PostgreSQL para camelCase do TypeScript */
function mapTransaction(row: any): Transaction {
  return {
    id: row.id,
    description: row.description,
    amount: Number(row.amount),
    type: row.type,
    date: typeof row.date === 'string' ? row.date.split('T')[0] : row.date,
    categoryId: row.categoryId ?? row.category_id ?? '',
    notes: row.notes,
    createdAt: row.created_at,
  };
}

/**
 * Serviço de transações financeiras
 * CRUD completo para entradas e saídas
 */
export const transactionService = {
  /**
   * Lista todas as transações de um usuário
   * @param userId - ID do usuário
   * @returns Lista de transações
   */
  async getAll(userId: string) {
    const response = await apiRequest<{ success: boolean; data: any[] }>(
      `/transactions/${userId}`
    );
    return response.data.map(mapTransaction);
  },

  /**
   * Cria uma nova transação
   * @param transaction - Dados da transação (sem ID)
   * @param userId - ID do usuário
   * @returns Transação criada com ID
   */
  async create(
    transaction: Omit<Transaction, 'id'>,
    userId: string
  ) {
    const response = await apiRequest<{ success: boolean; data: any }>(
      '/transactions',
      {
        method: 'POST',
        body: JSON.stringify({ ...transaction, userId }),
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
    const response = await apiRequest<{ success: boolean; data: any }>(
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
    await apiRequest(`/transactions/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// SERVIÇO DE CATEGORIAS
// ============================================

/** Mapeia snake_case do PostgreSQL para camelCase do TypeScript */
function mapCategory(row: any): Category {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    icon: row.icon,
    defaultType: row.defaultType ?? row.default_type ?? 'both',
  };
}

/**
 * Serviço de categorias financeiras
 * CRUD para categorias personalizadas por usuário
 */
export const categoryService = {
  /**
   * Lista todas as categorias de um usuário
   * @param userId - ID do usuário
   * @returns Lista de categorias
   */
  async getAll(userId: string) {
    const response = await apiRequest<{ success: boolean; data: any[] }>(
      `/categories/${userId}`
    );
    return response.data.map(mapCategory);
  },

  /**
   * Cria uma nova categoria
   * @param category - Dados da categoria (sem ID)
   * @param userId - ID do usuário
   * @returns Categoria criada com ID
   */
  async create(
    category: Omit<Category, 'id'>,
    userId: string
  ) {
    const response = await apiRequest<{ success: boolean; data: Category }>(
      '/categories',
      {
        method: 'POST',
        body: JSON.stringify({ ...category, userId }),
      }
    );
    return response.data;
  },

  /**
   * Remove uma categoria pelo ID
   * @param id - ID da categoria
   */
  async delete(id: string) {
    await apiRequest(`/categories/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// SERVIÇO DE ORÇAMENTOS
// ============================================

/** Mapeia snake_case do PostgreSQL para camelCase do TypeScript */
function mapBudget(row: any): Budget {
  return {
    id: row.id,
    categoryId: row.categoryId ?? row.category_id ?? '',
    limit: Number(row.limit ?? row.budget_limit ?? 0),
    month: row.month,
  };
}

/**
 * Serviço de orçamentos mensais
 * Gerencia limites de gasto por categoria
 */
export const budgetService = {
  /**
   * Lista todos os orçamentos de um usuário
   * @param userId - ID do usuário
   * @returns Lista de orçamentos
   */
  async getAll(userId: string) {
    const response = await apiRequest<{ success: boolean; data: any[] }>(
      `/budgets/${userId}`
    );
    return response.data.map(mapBudget);
  },

  /**
   * Cria um novo orçamento
   * @param budget - Dados do orçamento (sem ID)
   * @param userId - ID do usuário
   * @returns Orçamento criado com ID
   */
  async create(
    budget: Omit<Budget, 'id'>,
    userId: string
  ) {
    const response = await apiRequest<{ success: boolean; data: Budget }>(
      '/budgets',
      {
        method: 'POST',
        body: JSON.stringify({ ...budget, userId }),
      }
    );
    return response.data;
  },

  /**
   * Remove um orçamento pelo ID
   * @param id - ID do orçamento
   */
  async delete(id: string) {
    await apiRequest(`/budgets/${id}`, {
      method: 'DELETE',
    });
  },
};
