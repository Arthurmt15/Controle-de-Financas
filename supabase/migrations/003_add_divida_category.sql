-- ============================================
-- MIGRAÇÃO 003 - Adiciona categoria Dívida padrão
-- ============================================

-- Atualiza trigger para novos usuários incluir Dívida
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
    (NEW.id, 'Dívida', '#f59e0b', 'FaHandHoldingUsd', 'expense'),
    (NEW.id, 'Outros', '#6b7280', 'FaEllipsisH', 'both');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Para usuários existentes, cria categoria Dívida se não existir
INSERT INTO categories (user_id, name, color, icon, default_type)
SELECT DISTINCT user_id, 'Dívida', '#f59e0b', 'FaHandHoldingUsd', 'expense'
FROM categories
WHERE user_id NOT IN (SELECT user_id FROM categories WHERE name = 'Dívida')
ON CONFLICT DO NOTHING;
