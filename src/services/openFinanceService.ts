/**
 * @file src/services/openFinanceService.ts
 * @description Serviço para comunicação com a API do Open Finance via Supabase Edge Functions (pluggy-proxy).
 */

import { supabase } from '../lib/supabase';
import {
  OpenFinanceAccount,
  OpenFinanceTransaction,
  OpenFinanceItem,
  ConnectToken,
} from '../types/openFinance';

/** Interface de resposta da API para tokens */
interface TokenResponse { data: ConnectToken; }

/** Interface de resposta da API para itens */
interface ItemResponse { data: OpenFinanceItem; }

/** Interface de resposta da API para lista de itens */
interface ItemsListResponse { data: OpenFinanceItem[]; }

/** Interface de resposta da API para lista de contas */
interface AccountsListResponse { data: OpenFinanceAccount[]; }

/** Interface de resposta da API para lista de transações */
interface TransactionsListResponse { data: OpenFinanceTransaction[]; }

/**
 * Chama Edge Function do Supabase com autenticação.
 */
async function callEdgeFunction<T>(
  functionName: string,
  subPath: string = '',
  options: RequestInit = {}
): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  const url = `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/${functionName}${subPath}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session?.access_token || ''}`,
    'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY || '',
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `Erro na Edge Function: ${response.status}`);
  }
  
  return response.json();
}

/** Obtém um connect token para autenticar o widget Pluggy Connect. */
export async function getConnectToken(): Promise<ConnectToken> {
  const response = await callEdgeFunction<TokenResponse>('pluggy-proxy', '/token', {
    method: 'POST',
  });
  return response.data;
}

/** Salva um item (conexão) criado pelo widget no banco. */
export async function saveItem(
  pluggyItemId: string,
  connectorId: number,
  institutionName: string
): Promise<OpenFinanceItem> {
  const response = await callEdgeFunction<ItemResponse>('pluggy-proxy', '/items', {
    method: 'POST',
    body: JSON.stringify({ pluggyItemId, connectorId, institutionName }),
  });
  return response.data;
}

/** Lista todos os itens conectados do usuário. */
export async function listItems(): Promise<OpenFinanceItem[]> {
  const response = await callEdgeFunction<ItemsListResponse>('pluggy-proxy', '/items', {
    method: 'GET',
  });
  return response.data;
}

/** Lista as contas de um item específico. */
export async function getAccountsByItem(itemId: string): Promise<OpenFinanceAccount[]> {
  const response = await callEdgeFunction<AccountsListResponse>('pluggy-proxy', `/items/${itemId}/accounts`, {
    method: 'GET',
  });
  return response.data;
}

/** Lista todas as contas de todos os itens do usuário. */
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

/** Lista as transações de uma conta específica. */
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

  const response = await callEdgeFunction<TransactionsListResponse>('pluggy-proxy', `/accounts/${accountId}/transactions?${params.toString()}`, {
    method: 'GET',
  });
  return response.data;
}

/** Remove um item (desconecta uma instituição). */
export async function removeItem(itemId: string): Promise<void> {
  await callEdgeFunction('pluggy-proxy', `/items/${itemId}`, {
    method: 'DELETE',
  });
}
