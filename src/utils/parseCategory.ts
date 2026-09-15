import { CATEGORY_MAP } from './categories';

const INCOME_KEYWORDS = ['entrada','recebi','recebido','ganhei','ganho','salário','salario','pagamento','ordenha','depósito','deposito','transferência recebida','rendimento','cashback','estorno','reembolso','prêmio','premio','dividendos','caiu','entrou','crédito','credito'];
const EXPENSE_KEYWORDS = ['saída','saida','gastei','paguei','comprei','saiu','perdi','compra','despesa','conta','mercado','supermercado','restaurante','almoço','almoco','jantar','café','cafe','farmácia','farmacia','posto','combustível','combustivel','transporte','uber','taxi','ônibus','onibus','aluguel','condomínio','condominio','luz','água','agua','internet','telefone','iptu'];

export function detectType(text: string): 'despesa' | 'receita' {
  const lower = text.toLowerCase();
  for (const k of INCOME_KEYWORDS) if (lower.includes(k)) return 'receita';
  for (const k of EXPENSE_KEYWORDS) if (lower.includes(k)) return 'despesa';
  if (/R\$/i.test(text)) return 'despesa';
  return 'despesa';
}

export function detectCategory(text: string, tipo: 'despesa' | 'receita'): { category: string; clean: string } {
  const lower = text.toLowerCase();
  for (const { keywords, category } of CATEGORY_MAP) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        if (tipo === 'receita' && ['Salário','Freelance','Investimentos'].includes(category)) return { category, clean: text };
        if (tipo === 'despesa' && ['Alimentação','Transporte','Moradia','Saúde','Educação','Lazer'].includes(category)) return { category, clean: text };
      }
    }
  }
  return { category: tipo === 'receita' ? 'Salário' : 'Outros', clean: text };
}

export function extractDescription(remainingText: string): string {
  let desc = remainingText;
  const typeKeywords = ['gastei','paguei','comprei','saiu','perdi','despesa','recebi','recebido','ganhei','ganho','pagamento','entrada','salário','salario','rendimento','cashback','estorno','reembolso'];
  for (const k of typeKeywords) desc = desc.replace(new RegExp(`\\b${k}\\b`, 'gi'), ' ');
  desc = desc.replace(/^\s*(de|da|do|das|dos|no|na|nas|nos|em|e|a|o|as|os|um|uma|uns|umas)\s+/gi, '');
  desc = desc.replace(/\b\d{1,6}(?:\.\d{3})*(?:,\d{1,2})?\b/g, '');
  desc = desc.replace(/\b\d{2,6}\b/g, '');
  desc = desc.replace(/\b(parcelado?|vezes|prestação|prestacao|plt|taxa)\b/gi, ' ');
  desc = desc.replace(/[,.\s]+/g, ' ').trim();
  if (desc.length < 2) return '';
  return desc.charAt(0).toUpperCase() + desc.slice(1);
}
