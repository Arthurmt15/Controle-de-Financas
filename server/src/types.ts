/**
 * @file server/src/types.ts
 * @description Definições de tipos TypeScript para o backend.
 * Compartilhado entre rotas, banco de dados e middleware.
 */

/** Interface que representa um usuário no banco de dados */
export interface User {
  id: string;
  google_id: string;
  name: string;
  email: string;
  avatar: string | null;
  created_at: Date;
  updated_at: Date;
}

/** Interface que representa uma categoria no banco de dados */
export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  default_type: 'income' | 'expense' | 'both';
  created_at: Date;
}

/** Interface que representa uma transação no banco de dados */
export interface Transaction {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  category_id: string;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

/** Interface que representa um orçamento no banco de dados */
export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  limit: number;
  month: string;
  created_at: Date;
}

/** Interface para requisição autenticada */
export interface AuthRequest extends Express.Request {
  userId?: string;
}

/** Interface de resposta da API */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
