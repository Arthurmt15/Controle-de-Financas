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

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Obtém um connect token para autenticar o widget Pluggy Connect.
 * O token é válido por curto período e usado apenas para uma sessão.
 * @returns Objeto com o token de conexão
 */
export async function getConnectToken(): Promise<ConnectToken> {
  const response = await apiRequest(`${API_URL}/pluggy/token`, {
    method: 'POST',
  });
  return response.data;
}

/**
 * Salva um item (conexão) criado pelo widget no banco local.
 * Chamado após o sucesso do widget Pluggy Connect.
 * @param pluggyItemId ID do item na Pluggy
 * @param connectorId ID do conector (instituição)
 * @param institutionName Nome da instituição financeira
 * @returns Dados do item salvo
 */
export async function saveItem(
  pluggyItemId: string,
  connectorId: number,
  institutionName: string
): Promise<OpenFinanceItem> {
  const response = await apiRequest(`${API_URL}/pluggy/items`, {
    method: 'POST',
    body: JSON.stringify({ pluggyItemId, connectorId, institutionName }),
  });
  return response.data;
}

/**
 * Lista todos os itens conectados do usuário.
 * @returns Array de itens conectados
 */
export async function listItems(): Promise<OpenFinanceItem[]> {
  const response = await apiRequest(`${API_URL}/pluggy/items`);
  return response.data;
}

/**
 * Lista as contas de um item específico.
 * @param itemId ID do item no banco local
 * @returns Array de contas financeiras
 */
export async function getAccountsByItem(itemId: string): Promise<OpenFinanceAccount[]> {
  const response = await apiRequest(`${API_URL}/pluggy/items/${itemId}/accounts`);
  return response.data;
}

/**
 * Lista todas as contas de todos os itens do usuário.
 * Agrega contas de múltiplas instituições.
 * @returns Array de todas as contas conectadas
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
 * @param accountId ID da conta na Pluggy
 * @param from Data inicial (opcional)
 * @param to Data final (opcional)
 * @param limit Limite de resultados (padrão 100)
 * @returns Array de transações
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

  const response = await apiRequest(
    `${API_URL}/pluggy/accounts/${accountId}/transactions?${params.toString()}`
  );
  return response.data;
}

/**
 * Remove um item (desconecta uma instituição).
 * @param itemId ID do item no banco local
 */
export async function removeItem(itemId: string): Promise<void> {
  await apiRequest(`${API_URL}/pluggy/items/${itemId}`, {
    method: 'DELETE',
  });
}
