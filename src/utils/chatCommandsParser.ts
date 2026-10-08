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
  /** Descrição-alvo para localizar as transações */
  target: string;
  amount?: number;
  categoryName?: string;
  /** Data no formato yyyy-mm-dd */
  date?: string;
  newDescription?: string;
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

function cleanTarget(text: string): string {
  return text
    .replace(/^\s*(o|a|os|as|um|uma|de|da|do|no|na|em)\s+/gi, '')
    .replace(/\s+(para|pra|por)\s*$/gi, '')
    .replace(/[,.\s]+/g, ' ')
    .trim();
}

/**
 * Interpreta o trecho após o verbo de edição.
 * Ex.: "o lanche para 50" → { target: "lanche", amount: 50 }
 * Ex.: "mercado pra categoria alimentação" → { target: "mercado", categoryName: "Alimentação" }
 * Ex.: "uber de ontem para hoje" → { target: "uber", date: "<hoje>" }
 * Ex.: "mercado para supermercado" → { target: "mercado", newDescription: "supermercado" }
 */
export function parseTransactionUpdate(text: string): TransactionUpdatePatch | null {
  const amountRes = extractAmount(text);
  const dateRes = extractDate(amountRes.rest);
  const catRes = extractCategory(dateRes.rest);

  let rest = catRes.rest;
  let newDescription: string | undefined;

  // "X para Y" restante (Y não é valor/categoria/data) = nova descrição
  const paraMatch = rest.match(/^(.+?)\s+(?:para|pra)\s+(.+)$/i);
  if (paraMatch && paraMatch[2].trim().length >= 2) {
    rest = paraMatch[1];
    newDescription = capitalizeFirst(cleanTarget(paraMatch[2]));
  }

  const target = cleanTarget(rest);
  if (target.length < 2) return null;

  const patch: TransactionUpdatePatch = { target };
  if (amountRes.amount !== undefined) patch.amount = amountRes.amount;
  if (dateRes.date) patch.date = dateRes.date;
  if (catRes.categoryName) patch.categoryName = catRes.categoryName;
  if (newDescription) patch.newDescription = newDescription;

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
