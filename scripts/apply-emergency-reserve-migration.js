/**
 * Aplica a migration 004_add_emergency_reserve.sql no banco Postgres/Supabase.
 * Uso:
 *   DATABASE_URL="postgresql://postgres.xxx:senha@aws-0-sa-east-1.pooler.supabase.com:6543/postgres" node scripts/apply-emergency-reserve-migration.js
 * Ou defina no .env:
 *   DATABASE_URL=...
 * Obtém a connection string em: Supabase Dashboard -> Project Settings -> Database -> Connection string (URI, Session pooler ou Direct).
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function main() {
  const dbUrl = process.env.DATABASE_URL || process.env.NEW_DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL não definido.');
    console.error('   Pegue em: https://supabase.com/dashboard/project/hagnorgsihjddumzmnaw/settings/database');
    console.error('   Use a Connection String (Session pooler, porta 6543) ou Direct (5432).');
    console.error('   Ex: DATABASE_URL="postgresql://postgres.hagnorgsihjddumzmnaw:[SENHA]@aws-0-us-east-1.pooler.supabase.com:6543/postgres" node scripts/apply-emergency-reserve-migration.js');
    process.exit(1);
  }
  const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', '004_add_emergency_reserve.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  console.log('📄 Lendo migration:', sqlPath);
  console.log(`📄 SQL carregado (${sql.length} bytes)`);
  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    console.log('✅ Conectado ao Postgres');
    await client.query(sql);
    console.log('✅ Migration 004 aplicada com sucesso! Tabela emergency_reserves criada.');
    const check = await client.query("SELECT to_regclass('public.emergency_reserves') as tbl");
    console.log('Verificação:', check.rows[0]);
  } catch (e) {
    console.error('❌ Erro ao aplicar migration:', e.message);
    console.error(e);
    process.exit(1);
  } finally {
    await client.end();
  }
}
main();
