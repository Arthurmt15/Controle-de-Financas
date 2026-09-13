/**
 * @file server/src/services/pluggyService.ts
 * @description Serviço para comunicação com a API da Pluggy.
 * Gerencia autenticação, requisições e tratamento de erros.
 */

import axios, { AxiosInstance } from 'axios';
import {
  PluggyAccount,
  PluggyTransaction,
  PluggyItem,
  PluggyConnectToken,
} from '../types/pluggy';

/** URL base da API Pluggy */
const PLUGGY_API_URL = process.env.PLUGGY_API_URL || 'https://api.pluggy.ai';

/** Client ID da Pluggy (variável de ambiente) */
const PLUGGY_CLIENT_ID = process.env.PLUGGY_CLIENT_ID || '';

/** Client Secret da Pluggy (variável de ambiente) */
const PLUGGY_CLIENT_SECRET = process.env.PLUGGY_CLIENT_SECRET || '';

/** Instância axios configurada para a API Pluggy */
let apiClient: AxiosInstance | null = null;

/**
 * Obtém ou cria uma instância axios autenticada com a API Pluggy.
 * O token de acesso é renovado automaticamente quando expira.
 * @returns Instância axios configurada com o token de autenticação
 */
async function getApiClient(): Promise<AxiosInstance> {
  if (apiClient) {
    return apiClient;
  }

  const authResponse = await axios.post(`${PLUGGY_API_URL}/auth`, {
    clientId: PLUGGY_CLIENT_ID,
    clientSecret: PLUGGY_CLIENT_SECRET,
  });

  const { apiKey } = authResponse.data;

  apiClient = axios.create({
    baseURL: PLUGGY_API_URL,
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json',
    },
  });

  return apiClient;
}

/**
 * Gera um connect token para autenticar o widget no frontend.
 * O token é válido por curto período e usado apenas para uma sessão.
 * @returns Objeto com o token de conexão e data de expiração
 */
export async function getConnectToken(): Promise<PluggyConnectToken> {
  const client = await getApiClient();
  const response = await client.post('/connect-token');
  return response.data;
}

/**
 * Lista todas as contas de um item (conexão) específico.
 * @param itemId ID do item na Pluggy
 * @returns Array de contas financeiras associadas ao item
 */
export async function getAccountsByItem(itemId: string): Promise<PluggyAccount[]> {
  const client = await getApiClient();
  const response = await client.get(`/items/${itemId}/accounts`);
  return response.data.results || [];
}

/**
 * Lista todas as transações de uma conta específica.
 * @param accountId ID da conta na Pluggy
 * @param options Opções de paginação e filtros
 * @returns Array de transações da conta
 */
export async function getTransactionsByAccount(
  accountId: string,
  options: { from?: string; to?: string; limit?: number } = {}
): Promise<PluggyTransaction[]> {
  const client = await getApiClient();
  const params: Record<string, string | number> = {};

  if (options.from) params.from = options.from;
  if (options.to) params.to = options.to;
  if (options.limit) params.limit = options.limit;

  const response = await client.get(`/accounts/${accountId}/transactions`, { params });
  return response.data.results || [];
}

/**
 * Obtém detalhes de um item específico.
 * @param itemId ID do item na Pluggy
 * @returns Dados do item incluindo status e informações da instituição
 */
export async function getItem(itemId: string): Promise<PluggyItem> {
  const client = await getApiClient();
  const response = await client.get(`/items/${itemId}`);
  return response.data;
}

/**
 * Deleta um item e todas as suas contas e transações associadas.
 * Esta ação é irreversível.
 * @param itemId ID do item a ser removido
 */
export async function deleteItem(itemId: string): Promise<void> {
  const client = await getApiClient();
  await client.delete(`/items/${itemId}`);
  apiClient = null; // Força renovação do token na próxima requisição
}

/**
 * Lista todos os conectores (instituições financeiras) disponíveis.
 * Útil para exibir opções de bancos ao usuário.
 * @returns Array de conectores disponíveis
 */
export async function listConnectors(): Promise<Array<{ id: number; name: string; type: string }>> {
  const client = await getApiClient();
  const response = await client.get('/connectors');
  return response.data.results || [];
}

/**
 * Limpa o cache do cliente API.
 * Útil quando o token expira ou há erro de autenticação.
 */
export function clearApiCache(): void {
  apiClient = null;
}
