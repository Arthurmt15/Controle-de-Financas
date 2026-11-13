-- ============================================
-- MIGRAÇÃO 008 - Garante que referências externas pertençam ao mesmo usuário
-- O RLS valida apenas o `user_id` da própria linha. Sem isso, um usuário
-- poderia inserir uma transação/orçamento apontando para `category_id` ou
-- `bank_account_id` de outro usuário. Este trigger bloqueia essa escrita.
-- Idempotente: pode ser executada mais de uma vez.
-- ============================================

CREATE OR REPLACE FUNCTION public.assert_related_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  rec JSONB := to_jsonb(NEW);
  related_user_id UUID;
  category_id UUID := NULLIF(rec ->> 'category_id', '')::UUID;
  bank_account_id UUID := NULLIF(rec ->> 'bank_account_id', '')::UUID;
  connection_id UUID := NULLIF(rec ->> 'connection_id', '')::UUID;
BEGIN
  IF category_id IS NOT NULL THEN
    SELECT user_id INTO related_user_id FROM public.categories WHERE id = category_id;
    IF related_user_id IS DISTINCT FROM NEW.user_id THEN
      RAISE EXCEPTION 'category_id não pertence ao usuário autenticado'
        USING ERRCODE = '42501';
    END IF;
  END IF;

  IF bank_account_id IS NOT NULL THEN
    SELECT user_id INTO related_user_id FROM public.bank_accounts WHERE id = bank_account_id;
    IF related_user_id IS DISTINCT FROM NEW.user_id THEN
      RAISE EXCEPTION 'bank_account_id não pertence ao usuário autenticado'
        USING ERRCODE = '42501';
    END IF;
  END IF;

  IF connection_id IS NOT NULL THEN
    SELECT user_id INTO related_user_id FROM public.bank_connections WHERE id = connection_id;
    IF related_user_id IS DISTINCT FROM NEW.user_id THEN
      RAISE EXCEPTION 'connection_id não pertence ao usuário autenticado'
        USING ERRCODE = '42501';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_related_owner ON public.transactions;
CREATE TRIGGER enforce_related_owner
  BEFORE INSERT OR UPDATE OF user_id, category_id, bank_account_id
  ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.assert_related_owner();

DROP TRIGGER IF EXISTS enforce_related_owner ON public.budgets;
CREATE TRIGGER enforce_related_owner
  BEFORE INSERT OR UPDATE OF user_id, category_id
  ON public.budgets
  FOR EACH ROW EXECUTE FUNCTION public.assert_related_owner();

DROP TRIGGER IF EXISTS enforce_related_owner ON public.recurring_bills;
CREATE TRIGGER enforce_related_owner
  BEFORE INSERT OR UPDATE OF user_id, category_id
  ON public.recurring_bills
  FOR EACH ROW EXECUTE FUNCTION public.assert_related_owner();

DROP TRIGGER IF EXISTS enforce_related_owner ON public.installments;
CREATE TRIGGER enforce_related_owner
  BEFORE INSERT OR UPDATE OF user_id, category_id
  ON public.installments
  FOR EACH ROW EXECUTE FUNCTION public.assert_related_owner();

DROP TRIGGER IF EXISTS enforce_related_owner ON public.debts;
CREATE TRIGGER enforce_related_owner
  BEFORE INSERT OR UPDATE OF user_id, category_id
  ON public.debts
  FOR EACH ROW EXECUTE FUNCTION public.assert_related_owner();

DROP TRIGGER IF EXISTS enforce_related_owner ON public.future_expenses;
CREATE TRIGGER enforce_related_owner
  BEFORE INSERT OR UPDATE OF user_id, category_id
  ON public.future_expenses
  FOR EACH ROW EXECUTE FUNCTION public.assert_related_owner();

DROP TRIGGER IF EXISTS enforce_related_owner ON public.bank_accounts;
CREATE TRIGGER enforce_related_owner
  BEFORE INSERT OR UPDATE OF user_id, connection_id
  ON public.bank_accounts
  FOR EACH ROW EXECUTE FUNCTION public.assert_related_owner();
