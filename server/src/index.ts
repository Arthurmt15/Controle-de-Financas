/**
 * @file server/src/index.ts
 * @description Servidor Express principal da API de Controle Financeiro.
 * Configura middlewares, rotas e inicia o servidor na porta definida.
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection, createTables } from './database';
import usersRouter from './routes/users';
import transactionsRouter from './routes/transactions';
import categoriesRouter from './routes/categories';
import budgetsRouter from './routes/budgets';
import aiRouter from './routes/ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/** URL do frontend configurada via variável de ambiente */
const FRONTEND_URL = process.env.FRONTEND_URL || '';

/**
 * Middleware de CORS
 * Permite requisições do frontend autorizado e localhost
 */
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:5173',
    ].filter(Boolean);

    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Origem não permitida pelo CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());

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
 * Rotas da API (versão v1)
 */
app.use('/api/users', usersRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/budgets', budgetsRouter);
app.use('/api/ai', aiRouter);

/**
 * Middleware de tratamento de erros globais
 */
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Erro não tratado:', err.message);

  // Garante que CORS headers sejam enviados mesmo em erros
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

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
