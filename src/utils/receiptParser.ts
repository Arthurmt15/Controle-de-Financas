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
  // Moedas estrangeiras: "CHF 54.50" / "EUR 36.33" / "USD 25.00"
  /\b(CHF|EUR|USD|GBP|JPY|CAD|AUD|CNY|INR|R\$)\s*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})\b/gi,
  // Moeda no final: "54.50 CHF" / "36.33 EUR"
  /\b(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})\s*(CHF|EUR|USD|GBP|JPY|CAD|AUD|CNY|INR|R\$)\b/gi,
  // PIX: "Transferência de R$ 1.500,00" / "enviou R$ 25,50"
  /(?:transfer[êe]ncia|envio|pagamento|pix|cr[ée]dito|d[ée]bito)\s*(?:de\s*)?R\$\s*(\d{1,3}(?:\.\d{3})*,\d{2})/gi,
  // R$: "R$ 1.234,56"
  /R\$\s*(\d{1,3}(?:\.\d{3})*,\d{2})/g,
  // "VALOR TOTAL: 1.234,56" / "Total: CHF 54.50" / "Total: 54.50"
  /(?:valor|total|quantia|montante|pagamento|summe|betrag|total)\s*(?:total|a pagar|pago)?\s*[:=]?\s*(?:CHF|EUR|USD|R\$)?\s*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/gi,
  // "150,50" (número solto com vírgula decimal - padrão BR)
  /\b(\d{1,3}(?:\.\d{3})*,\d{2})\b/g,
  // "54.50" / "150.50" (ponto decimal - padrão EUA/EU)
  /\b(\d{1,6}\.\d{2})\b/g,
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

/**
 * Extrai valor do texto com múltiplos padrões
 */
function extractAmount(text: string): { value: number; raw: string; currency: string | null } | null {
  const allMatches: Array<{ value: number; raw: string; index: number; currency: string | null }> = [];

  for (const pattern of AMOUNT_PATTERNS) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(text)) !== null) {
      // Padrões com 2 captures (moeda + valor ou valor + moeda)
      let raw: string;
      let currency: string | null = null;

      if (match[2] && /(?:CHF|EUR|USD|GBP|JPY|CAD|AUD|CNY|INR|R\$)/i.test(match[1] || '')) {
        // Padrão: MOEDA VALOR (ex: "CHF 54.50")
        currency = match[1].toUpperCase();
        raw = match[2];
      } else if (match[2] && /(?:CHF|EUR|USD|GBP|JPY|CAD|AUD|CNY|INR|R\$)/i.test(match[2] || '')) {
        // Padrão: VALOR MOEDA (ex: "54.50 CHF")
        currency = match[2].toUpperCase();
        raw = match[1];
      } else {
        // Padrão sem moeda
        raw = match[2] || match[1];
      }

      if (!raw) continue;
      const value = parseFloat(raw.replace(/\./g, '').replace(',', '.'));
      if (!isNaN(value) && value > 0 && value < 1000000) {
        allMatches.push({ value, raw, index: match.index, currency });
      }
    }
  }

  if (allMatches.length === 0) return null;

  // Prioriza: Total > Valor > primeiro encontrado
  const prioritized = allMatches.find(m => {
    const before = text.substring(Math.max(0, m.index - 40), m.index).toLowerCase();
    return /(?:total|summe|betrag|valor|pagamento|quantia)/i.test(before);
  });

  return prioritized || allMatches[0];
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
