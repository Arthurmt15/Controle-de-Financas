/**
 * Edge Function: ai-chat
 * Proxy para a API Groq (IA).
 * Gerencia chat com IA para insights financeiros.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Headers CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
}

/** Verifica autenticação do usuário */
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

    // Obtém API key do Groq
    const groqApiKey = Deno.env.get("GROQ_API_KEY")
    if (!groqApiKey) {
      return new Response(
        JSON.stringify({ error: "Groq não configurado" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Analisa o corpo da requisição
    const { messages, model = "llama3-8b-8192" } = await req.json()

    // Valida mensagem
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Mensagens inválidas" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Chama a API do Groq
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "Você é um assistente financeiro especializado em controle de finanças pessoais. Responda sempre em português brasileiro, de forma clara e objetiva. Foque em dicas práticas e insights sobre gastos, orçamento e economia."
          },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    })

    // Verifica erro da API
    if (!response.ok) {
      const error = await response.json()
      return new Response(
        JSON.stringify({ error: error.error?.message || "Erro na API Groq" }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Retorna resposta da IA
    const data = await response.json()
    return new Response(
      JSON.stringify({ success: true, data: data.choices[0].message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
