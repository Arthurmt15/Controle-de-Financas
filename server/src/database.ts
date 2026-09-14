/**
 * @file server/src/database.ts
 * @description Configuração e gerenciamento da conexão com o PostgreSQL (Supabase).
 * Fornece pool de conexões e função para criar tabelas.
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';

// Carrega variáveis de ambiente do arquivo .env
dotenv.config();

/**
 * Pool de conexões com o PostgreSQL
 * Usa a variável de ambiente DATABASE_URL fornecida pelo Supabase
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
  // Configurações para Supabase (Transaction mode - porta 6543)
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

/**
 * Testa a conexão com o banco de dados
 * @returns {Promise<boolean>} true se conectou, false se falhou
 */
export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    console.log('✅ Conectado ao PostgreSQL (Supabase)');
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

    // Tabela de contas recorrentes (geram transações todo mês)
    await client.query(`
      CREATE TABLE IF NOT EXISTS recurring_bills (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        amount DECIMAL(12, 2) NOT NULL,
        type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
        day_of_month INTEGER NOT NULL CHECK (day_of_month BETWEEN 1 AND 31),
        category_id VARCHAR(255) NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
        active BOOLEAN DEFAULT true,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabela de itens Open Finance (conexões com instituições via Pluggy)
    await client.query(`
      CREATE TABLE IF NOT EXISTS openfinance_items (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        pluggy_item_id VARCHAR(255) UNIQUE NOT NULL,
        connector_id INTEGER NOT NULL,
        institution_name VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'CREATED',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabela de compras parceladas
    await client.query(`
      CREATE TABLE IF NOT EXISTS installments (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        description VARCHAR(500) NOT NULL,
        total_amount DECIMAL(12, 2) NOT NULL,
        installment_amount DECIMAL(12, 2) NOT NULL,
        total_installments INTEGER NOT NULL CHECK (total_installments > 0),
        current_installment INTEGER NOT NULL DEFAULT 0 CHECK (current_installment >= 0),
        start_date DATE NOT NULL,
        category_id VARCHAR(255) NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
        notes TEXT,
        source VARCHAR(20) NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'openfinance')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabela de despesas futuras
    await client.query(`
      CREATE TABLE IF NOT EXISTS future_expenses (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        description VARCHAR(500) NOT NULL,
        amount DECIMAL(12, 2) NOT NULL,
        expected_date DATE NOT NULL,
        category_id VARCHAR(255) NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
        notes TEXT,
        status VARCHAR(10) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
      CREATE INDEX IF NOT EXISTS idx_recurring_bills_user_id ON recurring_bills(user_id);
      CREATE INDEX IF NOT EXISTS idx_recurring_bills_active ON recurring_bills(active);
      CREATE INDEX IF NOT EXISTS idx_openfinance_items_user_id ON openfinance_items(user_id);
      CREATE INDEX IF NOT EXISTS idx_openfinance_items_pluggy_id ON openfinance_items(pluggy_item_id);
      CREATE INDEX IF NOT EXISTS idx_installments_user_id ON installments(user_id);
      CREATE INDEX IF NOT EXISTS idx_installments_start_date ON installments(start_date);
      CREATE INDEX IF NOT EXISTS idx_future_expenses_user_id ON future_expenses(user_id);
      CREATE INDEX IF NOT EXISTS idx_future_expenses_expected_date ON future_expenses(expected_date);
      CREATE INDEX IF NOT EXISTS idx_future_expenses_status ON future_expenses(status);
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
