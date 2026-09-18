/**
 * Edge Function: ai-chat
 * Proxy streaming para a API Groq (IA financeira).
 * Suporta Server-Sent Events (SSE) para resposta em tempo real.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeadersBase = {
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-requested-with",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
}

function getCorsHeaders(req: Request): Record<string, string> {
  const allowedOriginEnv = Deno.env.get("SUPABASE_CORS_ORIGIN")
  const requestOrigin = req.headers.get("origin") || ""

  let allowOrigin = ""
  if (allowedOriginEnv) {
    const allowedList = allowedOriginEnv.split(",").map((s) => s.trim()).filter(Boolean)
    if (requestOrigin && allowedList.includes(requestOrigin)) {
      allowOrigin = requestOrigin
    } else {
      // Se request sem origin ou não listado, usa o primeiro permitido (evita "*")
      allowOrigin = allowedList[0] || ""
    }
  } else if (requestOrigin) {
    // Sem env configurado: ecoa origin da requisição (nunca "*")
    allowOrigin = requestOrigin
  }

  return {
    ...corsHeadersBase,
    "Access-Control-Allow-Origin": allowOrigin,
    "Vary": "Origin",
  }
}

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
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: getCorsHeaders(req) })
  }

  const headers = getCorsHeaders(req)

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Método não permitido" }),
      { status: 405, headers: { ...headers, "Content-Type": "application/json" } }
    )
  }

  try {
    const user = await authenticateUser(req)
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Não autenticado" }),
        { status: 401, headers: { ...headers, "Content-Type": "application/json" } }
      )
    }

    const groqApiKey = Deno.env.get("GROQ_API_KEY")
    if (!groqApiKey) {
      return new Response(
        JSON.stringify({ error: "Groq não configurado" }),
        { status: 500, headers: { ...headers, "Content-Type": "application/json" } }
      )
    }

    const { messages, model = "qwen/qwen3.8-27b" } = await req.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Mensagens inválidas" }),
        { status: 400, headers: { ...headers, "Content-Type": "application/json" } }
      )
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      return new Response(
        JSON.stringify({ error: error.error?.message || "Erro na API Groq" }),
        { status: response.status, headers: { ...headers, "Content-Type": "application/json" } }
      )
    }

    // Streaming SSE para o cliente
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader()
        if (!reader) {
          controller.close()
          return
        }

        const decoder = new TextDecoder()
        let buffer = ""

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split("\n")
            buffer = lines.pop() || ""

            for (const line of lines) {
              const trimmed = line.trim()
              if (!trimmed || !trimmed.startsWith("data: ")) continue

              const data = trimmed.slice(6)
              if (data === "[DONE]") {
                controller.enqueue(encoder.encode("data: [DONE]\n\n"))
                continue
              }

              try {
                const parsed = JSON.parse(data)
                const content = parsed.choices?.[0]?.delta?.content
                if (content) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
                  )
                }
              } catch {
                // Linha JSON inválida, ignora
              }
            }
          }
        } catch (err) {
          console.error("Erro no streaming:", err)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        ...headers,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...headers, "Content-Type": "application/json" } }
    )
  }
})
