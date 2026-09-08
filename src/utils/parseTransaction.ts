/**
 * @file utils/parseTransaction.ts
 * @description Utilitário para interpretar mensagens de texto e fotos
 * como transações financeiras. Suporta linguagem informal, datas relativas,
 * valores com "k"/"conto" e detecção automática de categoria.
 */

// ============================================
// INTERFACES
// ============================================

/**
 * Resultado do parse de uma mensagem
 */
export interface ParsedTransaction {
  descricao: string;
  valor: number;
  tipo: 'despesa' | 'receita';
  categoria: string;
  data: string; // YYYY-MM-DD
}

/**
 * Resultado do parse de imagem (OCR)
 */
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

const CATEGORY_MAP: Array<{ keywords: string[]; category: string }> = [
  {
    keywords: ['mercado', 'supermercado', 'compra', 'almoço', 'almoco',
      'jantar', 'café', 'cafe', 'restaurante', 'lanche', 'padaria',
      'açougue', 'acougue', 'feira', 'refeição', 'refeicao', 'comida'],
    category: 'Alimentação',
  },
  {
    keywords: ['uber', '99', 'taxi', 'ônibus', 'onibus', 'combustível',
      'combustivel', 'posto', 'gasolina', 'etanol', 'estacionamento',
      'pedágio', 'pedagio', 'van', 'táxi'],
    category: 'Transporte',
  },
  {
    keywords: ['aluguel', 'luz', 'água', 'agua', 'internet', 'condomínio',
      'condominio', 'telefone', 'encargos', 'iptu', 'conta de luz',
      'conta de água', 'conta de agua', 'energia', 'gás', 'gas'],
    category: 'Moradia',
  },
  {
    keywords: ['farmácia', 'farmacia', 'remédio', 'remedio', 'médico',
      'medico', 'hospital', 'exame', 'dentista', 'consulta', 'plano de saúde',
      'plano de saude', 'vacina', 'laboratório', 'laboratorio'],
    category: 'Saúde',
  },
  {
    keywords: ['escola', 'faculdade', 'curso', 'livro', 'material',
      'matrícula', 'matricula', 'mensalidade', 'aula', 'universidade',
      'college', 'university', 'curso online'],
    category: 'Educação',
  },
  {
    keywords: ['cinema', 'show', 'teatro', 'parque', 'bar', 'balada',
      'jogo', 'netflix', 'spotify', 'spotify premium', 'amazon prime',
      'hbo', 'streaming', 'viagem', 'hotel', 'passeio', 'lazer',
      'playstation', 'xbox', 'steam'],
    category: 'Lazer',
  },
  {
    keywords: ['roupa', 'calçado', 'calcado', 'sapato', 'tênis', 'tenis',
      'camisa', 'calça', 'calca', 'vestido', 'compra de roupa',
      'zara', 'h&m', 'renner', 'c&a'],
    category: 'Lazer',
  },
  {
    keywords: ['salário', 'salario', 'pagamento', 'ordenha', 'proventos'],
    category: 'Salário',
  },
  {
    keywords: ['freelance', 'freela', 'bico', 'self-employed', 'trabalho extra'],
    category: 'Freelance',
  },
  {
    keywords: ['investimento', 'ações', 'acoes', 'renda fixa', 'tesouro',
      'dividendo', 'cdf', 'lcI', 'lca', 'cripto', 'bitcoin', 'criptomoeda'],
    category: 'Investimentos',
  },
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
// FUNÇÕES DE EXTRACÇÃO
// ============================================

/**
 * Extrai valor numérico de uma string.
 * Suporta: R$ 25,50 | 25.50 | 25,50 | 4k | 2.5k | 50 conto | 200 pila
 */
function extractAmount(text: string): number | null {
  const lower = text.toLowerCase();

  // "4k", "2.5k", "1,5k"
  const kPattern = /(\d+(?:[.,]\d+)?)\s*k\b/i;
  const kMatch = lower.match(kPattern);
  if (kMatch) {
    const num = parseFloat(kMatch[1].replace(',', '.'));
    if (!isNaN(num) && num > 0) return num * 1000;
  }

  // "50 conto", "200 pila", "100 paus", "30 reais"
  const slangPattern = /(\d+(?:[.,]\d+)?)\s*(?:conto|pila|paus|reais)\b/i;
  const slangMatch = lower.match(slangPattern);
  if (slangMatch) {
    const num = parseFloat(slangMatch[1].replace(',', '.'));
    if (!isNaN(num) && num > 0) return num;
  }

  // R$ 2000,50 | R$ 1.500 | R$25
  const brlPattern = /R\$\s*(\d{1,6}(?:\.\d{3})*(?:,\d{1,2})?)/i;
  const brlMatch = text.match(brlPattern);
  if (brlMatch) {
    const value = brlMatch[1].replace(/\./g, '').replace(',', '.');
    const num = parseFloat(value);
    if (!isNaN(num) && num > 0) return num;
  }

  // Número com vírgula decimal: 25,50
  const commaDecimalPattern = /(\d{1,6}(?:\.\d{3})*,\d{1,2})\b/g;
  const commaMatches = text.match(commaDecimalPattern);
  if (commaMatches) {
    const lastMatch = commaMatches[commaMatches.length - 1];
    const value = lastMatch.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(value);
    if (!isNaN(num) && num > 0) return num;
  }

  // Número com ponto decimal: 25.50
  const dotDecimalPattern = /\b(\d{1,6}(?:,\d{3})*\.\d{1,2})\b/g;
  const dotMatches = text.match(dotDecimalPattern);
  if (dotMatches) {
    const lastMatch = dotMatches[dotMatches.length - 1];
    const num = parseFloat(lastMatch);
    if (!isNaN(num) && num > 0) return num;
  }

  // Número inteiro: 50, 100, 2000
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
 * Determina o tipo da transação (despesa ou receita)
 */
function detectType(text: string): 'despesa' | 'receita' {
  const lower = text.toLowerCase();

  for (const keyword of INCOME_KEYWORDS) {
    if (lower.includes(keyword)) return 'receita';
  }

  for (const keyword of EXPENSE_KEYWORDS) {
    if (lower.includes(keyword)) return 'despesa';
  }

  // Se mencionar "R$" sem contexto claro, assume despesa
  if (/R\$/i.test(text)) return 'despesa';

  // Padrão: despesa
  return 'despesa';
}

/**
 * Extrai e interpreta data da mensagem.
 * Suporta: hoje, ontem, anteontem, dias da semana, "dia 20 de agosto", "05/03"
 */
function extractDate(text: string): string {
  const lower = text.toLowerCase();
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  // "hoje"
  if (/\bhoje\b/i.test(lower)) {
    return formatDate(today);
  }

  // "ontem"
  if (/\bontem\b/i.test(lower)) {
    const d = new Date(today);
    d.setDate(d.getDate() - 1);
    return formatDate(d);
  }

  // "anteontem"
  if (/\banteontem\b/i.test(lower)) {
    const d = new Date(today);
    d.setDate(d.getDate() - 2);
    return formatDate(d);
  }

  // Dias da semana: "segunda", "terça", etc.
  for (const [dayName, dayNum] of Object.entries(WEEKDAY_MAP)) {
    const regex = new RegExp(`\\b${dayName}\\b`, 'i');
    if (regex.test(lower)) {
      const d = new Date(today);
      const currentDay = d.getDay();
      let diff = currentDay - dayNum;
      if (diff <= 0) diff += 7; // Sempre pega o mais recente no passado
      d.setDate(d.getDate() - diff);
      return formatDate(d);
    }
  }

  // "dia 20 de agosto" | "20 de agosto" | "dia 20 de agosto de 2025"
  const dayMonthYearPattern = /(?:dia\s+)?(\d{1,2})\s+de\s+(\w+)(?:\s+de\s+(\d{4}))?/i;
  const dmyMatch = lower.match(dayMonthYearPattern);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1]);
    const monthStr = dmyMatch[2];
    const month = MONTH_MAP[monthStr];
    if (month !== undefined) {
      let year = dmyMatch[3] ? parseInt(dmyMatch[3]) : today.getFullYear();
      const d = new Date(year, month, day, 12, 0, 0, 0);
      // Se não tem ano explícito e a data já passou neste ano, OK.
      // Se a data é futura neste ano, assume ano anterior.
      if (!dmyMatch[3] && d > today) {
        d.setFullYear(d.getFullYear() - 1);
      }
      return formatDate(d);
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
      return formatDate(d);
    }
  }

  // Padrão: data atual
  return formatDate(today);
}

/**
 * Detecta categoria a partir do texto e tipo
 */
function detectCategory(text: string, tipo: 'despesa' | 'receita'): string {
  const lower = text.toLowerCase();

  for (const { keywords, category } of CATEGORY_MAP) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        // Verifica se a categoria faz sentido com o tipo
        if (tipo === 'receita' && ['Salário', 'Freelance', 'Investimentos'].includes(category)) {
          return category;
        }
        if (tipo === 'despesa' && ['Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Educação', 'Lazer'].includes(category)) {
          return category;
        }
      }
    }
  }

  // Fallback baseado no tipo
  return tipo === 'receita' ? 'Salário' : 'Outros';
}

/**
 * Extrai descrição da transação removendo valor, data, tipo e categorias
 */
function extractDescription(text: string, tipo: 'despesa' | 'receita', categoria: string): string {
  let desc = text;

  // Remove R$ xx,xx
  desc = desc.replace(/R\$\s*\d{1,6}(?:\.\d{3})*(?:,\d{1,2})?/gi, '');

  // Remove "4k", "2.5k"
  desc = desc.replace(/\d+(?:[.,]\d+)?\s*k\b/gi, '');

  // Remove "50 conto", "200 pila", etc
  desc = desc.replace(/\d+(?:[.,]\d+)?\s*(?:conto|pila|paus|reais)\b/gi, '');

  // Remove datas: "dia 20 de agosto", "05/03/2025", etc
  desc = desc.replace(/(?:dia\s+)?\d{1,2}\s+de\s+\w+(?:\s+de\s+\d{4})?/gi, '');
  desc = desc.replace(/(?:dia\s+)?\d{1,2}\/\d{1,2}(?:\/\d{4})?/gi, '');

  // Remove dias da semana e relações temporais
  const temporalWords = ['hoje', 'ontem', 'anteontem', 'segunda', 'terça', 'terca',
    'quarta', 'quinta', 'sexta', 'sábado', 'sabado', 'domingo',
    'seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'];
  for (const word of temporalWords) {
    desc = desc.replace(new RegExp(`\\b${word}\\b`, 'gi'), '');
  }

  // Remove palavras de tipo
  const typeWords = [
    'entrada', 'saída', 'saida', 'recebi', 'recebido', 'ganhei',
    'ganho', 'gastei', 'paguei', 'comprei', 'compra', 'despesa',
    'pagamento', 'caiu', 'saiu', 'perdi', 'entrou',
  ];
  for (const word of typeWords) {
    desc = desc.replace(new RegExp(`\\b${word}\\b`, 'gi'), '');
  }

  // Remove preposições e artigos soltos no início
  desc = desc.replace(/^\s*(de|da|do|das|dos|no|na|nas|nos|em|e|a|o|as|os)\s+/gi, '');

  // Remove números soltos
  desc = desc.replace(/\b\d{1,6}(?:\.\d{3})*(?:,\d{1,2})?\b/g, '');
  desc = desc.replace(/\b\d{2,6}\b/g, '');

  // Limpa espaços extras
  desc = desc.replace(/\s+/g, ' ').trim();

  // Se ficou vazio ou muito curto, usa a categoria como descrição
  if (desc.length < 2) {
    return categoria;
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
 * Suporta linguagem informal, datas relativas, valores com k/conto, etc.
 *
 * @param message - Mensagem do usuário
 * @returns Transação parseada ou null se não conseguir interpretar
 *
 * @example
 * parseTransactionFromMessage("Gastei 120 da luz dia 5 de janeiro")
 * // { descricao: "Conta de luz", valor: 120, tipo: "despesa", categoria: "Moradia", data: "2026-01-05" }
 *
 * @example
 * parseTransactionFromMessage("caiu 4k na conta ontem")
 * // { descricao: "Entrada de valor", valor: 4000, tipo: "receita", categoria: "Salário", data: "2026-09-07" }
 *
 * @example
 * parseTransactionFromMessage("mercado ontem 150,50")
 * // { descricao: "Mercado", valor: 150.50, tipo: "despesa", categoria: "Alimentação", data: "2026-09-07" }
 */
export function parseTransactionFromMessage(message: string): ParsedTransaction | null {
  const valor = extractAmount(message);

  if (valor === null) {
    return null;
  }

  const tipo = detectType(message);
  const data = extractDate(message);
  const categoria = detectCategory(message, tipo);
  const descricao = extractDescription(message, tipo, categoria);

  return { descricao, valor, tipo, categoria, data };
}

/**
 * Analisa texto extraído de imagem (OCR).
 * Procura por padrões de valores e datas.
 */
export function parseImageText(text: string): ImageParseResult {
  const result: ImageParseResult = {
    amount: null,
    description: null,
    date: null,
    rawText: text,
  };

  result.amount = extractAmount(text);

  // dd/mm/aaaa
  const datePattern = /(\d{2})\/(\d{2})\/(\d{4})/;
  const dateMatch = text.match(datePattern);
  if (dateMatch) {
    const [, day, month, year] = dateMatch;
    result.date = `${year}-${month}-${day}`;
  }

  // Primeira linha significativa
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
    'Gastei 120 da luz dia 5 de janeiro',
    'Mercado ontem 150,50',
    'Entrada 4k salário',
    'Uber terça 45',
    'Paguei 200 pila no aluguel',
    'Farmácia 89,90',
    'Ganhei 500 freelance sexta',
    'Jantar 85',
  ];
}

/**
 * Estilos (cor e ícone) para cada categoria padrão.
 * Usado para criar novas categorias no banco com a aparência correta.
 */
export const CATEGORY_STYLES: Record<string, { color: string; icon: string }> = {
  'Alimentação': { color: '#FF6B6B', icon: 'FaUtensils' },
  'Transporte': { color: '#4ECDC4', icon: 'FaCar' },
  'Moradia': { color: '#45B7D1', icon: 'FaHome' },
  'Saúde': { color: '#FFEAA7', icon: 'FaHeartbeat' },
  'Educação': { color: '#DDA0DD', icon: 'FaGraduationCap' },
  'Lazer': { color: '#96CEB4', icon: 'FaGamepad' },
  'Salário': { color: '#00B894', icon: 'FaMoneyBillWave' },
  'Freelance': { color: '#6C5CE7', icon: 'FaLaptop' },
  'Investimentos': { color: '#FDCB6E', icon: 'FaChartLine' },
  'Outros': { color: '#636E72', icon: 'FaEllipsisH' },
};
