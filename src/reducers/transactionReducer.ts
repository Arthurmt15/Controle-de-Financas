/**
 * @file reducers/transactionReducer.ts
 * @description Reducer para gerenciar o estado das transações financeiras.
 * Implementa o padrão Redux para gerenciamento de estado previsível.
 */

import type { TransactionState, TransactionAction } from '../types';

/**
 * Reducer principal para transações
 * @param {TransactionState} state - Estado atual
 * @param {TransactionAction} action - Ação a ser executada
 * @returns {TransactionState} Novo estado
 *
 * @example
 * // Adicionar transação
 * const newState = transactionReducer(state, {
 *   type: 'ADD_TRANSACTION',
 *   payload: { id: '1', description: 'Almoço', amount: 25, type: 'expense', date: '2026-09-03', categoryId: '1' }
 * });
 */
export function transactionReducer(
  state: TransactionState,
  action: TransactionAction
): TransactionState {
  switch (action.type) {
    // ============================================
    // AÇÕES DE TRANSAÇÕES
    // ============================================

    /**
     * Adiciona uma nova transação ao estado
     */
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [...state.transactions, action.payload],
      };

    /**
     * Atualiza uma transação existente
     */
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map((transaction) =>
          transaction.id === action.payload.id ? action.payload : transaction
        ),
      };

    /**
     * Remove uma transação pelo ID
     */
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(
          (transaction) => transaction.id !== action.payload
        ),
      };

    /**
     * Substitui todas as transações (usado para carregar dados)
     */
    case 'SET_TRANSACTIONS':
      return {
        ...state,
        transactions: action.payload,
      };

    // ============================================
    // AÇÕES DE CATEGORIAS
    // ============================================

    /**
     * Substitui todas as categorias
     */
    case 'SET_CATEGORIES':
      return {
        ...state,
        categories: action.payload,
      };

    /**
     * Adiciona uma nova categoria
     */
    case 'ADD_CATEGORY':
      return {
        ...state,
        categories: [...state.categories, action.payload],
      };

    /**
     * Atualiza uma categoria existente
     */
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map((category) =>
          category.id === action.payload.id ? action.payload : category
        ),
      };

    /**
     * Remove uma categoria pelo ID
     */
    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter(
          (category) => category.id !== action.payload
        ),
      };

    // ============================================
    // AÇÕES DE FILTROS
    // ============================================

    /**
     * Atualiza os filtros de transação
     */
    case 'SET_FILTERS':
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload,
        },
      };

    /**
     * Limpa todos os filtros (reseta para padrão)
     */
    case 'CLEAR_FILTERS':
      return {
        ...state,
        filters: {
          startDate: null,
          endDate: null,
          type: 'both',
          categoryId: null,
          searchTerm: '',
          sortBy: 'date',
          sortOrder: 'desc',
        },
      };

    // ============================================
    // AÇÕES DE ESTADO
    // ============================================

    /**
     * Atualiza o estado de carregamento
     */
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    /**
     * Atualiza a mensagem de erro
     */
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };

    // ============================================
    // CASO PADRÃO
    // ============================================

    /**
     * Retorna o estado inalterado para ações desconhecidas
     */
    default:
      return state;
  }
}

export default transactionReducer;
