/**
 * Edge Function: ai-chat
 * Proxy streaming para a API Groq (IA financeira).
 * Suporta Server-Sent Events (SSE) para resposta em tempo real.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeadersBase = {
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-requested-with',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

const DEFAULT_ALLOWED_ORIGINS = [
  'https://controle-de-financas-nine.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
];

function getCorsHeaders(req: Request): Record<string, string> {
  const allowedOriginEnv = Deno.env.get('SUPABASE_CORS_ORIGIN');
  const requestOrigin = req.headers.get('origin') || '';

  const configuredOrigins = (allowedOriginEnv ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (configuredOrigins.length === 0) {
    console.error('❌ SUPABASE_CORS_ORIGIN não configurado — usando allowlist padrão');
  }

  // Sempre permite apenas origens conhecidas. Nunca ecoa origin arbitrário.
  const allowedOrigins = configuredOrigins.length > 0 ? configuredOrigins : DEFAULT_ALLOWED_ORIGINS;
  const allowOrigin = allowedOrigins.includes(requestOrigin) ? requestOrigin : '';

  return {
    ...corsHeadersBase,
    'Access-Control-Allow-Origin': allowOrigin,
    Vary: 'Origin',
  };
}

async function authenticateUser(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return null;

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Prompt de sistema controlado pelo servidor. As regras NUNCA vêm do cliente,
 * evitando prompt injection e uso indevido da chave Groq como chatbot genérico.
 */
function buildSystemPrompt(financialContext: string): string {
  return `Você é um consultor financeiro pessoal experiente e direto. Analise os dados reais do usuário abaixo para dar conselhos personalizados.

DADOS FINANCEIROS DO USUÁRIO:
${financialContext || 'Nenhum dado financeiro disponível'}

REGRAS:
- Responda SEMPRE em português brasileiro
- Seja direto, prático e objetivo
- Fundamente suas respostas nos dados REAIS do usuário (não invente dados)
- Use valores específicos do usuário quando possível
- Considere: reserva de emergência (6 meses de despesas), regra 50-30-20 (necessidades/desejos/futuro)
- Se não tiver dados suficientes, peça mais informações
- Formatando: use **negrito** para valores e listas para recomendações
- Máximo de 200 palavras por resposta`;
}

interface ClientMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Aceita apenas mensagens de usuário/assistente. Qualquer `role: system`
 * enviado pelo cliente é descartado — o system prompt é definido no servidor.
 */
function sanitizeMessages(raw: unknown): ClientMessage[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter((message) => message && typeof message === 'object')
    .map((message) => message as { role?: unknown; content?: unknown })
    .filter(
      (message) =>
        (message.role === 'user' || message.role === 'assistant') &&
        typeof message.content === 'string'
    )
    .slice(-30)
    .map((message) => ({
      role: message.role as 'user' | 'assistant',
      content: (message.content as string).slice(0, 8000),
    }));
}

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 10;
const rateBuckets = new Map<string, number[]>();

/** Rate limit em memória por usuário/IP (best-effort por instância). */
function isRateLimited(key: string): boolean {
  const now = Date.now();
  const timestamps = (rateBuckets.get(key) ?? []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS
  );

  if (timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    rateBuckets.set(key, timestamps);
    return true;
  }

  timestamps.push(now);
  rateBuckets.set(key, timestamps);
  return false;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: getCorsHeaders(req) });
  }

  const headers = getCorsHeaders(req);

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método não permitido' }), {
      status: 405,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }

  try {
    const user = await authenticateUser(req);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Não autenticado' }), {
        status: 401,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    if (!groqApiKey) {
      return new Response(JSON.stringify({ error: 'Groq não configurado' }), {
        status: 500,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (isRateLimited(`${user.id}:${clientIp}`)) {
      return new Response(
        JSON.stringify({ error: 'Limite de consultas à IA atingido. Aguarde 1 minuto.' }),
        {
          status: 429,
          headers: { ...headers, 'Content-Type': 'application/json' },
        }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return new Response(JSON.stringify({ error: 'Corpo da requisição inválido' }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    const sanitizedMessages = sanitizeMessages(body.messages);
    const messagesSize = JSON.stringify(sanitizedMessages).length;
    if (sanitizedMessages.length === 0 || messagesSize > 30000) {
      return new Response(JSON.stringify({ error: 'Mensagens inválidas ou muito longas' }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    const financialContext =
      typeof body.financialContext === 'string' ? body.financialContext.slice(0, 8000) : '';
    const model = Deno.env.get('GROQ_MODEL') || 'qwen/qwen3.8-27b';

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: buildSystemPrompt(financialContext) },
          ...sanitizedMessages,
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return new Response(JSON.stringify({ error: error.error?.message || 'Erro na API Groq' }), {
        status: response.status,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    // Streaming SSE para o cliente
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith('data: ')) continue;

              const data = trimmed.slice(6);
              if (data === '[DONE]') {
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                continue;
              }

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                }
              } catch {
                // Linha JSON inválida, ignora
              }
            }
          }
        } catch (err) {
          console.error('Erro no streaming:', err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...headers,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    console.error('Erro na função ai-chat:', error);
    return new Response(JSON.stringify({ error: 'Erro interno ao processar a solicitação' }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }
});
