/**
 * @file server/src/database.ts
 * @description Configuração e gerenciamento da conexão com o PostgreSQL (Supabase).
 * Fornece pool de conexões e função para criar tabelas.
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Pool de conexões com o PostgreSQL (Supabase)
 * Porta 5432 = Session mode (transações isoladas)
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

/** Testa a conexão com o banco de dados */
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
 * Cria tabelas necessárias no banco Supabase.
 * Usa UUID para compatibilidade com auth.users do Supabase.
 * FOREIGN KEYs para auth.users não são criados aqui (RLS cuida disso).
 */
export async function createTables(): Promise<void> {
  const client = await pool.connect();
  try {
    // Tabela de categorias (UUID, compatível com Supabase Auth)
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
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
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        description VARCHAR(500) NOT NULL,
        amount DECIMAL(12, 2) NOT NULL,
        type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
        date DATE NOT NULL,
        category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabela de orçamentos mensais
    await client.query(`
      CREATE TABLE IF NOT EXISTS budgets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
        budget_limit DECIMAL(12, 2) NOT NULL,
        month VARCHAR(7) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabela de contas recorrentes
    await client.query(`
      CREATE TABLE IF NOT EXISTS recurring_bills (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        name VARCHAR(255) NOT NULL,
        amount DECIMAL(12, 2) NOT NULL,
        type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
        day_of_month INTEGER NOT NULL CHECK (day_of_month BETWEEN 1 AND 31),
        category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
        active BOOLEAN DEFAULT true,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabela de compras parceladas
    await client.query(`
      CREATE TABLE IF NOT EXISTS installments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        description VARCHAR(500) NOT NULL,
        total_amount DECIMAL(12, 2) NOT NULL,
        installment_amount DECIMAL(12, 2) NOT NULL,
        total_installments INTEGER NOT NULL CHECK (total_installments > 0),
        current_installment INTEGER NOT NULL DEFAULT 0 CHECK (current_installment >= 0),
        start_date DATE NOT NULL,
        category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
        notes TEXT,
        source VARCHAR(20) NOT NULL DEFAULT 'manual' CHECK (source IN ('manual')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabela de dívidas divididas (mesma lógica de parcelados)
    await client.query(`
      CREATE TABLE IF NOT EXISTS debts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        description VARCHAR(500) NOT NULL,
        total_amount DECIMAL(12, 2) NOT NULL,
        installment_amount DECIMAL(12, 2) NOT NULL,
        total_installments INTEGER NOT NULL CHECK (total_installments > 0),
        current_installment INTEGER NOT NULL DEFAULT 0 CHECK (current_installment >= 0),
        start_date DATE NOT NULL,
        category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
        notes TEXT,
        source VARCHAR(20) NOT NULL DEFAULT 'manual' CHECK (source IN ('manual')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabela de reserva de emergência (única por usuário)
    await client.query(`
      CREATE TABLE IF NOT EXISTS emergency_reserves (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL UNIQUE,
        goal_amount DECIMAL(12,2) NOT NULL CHECK (goal_amount >= 0),
        current_amount DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabela de despesas futuras
    await client.query(`
      CREATE TABLE IF NOT EXISTS future_expenses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        description VARCHAR(500) NOT NULL,
        amount DECIMAL(12, 2) NOT NULL,
        expected_date DATE NOT NULL,
        category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
        notes TEXT,
        status VARCHAR(10) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Índices para performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
      CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
      CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
      CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
      CREATE INDEX IF NOT EXISTS idx_budgets_month ON budgets(month);
      CREATE INDEX IF NOT EXISTS idx_recurring_bills_user_id ON recurring_bills(user_id);
      CREATE INDEX IF NOT EXISTS idx_recurring_bills_active ON recurring_bills(active);
      CREATE INDEX IF NOT EXISTS idx_installments_user_id ON installments(user_id);
      CREATE INDEX IF NOT EXISTS idx_debts_user_id ON debts(user_id);
      CREATE INDEX IF NOT EXISTS idx_emergency_reserves_user_id ON emergency_reserves(user_id);
      CREATE INDEX IF NOT EXISTS idx_future_expenses_user_id ON future_expenses(user_id);
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

export default pool;
