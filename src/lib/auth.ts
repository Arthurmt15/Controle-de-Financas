import { supabase } from './supabase';

/**
 * Retorna o ID do usuário autenticado.
 * Todas as consultas devem filtrar por este ID, além do RLS do banco.
 * @throws Error se não houver sessão válida
 */
export async function requireUserId(): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Não autenticado');
  }

  return user.id;
}
