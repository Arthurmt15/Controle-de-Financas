import { CATEGORY_STYLES } from './categories';

export function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function getCategoryStyle(name: string): { color: string; icon: string } {
  const lower = name.toLowerCase();
  if (['aliment', 'comida', 'mercado', 'lanche'].some((k) => lower.includes(k)))
    return CATEGORY_STYLES['Alimentação'] || { color: '#FF6B6B', icon: 'FaTag' };
  if (['transport', 'carro', 'uber', 'combust'].some((k) => lower.includes(k)))
    return CATEGORY_STYLES['Transporte'] || { color: '#4ECDC4', icon: 'FaTag' };
  if (['casa', 'moradia', 'aluguel', 'conta'].some((k) => lower.includes(k)))
    return CATEGORY_STYLES['Moradia'] || { color: '#45B7D1', icon: 'FaTag' };
  if (['saúde', 'saude', 'médico', 'farm'].some((k) => lower.includes(k)))
    return CATEGORY_STYLES['Saúde'] || { color: '#FFEAA7', icon: 'FaTag' };
  if (['educa', 'escola', 'curso'].some((k) => lower.includes(k)))
    return CATEGORY_STYLES['Educação'] || { color: '#DDA0DD', icon: 'FaTag' };
  if (['lazer', 'diversão', 'jogo', 'viagem'].some((k) => lower.includes(k)))
    return CATEGORY_STYLES['Lazer'] || { color: '#96CEB4', icon: 'FaTag' };
  if (['roupa', 'vest', 'sapato'].some((k) => lower.includes(k)))
    return { color: '#FD79A8', icon: 'FaTag' };
  if (['salário', 'salario', 'renda'].some((k) => lower.includes(k)))
    return CATEGORY_STYLES['Salário'] || { color: '#00B894', icon: 'FaTag' };
  const colors = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#96CEB4',
    '#FFEAA7',
    '#DDA0DD',
    '#FD79A8',
    '#6C5CE7',
  ];
  return { color: colors[Math.floor(Math.random() * colors.length)], icon: 'FaTag' };
}

export function parseRecurringBillInput(
  text: string
): { name: string; amount: number; day: number } | null {
  const dayMatch = text.match(/dia\s+(\d{1,2})/i);
  const day = dayMatch ? parseInt(dayMatch[1]) : new Date().getDate();
  const cleanText = dayMatch ? text.replace(dayMatch[0], ' ').trim() : text;
  const amountPatterns = [
    /R\$\s*(\d{1,6}(?:\.\d{3})*(?:,\d{1,2})?)/i,
    /(\d+(?:[.,]\d+)?)\s*k\b/i,
    /(\d+(?:[.,]\d+)?)\s*(?:conto|pila|paus|reais)\b/i,
    /(\d{1,6}(?:\.\d{3})*,\d{1,2})\b/,
    /(\d{2,6})\b/,
  ];
  let amount: number | null = null;
  let nameText = cleanText;
  for (const pattern of amountPatterns) {
    const match = cleanText.match(pattern);
    if (match) {
      if (pattern.source.includes('k')) amount = parseFloat(match[1].replace(',', '.')) * 1000;
      else if (pattern.source.includes('conto|pila|paus|reais'))
        amount = parseFloat(match[1].replace(',', '.'));
      else amount = parseFloat(match[1].replace(/\./g, '').replace(',', '.'));
      nameText = cleanText.replace(match[0], ' ').trim();
      break;
    }
  }
  if (!amount || amount <= 0) return null;
  const name = nameText
    .replace(/^\s*(de|da|do|das|dos|no|na|em|e|a|o|as|os)\s+/gi, '')
    .replace(/\s+(de|da|do|das|dos|no|na|em|e|a|o|as|os)\s+/gi, ' ')
    .replace(/[,.\s]+/g, ' ')
    .trim();
  if (name.length < 2) return null;
  return { name: capitalizeFirst(name), amount, day: Math.min(Math.max(day, 1), 31) };
}

export interface TransactionUpdatePatch {
  /** Descrição-alvo para localizar as transações (pode ser vazio se houver filtros) */
  target: string;
  /** Filtros do alvo: só altera quem combinar com todos os informados */
  filterAmount?: number;
  filterDate?: string;
  txType?: 'income' | 'expense';
  amount?: number;
  categoryName?: string;
  /** Data no formato yyyy-mm-dd */
  date?: string;
  newDescription?: string;
}

export interface TransactionTarget {
  target: string;
  filterAmount?: number;
  filterDate?: string;
  txType?: 'income' | 'expense';
}

/** Palavras genéricas que indicam tipo em vez de descrição ("a despesa de 70"). */
function detectTxType(text: string): 'income' | 'expense' | undefined {
  const lower = text.toLowerCase();
  if (/\b(despesa|despesas|gasto|gastos|sa[ií]da|conta|contas|d[ií]vida)\b/.test(lower))
    return 'expense';
  if (/\b(entrada|entradas|receita|receitas|ganho|sal[aá]rio)\b/.test(lower)) return 'income';
  return undefined;
}

const GENERIC_TARGET_WORDS = new Set(
  'despesa despesas gasto gastos saída saida conta contas lançamento lancamento transação transacao item itens valor lançamento despesa conta entrada entradas receita receitas ganho salario salário'.split(
    ' '
  )
);

function isGenericTarget(target: string): boolean {
  const words = target.toLowerCase().split(/\s+/).filter(Boolean);
  return words.length > 0 && words.every((w) => GENERIC_TARGET_WORDS.has(w));
}

const AMOUNT_PATTERNS = [
  /R\$\s*(\d{1,6}(?:\.\d{3})*(?:,\d{1,2})?)/i,
  /(\d+(?:[.,]\d+)?)\s*k\b/i,
  /(\d+(?:[.,]\d+)?)\s*(?:conto|contos|pila|pilas|paus|reais)\b/i,
  /(\d{1,6}(?:\.\d{3})*,\d{1,2})\b/,
  /(\d{2,6})\b/,
];

function extractAmount(cleanText: string): { amount?: number; rest: string } {
  for (const pattern of AMOUNT_PATTERNS) {
    const match = cleanText.match(pattern);
    if (match) {
      let amount: number;
      if (pattern.source.includes('\\sk')) amount = parseFloat(match[1].replace(',', '.')) * 1000;
      else if (pattern.source.includes('conto|contos'))
        amount = parseFloat(match[1].replace(',', '.'));
      else amount = parseFloat(match[1].replace(/\./g, '').replace(',', '.'));
      if (amount > 0) return { amount, rest: cleanText.replace(match[0], ' ').trim() };
    }
  }
  return { rest: cleanText };
}

function toISODate(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function extractDate(cleanText: string): { date?: string; rest: string } {
  const now = new Date();
  let m = cleanText.match(/\banteontem\b/i);
  if (m) {
    const d = new Date(now);
    d.setDate(d.getDate() - 2);
    return { date: toISODate(d), rest: cleanText.replace(m[0], ' ').trim() };
  }
  m = cleanText.match(/\bontem\b/i);
  if (m) {
    const d = new Date(now);
    d.setDate(d.getDate() - 1);
    return { date: toISODate(d), rest: cleanText.replace(m[0], ' ').trim() };
  }
  m = cleanText.match(/\bhoje\b/i);
  if (m) return { date: toISODate(now), rest: cleanText.replace(m[0], ' ').trim() };
  m = cleanText.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/);
  if (m) {
    const day = parseInt(m[1]);
    const month = parseInt(m[2]);
    let year = m[3] ? parseInt(m[3]) : now.getFullYear();
    if (year < 100) year += 2000;
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      const d = new Date(year, month - 1, day);
      return { date: toISODate(d), rest: cleanText.replace(m[0], ' ').trim() };
    }
  }
  m = cleanText.match(/\bdia\s+(\d{1,2})\b/i);
  if (m) {
    const day = Math.min(Math.max(parseInt(m[1]), 1), 31);
    const d = new Date(now.getFullYear(), now.getMonth(), day);
    return { date: toISODate(d), rest: cleanText.replace(m[0], ' ').trim() };
  }
  return { rest: cleanText };
}

function extractCategory(cleanText: string): { categoryName?: string; rest: string } {
  const m = cleanText.match(
    /(?:para|pra|na|pela?)\s+(?:a\s+)?categori[ao]\s+([A-Za-zÀ-ú][A-Za-zÀ-ú ]*?)(?=\s+(?:para|pra|dia|data|em\b|de\b)|$)/i
  );
  if (m) {
    const name = m[1].trim();
    if (name.length >= 2) return { categoryName: capitalizeFirst(name), rest: cleanText.replace(m[0], ' ').trim() };
  }
  return { rest: cleanText };
}

export function cleanTransactionTarget(text: string): string {
  return cleanTarget(text);
}

const FILLER_SET = new Set(
  'de da do das dos no na nos nas em e a o as os para pra por com sem um uma'.split(' ')
);

function stripFillers(text: string): string {
  return text
    .replace(/[,.;:!?]+/g, ' ')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w && !FILLER_SET.has(w.toLowerCase()))
    .join(' ');
}

function cleanTarget(text: string): string {
  return stripFillers(text);
}

/**
 * Normaliza texto para comparação tolerante ("despesa de de" casa com "Despesa",
 * "pão açúcar" casa com "Pão de Açúcar"). Usada nos dois lados do match.
 */
export function normalizeForMatch(text: string): string {
  return stripFillers(text.toLowerCase());
}

/**
 * Interpreta o trecho após o verbo de edição/exclusão.
 * Divide em "alvo" (esquerda do para) e "novo valor" (direita do para):
 *  - Esquerda: descrição + filtros (valor após "de", data, tipo "despesa/entrada").
 *    Ex.: "a despesa de 08/10/2026 de R$ 70" → filtros {expense, 2026-10-08, 70}
 *  - Direita: patch (valor, categoria, data ou nova descrição).
 *    Ex.: "para 50" → amount; "para categoria X" → categoria; "para festa rave" → descrição.
 */
export function parseTransactionTarget(text: string): TransactionTarget {
  const amountRes = extractAmount(text);
  const dateRes = extractDate(amountRes.rest);
  const txType = detectTxType(dateRes.rest);
  let target = cleanTarget(dateRes.rest);
  if (isGenericTarget(target)) target = '';
  const result: TransactionTarget = { target };
  if (amountRes.amount !== undefined) result.filterAmount = amountRes.amount;
  if (dateRes.date) result.filterDate = dateRes.date;
  if (txType) result.txType = txType;
  return result;
}

/**
 * Interpreta o trecho após o verbo de edição.
 * Ex.: "o lanche para 50" → { target: "lanche", amount: 50 }
 * Ex.: "a despesa de 08/10/2026 de R$ 70 para festa rave" → filtros + { newDescription }
 */
export function parseTransactionUpdate(text: string): TransactionUpdatePatch | null {
  const split = text.match(/^(.*?)\s+(?:para|pra)\s+(.+)$/i);
  const left = (split ? split[1] : text).trim();
  const right = (split ? split[2] : '').trim();

  const target = parseTransactionTarget(left);

  const patch: TransactionUpdatePatch = { target: target.target };
  if (target.filterAmount !== undefined) patch.filterAmount = target.filterAmount;
  if (target.filterDate) patch.filterDate = target.filterDate;
  if (target.txType) patch.txType = target.txType;

  if (right) {
    // "para categoria X" (com ou sem preposição, pois o split já consumiu o "para")
    const bareCat = right.match(/^categori[ao]s?\s+(.+)$/i);
    if (bareCat && bareCat[1].trim().length >= 2) {
      patch.categoryName = capitalizeFirst(cleanTarget(bareCat[1]));
    } else {
      const amountRes = extractAmount(right);
      const dateRes = extractDate(amountRes.rest);
      const catRes = extractCategory(dateRes.rest);
      if (amountRes.amount !== undefined) patch.amount = amountRes.amount;
      if (dateRes.date) patch.date = dateRes.date;
      if (catRes.categoryName) patch.categoryName = catRes.categoryName;
      const leftover = cleanTarget(catRes.rest);
      if (leftover.length >= 2) patch.newDescription = capitalizeFirst(leftover);
    }
  } else {
    // Sem "para": valor/data no próprio alvo (ex.: "corrige o lanche 50")
    const amountRes = extractAmount(left);
    if (amountRes.amount !== undefined) patch.amount = amountRes.amount;
  }

  // Sem alvo nem filtros, nada a localizar
  if (!patch.target && patch.filterAmount === undefined && !patch.filterDate) return null;

  // Sem nenhuma mudança identificada, não é um comando de edição válido
  if (
    patch.amount === undefined &&
    !patch.date &&
    !patch.categoryName &&
    !patch.newDescription
  ) {
    return null;
  }
  return patch;
}

export function parseRecurringBillUpdate(
  text: string
): { name: string; amount?: number; day?: number } | null {
  const dayMatch = text.match(/dia\s+(\d{1,2})/i);
  const day = dayMatch ? parseInt(dayMatch[1]) : undefined;
  const cleanText = dayMatch ? text.replace(dayMatch[0], ' ').trim() : text;
  const amountPatterns = [
    /R\$\s*(\d{1,6}(?:\.\d{3})*(?:,\d{1,2})?)/i,
    /(\d+(?:[.,]\d+)?)\s*k\b/i,
    /(\d+(?:[.,]\d+)?)\s*(?:conto|pila|paus|reais)\b/i,
    /(\d{1,6}(?:\.\d{3})*,\d{1,2})\b/,
    /(\d{2,6})\b/,
  ];
  let amount: number | undefined = undefined;
  let nameText = cleanText;
  for (const pattern of amountPatterns) {
    const match = cleanText.match(pattern);
    if (match) {
      if (pattern.source.includes('k')) amount = parseFloat(match[1].replace(',', '.')) * 1000;
      else if (pattern.source.includes('conto|pila|paus|reais'))
        amount = parseFloat(match[1].replace(',', '.'));
      else amount = parseFloat(match[1].replace(/\./g, '').replace(',', '.'));
      nameText = cleanText.replace(match[0], ' ').trim();
      break;
    }
  }
  const name = nameText
    .replace(/^\s*(de|da|do|das|dos|no|na|em|e|a|o|as|os)\s+/gi, '')
    .replace(/\s+(de|da|do|das|dos|no|na|em|e|a|o|as|os)\s+/gi, ' ')
    .replace(/[,.\s]+/g, ' ')
    .trim();
  if (name.length < 2) return null;
  return { name: capitalizeFirst(name), amount, day };
}
