import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const jsonHeaders = { 'Content-Type': 'application/json' };
const pluggyApiUrl = 'https://api.pluggy.ai';

function getCorsHeaders(req: Request) {
  const configuredOrigins =
    Deno.env
      .get('SUPABASE_CORS_ORIGIN')
      ?.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean) ?? [];
  const origin = req.headers.get('origin') ?? '';
  const allowOrigin = configuredOrigins.includes(origin)
    ? origin
    : (configuredOrigins[0] ?? origin);
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  };
}

function response(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...jsonHeaders, ...getCorsHeaders(req) },
  });
}

async function getUser(req: Request) {
  const authorization = req.headers.get('Authorization');
  if (!authorization) return null;

  const client = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: { headers: { Authorization: authorization } },
    }
  );
  const { data } = await client.auth.getUser();
  return data.user;
}

async function getPluggyApiKey() {
  const clientId = Deno.env.get('PLUGGY_CLIENT_ID');
  const clientSecret = Deno.env.get('PLUGGY_CLIENT_SECRET');
  if (!clientId || !clientSecret) throw new Error('Pluggy não configurado');

  const result = await fetch(`${pluggyApiUrl}/auth`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ clientId, clientSecret }),
  });
  if (!result.ok) {
    if (result.status === 401) {
      throw new Error(
        'Credenciais do Pluggy inválidas ou expiradas. Gere um novo Client Secret no painel Pluggy.'
      );
    }
    throw new Error('Não foi possível autenticar no Pluggy');
  }
  const body = await result.json();
  return body.apiKey as string;
}

async function pluggyFetch(path: string, apiKey: string) {
  const result = await fetch(`${pluggyApiUrl}${path}`, { headers: { 'X-API-KEY': apiKey } });
  if (!result.ok) throw new Error(`Falha ao consultar Pluggy: ${result.status}`);
  return result.json();
}

function classifyTransaction(amount: number, description: string, type?: string) {
  if (type?.toUpperCase() === 'TRANSFER' || /\b(pix|ted|doc|transferencia)\b/i.test(description))
    return null;
  if (amount > 0)
    return {
      type: 'income',
      categoryName: /\b(salario|pagamento|provento|rendimento|freelance)\b/i.test(description)
        ? 'Salário'
        : 'Outros',
    };
  if (/\b(ifood|uber\s*eats|rappi|restaurante|mercado|supermercado)\b/i.test(description))
    return { type: 'expense', categoryName: 'Alimentação' };
  if (/\b(uber|99\s*(pop|taxi)?|posto|combustivel|gasolina)\b/i.test(description))
    return { type: 'expense', categoryName: 'Transporte' };
  return { type: 'expense', categoryName: 'Outros' };
}

function normalizeConnectionStatus(status?: string) {
  const normalized = status?.toLowerCase();
  if (normalized === 'updated') return 'updated';
  if (normalized === 'updating') return 'updating';
  if (normalized === 'login_error' || normalized === 'login_required') return 'login_required';
  if (normalized === 'error') return 'error';
  return 'pending';
}

serve(async (req) => {
  if (req.method === 'OPTIONS')
    return new Response(null, { status: 204, headers: getCorsHeaders(req) });
  if (req.method !== 'POST') return response(req, { error: 'Método não permitido' }, 405);

  try {
    const user = await getUser(req);
    if (!user) return response(req, { error: 'Não autenticado' }, 401);

    const { action, itemId, connectionId } = await req.json();
    const admin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    const apiKey = await getPluggyApiKey();

    if (action === 'create_connect_token') {
      const result = await fetch(`${pluggyApiUrl}/connect_token`, {
        method: 'POST',
        headers: { ...jsonHeaders, 'X-API-KEY': apiKey },
        body: JSON.stringify({ options: { clientUserId: user.id } }),
      });
      if (!result.ok) throw new Error('Não foi possível iniciar a conexão bancária');
      return response(req, await result.json());
    }

    if (action === 'disconnect') {
      const { error } = await admin
        .from('bank_connections')
        .delete()
        .eq('id', connectionId)
        .eq('user_id', user.id);
      if (error) throw error;
      return response(req, { ok: true });
    }

    if (action !== 'sync' || (!itemId && !connectionId))
      return response(req, { error: 'Ação inválida' }, 400);

    let requestedItemId = itemId as string | undefined;
    if (!requestedItemId) {
      const { data: existingConnection, error } = await admin
        .from('bank_connections')
        .select('external_item_id')
        .eq('id', connectionId)
        .eq('user_id', user.id)
        .single();
      if (error || !existingConnection)
        return response(req, { error: 'Conta bancária não encontrada' }, 404);
      requestedItemId = existingConnection.external_item_id;
    }

    const item = await pluggyFetch(`/items/${requestedItemId}`, apiKey);
    if (item.clientUserId !== user.id)
      return response(req, { error: 'Conexão bancária inválida' }, 403);
    const { data: connection, error: connectionError } = await admin
      .from('bank_connections')
      .upsert(
        {
          user_id: user.id,
          provider: 'pluggy',
          external_item_id: item.id,
          institution_name: item.connector?.name ?? 'Banco conectado',
          status: normalizeConnectionStatus(item.status),
          last_synced_at: new Date().toISOString(),
          error_message: item.error?.message ?? null,
        },
        { onConflict: 'provider,external_item_id' }
      )
      .select()
      .single();
    if (connectionError) throw connectionError;

    const accounts =
      (await pluggyFetch(`/accounts?itemId=${encodeURIComponent(requestedItemId)}`, apiKey))
        .results ?? [];
    const { data: categories, error: categoryError } = await admin
      .from('categories')
      .select('id, name')
      .eq('user_id', user.id);
    if (categoryError) throw categoryError;

    let imported = 0;
    for (const account of accounts) {
      const { data: savedAccount, error: accountError } = await admin
        .from('bank_accounts')
        .upsert(
          {
            user_id: user.id,
            connection_id: connection.id,
            external_account_id: account.id,
            name: account.name ?? 'Conta bancária',
            type: account.type ?? null,
            balance: account.balance ?? null,
            currency: account.currencyCode ?? 'BRL',
          },
          { onConflict: 'connection_id,external_account_id' }
        )
        .select()
        .single();
      if (accountError) throw accountError;

      const transactions =
        (await pluggyFetch(`/transactions?accountId=${encodeURIComponent(account.id)}`, apiKey))
          .results ?? [];
      for (const transaction of transactions) {
        const classification = classifyTransaction(
          Number(transaction.amount),
          transaction.description ?? transaction.merchant?.name ?? '',
          transaction.type
        );
        if (!classification) continue;
        const categoryId =
          categories.find((category) => category.name === classification.categoryName)?.id ??
          categories.find((category) => category.name === 'Outros')?.id;
        if (!categoryId) throw new Error('Categoria padrão "Outros" não encontrada');

        const { error } = await admin.from('transactions').upsert(
          {
            user_id: user.id,
            description:
              transaction.description ?? transaction.merchant?.name ?? 'Transação bancária',
            amount: Math.abs(Number(transaction.amount)),
            type: classification.type,
            date: transaction.date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
            category_id: categoryId,
            source: 'pluggy',
            external_id: transaction.id,
            bank_account_id: savedAccount.id,
          },
          { onConflict: 'user_id,external_id' }
        );
        if (error) throw error;
        imported += 1;
      }
    }
    return response(req, { connectionId: connection.id, imported });
  } catch (error) {
    console.error(error);
    return response(
      req,
      { error: error instanceof Error ? error.message : 'Erro inesperado' },
      500
    );
  }
});
