import { extractAmount } from './parseAmount';
import { extractDate, formatDate } from './parseDate';
import { detectType, detectCategory, extractDescription } from './parseCategory';

export interface ParsedTransaction {
  descricao: string; valor: number; tipo: 'despesa' | 'receita';
  categoria: string; data: string; parcelas?: number;
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

/** Exemplos de input para o chat (usado como chips) */
export function getExampleMessages(): string[] {
  return ['Mercado ontem 150,50','Entrada 4k salário','Compra 1000 reais 10x','conta recorrente cartão 1500 dia 10','ajuda'];
}
