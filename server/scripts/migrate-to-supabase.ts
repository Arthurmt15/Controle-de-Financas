/**
 * @file server/scripts/migrate-to-supabase.ts
 * @description Script de migração de dados do Railway para o Supabase.
 * 
 * COMO USAR:
 * 1. Crie o arquivo .env.migration na pasta server/ com as URLs dos dois bancos
 * 2. Execute: npx ts-node scripts/migrate-to-supabase.ts
 * 
 * ATENÇÃO: Este script é executado uma única vez. Faça backup antes de rodar.
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.migration' });

/** URL do banco antigo (Railway) */
const OLD_DATABASE_URL = process.env.OLD_DATABASE_URL;

/** URL do banco novo (Supabase) */
const NEW_DATABASE_URL = process.env.NEW_DATABASE_URL;

/**
 * Conexão com o banco de dados
 * @param connectionString URL de conexão
 * @returns Pool de conexões
 */
function createPool(connectionString: string): Pool {
  return new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
}

/**
 * Exporta dados de uma tabela do banco antigo
 * @param oldPool Pool de conexão com o banco antigo
 * @param tableName Nome da tabela
 * @returns Array de registros
 */
async function exportTable(oldPool: Pool, tableName: string): Promise<Record<string, unknown>[]> {
  try {
    const result = await oldPool.query(`SELECT * FROM ${tableName}`);
    console.log(`  ✅ Exportado ${result.rowCount} registros de ${tableName}`);
    return result.rows;
  } catch (error) {
    console.log(`  ⚠️ Tabela ${tableName} não existe ou está vazia`);
    return [];
  }
}

/**
 * Importa dados para uma tabela no banco novo
 * @param newPool Pool de conexão com o banco novo
 * @param tableName Nome da tabela
 * @param data Dados a serem importados
 * @param columns Colunas da tabela (para inserção correta)
 */
async function importTable(
  newPool: Pool,
  tableName: string,
  data: Record<string, unknown>[],
  columns: string[]
): Promise<void> {
  if (data.length === 0) {
    console.log(`  ⏭️ Pulando ${tableName} (sem dados)`);
    return;
  }

  const client = await newPool.connect();
  try {
    await client.query('BEGIN');

    for (const row of data) {
      const values = columns.map(col => row[col]);
      const placeholders = columns.map((_, i) => `$${i + 1}`);
      
      await client.query(
        `INSERT INTO ${tableName} (${columns.join(', ')}) 
         VALUES (${placeholders.join(', ')}) 
         ON CONFLICT (id) DO NOTHING`,
        values
      );
    }

    await client.query('COMMIT');
    console.log(`  ✅ Importado ${data.length} registros para ${tableName}`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`  ❌ Erro ao importar ${tableName}:`, error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Função principal de migração
 */
async function migrate(): Promise<void> {
  console.log('🚀 Iniciando migração Railway → Supabase\n');

  if (!OLD_DATABASE_URL || !NEW_DATABASE_URL) {
    console.error('❌ Configure OLD_DATABASE_URL e NEW_DATABASE_URL no arquivo .env.migration');
    process.exit(1);
  }

  const oldPool = createPool(OLD_DATABASE_URL);
  const newPool = createPool(NEW_DATABASE_URL);

  try {
    // Testa conexões
    console.log('📡 Testando conexões...');
    await oldPool.query('SELECT 1');
    console.log('  ✅ Conectado ao Railway (antigo)');
    
    await newPool.query('SELECT 1');
    console.log('  ✅ Conectado ao Supabase (novo)\n');

    // Define a ordem das tabelas (respeitando foreign keys)
    const tables = [
      {
        name: 'users',
        columns: ['id', 'google_id', 'name', 'email', 'avatar', 'created_at', 'updated_at'],
      },
      {
        name: 'categories',
        columns: ['id', 'user_id', 'name', 'color', 'icon', 'default_type', 'created_at'],
      },
      {
        name: 'transactions',
        columns: ['id', 'user_id', 'description', 'amount', 'type', 'date', 'category_id', 'notes', 'created_at', 'updated_at'],
      },
      {
        name: 'budgets',
        columns: ['id', 'user_id', 'category_id', 'budget_limit', 'month', 'created_at'],
      },
      {
        name: 'recurring_bills',
        columns: ['id', 'user_id', 'name', 'amount', 'type', 'day_of_month', 'category_id', 'active', 'notes', 'created_at', 'updated_at'],
      },
      {
        name: 'openfinance_items',
        columns: ['id', 'user_id', 'pluggy_item_id', 'connector_id', 'institution_name', 'status', 'created_at', 'updated_at'],
      },
    ];

    // Exporta e importa cada tabela
    console.log('📦 Exportando dados do Railway...');
    const exportedData: Record<string, Record<string, unknown>[]> = {};

    for (const table of tables) {
      exportedData[table.name] = await exportTable(oldPool, table.name);
    }

    console.log('\n📥 Importando dados para o Supabase...');

    for (const table of tables) {
      await importTable(newPool, table.name, exportedData[table.name], table.columns);
    }

    console.log('\n✅ Migração concluída com sucesso!');
    console.log('\n📊 Resumo:');

    for (const table of tables) {
      console.log(`  ${table.name}: ${exportedData[table.name].length} registros`);
    }

  } catch (error) {
    console.error('\n❌ Erro durante a migração:', error);
    process.exit(1);
  } finally {
    await oldPool.end();
    await newPool.end();
  }
}

// Executa a migração
migrate();
