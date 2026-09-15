/**
 * Edge Function: pluggy-proxy
 * Proxy para a API da Pluggy (Open Finance).
 * Gerencia autenticação, contas e transações bancárias.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Headers CORS - restringir ao domínio do Vercel em produção
// NOTA: verify_jwt = false no config.toml é OBRIGATÓRIO para o preflight OPTIONS
// chegar até aqui. Caso contrário o gateway retorna 404 antes da função.
const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("SUPABASE_CORS_ORIGIN") || "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-requested-with",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Max-Age": "86400",
}

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") || Deno.env.get("SUPABASE_CORS_ORIGIN") || "*"
  const allowedOrigin = Deno.env.get("SUPABASE_CORS_ORIGIN")
  // Se ALLOWED_ORIGIN específico, reflete apenas ele; se "*", reflete origin ou "*"
  const allowOrigin = allowedOrigin ? allowedOrigin : origin || "*"
  return {
    ...corsHeaders,
    "Access-Control-Allow-Origin": allowOrigin,
    "Vary": "Origin",
  }
}

/** Obtém API key da Pluggy usando Client ID e Secret */
async function getPluggyApiKey(): Promise<string> {
  const clientId = Deno.env.get("PLUGGY_CLIENT_ID")
  const clientSecret = Deno.env.get("PLUGGY_CLIENT_SECRET")
  if (!clientId || !clientSecret) {
    throw new Error("PLUGGY_CLIENT_ID/PLUGGY_CLIENT_SECRET não configurados nos secrets do Supabase (supabase secrets set).")
  }
  const res = await fetch(`${Deno.env.get("PLUGGY_API_URL") || "https://api.pluggy.ai"}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clientId, clientSecret }),
  })
  const text = await res.text()
  let body: any = {}
  try { body = text ? JSON.parse(text) : {} } catch { body = { raw: text } }
  if (!res.ok) {
    throw new Error(`Pluggy auth falhou (${res.status}): ${body?.error || body?.message || text}`)
  }
  const { apiKey } = body
  if (!apiKey) throw new Error(`Pluggy não retornou apiKey: ${text}`)
  return apiKey
}

/** Verifica autenticação do usuário via Supabase Auth */
async function authenticateUser(req: Request) {
  const authHeader = req.headers.get("Authorization")
  if (!authHeader) return null

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  return user
}

serve(async (req) => {
  // Responde pré-requisição CORS - deve ser ANTES de qualquer auth
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: getCorsHeaders(req) })
  }

  const headers = getCorsHeaders(req)

  try {
    // Verifica autenticação
    const user = await authenticateUser(req)
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Não autenticado" }),
        { status: 401, headers: { ...headers, "Content-Type": "application/json" } }
      )
    }

    // Conecta ao Supabase com permissão do usuário
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    )

    // Analisa a rota e método - suporta local e cloud
    const url = new URL(req.url)
    let path = url.pathname.replace(/^\/functions\/v1\/pluggy-proxy/, "").replace(/^\/pluggy-proxy/, "")
    if (!path) path = "/"
    // Remove trailing slash exceto raiz
    if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1)
    const method = req.method

    // Lazy: obtém API key da Pluggy apenas quando a rota precisa dela
    let pluggyHeaders: Record<string, string> | null = null
    let pluggyApi: string | null = null

    async function ensurePluggy() {
      if (!pluggyHeaders) {
        const apiKey = await getPluggyApiKey()
        pluggyHeaders = { "Content-Type": "application/json", "X-API-KEY": apiKey }
        pluggyApi = Deno.env.get("PLUGGY_API_URL") || "https://api.pluggy.ai"
      }
    }

    // Rota: POST /token - Gera connect token para o widget
    if (path === "/token" && method === "POST") {
      await ensurePluggy()
      const res = await fetch(`${pluggyApi}/connect_token`, {
        method: "POST",
        headers: pluggyHeaders,
        body: JSON.stringify({}),
      })
      const text = await res.text()
      let data: any = {}
      try { data = text ? JSON.parse(text) : {} } catch { data = { raw: text } }
      if (!res.ok) {
        return new Response(
          JSON.stringify({ error: data?.error || data?.message || text || `Pluggy connect_token falhou (${res.status})` }),
          { status: res.status, headers: { ...headers, "Content-Type": "application/json" } }
        )
      }
      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: { ...headers, "Content-Type": "application/json" } }
      )
    }

    // Rota: GET /items - Lista itens conectados do usuário
    if (path === "/items" && method === "GET") {
      const { data: items } = await supabase
        .from("openfinance_items")
        .select("*")
        .eq("user_id", user.id)
      return new Response(
        JSON.stringify({ success: true, data: items || [] }),
        { headers: { ...headers, "Content-Type": "application/json" } }
      )
    }

    // Rota: POST /items - Salva novo item conectado
    if (path === "/items" && method === "POST") {
      const body = await req.json()
      const { data: item, error } = await supabase
        .from("openfinance_items")
        .insert({
          user_id: user.id,
          pluggy_item_id: body.pluggyItemId,
          connector_id: body.connectorId,
          institution_name: body.institutionName,
        })
        .select()
        .single()
      if (error) throw error
      return new Response(
        JSON.stringify({ success: true, data: item }),
        { headers: { ...headers, "Content-Type": "application/json" } }
      )
    }

    // Rota: GET /items/:id/accounts - Lista contas de um item
    const accountsMatch = path.match(/^\/items\/([^/]+)\/accounts$/)
    if (accountsMatch && method === "GET") {
      const itemId = accountsMatch[1]
      const { data: dbItem } = await supabase
        .from("openfinance_items")
        .select("pluggy_item_id")
        .eq("id", itemId)
        .eq("user_id", user.id)
        .single()
      if (!dbItem) {
        return new Response(
          JSON.stringify({ error: "Item não encontrado" }),
          { status: 404, headers: { ...headers, "Content-Type": "application/json" } }
        )
      }
      await ensurePluggy()
      const res = await fetch(`${pluggyApi}/accounts?item_id=${dbItem.pluggy_item_id}`, {
        headers: pluggyHeaders,
      })
      const data = await res.json()
      return new Response(
        JSON.stringify({ success: true, data: data?.results || [] }),
        { headers: { ...headers, "Content-Type": "application/json" } }
      )
    }

    // Rota: GET /accounts/:id/transactions - Lista transações de uma conta
    const txMatch = path.match(/^\/accounts\/([^/]+)\/transactions$/)
    if (txMatch && method === "GET") {
      const accountId = txMatch[1]
      const params = url.searchParams.toString()
      await ensurePluggy()
      const res = await fetch(`${pluggyApi}/transactions?account_id=${accountId}&${params}`, {
        headers: pluggyHeaders,
      })
      const data = await res.json()
      return new Response(
        JSON.stringify({ success: true, data: data?.results || [] }),
        { headers: { ...headers, "Content-Type": "application/json" } }
      )
    }

    // Rota: DELETE /items/:id - Remove um item
    const deleteMatch = path.match(/^\/items\/([^/]+)$/)
    if (deleteMatch && method === "DELETE") {
      const itemId = deleteMatch[1]
      const { data: dbItem } = await supabase
        .from("openfinance_items")
        .select("pluggy_item_id")
        .eq("id", itemId)
        .eq("user_id", user.id)
        .single()
      if (dbItem) {
        await ensurePluggy()
        await fetch(`${pluggyApi}/items/${dbItem.pluggy_item_id}`, {
          method: "DELETE",
          headers: pluggyHeaders,
        })
      }
      await supabase
        .from("openfinance_items")
        .delete()
        .eq("id", itemId)
        .eq("user_id", user.id)
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...headers, "Content-Type": "application/json" } }
      )
    }

    // Rota não encontrada
    return new Response(
      JSON.stringify({ error: "Rota não encontrada" }),
      { status: 404, headers: { ...headers, "Content-Type": "application/json" } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...headers, "Content-Type": "application/json" } }
    )
  }
})
