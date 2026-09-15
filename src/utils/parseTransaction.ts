import { extractAmount } from './parseAmount';
import { extractDate, formatDate } from './parseDate';
import { detectType, detectCategory, extractDescription } from './parseCategory';

export interface ParsedTransaction {
  descricao: string; valor: number; tipo: 'despesa' | 'receita';
  categoria: string; data: string; parcelas?: number;
}
export interface ImageParseResult {
  amount: number | null; description: string | null; date: string | null; rawText: string;
}

/**
 * Parseia mensagem em transação. Suporta valores, datas, tipos em qualquer ordem.
 */
export function parseTransactionFromMessage(message: string): ParsedTransaction | null {
  const dateResult = extractDate(message);
  const textWithoutDate = dateResult?.clean || message;
  const data = dateResult?.value || formatDate(new Date());
  const amountResult = extractAmount(textWithoutDate);
  if (!amountResult) return null;
  const valor = amountResult.value;
  const tipo = detectType(message);
  const catResult = detectCategory(message, tipo);
  const parcelasMatch = message.match(/(\d+)\s*(?:x|vezes)\b/i);
  const parcelas = parcelasMatch ? parseInt(parcelasMatch[1]) : undefined;
  const descricao = extractDescription(amountResult.clean) || catResult.category;
  return { descricao, valor, tipo, categoria: catResult.category, data, parcelas };
}

export function parseImageText(text: string): ImageParseResult {
  const result: ImageParseResult = { amount: null, description: null, date: null, rawText: text };
  const amountResult = extractAmount(text);
  if (amountResult) result.amount = amountResult.value;
  const dateResult = extractDate(text);
  if (dateResult) result.date = dateResult.value;
  const lines = text.split('\n').filter(l => l.trim().length > 3);
  for (const line of lines) {
    const cleaned = line.trim();
    if (cleaned.length > 3 && !/^\d+[.,]?\d*$/.test(cleaned)) { result.description = cleaned.substring(0, 50); break; }
  }
  return result;
}

export function getExampleMessages(): string[] {
  return ['Mercado ontem 150,50','Entrada 4k salário','Compra 1000 reais 10x','conta recorrente cartão 1500 dia 10','ajuda'];
}
