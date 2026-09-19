import { extractAmount } from './parseAmount';
import { extractDate, formatDate } from './parseDate';
import { detectType, detectCategory, extractDescription } from './parseCategory';

export interface ParsedTransaction {
  descricao: string;
  valor: number;
  tipo: 'despesa' | 'receita';
  categoria: string;
  data: string;
  parcelas?: number;
}

/**
 * Detecta se a mensagem é uma dúvida/pergunta e não uma transação clara.
 * Evita que "estou com uma dúvida de 2000" vire transação.
 */
function isQuestionLike(message: string): boolean {
  const lower = message.toLowerCase();
  const hasQuestionMark = message.includes('?');
  const hasDoubt = /d[uú]vida/.test(lower);
  const hasHelpIntent =
    /\b(como|posso|vale a pena|devo|ser[aá]|quanto posso|quanto ganho|quanto eu ganho|me ajuda|me explica|explica|ajuda|conselho|opini[aã]o|sugest[aã]o|pretendo|quero investir|quero aplicar|simula|simular|calcule|proje[cç][aã]o|lucro|rentabilidade|juros|por m[eê]s|durante|ao ano)\b/.test(
      lower
    );
  const hasDoubtPrefix =
    /^(estou com|tenho|posso|vale|devo|como|quanto|ser[aá]|qual|onde|quando|por que|porque|pretendo|quanto ganho|quanto eu ganho)\b/.test(
      lower.trim()
    );
  // Frases de planejamento futuro ("pretendo investir", "quanto ganho se investir") são sempre pergunta, mesmo com "investir"
  const isPlanning =
    /\b(pretendo|planejo|quero)\s+(investir|aplicar|guardar|poupar)\b/i.test(lower) ||
    /\bquanto.*ganho\b/i.test(lower) ||
    /\b(lucro|rentabilidade).*%.*ao ano\b/i.test(lower);
  return hasQuestionMark || hasDoubt || hasHelpIntent || hasDoubtPrefix || isPlanning;
}

/**
 * Sinais fortes de intenção de transação (verbo ou contexto financeiro claro) — agora inclui dívida.
 */
function hasTransactionIntent(message: string): boolean {
  const lower = message.toLowerCase();
  // "pretendo investir" / "quanto ganho" não é transação imediata, mesmo tendo "investir"
  if (/\b(pretendo|planejo|quero)\s+(investir|aplicar|guardar)\b/i.test(lower)) return false;
  if (/\bquanto.*ganho\b/i.test(lower) && /\b(investir|lucro|juros|rentabilidade)\b/i.test(lower))
    return false;
  return /\b(comprei|paguei|gastei|mercado|supermercado|restaurante|almo[cç]o|jantar|caf[eé]|farm[aá]cia|posto|combust[ií]vel|transporte|uber|aluguel|condom[ií]nio|luz|[aá]gua|internet|recebi|recebido|ganhei|sal[aá]rio|entrada|entra|entrou|sa[ií]da|reembolso|estorno|parcelado|vezes|x\b|R\$|reais?|conto|pila|d[ií]vida|dividida|empr[eé]stimo|investi|apliquei|investimento|investimentos)\b/i.test(
    lower
  );
}

/**
 * Parseia mensagem em transação. Suporta valores, datas, tipos em qualquer ordem.
 * Agora com proteção contra dúvidas/perguntas virarem transação acidental.
 */
export function parseTransactionFromMessage(message: string): ParsedTransaction | null {
  // Se parece pergunta/dúvida e não tem sinal forte de transação, não parseia
  if (isQuestionLike(message) && !hasTransactionIntent(message)) return null;

  const dateResult = extractDate(message);
  const textWithoutDate = dateResult?.clean || message;
  const data = dateResult?.value || formatDate(new Date());
  const amountResult = extractAmount(textWithoutDate);
  if (!amountResult) return null;
  const valor = amountResult.value;

  // Validação extra: valor inteiro solto sem contexto → ignora se for pergunta/dúvida
  if (
    !/R\$|reais?|conto|k\b|parcelad|vezes|d[ií]vida|dividida/i.test(message) &&
    !hasTransactionIntent(message)
  ) {
    if (/\bd[uú]vida\b/i.test(message)) return null;
  }

  const tipo = detectType(message);
  const catResult = detectCategory(message, tipo);
  const parcelasMatch = message.match(/(\d+)\s*(?:x|vezes)\b/i);
  const parcelas = parcelasMatch ? parseInt(parcelasMatch[1]) : undefined;
  const descricao = extractDescription(amountResult.clean) || catResult.category;
  // Descrição muito genérica tipo "Estou com uma duvida de" não deve virar transação
  if (/^(estou com|tenho|d[uú]vida|posso|vale|devo)/i.test(descricao)) return null;
  return { descricao, valor, tipo, categoria: catResult.category, data, parcelas };
}

/** Exemplos de input para o chat (usado como chips) */
export function getExampleMessages(): string[] {
  return [
    'Mercado ontem 150,50',
    'Entrada 4k salário',
    'Compra 1000 reais 10x',
    'conta recorrente cartão 1500 dia 10',
    'ajuda',
  ];
}
