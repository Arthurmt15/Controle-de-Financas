"use strict";
/**
 * @file server/src/routes/ai.ts
 * @description Rota de chat com IA via Groq (backend proxy).
 * Recebe contexto financeiro do frontend e retorna resposta da IA com streaming.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * POST /api/ai/chat
 * Envia mensagem para IA via Groq com streaming SSE.
 * Requer autenticação JWT.
 */
router.post('/chat', auth_1.authenticate, async (req, res) => {
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
        const { default: Groq } = await Promise.resolve().then(() => __importStar(require('groq-sdk')));
        const groq = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });
        const messages = [
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
            ...history.map((m) => ({
                role: m.role,
                content: m.content,
            })),
            { role: 'user', content: message },
        ];
        // Configura headers para Server-Sent Events
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        const stream = await groq.chat.completions.create({
            messages,
            model: 'qwen/qwen3.8-27b',
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
    }
    catch (error) {
        console.error('Erro na rota de IA:', error);
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                error: 'Erro ao processar mensagem com IA',
            });
        }
        else {
            res.write(`data: ${JSON.stringify({ error: 'Erro ao processar mensagem' })}\n\n`);
            res.end();
        }
    }
});
exports.default = router;
//# sourceMappingURL=ai.js.map