-- ============================================
-- MIGRAÇÃO 004 - Reserva de Emergência (única por usuário)
-- ============================================

CREATE TABLE IF NOT EXISTS emergency_reserves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  goal_amount DECIMAL(12,2) NOT NULL CHECK (goal_amount >= 0),
  current_amount DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE emergency_reserves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own emergency_reserve" ON emergency_reserves FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own emergency_reserve" ON emergency_reserves FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own emergency_reserve" ON emergency_reserves FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own emergency_reserve" ON emergency_reserves FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_emergency_reserves_user_id ON emergency_reserves(user_id);
