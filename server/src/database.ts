/**
 * @file server/src/database.ts
 * @description Configuração e gerenciamento da conexão com o PostgreSQL (Railway).
 * Fornece pool de conexões e função para criar tabelas.
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';

// Carrega variáveis de ambiente do arquivo .env
dotenv.config();

/**
 * Pool de conexões com o PostgreSQL
 * Usa a variável de ambiente DATABASE_URL fornecida pelo Railway
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
});

/**
 * Testa a conexão com o banco de dados
 * @returns {Promise<boolean>} true se conectou, false se falhou
 */
export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    console.log('✅ Conectado ao PostgreSQL (Railway)');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar ao PostgreSQL:', error);
    return false;
  }
}

/**
 * Cria todas as tabelas necessárias no banco de dados
 * Executa migrations simples com IF NOT EXISTS
 */
export async function createTables(): Promise<void> {
  const client = await pool.connect();
  try {
    // Tabela de usuários (autenticados via Google OAuth)
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        google_id VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        avatar TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabela de categorias (personalizadas por usuário)
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        color VARCHAR(7) NOT NULL,
        icon VARCHAR(100) NOT NULL,
        default_type VARCHAR(10) NOT NULL CHECK (default_type IN ('income', 'expense', 'both')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabela de transações financeiras
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        description VARCHAR(500) NOT NULL,
        amount DECIMAL(12, 2) NOT NULL,
        type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
        date DATE NOT NULL,
        category_id VARCHAR(255) NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabela de orçamentos mensais por categoria
    await client.query(`
      CREATE TABLE IF NOT EXISTS budgets (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        category_id VARCHAR(255) NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
        "budget_limit" DECIMAL(12, 2) NOT NULL,
        month VARCHAR(7) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Índices para melhor performance nas consultas
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
      CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
      CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
      CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
      CREATE INDEX IF NOT EXISTS idx_budgets_month ON budgets(month);
    `);

    console.log('✅ Tabelas criadas/verificadas com sucesso');
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error);
    throw error;
  } finally {
    client.release();
  }
}

/** Exporta o pool para uso nas rotas */
export default pool;
