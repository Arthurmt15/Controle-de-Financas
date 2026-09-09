/**
 * @file server/src/database.ts
 * @description Configuração e gerenciamento da conexão com o PostgreSQL (Railway).
 * Fornece pool de conexões e função para criar tabelas.
 */
import { Pool } from 'pg';
/**
 * Pool de conexões com o PostgreSQL
 * Usa a variável de ambiente DATABASE_URL fornecida pelo Railway
 */
declare const pool: Pool;
/**
 * Testa a conexão com o banco de dados
 * @returns {Promise<boolean>} true se conectou, false se falhou
 */
export declare function testConnection(): Promise<boolean>;
/**
 * Cria todas as tabelas necessárias no banco de dados
 * Executa migrations simples com IF NOT EXISTS
 */
export declare function createTables(): Promise<void>;
/** Exporta o pool para uso nas rotas */
export default pool;
//# sourceMappingURL=database.d.ts.map