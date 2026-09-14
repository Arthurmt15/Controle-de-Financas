/**
 * @file src/services/openFinanceService.ts
 * @description Serviço para comunicação com a API do Open Finance (backend).
 * Fornece funções para autenticação, consulta de contas e transações.
 */

import { apiRequest } from './api';
import {
  OpenFinanceAccount,
  OpenFinanceTransaction,
  OpenFinanceItem,
  ConnectToken,
} from '../types/openFinance';

/** Interface de resposta da API para tokens */
interface TokenResponse {
  data: ConnectToken;
}

/** Interface de resposta da API para itens */
interface ItemResponse {
  data: OpenFinanceItem;
}

/** Interface de resposta da API para lista de itens */
interface ItemsListResponse {
  data: OpenFinanceItem[];
}

/** Interface de resposta da API para lista de contas */
interface AccountsListResponse {
  data: OpenFinanceAccount[];
}

/** Interface de resposta da API para lista de transações */
interface TransactionsListResponse {
  data: OpenFinanceTransaction[];
}

/**
 * Obtém um connect token para autenticar o widget Pluggy Connect.
 */
export async function getConnectToken(): Promise<ConnectToken> {
  const response = await apiRequest<TokenResponse>('/pluggy/token', {
    method: 'POST',
  });
  return response.data;
}

/**
 * Salva um item (conexão) criado pelo widget no banco local.
 */
export async function saveItem(
  pluggyItemId: string,
  connectorId: number,
  institutionName: string
): Promise<OpenFinanceItem> {
  const response = await apiRequest<ItemResponse>('/pluggy/items', {
    method: 'POST',
    body: JSON.stringify({ pluggyItemId, connectorId, institutionName }),
  });
  return response.data;
}

/**
 * Lista todos os itens conectados do usuário.
 */
export async function listItems(): Promise<OpenFinanceItem[]> {
  const response = await apiRequest<ItemsListResponse>('/pluggy/items');
  return response.data;
}

/**
 * Lista as contas de um item específico.
 */
export async function getAccountsByItem(itemId: string): Promise<OpenFinanceAccount[]> {
  const response = await apiRequest<AccountsListResponse>(
    `/pluggy/items/${itemId}/accounts`
  );
  return response.data;
}

/**
 * Lista todas as contas de todos os itens do usuário.
 */
export async function getAllAccounts(): Promise<OpenFinanceAccount[]> {
  const items = await listItems();
  const allAccounts: OpenFinanceAccount[] = [];

  for (const item of items) {
    try {
      const accounts = await getAccountsByItem(item.id);
      allAccounts.push(...accounts);
    } catch (error) {
      console.error(`Erro ao listar contas do item ${item.id}:`, error);
    }
  }

  return allAccounts;
}

/**
 * Lista as transações de uma conta específica.
 */
export async function getTransactions(
  accountId: string,
  from?: string,
  to?: string,
  limit: number = 100
): Promise<OpenFinanceTransaction[]> {
  const params = new URLSearchParams();
  if (from) params.append('from', from);
  if (to) params.append('to', to);
  params.append('limit', limit.toString());

  const response = await apiRequest<TransactionsListResponse>(
    `/pluggy/accounts/${accountId}/transactions?${params.toString()}`
  );
  return response.data;
}

/**
 * Remove um item (desconecta uma instituição).
 */
export async function removeItem(itemId: string): Promise<void> {
  await apiRequest(`/pluggy/items/${itemId}`, {
    method: 'DELETE',
  });
}
