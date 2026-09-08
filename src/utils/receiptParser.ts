/**
 * @file utils/receiptParser.ts
 * @description Processador de texto OCR extraído de comprovantes e notas fiscais.
 * Suporta formatos comuns de bancos brasileiros, PIX e notas fiscais.
 */

export interface ReceiptData {
  amount: number | null;
  currency: string | null;
  description: string | null;
  date: string | null;
  store: string | null;
  paymentMethod: string | null;
  rawText: string;
  confidence: 'high' | 'medium' | 'low';
}

// ============================================
// PADRÕES DE EXTRAÇÃO DE VALOR
// ============================================

const AMOUNT_PATTERNS = [
  // Moedas: "R$ 1.234,56" / "CHF 54.50" / "EUR 36.33"
  /\b(?:R\$|CHF|EUR|USD|GBP|JPY|CAD|AUD|CNY|INR)\s*(\d{1,6}[.,]\d{2})\b/gi,
  // Moeda no final: "54.50 CHF" / "150,50 R$"
  /\b(\d{1,6}[.,]\d{2})\s*(?:R\$|CHF|EUR|USD|GBP|JPY|CAD|AUD|CNY|INR)\b/gi,
  // "Total: 429,00" / "Total: 429.00" / "VALOR: 1.234,56"
  /(?:valor|total|quantia|montante|pagamento|summe|betrag)\s*(?:total|a pagar|pago)?\s*[:=]?\s*(?:R\$|CHF|EUR|USD)?\s*(\d{1,6}[.,]\d{2})/gi,
  // "429,00" ou "429.00" (número solto com 2 casas decimais)
  /\b(\d{1,6}[.,]\d{2})\b/g,
];

// ============================================
// PADRÕES DE EXTRAÇÃO DE DATA
// ============================================

const DATE_PATTERNS = [
  // "30.07.2007/13:29:17" (formato alemão com hora)
  /\b(\d{1,2})\.(\d{1,2})\.(\d{2,4})\/\d{1,2}:\d{2}(?::\d{2})?\b/g,
  // "30.07.2007" (formato alemão/europeu)
  /\b(\d{1,2})\.(\d{1,2})\.(\d{2,4})\b/g,
  // "08/09/2026" / "08/09/26" (formato BR)
  /\b(\d{1,2})\/(\d{1,2})\/(\d{2,4})\b/g,
  // "08-09-2026"
  /\b(\d{1,2})-(\d{1,2})-(\d{2,4})\b/g,
  // "08 de set de 2026" / "08 de setembro de 2026"
  /\b(\d{1,2})\s+de\s+(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)\w*\s+(?:de\s+)?(\d{2,4})\b/gi,
  // "08 set 2026"
  /\b(\d{1,2})\s+(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)\w*\s+(\d{2,4})\b/gi,
];

const MONTH_MAP: Record<string, number> = {
  // Português
  'jan': 0, 'fev': 1, 'mar': 2, 'abr': 3, 'mai': 4, 'jun': 5,
  'jul': 6, 'ago': 7, 'set': 8, 'out': 9, 'nov': 10, 'dez': 11,
  // Alemão
  'feb': 1, 'mär': 2, 'aug': 7, 'sep': 8, 'okt': 9,
  // Inglês
  'may': 4, 'oct': 9, 'dec': 11,
};

// ============================================
// PADRÕES DE EXTRAÇÃO DE LOJA/ESTABELECIMENTO
// ============================================

const STORE_KEYWORDS = [
  'loja', 'estabelecimento', 'comercio', 'comércio', 'mercado',
  'supermercado', 'farmacia', 'farmácia', 'padaria', 'restaurante',
  'bar', 'posto', 'banco', 'instituição', 'recebedor', 'beneficiario',
  'favorecido', 'para', 'destinatario', 'destinatário',
];

const NOISE_LINES = [
  'comprovante',
  'recibo',
  'nota fiscal',
  'nf-e',
  'nfe',
  'cnpj',
  'cpf',
  'inscricao',
  'endereco',
  'endereço',
  'telefone',
  'contato',
  'www.',
  'http',
  'obrigado',
  'obrigada',
  'volte',
  'preferencia',
  'preferência',
  'cartao',
  'cartão',
  'bandeira',
  'operacao',
  'operação',
  'autorizacao',
  'autorização',
  'nsu',
  'tid',
  'codigo',
  'código',
  'voucher',
  'troco',
  'cashback',
  // Alemão
  'mwst',
  'steuer',
  'telefon',
  'fax',
  'e-mail',
  'bedienend',
];

// ============================================
// PADRÕES DE MÉTODO DE PAGAMENTO
// ============================================

const PAYMENT_METHODS: Array<{ pattern: RegExp; method: string }> = [
  { pattern: /(?:pix|transfer[êe]ncia\s+pix)/i, method: 'PIX' },
  { pattern: /(?:cart[ãa]o\s+(?:de\s+)?cr[ée]dito|cr[ée]dito)/i, method: 'Cartão de Crédito' },
  { pattern: /(?:cart[ãa]o\s+(?:de\s+)?d[ée]bito|d[ée]bito)/i, method: 'Cartão de Débito' },
  { pattern: /(?:boleto|uplicidade)/i, method: 'Boleto' },
  { pattern: /(?:dinheiro|esp[ée]cie|bar|bargeld)/i, method: 'Dinheiro' },
  { pattern: /(?:google\s*pay|apple\s*pay|samsung\s*pay)/i, method: 'Carteira Digital' },
  { pattern: /(?:mercado\s*pago|picpay|pagseguro|inter|iugu)/i, method: 'Pix/Transferência' },
];

// ============================================
// FUNÇÕES DE LIMPEZA
// ============================================

/**
 * Limpa e normaliza texto OCR
 */
function cleanOcrText(text: string): string {
  return text
    // Remove caracteres estranhos do OCR
    .replace(/[|\\~`]/g, ' ')
    // Normaliza espaços
    .replace(/\s+/g, ' ')
    // Remove linhas vazias múltiplas
    .replace(/\n\s*\n/g, '\n')
    // Remove espaços no início/fim de cada linha
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n');
}

/**
 * Verifica se uma linha é ruído (cabeçalho/rodapé)
 */
function isNoiseLine(line: string): boolean {
  const lower = line.toLowerCase();
  return NOISE_LINES.some(keyword => lower.includes(keyword)) ||
    /^\d{4,}$/.test(line.trim()) || // CNPJ/CPF puro
    line.trim().length < 2;
}

/**
 * Extrai a melhor descrição do texto
 */
function extractBestDescription(lines: string[]): string | null {
  // Procura por linhas que parecem nome de estabelecimento
  for (const line of lines) {
    // Pula linhas de ruído
    if (isNoiseLine(line)) continue;
    // Pula valores e datas
    if (/^[\d.,/\-\s]+$/.test(line)) continue;
    // Pula linhas muito curtas
    if (line.trim().length < 3) continue;
    // Pula linhas que são só números
    if (/^\d+\s*$/.test(line)) continue;

    return line.trim().substring(0, 50);
  }
  return null;
}

// ============================================
// FUNÇÕES DE EXTRAÇÃO
// ============================================

// Padrões que indicam que o número NÃO é um valor monetário
const NON_MONEY_PATTERNS = /(?:rech\.?\s*nr|nr\.|número|num|tel\.?|telefone|fax|mwst|cnpj|cpf|cep|código|nsu|tid|tisch|datum|uhrzeit)/i;

/**
 * Converte string de valor para número
 * Aceita: 429,00 | 429.00 | 1.234,56 | 1,234.56
 */
function parseValue(raw: string): number {
  // Remove espaços
  const clean = raw.replace(/\s/g, '');

  // Se tem vírgula E ponto
  if (clean.includes(',') && clean.includes('.')) {
    const lastComma = clean.lastIndexOf(',');
    const lastPeriod = clean.lastIndexOf('.');
    // O que vem DEPOIS é o decimal
    if (lastComma > lastPeriod) {
      // BR: 1.234,56
      return parseFloat(clean.replace(/\./g, '').replace(',', '.'));
    } else {
      // US: 1,234.56
      return parseFloat(clean.replace(/,/g, ''));
    }
  }

  // Só vírgula → decimal BR: 429,00 → 429.00
  if (clean.includes(',')) {
    return parseFloat(clean.replace(',', '.'));
  }

  // Só ponto → decimal US: 429.00 → 429.00
  // Ou inteiro: 429 → 429
  return parseFloat(clean);
}

interface AmountMatch {
  value: number;
  raw: string;
  index: number;
  currency: string | null;
  lineIndex: number;
  score: number;
}

/**
 * Extrai valor do texto com múltiplos padrões
 */
function extractAmount(text: string): { value: number; raw: string; currency: string | null } | null {
  const lines = text.split('\n');
  const allMatches: AmountMatch[] = [];

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];

    // Pula linhas que são claramente números de identificação
    if (NON_MONEY_PATTERNS.test(line)) continue;

    // Pula linhas muito curtas (1-2 chars)
    if (line.trim().length <= 2) continue;

    // Se a linha termina com moeda (ex: "Total: CHF"), olha a próxima linha
    let nextLineValue: string | null = null;
    const currencyEndMatch = line.match(/(?:CHF|EUR|USD|GBP|JPY|CAD|AUD|CNY|INR|R\$)\s*$/i);
    if (currencyEndMatch && lineIndex + 1 < lines.length) {
      const nextLine = lines[lineIndex + 1].trim();
      if (/^\d+[.,]\d{2}$/.test(nextLine)) {
        nextLineValue = nextLine;
      }
    }

    for (const pattern of AMOUNT_PATTERNS) {
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(line)) !== null) {
        let raw: string;
        let currency: string | null = null;

        if (match[2] && /(?:CHF|EUR|USD|GBP|JPY|CAD|AUD|CNY|INR|R\$)/i.test(match[1] || '')) {
          currency = match[1].toUpperCase();
          raw = match[2];
        } else if (match[2] && /(?:CHF|EUR|USD|GBP|JPY|CAD|AUD|CNY|INR|R\$)/i.test(match[2] || '')) {
          currency = match[2].toUpperCase();
          raw = match[1];
        } else {
          raw = match[2] || match[1];
        }

        if (!raw) continue;
        const value = parseValue(raw);
        if (!isNaN(value) && value > 0 && value < 100000) {
          let score = 0;

          // Verifica linha atual
          if (/(?:total|summe|betrag|valor|pagamento|quantia)/i.test(line)) {
            score += 100;
          }
          // Verifica linha anterior (para "TOTAL LIQUIDO\n429,00")
          if (lineIndex > 0) {
            const prevLine = lines[lineIndex - 1];
            if (/(?:total|summe|betrag|valor|pagamento|quantia)/i.test(prevLine)) {
              score += 100;
            }
          }
          if (currency) {
            score += 50;
          }
          const numsInLine = line.match(/\d+[.,]\d{2}/g);
          if (numsInLine && numsInLine.length === 1) {
            score += 30;
          }
          if (value < 1) {
            score -= 20;
          }
          // Penaliza valores muito baixos (< 5) que provavelmente são quantidades
          if (value < 5) {
            score -= 10;
          }

          allMatches.push({ value, raw, index: match.index, currency, lineIndex, score });
        }
      }
    }

    // Se a linha termina com moeda e a próxima linha é um valor
    if (nextLineValue) {
      const value = parseValue(nextLineValue);
      const currencyMatch = line.match(/(CHF|EUR|USD|GBP|JPY|CAD|AUD|CNY|INR|R\$)/i);
      const currency = currencyMatch ? currencyMatch[1].toUpperCase() : null;

      if (!isNaN(value) && value > 0 && value < 100000) {
        allMatches.push({
          value,
          raw: nextLineValue,
          index: 0,
          currency,
          lineIndex: lineIndex + 1,
          score: 150, // Prioridade máxima para "Total: CHF\n54.50"
        });
      }
    }
  }

  if (allMatches.length === 0) return null;

  allMatches.sort((a, b) => b.score - a.score);

  return allMatches[0];
}

/**
 * Extrai data do texto
 */
function extractDate(text: string): string | null {
  for (const pattern of DATE_PATTERNS) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(text)) !== null) {
      try {
        let day: number, month: number, year: number;

        if (match[0].includes('.')) {
          // Formato alemão/europeu: DD.MM.YYYY
          day = parseInt(match[1]);
          month = parseInt(match[2]) - 1;
          year = parseInt(match[3]);
        } else if (match[0].includes('/')) {
          day = parseInt(match[1]);
          month = parseInt(match[2]) - 1;
          year = parseInt(match[3]);
        } else if (match[0].includes('-')) {
          day = parseInt(match[1]);
          month = parseInt(match[2]) - 1;
          year = parseInt(match[3]);
        } else {
          // "08 de set de 2026"
          day = parseInt(match[1]);
          const monthStr = match[2].substring(0, 3).toLowerCase();
          month = MONTH_MAP[monthStr] ?? 0;
          year = parseInt(match[3]);
        }

        if (year < 100) year += 2000;
        if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
          const d = new Date(year, month, day, 12, 0, 0, 0);
          if (!isNaN(d.getTime())) {
            return formatDate(d);
          }
        }
      } catch {
        continue;
      }
    }
  }
  return null;
}

/**
 * Detecta método de pagamento
 */
function detectPaymentMethod(text: string): string | null {
  const lower = text.toLowerCase();
  for (const { pattern, method } of PAYMENT_METHODS) {
    if (pattern.test(lower)) {
      return method;
    }
  }
  return null;
}

/**
 * Extrai loja/estabelecimento do texto
 */
function extractStore(lines: string[]): string | null {
  for (const line of lines) {
    const lower = line.toLowerCase();
    if (STORE_KEYWORDS.some(kw => lower.includes(kw))) {
      if (line.length > 3 && line.length < 60) {
        return line.trim();
      }
    }
  }
  return null;
}

// ============================================
// FUNÇÃO PRINCIPAL
// ============================================

/**
 * Processa texto OCR de um comprovante e extrai dados estruturados.
 *
 * Suporta:
 * - Comprovantes de PIX
 * - Comprovantes de cartão (crédito/débito)
 * - Notas fiscais (NFe)
 * - Comprovantes de transferência bancária
 * - Boletos pagos
 *
 * @param text - Texto extraído pelo OCR
 * @returns Dados estruturados do comprovante
 *
 * @example
 * const receipt = parseReceiptText("Nubank\nPagamento de R$ 150,50\n08/09/2026\nPara: João");
 * // { amount: 150.50, date: "2026-09-08", store: "Nubank", ... }
 */
export function parseReceiptText(text: string): ReceiptData {
  const cleaned = cleanOcrText(text);
  const lines = cleaned.split('\n');

  // Extrai valor
  const amountResult = extractAmount(cleaned);

  // Extrai data
  const date = extractDate(cleaned);

  // Extrai descrição
  const description = extractBestDescription(lines);

  // Extrai loja
  const store = extractStore(lines);

  // Detecta método de pagamento
  const paymentMethod = detectPaymentMethod(cleaned);

  // Calcula confiança
  let confidence: 'high' | 'medium' | 'low' = 'low';
  if (amountResult && date && (description || store)) {
    confidence = 'high';
  } else if (amountResult && (date || description || store)) {
    confidence = 'medium';
  }

  return {
    amount: amountResult?.value ?? null,
    currency: amountResult?.currency ?? null,
    description: description || store,
    date: date,
    store: store,
    paymentMethod: paymentMethod,
    rawText: cleaned,
    confidence,
  };
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

/**
 * Gera mensagem de resposta baseada na confiança da extração
 */
export function getReceiptResponse(receipt: ReceiptData): string {
  if (!receipt.amount) {
    return '❌ Não consegui identificar o valor no comprovante.\nPor favor, digite manualmente.\nEx: "Mercado 150,50"';
  }

  const confidenceEmoji = receipt.confidence === 'high' ? '✅' : receipt.confidence === 'medium' ? '⚠️' : '❓';
  const confidenceText = receipt.confidence === 'high'
    ? 'Dados extraídos com sucesso!'
    : receipt.confidence === 'medium'
      ? 'Alguns dados podem precisar de correção'
      : 'Dados incompletos - verifique antes de salvar';

  const currencySymbol = receipt.currency || 'R$';

  let response = `${confidenceEmoji} ${confidenceText}\n\n`;
  response += `💰 Valor: ${currencySymbol} ${receipt.amount.toFixed(2).replace('.', ',')}\n`;

  if (receipt.description) {
    response += `📝 Descrição: ${receipt.description}\n`;
  }
  if (receipt.date) {
    const [y, m, d] = receipt.date.split('-');
    response += `📅 Data: ${d}/${m}/${y}\n`;
  }
  if (receipt.store) {
    response += `🏪 Local: ${receipt.store}\n`;
  }
  if (receipt.paymentMethod) {
    response += `💳 Pagamento: ${receipt.paymentMethod}\n`;
  }

  return response;
}
