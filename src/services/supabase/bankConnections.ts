import { supabase } from '../../lib/supabase';
import type { BankConnection } from '../../types';

interface BankConnectionRow {
  id: string;
  institution_name: string | null;
  status: BankConnection['status'];
  last_synced_at: string | null;
  error_message: string | null;
  bank_accounts: Array<{
    id: string;
    name: string;
    type: string | null;
    balance: number | string | null;
    currency: string;
  }> | null;
}

function mapConnection(row: BankConnectionRow): BankConnection {
  return {
    id: row.id,
    institutionName: row.institution_name ?? undefined,
    status: row.status,
    lastSyncedAt: row.last_synced_at ?? undefined,
    errorMessage: row.error_message ?? undefined,
    accounts: (row.bank_accounts ?? []).map((account) => ({
      id: account.id,
      name: account.name,
      type: account.type ?? undefined,
      balance: account.balance == null ? undefined : Number(account.balance),
      currency: account.currency,
    })),
  };
}

async function invoke(action: string, payload: Record<string, string> = {}) {
  const { data, error } = await supabase.functions.invoke('pluggy', { body: { action, ...payload } });
  if (error) {
    const response = (error as { context?: Response }).context;
    if (response) {
      const body = (await response.clone().json().catch(() => null)) as { error?: string } | null;
      if (body?.error) throw new Error(body.error);
    }
    throw error;
  }
  if (data?.error) throw new Error(data.error);
  return data;
}

export const bankConnectionService = {
  async getAll(): Promise<BankConnection[]> {
    const { data, error } = await supabase
      .from('bank_connections')
      .select('id, institution_name, status, last_synced_at, error_message, bank_accounts(id, name, type, balance, currency)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as BankConnectionRow[]).map(mapConnection);
  },

  async createConnectToken(): Promise<string> {
    const data = await invoke('create_connect_token');
    if (!data.accessToken) throw new Error('Token de conexão inválido');
    return data.accessToken;
  },

  sync(itemId: string): Promise<{ connectionId: string; imported: number }> {
    return invoke('sync', { itemId });
  },

  syncConnection(connectionId: string): Promise<{ connectionId: string; imported: number }> {
    return invoke('sync', { connectionId });
  },

  disconnect(connectionId: string): Promise<void> {
    return invoke('disconnect', { connectionId });
  },
};
