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

// Carrega variáveis de ambiente
dotenv.config();

// Inicializa o Express
const app = express();
const PORT = process.env.PORT || 5000;

/**
 * Middleware de CORS
 * Permite requisições do frontend em desenvolvimento e produção
 */
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'https://controle-de-financas.vercel.app',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Permite requisições sem origin (ex: ferramentas de API)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true,
}));

/**
 * Middleware para parsear JSON no corpo das requisições
 */
app.use(express.json());

/**
 * Rota de health check
 * Verifica se o servidor está funcionando
 */
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'API de Controle Financeiro está funcionando',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Rotas da API
 * Cada rota é modularizada em seu próprio arquivo
 */
app.use('/api/users', usersRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/budgets', budgetsRouter);

/**
 * Middleware de tratamento de erros globais
 * Captura erros não tratados nas rotas
 */
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Erro não tratado:', err);
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
  // Testa conexão com o PostgreSQL (Railway)
  const connected = await testConnection();
  if (!connected) {
    console.error('❌ Não foi possível conectar ao banco de dados');
    process.exit(1);
  }

  // Cria as tabelas caso não existam
  await createTables();

  // Inicia o servidor HTTP
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  });
}

// Executa a inicialização
startServer().catch((error) => {
  console.error('❌ Erro ao iniciar servidor:', error);
  process.exit(1);
});

export default app;
