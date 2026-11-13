-- ============================================
-- MIGRAÇÃO 007 - Endurece a função de criação de usuário
-- Fixa o search_path de função SECURITY DEFINER para evitar
-- sequestro de resolução de objetos (search_path hijacking).
-- Idempotente: pode ser executada mais de uma vez.
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
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
    (NEW.id, 'Dívida', '#f59e0b', 'FaHandHoldingUsd', 'expense'),
    (NEW.id, 'Outros', '#6b7280', 'FaEllipsisH', 'both');
  RETURN NEW;
END;
$$;
