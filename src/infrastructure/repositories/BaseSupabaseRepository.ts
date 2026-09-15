import { supabase } from '../../lib/supabase';

/**
 * Classe base abstrata para repositórios Supabase.
 * Encapsula autenticação e mapeamento.
 * Princípio DRY + Template Method.
 */
export abstract class BaseSupabaseRepository<Row, Domain> {
  protected abstract tableName: string;
  protected abstract mapRow(row: Row): Domain;

  /** Obtém usuário autenticado ou lança */
  protected async requireUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');
    return user;
  }

  /** Lista todos do usuário atual */
  async getAll(): Promise<Domain[]> {
    const { data, error } = await supabase.from(this.tableName).select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data as Row[]).map(r => this.mapRow(r));
  }
}
