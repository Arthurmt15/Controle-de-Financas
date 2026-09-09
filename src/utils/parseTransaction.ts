/**
 * @file utils/parseTransaction.ts
 * @description Utilitário para interpretar mensagens de texto e fotos
 * como transações financeiras. Suporta linguagem informal, datas relativas,
 * valores com "k"/"conto" e qualquer ordem dos campos na mensagem.
 *
 * Abordagem: cada componente (valor, data, tipo, categoria) é extraído
 * independentemente do texto. A descrição é montada com o que sobra.
 */

import { CATEGORY_MAP } from './categories';

// ============================================
// INTERFACES
// ============================================

export interface ParsedTransaction {
  descricao: string;
  valor: number;
  tipo: 'despesa' | 'receita';
  categoria: string;
  data: string; // YYYY-MM-DD
}

export interface ImageParseResult {
  amount: number | null;
  description: string | null;
  date: string | null;
  rawText: string;
}

// ============================================
// CONSTANTES
// ============================================

const INCOME_KEYWORDS = [
  'entrada', 'recebi', 'recebido', 'ganhei', 'ganho',
  'salário', 'salario', 'pagamento', 'ordenha',
  'depósito', 'deposito', 'transferência recebida', 'rendimento',
  'cashback', 'estorno', 'reembolso', 'prêmio', 'premio',
  'dividendos', 'caiu', 'entrou', 'crédito', 'credito',
];

const EXPENSE_KEYWORDS = [
  'saída', 'saida', 'gastei', 'paguei', 'comprei', 'saiu',
  'perdi', 'compra', 'despesa', 'conta', 'mercado', 'supermercado',
  'restaurante', 'almoço', 'almoco', 'jantar', 'café', 'cafe',
  'farmácia', 'farmacia', 'posto', 'combustível', 'combustivel',
  'transporte', 'uber', 'taxi', 'ônibus', 'onibus',
  'aluguel', 'condomínio', 'condominio', 'luz', 'água', 'agua',
  'internet', 'telefone', 'iptu',
];

const WEEKDAY_MAP: Record<string, number> = {
  'domingo': 0, 'dom': 0,
  'segunda': 1, 'seg': 1, 'segunda-feira': 1,
  'terça': 2, 'terca': 2, 'ter': 2, 'terça-feira': 2, 'terca-feira': 2,
  'quarta': 3, 'qua': 3, 'quarta-feira': 3,
  'quinta': 4, 'qui': 4, 'quinta-feira': 4,
  'sexta': 5, 'sex': 5, 'sexta-feira': 5,
  'sábado': 6, 'sabado': 6, 'sab': 6,
};

const MONTH_MAP: Record<string, number> = {
  'janeiro': 0, 'jan': 0,
  'fevereiro': 1, 'fev': 1,
  'março': 2, 'marco': 2, 'mar': 2,
  'abril': 3, 'abr': 3,
  'maio': 4, 'mai': 4,
  'junho': 5, 'jun': 5,
  'julho': 6, 'jul': 6,
  'agosto': 7, 'ago': 7,
  'setembro': 8, 'set': 8,
  'outubro': 9, 'out': 9,
  'novembro': 10, 'nov': 10,
  'dezembro': 11, 'dez': 11,
};

// ============================================
// FUNÇÕES DE EXTRACÇÃO INDEPENDENTE
// Cada função recebe o texto original e retorna
// o componente extraído + o texto limpo.
// ============================================

/**
 * Extrai valor numérico e retorna o texto sem ele.
 * Suporta qualquer posição: "150 mercado", "mercado 150", "gastei 150 no mercado"
 */
function extractAmount(text: string): { value: number; clean: string } | null {
  const lower = text.toLowerCase();

  // "4k", "2.5k", "1,5k"
  const kPattern = /(\d+(?:[.,]\d+)?)\s*k\b/i;
  const kMatch = lower.match(kPattern);
  if (kMatch) {
    const num = parseFloat(kMatch[1].replace(',', '.'));
    if (!isNaN(num) && num > 0) {
      return { value: num * 1000, clean: text.replace(kMatch[0], ' ').trim() };
    }
  }

  // "50 conto", "200 pila", "100 paus", "30 reais"
  const slangPattern = /(\d+(?:[.,]\d+)?)\s*(?:conto|pila|paus|reais)\b/i;
  const slangMatch = lower.match(slangPattern);
  if (slangMatch) {
    const num = parseFloat(slangMatch[1].replace(',', '.'));
    if (!isNaN(num) && num > 0) {
      return { value: num, clean: text.replace(slangMatch[0], ' ').trim() };
    }
  }

  // R$ 2000,50 | R$ 1.500 | R$25
  const brlPattern = /R\$\s*(\d{1,6}(?:\.\d{3})*(?:,\d{1,2})?)/i;
  const brlMatch = text.match(brlPattern);
  if (brlMatch) {
    const value = brlMatch[1].replace(/\./g, '').replace(',', '.');
    const num = parseFloat(value);
    if (!isNaN(num) && num > 0) {
      return { value: num, clean: text.replace(brlMatch[0], ' ').trim() };
    }
  }

  // Número com vírgula decimal: 150,50 | 25,50
  const commaDecimalPattern = /(\d{1,6}(?:\.\d{3})*,\d{1,2})\b/g;
  const commaMatches: RegExpExecArray[] = [];
  let commaMatch: RegExpExecArray | null;
  while ((commaMatch = commaDecimalPattern.exec(text)) !== null) {
    commaMatches.push(commaMatch);
  }
  if (commaMatches.length > 0) {
    const match = commaMatches[commaMatches.length - 1];
    const value = match[1].replace(/\./g, '').replace(',', '.');
    const num = parseFloat(value);
    if (!isNaN(num) && num > 0) {
      return { value: num, clean: text.slice(0, match.index).trim() + ' ' + text.slice(match.index! + match[0].length).trim() };
    }
  }

  // Número com ponto decimal: 25.50
  const dotDecimalPattern = /\b(\d{1,6}(?:,\d{3})*\.\d{1,2})\b/g;
  const dotMatches: RegExpExecArray[] = [];
  let dotMatch: RegExpExecArray | null;
  while ((dotMatch = dotDecimalPattern.exec(text)) !== null) {
    dotMatches.push(dotMatch);
  }
  if (dotMatches.length > 0) {
    const match = dotMatches[dotMatches.length - 1];
    const num = parseFloat(match[1]);
    if (!isNaN(num) && num > 0) {
      return { value: num, clean: text.slice(0, match.index).trim() + ' ' + text.slice(match.index! + match[0].length).trim() };
    }
  }

  // Número inteiro: 50, 100, 2000 (pega o ÚLTIMO número que pareça valor)
  const integerPattern = /\b(\d{2,6})\b/g;
  const integerMatches: RegExpExecArray[] = [];
  let integerMatch: RegExpExecArray | null;
  while ((integerMatch = integerPattern.exec(text)) !== null) {
    integerMatches.push(integerMatch);
  }
  if (integerMatches.length > 0) {
    const match = integerMatches[integerMatches.length - 1];
    const num = parseFloat(match[1]);
    if (!isNaN(num) && num > 0) {
      return { value: num, clean: text.slice(0, match.index).trim() + ' ' + text.slice(match.index! + match[0].length).trim() };
    }
  }

  return null;
}

/**
 * Extrai data e retorna o texto sem ela.
 * Suporta qualquer posição.
 */
function extractDate(text: string): { value: string; clean: string } | null {
  const lower = text.toLowerCase();
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  // "hoje"
  const hojeMatch = lower.match(/\bhoje\b/i);
  if (hojeMatch) {
    return { value: formatDate(today), clean: text.replace(hojeMatch[0], ' ').trim() };
  }

  // "ontem"
  const ontemMatch = lower.match(/\bontem\b/i);
  if (ontemMatch) {
    const d = new Date(today);
    d.setDate(d.getDate() - 1);
    return { value: formatDate(d), clean: text.replace(ontemMatch[0], ' ').trim() };
  }

  // "anteontem"
  const anteontemMatch = lower.match(/\banteontem\b/i);
  if (anteontemMatch) {
    const d = new Date(today);
    d.setDate(d.getDate() - 2);
    return { value: formatDate(d), clean: text.replace(anteontemMatch[0], ' ').trim() };
  }

  // Dias da semana
  for (const [dayName, dayNum] of Object.entries(WEEKDAY_MAP)) {
    const regex = new RegExp(`\\b${dayName}\\b`, 'i');
    const match = lower.match(regex);
    if (match) {
      const d = new Date(today);
      const currentDay = d.getDay();
      let diff = currentDay - dayNum;
      if (diff <= 0) diff += 7;
      d.setDate(d.getDate() - diff);
      return { value: formatDate(d), clean: text.replace(match[0], ' ').trim() };
    }
  }

  // "dia 20 de agosto" | "20 de agosto" | "dia 20 de agosto de 2025"
  const dmyPattern = /(?:dia\s+)?(\d{1,2})\s+de\s+(\w+)(?:\s+de\s+(\d{4}))?/i;
  const dmyMatch = lower.match(dmyPattern);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1]);
    const monthStr = dmyMatch[2];
    const month = MONTH_MAP[monthStr];
    if (month !== undefined) {
      let year = dmyMatch[3] ? parseInt(dmyMatch[3]) : today.getFullYear();
      const d = new Date(year, month, day, 12, 0, 0, 0);
      if (!dmyMatch[3] && d > today) {
        d.setFullYear(d.getFullYear() - 1);
      }
      return { value: formatDate(d), clean: text.replace(dmyMatch[0], ' ').trim() };
    }
  }

  // "dia 05/03" | "05/03" | "dia 05/03/2025"
  const slashPattern = /(?:dia\s+)?(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?/i;
  const slashMatch = lower.match(slashPattern);
  if (slashMatch) {
    const day = parseInt(slashMatch[1]);
    const month = parseInt(slashMatch[2]) - 1;
    if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      let year = slashMatch[3] ? parseInt(slashMatch[3]) : today.getFullYear();
      const d = new Date(year, month, day, 12, 0, 0, 0);
      if (!slashMatch[3] && d > today) {
        d.setFullYear(d.getFullYear() - 1);
      }
      return { value: formatDate(d), clean: text.replace(slashMatch[0], ' ').trim() };
    }
  }

  return null;
}

/**
 * Detecta tipo (despesa/receita) a partir do texto
 */
function detectType(text: string): 'despesa' | 'receita' {
  const lower = text.toLowerCase();

  for (const keyword of INCOME_KEYWORDS) {
    if (lower.includes(keyword)) return 'receita';
  }

  for (const keyword of EXPENSE_KEYWORDS) {
    if (lower.includes(keyword)) return 'despesa';
  }

  if (/R\$/i.test(text)) return 'despesa';

  return 'despesa';
}

/**
 * Detecta categoria e retorna o texto sem as palavras-chave da categoria
 */
function detectCategory(text: string, tipo: 'despesa' | 'receita'): { category: string; clean: string } {
  const lower = text.toLowerCase();

  for (const { keywords, category } of CATEGORY_MAP) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        // Verifica se a categoria faz sentido com o tipo
        if (tipo === 'receita' && ['Salário', 'Freelance', 'Investimentos'].includes(category)) {
          return { category, clean: text };
        }
        if (tipo === 'despesa' && ['Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Educação', 'Lazer'].includes(category)) {
          return { category, clean: text };
        }
      }
    }
  }

  return { category: tipo === 'receita' ? 'Salário' : 'Outros', clean: text };
}

/**
 * Extrai descrição do texto restante após remover valor, data, tipo e preposições.
 * Não depende da ordem dos campos.
 */
function extractDescription(remainingText: string): string {
  let desc = remainingText;

  // Remove palavras-chave de tipo (despesa/receita) que podem estar no início
  const typeKeywords = [
    'gastei', 'paguei', 'comprei', 'saiu', 'perdi', 'compra', 'despesa',
    'recebi', 'recebido', 'ganhei', 'ganho', 'pagamento', 'entrada',
    'salário', 'salario', 'rendimento', 'cashback', 'estorno', 'reembolso',
  ];
  for (const keyword of typeKeywords) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    desc = desc.replace(regex, ' ');
  }

  // Remove preposições e artigos soltos no início
  desc = desc.replace(/^\s*(de|da|do|das|dos|no|na|nas|nos|em|e|a|o|as|os|um|uma|uns|umas)\s+/gi, '');

  // Remove preposições no meio também
  desc = desc.replace(/\s+(de|da|do|das|dos|no|na|nas|nos|em)\s+/gi, ' ');

  // Remove números soltos que possam ter sobrado
  desc = desc.replace(/\b\d{1,6}(?:\.\d{3})*(?:,\d{1,2})?\b/g, '');
  desc = desc.replace(/\b\d{2,6}\b/g, '');

  // Limpa espaços extras, vírgulas e pontos soltos
  desc = desc.replace(/[,.\s]+/g, ' ').trim();

  // Se ficou vazio, retorna vazio (será tratado depois)
  if (desc.length < 2) {
    return '';
  }

  // Capitaliza primeira letra
  return desc.charAt(0).toUpperCase() + desc.slice(1);
}

/**
 * Formata Date para YYYY-MM-DD
 */
function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ============================================
// FUNÇÃO PRINCIPAL
// ============================================

/**
 * Parseia uma mensagem de texto em uma transação financeira.
 * Extrai cada componente independentemente da ordem na mensagem.
 *
 * Suporta:
 * - Valor em qualquer posição: "mercado 150", "150 mercado", "gastei 150 no mercado"
 * - Data em qualquer posição: "ontem 150 mercado", "mercado ontem 150"
 * - Tipo em qualquer posição: "entrada 4k", "4k caiu"
 * - Gírias: "4k", "50 conto", "200 pila"
 * - Datas: "hoje", "ontem", "terça", "dia 20 de agosto", "05/03"
 *
 * @example parseTransactionFromMessage("mercado 150,50")
 * @example parseTransactionFromMessage("150,50 mercado")
 * @example parseTransactionFromMessage("gastei 150 no mercado")
 * @example parseTransactionFromMessage("mercado ontem 150,50")
 * @example parseTransactionFromMessage("ontem 150 mercado")
 * @example parseTransactionFromMessage("entrada 4k")
 * @example parseTransactionFromMessage("4k entrada")
 * @example parseTransactionFromMessage("dia 20 de agosto 4000")
 * @example parseTransactionFromMessage("4000 dia 20 de agosto")
 */
export function parseTransactionFromMessage(message: string): ParsedTransaction | null {
  // 1. Extrai data primeiro (para remover números de datas como "20 de agosto")
  const dateResult = extractDate(message);
  const textWithoutDate = dateResult?.clean || message;
  const data = dateResult?.value || formatDate(new Date());

  // 2. Extrai valor do texto sem a data
  const amountResult = extractAmount(textWithoutDate);
  if (!amountResult) return null;
  const valor = amountResult.value;

  // 3. Detecta tipo
  const tipo = detectType(message);

  // 4. Detecta categoria
  const catResult = detectCategory(message, tipo);
  const categoria = catResult.category;

  // 5. Monta descrição do texto que sobrou
  const textForDescription = amountResult.clean;
  const descricao = extractDescription(textForDescription) || categoria;

  return { descricao, valor, tipo, categoria, data };
}

/**
 * Analisa texto extraído de imagem (OCR).
 */
export function parseImageText(text: string): ImageParseResult {
  const result: ImageParseResult = {
    amount: null,
    description: null,
    date: null,
    rawText: text,
  };

  const amountResult = extractAmount(text);
  if (amountResult) result.amount = amountResult.value;

  const dateResult = extractDate(text);
  if (dateResult) result.date = dateResult.value;

  const lines = text.split('\n').filter(line => line.trim().length > 3);
  for (const line of lines) {
    const cleaned = line.trim();
    if (cleaned.length > 3 && !/^\d+[.,]?\d*$/.test(cleaned)) {
      result.description = cleaned.substring(0, 50);
      break;
    }
  }

  return result;
}

/**
 * Gera exemplos de mensagens para o usuário
 */
export function getExampleMessages(): string[] {
  return [
    'Mercado ontem 150,50',
    'Entrada 4k salário',
    'resumo',
    'análise',
    'ajuda',
  ];
}
