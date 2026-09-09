/**
 * @file server/src/routes/ai.ts
 * @description Rota de chat com IA via Groq (backend proxy).
 * Recebe contexto financeiro do frontend e retorna resposta da IA com streaming.
 */

import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * POST /api/ai/chat
 * Envia mensagem para IA via Groq com streaming SSE.
 * Requer autenticação JWT.
 */
router.post('/chat', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { message, financialContext, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Mensagem é obrigatória',
      });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'Chave de API da IA não configurada no servidor',
      });
    }

    // Import dinâmico do groq-sdk para não quebrar o startup
    const { default: Groq } = await import('groq-sdk');
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `Você é um consultor financeiro pessoal experiente e direto. Analise os dados reais do usuário abaixo para dar conselhos personalizados.

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
- Máximo de 200 palavras por resposta`,
      },
      ...history.map((m: ChatMessage) => ({
        role: m.role,
        content: m.content,
      })),
      { role: 'user' as const, content: message },
    ];

    // Configura headers para Server-Sent Events
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const stream = await groq.chat.completions.create({
      messages,
      model: 'llama-3.3-70b-versatile',
      stream: true,
      max_tokens: 500,
      temperature: 0.7,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Erro na rota de IA:', error);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Erro ao processar mensagem com IA',
      });
    } else {
      res.write(`data: ${JSON.stringify({ error: 'Erro ao processar mensagem' })}\n\n`);
      res.end();
    }
  }
});

export default router;
