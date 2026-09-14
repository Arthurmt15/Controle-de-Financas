/**
 * @file server/src/index.ts
 * @description Servidor Express principal da API de Controle Financeiro.
 * Configura middlewares de segurança, rotas e inicia o servidor.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { testConnection, createTables } from './database';
import usersRouter from './routes/users';
import transactionsRouter from './routes/transactions';
import categoriesRouter from './routes/categories';
import budgetsRouter from './routes/budgets';
import recurringBillsRouter from './routes/recurringBills';
import installmentsRouter from './routes/installments';
import futureExpensesRouter from './routes/futureExpenses';
import aiRouter from './routes/ai';
import pluggyRouter from './routes/pluggy';

dotenv.config();

/**
 * Valida variáveis de ambiente obrigatórias.
 * Em produção, falha se JWT_SECRET não estiver definido.
 */
function validateEnv(): void {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction && !process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET é obrigatório em produção');
    process.exit(1);
  }

  if (isProduction && !process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL é obrigatório em produção');
    process.exit(1);
  }
}

validateEnv();

const app = express();
const PORT = process.env.PORT || 5000;

/** URL do frontend configurada via variável de ambiente */
const FRONTEND_URL = process.env.FRONTEND_URL || '';

/**
 * Middleware de segurança Helmet
 * Adiciona headers HTTP de segurança (X-Frame-Options, CSP, etc.)
 */
app.use(helmet());

/**
 * Rate limiting global
 * Limita requisições para prevenir abuso
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requisições por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Muitas requisições. Tente novamente em 15 minutos.',
  },
});

/**
 * Rate limiting para rotas sensíveis
 * Mais restritivo: 10 requisições por 15 minutos
 */
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // 10 requisições por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Muitas tentativas. Aguarde 15 minutos.',
  },
});

/**
 * Rate limiting para IA
 * Limite específico para rotas que usam API do Groq (custo por uso)
 */
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 5, // 5 requisições por minuto
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Limite de consultas à IA atingido. Aguarde 1 minuto.',
  },
});

/** Aplica rate limiting global */
app.use(globalLimiter);

/**
 * Middleware de CORS
 * Permite apenas origens específicas da whitelist
 */
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      FRONTEND_URL,
      'https://controle-de-financas-nine.vercel.app',
      'http://localhost:3000',
      'http://localhost:5173',
    ].filter(Boolean);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origem não permitida pelo CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));

/**
 * Rota de health check
 */
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'API de Controle Financeiro está funcionando',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Rotas da API com rate limiting específico
 */
app.use('/api/users', strictLimiter, usersRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/budgets', budgetsRouter);
app.use('/api/recurring-bills', recurringBillsRouter);
app.use('/api/installments', installmentsRouter);
app.use('/api/future-expenses', futureExpensesRouter);
app.use('/api/ai', aiLimiter, aiRouter);
app.use('/api/pluggy', pluggyRouter);

/**
 * Middleware de tratamento de erros globais
 */
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Erro não tratado:', err.message);

  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor',
  });
});

/**
 * Inicializa o servidor
 * 1. Testa conexão com o banco
 * 2. Cria tabelas se necessário
 * 3. Inicia a escuta na porta definida
 */
async function startServer() {
  const connected = await testConnection();
  if (!connected) {
    console.error('Não foi possível conectar ao banco de dados');
    process.exit(1);
  }

  await createTables();

  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
}

startServer().catch((error) => {
  console.error('Erro ao iniciar servidor:', error);
  process.exit(1);
});

export default app;
