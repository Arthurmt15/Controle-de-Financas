/**
 * @file services/financialAdvisorService.ts
 * @description Serviço de consultor financeiro com IA (via backend proxy).
 * Constrói contexto financeiro real do usuário e consulta IA para conselhos.
 */

import type { Transaction, Category } from '../types';
import api from './api';

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

  const recent = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)
    .map(
      (t) =>
        `  - ${t.date} | ${t.type === 'income' ? 'Entrada' : 'Saída'} | R$ ${t.amount.toFixed(2)} | ${t.description}`
    )
    .join('\n');

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
 * Envia pergunta ao consultor financeiro IA via backend proxy com streaming.
 * Retorna um AsyncGenerator que yield cada chunk de texto.
 */
export async function* streamAdvisor(
  userMessage: string,
  financialContext: string,
  history: ChatMessage[]
): AsyncGenerator<string> {
  const response = await api.post('/ai/chat', {
    message: userMessage,
    financialContext,
    history,
  });

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Não foi possível ler a resposta do servidor');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') {
          return;
        }
        try {
          const parsed = JSON.parse(data);
          if (parsed.content) {
            yield parsed.content;
          }
        } catch {
          // Ignora linhas JSON inválidas
        }
      }
    }
  }
}
