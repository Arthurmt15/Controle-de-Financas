-- Integração Open Finance via Pluggy. As credenciais bancárias permanecem no Pluggy;
-- este banco armazena apenas IDs de conexão e referências para sincronização.

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS source VARCHAR(20) NOT NULL DEFAULT 'manual'
    CHECK (source IN ('manual', 'pluggy')),
  ADD COLUMN IF NOT EXISTS external_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS bank_account_id UUID;

CREATE TABLE IF NOT EXISTS public.bank_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider VARCHAR(20) NOT NULL DEFAULT 'pluggy' CHECK (provider = 'pluggy'),
  external_item_id VARCHAR(255) NOT NULL,
  institution_name VARCHAR(255),
  status VARCHAR(30) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'updating', 'updated', 'error', 'login_required', 'disconnected')),
  last_synced_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (provider, external_item_id)
);

CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_id UUID NOT NULL REFERENCES public.bank_connections(id) ON DELETE CASCADE,
  external_account_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50),
  balance DECIMAL(12, 2),
  currency VARCHAR(10) NOT NULL DEFAULT 'BRL',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (connection_id, external_account_id)
);

ALTER TABLE public.transactions
  ADD CONSTRAINT transactions_bank_account_id_fkey
  FOREIGN KEY (bank_account_id) REFERENCES public.bank_accounts(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_pluggy_external_id
  ON public.transactions(user_id, external_id)
  WHERE external_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bank_connections_user_id ON public.bank_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_user_id ON public.bank_accounts(user_id);

ALTER TABLE public.bank_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_connections FORCE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts FORCE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bank connections"
  ON public.bank_connections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own bank connections"
  ON public.bank_connections FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own bank accounts"
  ON public.bank_accounts FOR SELECT USING (auth.uid() = user_id);

REVOKE ALL ON public.bank_connections FROM anon;
REVOKE ALL ON public.bank_accounts FROM anon;
GRANT SELECT, DELETE ON public.bank_connections TO authenticated;
GRANT SELECT ON public.bank_accounts TO authenticated;
