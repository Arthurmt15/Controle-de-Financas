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
