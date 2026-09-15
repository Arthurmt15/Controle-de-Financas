-- ============================================
-- MIGRAÇÃO COMPLETA - Controle de Finanças
-- Projeto Supabase: igefdzesaftjrqedssmi
-- Execute no SQL Editor do Supabase Dashboard
-- ============================================

-- ============================================
-- TABELAS
-- ============================================

-- Categorias personalizadas por usuário
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(7) NOT NULL,
  icon VARCHAR(100) NOT NULL,
  default_type VARCHAR(10) NOT NULL CHECK (default_type IN ('income', 'expense', 'both')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transações financeiras
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

-- Orçamentos mensais por categoria
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  budget_limit DECIMAL(12, 2) NOT NULL,
  month VARCHAR(7) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contas recorrentes
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

-- Itens Open Finance (conexões com instituições via Pluggy)
CREATE TABLE IF NOT EXISTS openfinance_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pluggy_item_id VARCHAR(255) UNIQUE NOT NULL,
  connector_id INTEGER NOT NULL,
  institution_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'CREATED',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Compras parceladas
CREATE TABLE IF NOT EXISTS installments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description VARCHAR(500) NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL,
  installment_amount DECIMAL(12, 2) NOT NULL,
  total_installments INTEGER NOT NULL CHECK (total_installments > 0),
  current_installment INTEGER NOT NULL DEFAULT 0 CHECK (current_installment >= 0),
  start_date DATE NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  notes TEXT,
  source VARCHAR(20) NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'openfinance')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Despesas futuras
CREATE TABLE IF NOT EXISTS future_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description VARCHAR(500) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  expected_date DATE NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  notes TEXT,
  status VARCHAR(10) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE openfinance_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE future_expenses ENABLE ROW LEVEL SECURITY;

-- CATEGORIES
CREATE POLICY "Users can view own categories" ON categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own categories" ON categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own categories" ON categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own categories" ON categories FOR DELETE USING (auth.uid() = user_id);

-- TRANSACTIONS
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions" ON transactions FOR DELETE USING (auth.uid() = user_id);

-- BUDGETS
CREATE POLICY "Users can view own budgets" ON budgets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own budgets" ON budgets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own budgets" ON budgets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own budgets" ON budgets FOR DELETE USING (auth.uid() = user_id);

-- RECURRING_BILLS
CREATE POLICY "Users can view own recurring_bills" ON recurring_bills FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own recurring_bills" ON recurring_bills FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own recurring_bills" ON recurring_bills FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own recurring_bills" ON recurring_bills FOR DELETE USING (auth.uid() = user_id);

-- OPENFINANCE_ITEMS
CREATE POLICY "Users can view own openfinance_items" ON openfinance_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own openfinance_items" ON openfinance_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own openfinance_items" ON openfinance_items FOR DELETE USING (auth.uid() = user_id);

-- INSTALLMENTS
CREATE POLICY "Users can view own installments" ON installments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own installments" ON installments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own installments" ON installments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own installments" ON installments FOR DELETE USING (auth.uid() = user_id);

-- FUTURE_EXPENSES
CREATE POLICY "Users can view own future_expenses" ON future_expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own future_expenses" ON future_expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own future_expenses" ON future_expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own future_expenses" ON future_expenses FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- ÍNDICES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_month ON budgets(month);
CREATE INDEX IF NOT EXISTS idx_recurring_bills_user_id ON recurring_bills(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_bills_active ON recurring_bills(active);
CREATE INDEX IF NOT EXISTS idx_openfinance_items_user_id ON openfinance_items(user_id);
CREATE INDEX IF NOT EXISTS idx_installments_user_id ON installments(user_id);
CREATE INDEX IF NOT EXISTS idx_installments_start_date ON installments(start_date);
CREATE INDEX IF NOT EXISTS idx_future_expenses_user_id ON future_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_future_expenses_expected_date ON future_expenses(expected_date);
CREATE INDEX IF NOT EXISTS idx_future_expenses_status ON future_expenses(status);

-- ============================================
-- TRIGGER: CATEGORIAS PADRÃO NO SIGNUP
-- ============================================

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

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
