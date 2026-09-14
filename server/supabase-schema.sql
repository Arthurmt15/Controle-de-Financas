-- ============================================
-- SQL para criar tabelas no Supabase
-- Cole este código no SQL Editor do Supabase
-- ============================================

-- ============================================
-- TABELAS
-- ============================================

-- Tabela de categorias (personalizadas por usuário)
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(7) NOT NULL,
  icon VARCHAR(100) NOT NULL,
  default_type VARCHAR(10) NOT NULL CHECK (default_type IN ('income', 'expense', 'both')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de transações financeiras
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description VARCHAR(500) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  date DATE NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de orçamentos mensais por categoria
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  "budget_limit" DECIMAL(12, 2) NOT NULL,
  month VARCHAR(7) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de contas recorrentes (geram transações todo mês)
CREATE TABLE IF NOT EXISTS recurring_bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilita RLS em todas as tabelas
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_bills ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS RLS - CATEGORIES
-- ============================================

-- Usuários podem ver apenas suas próprias categorias
CREATE POLICY "Users can view own categories"
  ON categories FOR SELECT
  USING (auth.uid() = user_id);

-- Usuários podem criar categorias para si mesmos
CREATE POLICY "Users can insert own categories"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar suas próprias categorias
CREATE POLICY "Users can update own categories"
  ON categories FOR UPDATE
  USING (auth.uid() = user_id);

-- Usuários podem deletar suas próprias categorias
CREATE POLICY "Users can delete own categories"
  ON categories FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- POLÍTICAS RLS - TRANSACTIONS
-- ============================================

-- Usuários podem ver apenas suas próprias transações
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Usuários podem criar transações para si mesmos
CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar suas próprias transações
CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id);

-- Usuários podem deletar suas próprias transações
CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- POLÍTICAS RLS - BUDGETS
-- ============================================

-- Usuários podem ver apenas seus próprios orçamentos
CREATE POLICY "Users can view own budgets"
  ON budgets FOR SELECT
  USING (auth.uid() = user_id);

-- Usuários podem criar orçamentos para si mesmos
CREATE POLICY "Users can insert own budgets"
  ON budgets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar seus próprios orçamentos
CREATE POLICY "Users can update own budgets"
  ON budgets FOR UPDATE
  USING (auth.uid() = user_id);

-- Usuários podem deletar seus próprios orçamentos
CREATE POLICY "Users can delete own budgets"
  ON budgets FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- POLÍTICAS RLS - RECURRING_BILLS
-- ============================================

-- Usuários podem ver apenas suas próprias contas recorrentes
CREATE POLICY "Users can view own recurring_bills"
  ON recurring_bills FOR SELECT
  USING (auth.uid() = user_id);

-- Usuários podem criar contas recorrentes para si mesmos
CREATE POLICY "Users can insert own recurring_bills"
  ON recurring_bills FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar suas próprias contas recorrentes
CREATE POLICY "Users can update own recurring_bills"
  ON recurring_bills FOR UPDATE
  USING (auth.uid() = user_id);

-- Usuários podem deletar suas próprias contas recorrentes
CREATE POLICY "Users can delete own recurring_bills"
  ON recurring_bills FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_month ON budgets(month);
CREATE INDEX IF NOT EXISTS idx_recurring_bills_user_id ON recurring_bills(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_bills_active ON recurring_bills(active);

-- ============================================
-- TRIGGER PARA CATEGORIAS PADRÃO NO SIGNUP
-- ============================================

-- Função que cria categorias padrão quando um usuário se cadastra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.categories (user_id, name, color, icon, default_type)
  VALUES
    (NEW.id, 'Salário', '#22c55e', 'FaWallet', 'income'),
    (NEW.id, 'Freelance', '#3b82f6', 'FaLaptop', 'income'),
    (NEW.id, 'Investimentos', '#8b5cf6', 'FaChartLine', 'income'),
    (NEW.id, 'Alimentação', '#ef4444', 'FaUtensils', 'expense'),
    (NEW.id, 'Moradia', '#f97316', 'FaHome', 'expense'),
    (NEW.id, 'Transporte', '#eab308', 'FaCar', 'expense'),
    (NEW.id, 'Saúde', '#06b6d4', 'FaHeartbeat', 'expense'),
    (NEW.id, 'Educação', '#84cc16', 'FaGraduationCap', 'expense'),
    (NEW.id, 'Lazer', '#ec4899', 'FaGamepad', 'expense'),
    (NEW.id, 'Outros', '#6b7280', 'FaEllipsisH', 'both');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que executa a função após insert na tabela auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
