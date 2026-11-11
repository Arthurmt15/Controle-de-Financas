import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.REACT_APP_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase env ausente — funcionalidades limitadas');
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ REACT_APP_SUPABASE_URL / REACT_APP_SUPABASE_ANON_KEY ausentes. Configure .env');
}

/**
 * Extrai a role do JWT para garantir que a chave pública (anon) seja usada.
 * A chave service_role ignora RLS e NUNCA deve ser exposta no frontend.
 */
function getJwtRole(key: string): string | null {
  try {
    const payload = JSON.parse(atob(key.split('.')[1]));
    return typeof payload.role === 'string' ? payload.role : null;
  } catch {
    return null;
  }
}

if (getJwtRole(supabaseAnonKey) === 'service_role') {
  console.error(
    '❌ A chave do Supabase configurada é service_role. Use a anon key: a service_role ignora o RLS e expõe os dados de todos os usuários.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
