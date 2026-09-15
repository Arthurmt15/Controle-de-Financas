/**
 * Edge Function: pluggy-proxy
 * Proxy para a API da Pluggy (Open Finance).
 * Gerencia autenticação, contas e transações bancárias.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Headers CORS - restringir ao domínio do Vercel em produção
const ALLOWED_ORIGIN = Deno.env.get("SUPABASE_CORS_ORIGIN") || "*"
const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
}

/** Obtém API key da Pluggy usando Client ID e Secret */
async function getPluggyApiKey(): Promise<string> {
  const res = await fetch(`${Deno.env.get("PLUGGY_API_URL") || "https://api.pluggy.ai"}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clientId: Deno.env.get("PLUGGY_CLIENT_ID"),
      clientSecret: Deno.env.get("PLUGGY_CLIENT_SECRET"),
    }),
  })
  const { apiKey } = await res.json()
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
  // Responde pré-requisição CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    // Verifica autenticação
    const user = await authenticateUser(req)
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Não autenticado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Conecta ao Supabase com permissão do usuário
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    )

    // Analisa a rota e método
    const url = new URL(req.url)
    const path = url.pathname.replace("/functions/v1/pluggy-proxy", "")
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
      const data = await res.json()
      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }
      await ensurePluggy()
      const res = await fetch(`${pluggyApi}/accounts?item_id=${dbItem.pluggy_item_id}`, {
        headers: pluggyHeaders,
      })
      const data = await res.json()
      return new Response(
        JSON.stringify({ success: true, data: data?.results || [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Rota não encontrada
    return new Response(
      JSON.stringify({ error: "Rota não encontrada" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
