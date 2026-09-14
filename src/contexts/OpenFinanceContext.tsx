/**
 * @file src/contexts/OpenFinanceContext.tsx
 * @description Context para gerenciar estado do Open Finance Brasil.
 * Fornece dados de contas e transações para toda a aplicação.
 */

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import {
  OpenFinanceState,
  OpenFinanceAction,
} from '../types/openFinance';
import * as openFinanceService from '../services/openFinanceService';

/** Estado inicial do contexto */
const initialState: OpenFinanceState = {
  accounts: [],
  transactions: [],
  items: [],
  loading: false,
  error: null,
  selectedAccountId: null,
};

/**
 * Reducer para gerenciar ações do Open Finance.
 * Atualiza o estado baseado nas ações dispatchadas.
 */
function openFinanceReducer(
  state: OpenFinanceState,
  action: OpenFinanceAction
): OpenFinanceState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_ACCOUNTS':
      return { ...state, accounts: action.payload, loading: false };
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload, loading: false };
    case 'SET_ITEMS':
      return { ...state, items: action.payload };
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload] };
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((i) => i.id !== action.payload),
        accounts: state.accounts.filter((a) => a.itemId !== action.payload),
      };
    case 'SELECT_ACCOUNT':
      return { ...state, selectedAccountId: action.payload, transactions: [] };
    case 'CLEAR_DATA':
      return initialState;
    default:
      return state;
  }
}

/** Tipo do contexto */
interface OpenFinanceContextType extends OpenFinanceState {
  /** Carrega todos os itens do usuário */
  loadItems: () => Promise<void>;
  /** Carrega contas de um item específico */
  loadAccountsByItem: (itemId: string) => Promise<void>;
  /** Carrega todas as contas conectadas */
  loadAllAccounts: () => Promise<void>;
  /** Carrega transações de uma conta */
  loadTransactions: (accountId: string, from?: string, to?: string) => Promise<void>;
  /** Salva um novo item conectado */
  addItem: (pluggyItemId: string, connectorId: number, institutionName: string) => Promise<void>;
  /** Remove um item (desconecta) */
  removeItem: (itemId: string) => Promise<void>;
  /** Seleciona uma conta para ver detalhes */
  selectAccount: (accountId: string | null) => void;
  /** Limpa todos os dados do Open Finance */
  clearData: () => void;
}

/** Context do Open Finance */
const OpenFinanceContext = createContext<OpenFinanceContextType | undefined>(undefined);

/**
 * Provider do Open Finance.
 * Gerencia estado e fornece funções para toda a aplicação.
 */
export function OpenFinanceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(openFinanceReducer, initialState);

  /**
   * Carrega todos os itens conectados do usuário.
   */
  const loadItems = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const items = await openFinanceService.listItems();
      dispatch({ type: 'SET_ITEMS', payload: items });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao carregar conexões' });
    }
  }, []);

  /**
   * Carrega contas de um item específico.
   * @param itemId ID do item no banco local
   */
  const loadAccountsByItem = useCallback(async (itemId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const accounts = await openFinanceService.getAccountsByItem(itemId);
      dispatch({ type: 'SET_ACCOUNTS', payload: accounts });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao carregar contas' });
    }
  }, []);

  /**
   * Carrega todas as contas de todos os itens conectados.
   */
  const loadAllAccounts = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const accounts = await openFinanceService.getAllAccounts();
      dispatch({ type: 'SET_ACCOUNTS', payload: accounts });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao carregar contas' });
    }
  }, []);

  /**
   * Carrega transações de uma conta específica.
   * @param accountId ID da conta na Pluggy
   * @param from Data inicial opcional
   * @param to Data final opcional
   */
  const loadTransactions = useCallback(
    async (accountId: string, from?: string, to?: string) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const transactions = await openFinanceService.getTransactions(accountId, from, to);
        dispatch({ type: 'SET_TRANSACTIONS', payload: transactions });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Erro ao carregar transações' });
      }
    },
    []
  );

  /**
   * Salva um novo item conectado no banco local.
   * @param pluggyItemId ID do item na Pluggy
   * @param connectorId ID do conector
   * @param institutionName Nome da instituição
   */
  const addItem = useCallback(
    async (pluggyItemId: string, connectorId: number, institutionName: string) => {
      try {
        const item = await openFinanceService.saveItem(pluggyItemId, connectorId, institutionName);
        dispatch({ type: 'ADD_ITEM', payload: item });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Erro ao salvar conexão' });
      }
    },
    []
  );

  /**
   * Remove um item do banco local e da Pluggy.
   * @param itemId ID do item no banco local
   */
  const removeItemHandler = useCallback(async (itemId: string) => {
    try {
      await openFinanceService.removeItem(itemId);
      dispatch({ type: 'REMOVE_ITEM', payload: itemId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao remover conexão' });
    }
  }, []);

  /**
   * Seleciona uma conta para ver suas transações.
   * @param accountId ID da conta ou null para deselecionar
   */
  const selectAccount = useCallback((accountId: string | null) => {
    dispatch({ type: 'SELECT_ACCOUNT', payload: accountId });
  }, []);

  /**
   * Limpa todos os dados do Open Finance.
   */
  const clearData = useCallback(() => {
    dispatch({ type: 'CLEAR_DATA' });
  }, []);

  return (
    <OpenFinanceContext.Provider
      value={{
        ...state,
        loadItems,
        loadAccountsByItem,
        loadAllAccounts,
        loadTransactions,
        addItem,
        removeItem: removeItemHandler,
        selectAccount,
        clearData,
      }}
    >
      {children}
    </OpenFinanceContext.Provider>
  );
}

/**
 * Hook para acessar o contexto do Open Finance.
 * Deve ser usado dentro do OpenFinanceProvider.
 * @returns Funções e dados do Open Finance
 */
export function useOpenFinance(): OpenFinanceContextType {
  const context = useContext(OpenFinanceContext);
  if (!context) {
    throw new Error('useOpenFinance deve ser usado dentro de um OpenFinanceProvider');
  }
  return context;
}
