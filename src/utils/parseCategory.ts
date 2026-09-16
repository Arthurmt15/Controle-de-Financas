import { CATEGORY_MAP } from './categories';

const INCOME_KEYWORDS = ['entrada','entra','entrou','recebi','recebido','ganhei','ganho','salário','salario','pagamento','ordenha','depósito','deposito','transferência recebida','rendimento','cashback','estorno','reembolso','prêmio','premio','dividendos','caiu','entrou','crédito','credito','investimento','investimentos','renda fixa','rendimento'];
const EXPENSE_KEYWORDS = ['saída','saida','gastei','paguei','comprei','saiu','perdi','compra','despesa','conta','mercado','supermercado','restaurante','almoço','almoco','jantar','café','cafe','farmácia','farmacia','posto','combustível','combustivel','transporte','uber','taxi','ônibus','onibus','aluguel','condomínio','condominio','luz','água','agua','internet','telefone','iptu'];

/** Detecta tipo despesa/receita por palavras-chave no texto */
export function detectType(text: string): 'despesa' | 'receita' {
  const lower = text.toLowerCase();
  for (const k of INCOME_KEYWORDS) if (lower.includes(k)) return 'receita';
  for (const k of EXPENSE_KEYWORDS) if (lower.includes(k)) return 'despesa';
  if (/R\$/i.test(text)) return 'despesa';
  return 'despesa';
}

/** Detecta categoria pelo CATEGORY_MAP e tipo, retorna fallback Outros/Salário — agora inclui Dívida */
export function detectCategory(text: string, tipo: 'despesa' | 'receita'): { category: string; clean: string } {
  const lower = text.toLowerCase();
  // Dívida tem prioridade: se falar divida/dívida, categoriza como Dívida direto
  if (/d[ií]vida|dividida|empr[eé]stimo/.test(lower)) return { category: 'Dívida', clean: text };
  for (const { keywords, category } of CATEGORY_MAP) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        if (tipo === 'receita' && ['Salário','Freelance','Investimentos'].includes(category)) return { category, clean: text };
        if (tipo === 'despesa' && ['Alimentação','Transporte','Moradia','Saúde','Educação','Lazer','Dívida'].includes(category)) return { category, clean: text };
      }
    }
  }
  return { category: tipo === 'receita' ? 'Salário' : 'Outros', clean: text };
}

/** Extrai descrição limpa removendo keywords de tipo, números e parcelado — agora limpa também 'de' pendente de 'divida de' */
export function extractDescription(remainingText: string): string {
  let desc = remainingText;
  const typeKeywords = ['gastei','paguei','comprei','saiu','perdi','despesa','recebi','recebido','ganhei','ganho','pagamento','entrada','entra','entrou','salário','salario','rendimento','cashback','estorno','reembolso'];
  for (const k of typeKeywords) {
    desc = desc.replace(new RegExp(`\\\\b${k}\\\\b`, 'gi'), ' ');
  }
  // Remove prefixo solto
  desc = desc.replace(/^\s*(de|da|do|das|dos|no|na|nas|nos|em|e|a|o|as|os|um|uma|uns|umas)\s+/gi, '');
  desc = desc.replace(/\b\d{1,6}(?:\.\d{3})*(?:,\d{1,2})?\b/g, '');
  desc = desc.replace(/\b\d{2,6}\b/g, '');
  desc = desc.replace(/\b(parcelado?|vezes|prestação|prestacao|plt|taxa)\b/gi, ' ');
  // Remove "dia desse mês" / "dia 20 desse mês" que sobrou do clean
  desc = desc.replace(/\b(?:dia\s+)?\d{1,2}\s+(?:desse|deste)\s+m[eê]s\b/gi, ' ');
  desc = desc.replace(/\bdia\s+(?:desse|deste)\s+m[eê]s\b/gi, ' ');
  desc = desc.replace(/\bdesse\s+m[eê]s\b/gi, ' ');
  // Limpa pontuação e espaços duplos
  desc = desc.replace(/[,.\s]+/g, ' ').trim();
  // Remove 'de/da/do' pendente no final — corrige "Divida de " → "Divida"
  desc = desc.replace(/\s+(de|da|do|das|dos|com|para|em|por|no|na)\s*$/gi, '').trim();
  // Normaliza dívida/divida isolada
  if (/^d[ií]vida$/i.test(desc)) return 'Dívida';
  if (/^divida\s+de$/i.test(desc.trim())) return 'Dívida';
  if (desc.length < 2) return '';
  return desc.charAt(0).toUpperCase() + desc.slice(1);
}
