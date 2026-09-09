/**
 * @file services/financialAdvisorService.ts
 * @description Serviço de consultor financeiro com IA (Puter.js).
 * Constrói contexto financeiro real do usuário e consulta IA para conselhos.
 */

import type { Transaction, Category } from '../types';

declare const puter: any;

/** Mensagem no formato do chat */
interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Constrói um resumo textual dos dados financeiros do usuário
 * para enviar como contexto ao modelo de IA.
 */
export function buildFinancialContext(
  transactions: Transaction[],
  categories: Category[]
): string {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthly = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const monthlyIncome = monthly
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);
  const monthlyExpense = monthly
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);
  const balance = monthlyIncome - monthlyExpense;

  // Top categorias de gasto
  const categoryTotals: Record<string, number> = {};
  monthly
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      const cat = categories.find((c) => c.id === t.categoryId);
      const name = cat?.name || 'Outros';
      categoryTotals[name] = (categoryTotals[name] || 0) + t.amount;
    });
  const topCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, total]) => `  - ${name}: R$ ${total.toFixed(2)}`)
    .join('\n');

  // Últimas 10 transações
  const recent = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)
    .map(
      (t) =>
        `  - ${t.date} | ${t.type === 'income' ? 'Entrada' : 'Saída'} | R$ ${t.amount.toFixed(2)} | ${t.description}`
    )
    .join('\n');

  // Tendência últimos 3 meses
  const monthNames = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
  ];
  const last3Months: string[] = [];
  for (let i = 0; i < 3; i++) {
    const d = new Date(currentYear, currentMonth - i, 1);
    const m = d.getMonth();
    const y = d.getFullYear();
    const mIncome = transactions
      .filter((t) => {
        const td = new Date(t.date);
        return td.getMonth() === m && td.getFullYear() === y && t.type === 'income';
      })
      .reduce((s, t) => s + t.amount, 0);
    const mExpense = transactions
      .filter((t) => {
        const td = new Date(t.date);
        return td.getMonth() === m && td.getFullYear() === y && t.type === 'expense';
      })
      .reduce((s, t) => s + t.amount, 0);
    last3Months.push(
      `  - ${monthNames[m]}/${y}: Entradas R$ ${mIncome.toFixed(2)} | Saídas R$ ${mExpense.toFixed(2)} | Saldo R$ ${(mIncome - mExpense).toFixed(2)}`
    );
  }

  const mm = String(currentMonth + 1).padStart(2, '0');

  return `
RESUMO FINANCEIRO (${mm}/${currentYear}):
- Receita mensal: R$ ${monthlyIncome.toFixed(2)}
- Despesa mensal: R$ ${monthlyExpense.toFixed(2)}
- Saldo mensal: R$ ${balance.toFixed(2)}
- Reserva de emergência necessária (6x despesas): R$ ${(monthlyExpense * 6).toFixed(2)}

TOP 5 CATEGORIAS DE GASTO:
${topCategories || '  Nenhum gasto registrado este mês'}

TENDÊNCEA (ÚLTIMOS 3 MESES):
${last3Months.join('\n')}

ÚLTIMAS TRANSAÇÕES:
${recent || '  Nenhuma transação recente'}
`.trim();
}

/**
 * Envia pergunta ao consultor financeiro IA com streaming.
 * Retorna um AsyncGenerator que yield cada chunk de texto.
 */
export async function* streamAdvisor(
  userMessage: string,
  financialContext: string,
  history: ChatMessage[]
): AsyncGenerator<string> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `Você é um consultor financeiro pessoal experiente e direto. Analise os dados reais do usuário abaixo para dar conselhos personalizados.

DADOS FINANCEIROS DO USUÁRIO:
${financialContext}

REGRAS:
- Responda SEMPRE em português brasileiro
- Seja direto, prático e objetivo
- Fundamente suas respostas nos dados REAIS do usuário (não invente dados)
- Use valores específicos do usuário quando possível
- Considere: reserva de emergência (6 meses de despesas), regra 50-30-20 (necessidades/desejos/futuro)
- Se não tiver dados suficientes, peça mais informações
- Formatando: use **negrito** para valores e listas para recomendações
- Máximo de 200 palavras por resposta`,
    },
    ...history,
    { role: 'user', content: userMessage },
  ];

  const response = await puter.ai.chat(messages, {
    stream: true,
    model: 'gpt-5-nano',
  });

  for await (const chunk of response) {
    if (chunk?.text) {
      yield chunk.text;
    }
  }
}
