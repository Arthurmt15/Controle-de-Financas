/**
 * Keep-alive + reativação do projeto Supabase (free tier pausa após ~7 dias sem tráfego).
 *
 * Uso local:
 *   node scripts/supabase-keepalive.mjs
 *   node scripts/supabase-keepalive.mjs --restore
 *   node scripts/supabase-keepalive.mjs --status-only
 *
 * Env (lê process.env e, em local, o arquivo .env da raiz):
 *   REACT_APP_SUPABASE_URL / SUPABASE_URL
 *   REACT_APP_SUPABASE_ANON_KEY / SUPABASE_ANON_KEY
 *   SUPABASE_PROJECT_REF            (padrão: extraído da URL)
 *   SUPABASE_ACCESS_TOKEN / SUPABASE_MANAGEMENT_TOKEN  (token sbp_... — só p/ --restore)
 *
 * Comportamento:
 *   1. GET /auth/v1/health  → se DNS não resolve / 5xx = projeto pausado.
 *   2. --restore: POST https://api.supabase.com/v1/projects/{ref}/restore (Management API).
 *   3. Ping leve no PostgREST (transactions?select=id&limit=1) para gerar atividade
 *      e impedir novo congelamento. Não escreve nada no banco.
 *
 * Exit codes: 0 = ativo/ping ok · 2 = pausado (sem restore ou restore pendente) · 1 = erro config.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_ENV = path.join(__dirname, '..', '.env');

// Carrega .env simples (sem dependências) apenas em execução local.
function loadLocalDotEnv() {
  if (process.env.GITHUB_ACTIONS) return;
  if (!fs.existsSync(ROOT_ENV)) return;
  const raw = fs.readFileSync(ROOT_ENV, 'utf8');
  for (const line of raw.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!(k in process.env)) process.env[k] = v;
  }
}
loadLocalDotEnv();

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || '';
const ANON_KEY =
  process.env.SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY || '';
const PROJECT_REF =
  process.env.SUPABASE_PROJECT_REF || extractRef(SUPABASE_URL);
const MGMT_TOKEN =
  process.env.SUPABASE_ACCESS_TOKEN || process.env.SUPABASE_MANAGEMENT_TOKEN || '';

const args = new Set(process.argv.slice(2));
const WANT_RESTORE = args.has('--restore');
const STATUS_ONLY = args.has('--status-only');

function extractRef(url) {
  const m = /^https:\/\/([a-z0-9]+)\.supabase\.co/i.exec(url || '');
  return m ? m[1] : '';
}

async function fetchTimeout(url, options = {}, ms = 20000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

async function checkHealth() {
  const url = `${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/health`;
  try {
    const res = await fetchTimeout(
      url,
      { headers: { apikey: ANON_KEY } },
      20000
    );
    return { reachable: res.ok, status: res.status };
  } catch (err) {
    return { reachable: false, status: 0, error: err.cause?.code || err.message };
  }
}

async function pingPostgREST() {
  // Leitura mínima — gera atividade sem alterar dados.
  const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/transactions?select=id&limit=1`;
  const res = await fetchTimeout(
    url,
    {
      headers: {
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
        Accept: 'application/json',
      },
    },
    20000
  );
  // 200 (com/sem linhas), 401/404 = API respondendo = atividade registrada.
  // 502/503 = ainda pausado ou restaurando.
  return res.status;
}

async function restoreProject() {
  if (!MGMT_TOKEN) {
    console.error(
      '❌ --restore precisa de SUPABASE_ACCESS_TOKEN (token sbp_...). Gere em: https://supabase.com/dashboard/account/tokens'
    );
    process.exit(1);
  }
  console.log(`🔄 Solicitando restore do projeto ${PROJECT_REF}...`);
  const res = await fetchTimeout(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/restore`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${MGMT_TOKEN}`,
        'Content-Type': 'application/json',
      },
    },
    30000
  );
  const body = await res.text();
  if (res.ok) {
    console.log('✅ Restore aceito. O projeto leva ~2-5 min para voltar (DNS + PostgREST).');
  } else if (res.status === 400 && /already|active/i.test(body)) {
    console.log('ℹ️ Projeto já está ativo — nada a restaurar.');
  } else {
    console.error(`❌ Restore falhou (${res.status}): ${body.slice(0, 500)}`);
    process.exit(2);
  }
}

async function main() {
  if (!SUPABASE_URL || !ANON_KEY) {
    console.error('❌ SUPABASE_URL / ANON_KEY ausentes. Configure .env ou secrets do GitHub.');
    process.exit(1);
  }
  console.log(`🔍 Projeto: ${PROJECT_REF} (${SUPABASE_URL})`);

  if (WANT_RESTORE) await restoreProject();

  const health = await checkHealth();
  if (!health.reachable) {
    console.error(
      `🧊 Projeto PAUSADO/CONGELADO (health unreachable${health.error ? `: ${health.error}` : `, http ${health.status}`}).`
    );
    console.error(`👉 Reative em: https://supabase.com/dashboard/project/${PROJECT_REF}`);
    console.error('   1. Abra o link → clique em "Restore project" / "Unpause".');
    console.error('   2. Aguarde 2-5 min e rode: node scripts/supabase-keepalive.mjs');
    console.error('   Ou automático: SUPABASE_ACCESS_TOKEN=sbp_... node scripts/supabase-keepalive.mjs --restore');
    if (STATUS_ONLY) process.exit(2);
    if (!WANT_RESTORE) process.exit(2);
    // Se pediu restore, aguarda e re-checa.
    console.log('⏳ Aguardando 60s para re-checar...');
    await new Promise((r) => setTimeout(r, 60000));
    const retry = await checkHealth();
    if (!retry.reachable) {
      console.error('⏳ Ainda restaurando. Rode o job de novo em alguns minutos.');
      process.exit(2);
    }
  }

  if (STATUS_ONLY) {
    console.log('✅ Projeto ATIVO.');
    return;
  }

  const status = await pingPostgREST();
  if ([200, 206, 401, 404].includes(status)) {
    console.log(`✅ Keep-alive ok (PostgREST http ${status}). Atividade registrada — sem risco de pausa.`);
  } else {
    console.error(`⚠️ PostgREST retornou http ${status} — projeto pode ainda estar restaurando.`);
    process.exit(2);
  }
}

main().catch((e) => {
  console.error('❌ Erro:', e.message);
  process.exit(1);
});
