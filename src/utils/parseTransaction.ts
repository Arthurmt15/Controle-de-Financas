/**
 * @file utils/parseTransaction.ts
 * @description Utilitário para interpretar mensagens de texto e fotos
 * como transações financeiras.
 */

/**
 * Interface representando uma transação parseada de mensagem
 */
export interface ParsedTransaction {
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
}

/**
 * Interface para resultado do parse de imagem
 */
export interface ImageParseResult {
  amount: number | null;
  description: string | null;
  date: string | null;
  rawText: string;
}

/**
 * Palavras-chave que indicam tipo de transação
 */
const INCOME_KEYWORDS = [
  'entrada', 'recebi', 'recebido', 'salário', 'salario', 'pagamento',
  'depósito', 'deposito', 'transferência recebida', 'rendimento',
  'cashback', 'estorno', 'reembolso', 'prêmio', 'premio', ' dividendos',
];

const EXPENSE_KEYWORDS = [
  'saída', 'saida', 'gastei', 'paguei', 'pagamento', 'comprei',
  'compra', 'despesa', 'aluguel', 'conta', 'mercado', 'supermercado',
  'restaurante', 'almoço', 'almoco', 'jantar', 'café', 'cafe',
  'farmácia', 'farmacia', 'posto', 'combustível', 'combustivel',
  'transporte', 'uber', '99', 'taxi', 'ônibus', 'onibus',
];

/**
 * Extrai valor numérico de uma string
 * Suporta formatos: R$ 25,50 | 25.50 | 25,50 | R$25
 */
function extractAmount(text: string): number | null {
  // Padrão para R$ seguido de número
  const brlPattern = /R\$\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/i;
  const brlMatch = text.match(brlPattern);
  if (brlMatch) {
    const value = brlMatch[1].replace(/\./g, '').replace(',', '.');
    const num = parseFloat(value);
    if (!isNaN(num) && num > 0) return num;
  }

  // Padrão para número com vírgula decimal (ex: 25,50)
  const commaDecimalPattern = /(\d{1,3}(?:\.\d{3})*,\d{1,2})\b/g;
  const commaMatches = text.match(commaDecimalPattern);
  if (commaMatches) {
    // Pega o último valor encontrado (geralmente o total)
    const lastMatch = commaMatches[commaMatches.length - 1];
    const value = lastMatch.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(value);
    if (!isNaN(num) && num > 0) return num;
  }

  // Padrão para número com ponto decimal (ex: 25.50)
  const dotDecimalPattern = /\b(\d{1,3}(?:,\d{3})*\.\d{1,2})\b/g;
  const dotMatches = text.match(dotDecimalPattern);
  if (dotMatches) {
    const lastMatch = dotMatches[dotMatches.length - 1];
    const num = parseFloat(lastMatch);
    if (!isNaN(num) && num > 0) return num;
  }

  // Padrão para número inteiro (ex: 50, 100)
  const integerPattern = /\b(\d{2,6})\b/g;
  const integerMatches = text.match(integerPattern);
  if (integerMatches) {
    const lastMatch = integerMatches[integerMatches.length - 1];
    const num = parseFloat(lastMatch);
    if (!isNaN(num) && num > 0) return num;
  }

  return null;
}

/**
 * Determina o tipo da transação baseado em palavras-chave
 */
function detectType(text: string): 'income' | 'expense' {
  const lowerText = text.toLowerCase();

  for (const keyword of INCOME_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      return 'income';
    }
  }

  for (const keyword of EXPENSE_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      return 'expense';
    }
  }

  // Padrão: se mencionar "R$" sem contexto claro, assume despesa
  return 'expense';
}

/**
 * Extrai descrição removendo valor e tipo
 */
function extractDescription(text: string, amount: number | null): string {
  let description = text;

  // Remove valores R$ xx,xx
  description = description.replace(/R\$\s*\d{1,3}(?:\.\d{3})*(?:,\d{2})?/gi, '');

  // Remove números soltos
  description = description.replace(/\b\d{1,3}(?:\.\d{3})*,\d{1,2}\b/g, '');
  description = description.replace(/\b\d{1,3}(?:,\d{3})*\.\d{1,2}\b/g, '');
  description = description.replace(/\b\d{2,6}\b/g, '');

  // Remove palavras de tipo
  const typeWords = [
    'entrada', 'saída', 'saida', 'recebi', 'recebido', 'gastei',
    'paguei', 'comprei', 'compra', 'despesa', 'pagamento',
  ];
  for (const word of typeWords) {
    description = description.replace(new RegExp(`\\b${word}\\b`, 'gi'), '');
  }

  // Limpa espaços extras e capitaliza
  description = description
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (str) => str.toUpperCase());

  return description || 'Transação via chat';
}

/**
 * Parseia uma mensagem de texto em uma transação
 * @param message - Mensagem do usuário
 * @returns Transação parseada ou null se não conseguir interpretar
 *
 * @example
 * parseTransactionFromMessage("Almoço R$ 25,50")
 * // { description: "Almoço", amount: 25.50, type: "expense", date: "2026-09-03" }
 *
 * @example
 * parseTransactionFromMessage("Entrada R$ 500 salário")
 * // { description: "Salário", amount: 500, type: "income", date: "2026-09-03" }
 */
export function parseTransactionFromMessage(message: string): ParsedTransaction | null {
  const amount = extractAmount(message);

  if (amount === null) {
    return null;
  }

  const type = detectType(message);
  const description = extractDescription(message, amount);

  const today = new Date().toISOString().split('T')[0];

  return {
    description,
    amount,
    type,
    date: today,
  };
}

/**
 * Analisa texto extraído de imagem (OCR básico)
 * Procura por padrões de valores e datas
 * @param text - Texto extraído da imagem
 * @returns Resultado da análise
 */
export function parseImageText(text: string): ImageParseResult {
  const result: ImageParseResult = {
    amount: null,
    description: null,
    date: null,
    rawText: text,
  };

  // Extrai valor
  result.amount = extractAmount(text);

  // Extrai data (padrão brasileiro: dd/mm/aaaa)
  const datePattern = /(\d{2})\/(\d{2})\/(\d{4})/;
  const dateMatch = text.match(datePattern);
  if (dateMatch) {
    const [, day, month, year] = dateMatch;
    result.date = `${year}-${month}-${day}`;
  }

  // Tenta extrair descrição (primeira linha significativa)
  const lines = text.split('\n').filter(line => line.trim().length > 3);
  if (lines.length > 0) {
    // Pega a primeira linha que não seja só número
    for (const line of lines) {
      const cleaned = line.trim();
      if (cleaned.length > 3 && !/^\d+[\.,]?\d*$/.test(cleaned)) {
        result.description = cleaned.substring(0, 50);
        break;
      }
    }
  }

  return result;
}

/**
 * Gera exemplos de mensagens para o usuário
 */
export function getExampleMessages(): string[] {
  return [
    'Almoço R$ 35',
    'Mercado R$ 150,50',
    'Entrada R$ 2500 salário',
    'Uber R$ 22',
    'Farmácia R$ 45,90',
    'Saída R$ 800 aluguel',
  ];
}
