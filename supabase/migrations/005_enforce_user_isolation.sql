-- ============================================
-- MIGRAÇÃO 005 - Isolamento total por usuário
-- Endurece o RLS de todas as tabelas de dados.
-- Idempotente: pode ser executada mais de uma vez.
-- ============================================

-- 1) Habilita RLS e força a aplicação das policies (inclusive para o owner)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.future_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_reserves ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.categories FORCE ROW LEVEL SECURITY;
ALTER TABLE public.transactions FORCE ROW LEVEL SECURITY;
ALTER TABLE public.budgets FORCE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_bills FORCE ROW LEVEL SECURITY;
ALTER TABLE public.installments FORCE ROW LEVEL SECURITY;
ALTER TABLE public.debts FORCE ROW LEVEL SECURITY;
ALTER TABLE public.future_expenses FORCE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_reserves FORCE ROW LEVEL SECURITY;

-- 2) Remove TODAS as policies existentes nessas tabelas
--    (inclusive policies permissivas criadas manualmente)
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'categories',
        'transactions',
        'budgets',
        'recurring_bills',
        'installments',
        'debts',
        'future_expenses',
        'emergency_reserves'
      )
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON public.%I',
      policy_record.policyname,
      policy_record.tablename
    );
  END LOOP;
END
$$;

-- 3) Recria policies de acesso somente ao próprio dono
CREATE POLICY "Users can view own categories"
  ON public.categories FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own categories"
  ON public.categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own categories"
  ON public.categories FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own categories"
  ON public.categories FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions"
  ON public.transactions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions"
  ON public.transactions FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own budgets"
  ON public.budgets FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own budgets"
  ON public.budgets FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own budgets"
  ON public.budgets FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own budgets"
  ON public.budgets FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own recurring_bills"
  ON public.recurring_bills FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own recurring_bills"
  ON public.recurring_bills FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own recurring_bills"
  ON public.recurring_bills FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own recurring_bills"
  ON public.recurring_bills FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own installments"
  ON public.installments FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own installments"
  ON public.installments FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own installments"
  ON public.installments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own installments"
  ON public.installments FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own debts"
  ON public.debts FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own debts"
  ON public.debts FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own debts"
  ON public.debts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own debts"
  ON public.debts FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own future_expenses"
  ON public.future_expenses FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own future_expenses"
  ON public.future_expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own future_expenses"
  ON public.future_expenses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own future_expenses"
  ON public.future_expenses FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own emergency_reserves"
  ON public.emergency_reserves FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own emergency_reserves"
  ON public.emergency_reserves FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own emergency_reserves"
  ON public.emergency_reserves FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own emergency_reserves"
  ON public.emergency_reserves FOR DELETE
  USING (auth.uid() = user_id);

-- 4) Garante que apenas usuários autenticados acessem as tabelas
REVOKE ALL ON public.categories FROM anon;
REVOKE ALL ON public.transactions FROM anon;
REVOKE ALL ON public.budgets FROM anon;
REVOKE ALL ON public.recurring_bills FROM anon;
REVOKE ALL ON public.installments FROM anon;
REVOKE ALL ON public.debts FROM anon;
REVOKE ALL ON public.future_expenses FROM anon;
REVOKE ALL ON public.emergency_reserves FROM anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.budgets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recurring_bills TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.installments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.debts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.future_expenses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.emergency_reserves TO authenticated;

-- 5) Verificação rápida (deve retornar todas as tabelas com rowsecurity = true)
-- SELECT relname, relrowsecurity, relforcerowsecurity
-- FROM pg_class
-- WHERE relname IN (
--   'categories','transactions','budgets','recurring_bills',
--   'installments','debts','future_expenses','emergency_reserves'
-- );
