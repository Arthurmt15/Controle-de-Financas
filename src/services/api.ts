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

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Erro na requisição à API');
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
    const response = await apiRequest<{ success: boolean; data: Transaction[] }>(
      `/transactions/${userId}`
    );
    return response.data;
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
    const response = await apiRequest<{ success: boolean; data: Transaction }>(
      '/transactions',
      {
        method: 'POST',
        body: JSON.stringify({ ...transaction, userId }),
      }
    );
    return response.data;
  },

  /**
   * Atualiza uma transação existente
   * @param transaction - Transação completa com ID
   * @returns Transação atualizada
   */
  async update(transaction: Transaction) {
    const response = await apiRequest<{ success: boolean; data: Transaction }>(
      `/transactions/${transaction.id}`,
      {
        method: 'PUT',
        body: JSON.stringify(transaction),
      }
    );
    return response.data;
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
    const response = await apiRequest<{ success: boolean; data: Category[] }>(
      `/categories/${userId}`
    );
    return response.data;
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
    const response = await apiRequest<{ success: boolean; data: Budget[] }>(
      `/budgets/${userId}`
    );
    return response.data;
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
