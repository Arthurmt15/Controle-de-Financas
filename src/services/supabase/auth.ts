import { supabase } from '../../lib/supabase';
import type { User } from '../../types';

/** Remove chaves de sessão do Supabase Auth do storage (auto-cura pós-pausa). */
function purgeSupabaseSessionFromStorage(): void {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith('sb-') && k.endsWith('-auth-token'))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    // storage indisponível — ignora
  }
}

export const authService = {
  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } finally {
      // Garante que nenhum resíduo de sessão morta sobreviva no storage
      purgeSupabaseSessionFromStorage();
    }
  },

  /**
   * Valida a sessão local contra o servidor (round-trip getUser).
   * Sessões obsoletas (ex.: refresh token invalidado enquanto o projeto
   * estava pausado) passam no getSession local mas o servidor as rejeita
   * com 400/401 — causando 401 em tudo, incluindo a edge function ai-chat.
   * Retorna false e purga o storage automaticamente nesse caso, sem exigir
   * nenhuma ação do usuário. Erros de rede não invalidam (mantém login).
   */
  async validateSession(): Promise<boolean> {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return false;

    const { error } = await supabase.auth.getUser();
    if (!error) return true;

    const status = (error as { status?: number })?.status;
    if (status === 400 || status === 401 || status === 403 || status === 404) {
      try {
        await supabase.auth.signOut();
      } catch {
        // Sem sessão válida p/ encerrar no servidor — segue p/ purga local
      }
      purgeSupabaseSessionFromStorage();
      return false;
    }
    return true;
  },

  async getSession() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  async getUser(): Promise<User | null> {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) return null;

    return {
      id: user.id,
      name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
      email: user.email || '',
      avatar: user.user_metadata?.avatar_url,
    };
  },

  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const user: User = {
          id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '',
          email: session.user.email || '',
          avatar: session.user.user_metadata?.avatar_url,
        };
        callback(user);
      } else {
        callback(null);
      }
    });
  },
};
