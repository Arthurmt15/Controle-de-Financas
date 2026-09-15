/**
 * @file src/services/openFinanceService.ts
 * @description Serviço para Open Finance via Supabase Edge Functions (pluggy-proxy) com fallback.
 */

import { supabase } from '../lib/supabase';
import {
  OpenFinanceAccount,
  OpenFinanceTransaction,
  OpenFinanceItem,
  ConnectToken,
} from '../types/openFinance';

interface TokenResponse { data: ConnectToken; }
interface ItemResponse { data: OpenFinanceItem; }
interface ItemsListResponse { data: OpenFinanceItem[]; }
interface AccountsListResponse { data: OpenFinanceAccount[]; }
interface TransactionsListResponse { data: OpenFinanceTransaction[]; }

async function callEdgeFunction<T>(
  functionName: string,
  subPath: string = '',
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = process.env.REACT_APP_SUPABASE_URL;
  const anonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

  if (!baseUrl || !anonKey) {
    throw new Error('Supabase não configurado (REACT_APP_SUPABASE_URL ausente). Configure as envs na Vercel.');
  }

  // Aguarda sessão ficar pronta (AuthProvider pode estar hidratando)
  let session: any = null;
  for (let i = 0; i < 3; i++) {
    const { data: { session: s } } = await supabase.auth.getSession();
    if (s?.access_token) { session = s; break; }
    // tenta refresh silencioso
    try { const { data: { session: rs } } = await supabase.auth.refreshSession(); if (rs?.access_token) { session = rs; break; } } catch {}
    if (i < 2) await new Promise(r => setTimeout(r, 400));
  }
  if (!session?.access_token) {
    // fallback: pega do localStorage do supabase (sb-...-auth-token)
    try {
      const raw = localStorage.getItem(`sb-${new URL(baseUrl).hostname.split('.')[0]}-auth-token`) || '';
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed?.access_token) session = { access_token: parsed.access_token };
    } catch {}
  }
  const url = `${baseUrl}/functions/v1/${functionName}${subPath}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session?.access_token || ''}`,
    'apikey': anonKey,
    ...(options.headers as Record<string, string>),
  };

  let response: Response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (e: any) {
    throw new Error(`Falha de rede ao chamar ${functionName}: ${e?.message || e}`);
  }

  const bodyText = await response.text();
  let body: any = {};
  try { body = bodyText ? JSON.parse(bodyText) : {}; } catch { body = { raw: bodyText }; }

  if (!response.ok) {
    const msg = body?.error || body?.message || body?.raw || `HTTP ${response.status}`;
    // mensagens amigáveis para casos comuns
    if (response.status === 401) throw new Error(`Não autenticado: ${msg} — faça login novamente.`);
    if (msg?.includes('PLUGGY_CLIENT_ID') || msg?.includes('apiKey')) throw new Error(`Pluggy não configurado: ${msg}. Configure PLUGGY_CLIENT_ID/SECRET nos secrets do Supabase.`);
    throw new Error(msg || `Erro na Edge Function: ${response.status}`);
  }

  return body as T;
}

/** Obtém um connect token para autenticar o widget Pluggy Connect. */
export async function getConnectToken(): Promise<ConnectToken> {
  try {
    const response = await callEdgeFunction<TokenResponse>('pluggy-proxy', '/token', { method: 'POST' });
    // edge retorna { success, data: { accessToken } } — Pluggy retorna { accessToken }
    const token = (response as any)?.data?.accessToken || (response as any)?.accessToken || (response as any)?.data?.data?.accessToken;
    if (!token) {
      const dump = JSON.stringify(response).slice(0, 800);
      console.error('Token vazio, resposta:', dump);
      throw new Error(`Token vazio retornado pelo servidor. Resposta: ${dump}. Verifique se PLUGGY_CLIENT_ID/SECRET estão corretos e se a função foi redeployada.`);
    }
    return { accessToken: token } as ConnectToken;
  } catch (e: any) {
    const demo = (process.env as any).REACT_APP_PLUGGY_DEMO_TOKEN || (process.env as any).REACT_APP_DEMO_PLUGGY_TOKEN;
    if (demo) {
      console.warn('Usando token demo para Open Finance', e?.message);
      return { accessToken: demo } as ConnectToken;
    }
    throw e;
  }
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
  const response = await callEdgeFunction<ItemsListResponse>('pluggy-proxy', '/items', { method: 'GET' });
  return response.data;
}

/** Lista as contas de um item específico. */
export async function getAccountsByItem(itemId: string): Promise<OpenFinanceAccount[]> {
  const response = await callEdgeFunction<AccountsListResponse>('pluggy-proxy', `/items/${itemId}/accounts`, { method: 'GET' });
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
  const response = await callEdgeFunction<TransactionsListResponse>('pluggy-proxy', `/accounts/${accountId}/transactions?${params.toString()}`, { method: 'GET' });
  return response.data;
}

/** Remove um item (desconecta uma instituição). */
export async function removeItem(itemId: string): Promise<void> {
  await callEdgeFunction('pluggy-proxy', `/items/${itemId}`, { method: 'DELETE' });
}
