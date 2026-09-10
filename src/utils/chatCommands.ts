/**
 * @file utils/chatCommands.ts
 * @description Detector de comandos para o Chat Rápido.
 * Interpreta mensagens do usuário e retorna a intenção detectada.
 */

import type { Category, RecurringBill } from '../types';
import { CATEGORY_STYLES } from './categories';

export type CommandType =
  | { type: 'create_category'; name: string }
  | { type: 'delete_category'; name: string }
  | { type: 'list_categories' }
  | { type: 'summary' }
  | { type: 'analysis'; text: string }
  | { type: 'help' }
  | { type: 'create_recurring'; name: string; amount: number; day: number; categoryId?: string }
  | { type: 'list_recurring' }
  | { type: 'update_recurring'; name: string; amount?: number; day?: number }
  | { type: 'delete_recurring'; name: string }
  | { type: 'generate_bills' }
  | { type: null };

const CREATE_CATEGORY_PATTERNS = [
  /criar?\s+(?:uma\s+)?categori[ao]\s+(.+)/i,
  /nova\s+categori[ao]\s+(.+)/i,
  /adicionar?\s+categori[ao]\s+(.+)/i,
  /add\s+categori[ao]\s+(.+)/i,
  /criar?\s+(.+)/i,
];

const DELETE_CATEGORY_PATTERNS = [
  /excluir?\s+categori[ao]\s+(.+)/i,
  /deletar?\s+categori[ao]\s+(.+)/i,
  /remover?\s+categori[ao]\s+(.+)/i,
  /apagar?\s+categori[ao]\s+(.+)/i,
];

const SUMMARY_PATTERNS = [
  /\bresumo\b/i,
  /\bsaldo\b/i,
  /\bquanto\s+(?:tenho|ganho|gastei|sobrou)\b/i,
  /\bmeu\s+saldo\b/i,
  /\bcomo\s+(?:estou|está|esta)\b/i,
  /\bstatus\b/i,
];

const ANALYSIS_PATTERNS = [
  /\banalis[eé]\b/i,
  /\banálise\b/i,
  /\bcomo\s+estão?\s+(?:meus|as)\s+gastos\b/i,
  /\bpara\s+onde\s+(?:vai|vai)\b/i,
  /\bmaiores?\s+gastos?\b/i,
  /\bquanto\s+gastei\b/i,
  /\bgastos\s+por\s+categori[ao]\b/i,
  /\bmeus\s+gastos\b/i,
  /\bcompar[ae]\b/i,
  /\btendência\b/i,
];

const HELP_PATTERNS = [
  /\bajuda\b/i,
  /\bcomo\s+(?:usar|funciona)\b/i,
  /\bcomandos?\b/i,
  /\bhelp\b/i,
  /\bquais?\s+comandos?\b/i,
];

const LIST_CATEGORIES_PATTERNS = [
  /\bcategorias?\b/i,
  /\bquais?\s+categorias?\b/i,
  /\blista\s+(?:de\s+)?categorias?\b/i,
];

const CREATE_RECURRING_PATTERNS = [
  /(?:criar?|adicionar?|novo?)\s+(?:conta\s+)?recorrente\s+(.+)/i,
  /(?:conta\s+)?recorrente\s+(.+)/i,
  /(?:recorrente|fixo|fixa)\s+(.+)/i,
];

const LIST_RECURRING_PATTERNS = [
  /\b(?:contas?\s+)?recorrentes?\b/i,
  /\bfixos?\b/i,
  /\bquais?\s+(?:contas?\s+)?fixas?\b/i,
];

const UPDATE_RECURRING_PATTERNS = [
  /(?:editar?|atualizar?|alterar?)\s+(?:conta\s+)?recorrente\s+(.+)/i,
  /(?:mudar?|trocar?)\s+(?:conta\s+)?recorrente\s+(.+)/i,
];

const DELETE_RECURRING_PATTERNS = [
  /(?:excluir?|deletar?|remover?|apagar?)\s+(?:conta\s+)?recorrente\s+(.+)/i,
];

const GENERATE_BILLS_PATTERNS = [
  /\bgerar?\s+contas?\b/i,
  /\bcriar?\s+transações?\s+(?:das\s+)?contas?\b/i,
  /\bprocessar?\s+contas?\b/i,
];

/**
 * Detecta a intenção/comando em uma mensagem do usuário.
 * Deve ser chamada ANTES de parseTransactionFromMessage.
 */
export function detectCommand(text: string): CommandType {
  const trimmed = text.trim();

  // Criar categoria
  for (const pattern of CREATE_CATEGORY_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) {
      const name = match[1].trim();
      if (name.length >= 2 && name.length <= 50) {
        return { type: 'create_category', name: capitalizeFirst(name) };
      }
    }
  }

  // Deletar categoria
  for (const pattern of DELETE_CATEGORY_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) {
      return { type: 'delete_category', name: match[1].trim() };
    }
  }

  // Gerar transações de contas recorrentes
  for (const pattern of GENERATE_BILLS_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { type: 'generate_bills' };
    }
  }

  // Criar conta recorrente
  for (const pattern of CREATE_RECURRING_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) {
      const parsed = parseRecurringBillInput(match[1].trim());
      if (parsed) {
        return { type: 'create_recurring', ...parsed };
      }
    }
  }

  // Editar conta recorrente
  for (const pattern of UPDATE_RECURRING_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) {
      const parsed = parseRecurringBillUpdate(match[1].trim());
      if (parsed) {
        return { type: 'update_recurring', ...parsed };
      }
    }
  }

  // Excluir conta recorrente
  for (const pattern of DELETE_RECURRING_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) {
      return { type: 'delete_recurring', name: match[1].trim() };
    }
  }

  // Listar contas recorrentes
  for (const pattern of LIST_RECURRING_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { type: 'list_recurring' };
    }
  }

  // Resumo
  for (const pattern of SUMMARY_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { type: 'summary' };
    }
  }

  // Análise
  for (const pattern of ANALYSIS_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { type: 'analysis', text: trimmed };
    }
  }

  // Listar categorias
  for (const pattern of LIST_CATEGORIES_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { type: 'list_categories' };
    }
  }

  // Ajuda
  for (const pattern of HELP_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { type: 'help' };
    }
  }

  return { type: null };
}

/**
 * Parseia entrada do usuário para criar conta recorrente
 * Ex: "cartão nubank 1500 dia 10" -> { name: "cartão nubank", amount: 1500, day: 10 }
 */
function parseRecurringBillInput(text: string): { name: string; amount: number; day: number } | null {
  // Tenta extrair "dia X"
  const dayMatch = text.match(/dia\s+(\d{1,2})/i);
  const day = dayMatch ? parseInt(dayMatch[1]) : new Date().getDate();

  // Remove "dia X" do texto para processar o resto
  const cleanText = dayMatch ? text.replace(dayMatch[0], ' ').trim() : text;

  // Tenta extrair valor (último número encontrado)
  const amountPatterns = [
    /R\$\s*(\d{1,6}(?:\.\d{3})*(?:,\d{1,2})?)/i,
    /(\d+(?:[.,]\d+)?)\s*k\b/i,
    /(\d+(?:[.,]\d+)?)\s*(?:conto|pila|paus|reais)\b/i,
    /(\d{1,6}(?:\.\d{3})*,\d{1,2})\b/,
    /(\d{2,6})\b/,
  ];

  let amount: number | null = null;
  let nameText = cleanText;

  for (const pattern of amountPatterns) {
    const match = cleanText.match(pattern);
    if (match) {
      if (pattern.source.includes('k')) {
        amount = parseFloat(match[1].replace(',', '.')) * 1000;
      } else if (pattern.source.includes('conto|pila|paus|reais')) {
        amount = parseFloat(match[1].replace(',', '.'));
      } else {
        amount = parseFloat(match[1].replace(/\./g, '').replace(',', '.'));
      }
      nameText = cleanText.replace(match[0], ' ').trim();
      break;
    }
  }

  if (!amount || amount <= 0) return null;

  // Limpa o nome (remove preposições soltas)
  const name = nameText
    .replace(/^\s*(de|da|do|das|dos|no|na|em|e|a|o|as|os)\s+/gi, '')
    .replace(/\s+(de|da|do|das|dos|no|na|em|e|a|o|as|os)\s+/gi, ' ')
    .replace(/[,.\s]+/g, ' ')
    .trim();

  if (name.length < 2) return null;

  return {
    name: capitalizeFirst(name),
    amount,
    day: Math.min(Math.max(day, 1), 31),
  };
}

/**
 * Parseia entrada do usuário para editar conta recorrente
 * Ex: "cartão nubank 1800" -> { name: "cartão nubank", amount: 1800 }
 */
function parseRecurringBillUpdate(text: string): { name: string; amount?: number; day?: number } | null {
  // Tenta extrair "dia X"
  const dayMatch = text.match(/dia\s+(\d{1,2})/i);
  const day = dayMatch ? parseInt(dayMatch[1]) : undefined;

  // Remove "dia X" do texto
  const cleanText = dayMatch ? text.replace(dayMatch[0], ' ').trim() : text;

  // Tenta extrair valor
  const amountPatterns = [
    /R\$\s*(\d{1,6}(?:\.\d{3})*(?:,\d{1,2})?)/i,
    /(\d+(?:[.,]\d+)?)\s*k\b/i,
    /(\d+(?:[.,]\d+)?)\s*(?:conto|pila|paus|reais)\b/i,
    /(\d{1,6}(?:\.\d{3})*,\d{1,2})\b/,
    /(\d{2,6})\b/,
  ];

  let amount: number | undefined = undefined;
  let nameText = cleanText;

  for (const pattern of amountPatterns) {
    const match = cleanText.match(pattern);
    if (match) {
      if (pattern.source.includes('k')) {
        amount = parseFloat(match[1].replace(',', '.')) * 1000;
      } else if (pattern.source.includes('conto|pila|paus|reais')) {
        amount = parseFloat(match[1].replace(',', '.'));
      } else {
        amount = parseFloat(match[1].replace(/\./g, '').replace(',', '.'));
      }
      nameText = cleanText.replace(match[0], ' ').trim();
      break;
    }
  }

  // Limpa o nome
  const name = nameText
    .replace(/^\s*(de|da|do|das|dos|no|na|em|e|a|o|as|os)\s+/gi, '')
    .replace(/\s+(de|da|do|das|dos|no|na|em|e|a|o|as|os)\s+/gi, ' ')
    .replace(/[,.\s]+/g, ' ')
    .trim();

  if (name.length < 2) return null;

  return {
    name: capitalizeFirst(name),
    amount,
    day,
  };
}

/**
 * Capitaliza a primeira letra de cada palavra
 */
function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Retorna estilos padrão para uma nova categoria
 */
function getCategoryStyle(name: string): { color: string; icon: string } {
  const lower = name.toLowerCase();

  // Tenta encontrar estilo baseado em palavras-chave existentes
  if (['aliment', 'comida', 'mercado', 'lanche'].some(k => lower.includes(k))) {
    return CATEGORY_STYLES['Alimentação'] || { color: '#FF6B6B', icon: 'FaTag' };
  }
  if (['transport', 'carro', 'uber', 'combust'].some(k => lower.includes(k))) {
    return CATEGORY_STYLES['Transporte'] || { color: '#4ECDC4', icon: 'FaTag' };
  }
  if (['casa', 'moradia', 'aluguel', 'conta'].some(k => lower.includes(k))) {
    return CATEGORY_STYLES['Moradia'] || { color: '#45B7D1', icon: 'FaTag' };
  }
  if (['saúde', 'saude', 'médico', 'farm'].some(k => lower.includes(k))) {
    return CATEGORY_STYLES['Saúde'] || { color: '#FFEAA7', icon: 'FaTag' };
  }
  if (['educa', 'escola', 'curso'].some(k => lower.includes(k))) {
    return CATEGORY_STYLES['Educação'] || { color: '#DDA0DD', icon: 'FaTag' };
  }
  if (['lazer', 'diversão', 'jogo', 'viagem'].some(k => lower.includes(k))) {
    return CATEGORY_STYLES['Lazer'] || { color: '#96CEB4', icon: 'FaTag' };
  }
  if (['roupa', 'vest', 'sapato'].some(k => lower.includes(k))) {
    return { color: '#FD79A8', icon: 'FaTag' };
  }
  if (['salário', 'salario', 'renda'].some(k => lower.includes(k))) {
    return CATEGORY_STYLES['Salário'] || { color: '#00B894', icon: 'FaTag' };
  }

  // Cor aleatória para categorias desconhecidas
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FD79A8', '#6C5CE7'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  return { color: randomColor, icon: 'FaTag' };
}

/**
 * Executa um comando detectado e retorna a resposta para o chat.
 */
export function executeCommand(
  command: CommandType,
  categories: Category[],
  createCategory: (category: Omit<Category, 'id'>) => Promise<Category>,
  deleteCategory: (id: string) => Promise<void>,
  generateSummary: () => string,
  generateAnalysis: () => string,
  addRecurringBill?: (bill: Omit<RecurringBill, 'id'>) => Promise<RecurringBill>,
  updateRecurringBill?: (bill: RecurringBill) => Promise<RecurringBill>,
  deleteRecurringBill?: (id: string) => Promise<void>,
  generateRecurringTransactions?: () => Promise<unknown[]>,
  recurringBills?: RecurringBill[],
): Promise<string> {
  switch (command.type) {
    case 'create_category': {
      const exists = categories.some(
        c => c.name.toLowerCase() === command.name.toLowerCase()
      );
      if (exists) {
        return Promise.resolve(`A categoria "${command.name}" já existe.`);
      }
      const style = getCategoryStyle(command.name);
      return createCategory({
        name: command.name,
        color: style.color,
        icon: style.icon,
        defaultType: 'both',
      }).then(() => {
        return `✅ Categoria "${command.name}" criada com sucesso!`;
      }).catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'desconhecido';
        return `❌ Erro ao criar categoria: ${msg}`;
      });
    }

    case 'delete_category': {
      const cat = categories.find(
        c => c.name.toLowerCase() === command.name.toLowerCase()
      );
      if (!cat) {
        const list = categories.map(c => `• ${c.name}`).join('\n');
        return Promise.resolve(`Categoria "${command.name}" não encontrada.\n\nCategorias existentes:\n${list}`);
      }
      return deleteCategory(cat.id).then(() => {
        return `🗑️ Categoria "${command.name}" removida.`;
      }).catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'desconhecido';
        return `❌ Erro ao remover: ${msg}`;
      });
    }

    case 'list_categories': {
      if (categories.length === 0) {
        return Promise.resolve('Nenhuma categoria encontrada. Crie uma com "criar categoria [nome]".');
      }
      const list = categories.map(c => `• ${c.name}`).join('\n');
      return Promise.resolve(`📋 Suas categorias:\n${list}`);
    }

    case 'summary': {
      return Promise.resolve(generateSummary());
    }

    case 'analysis': {
      return Promise.resolve(generateAnalysis());
    }

    case 'create_recurring': {
      if (!addRecurringBill || !categories.length) {
        return Promise.resolve('❌ Não foi possível criar conta recorrente. Verifique se há categorias disponíveis.');
      }

      // Encontra a categoria (usa a padrão "Outros" ou a primeira disponível)
      const categoryId = command.categoryId || 
        categories.find(c => c.name.toLowerCase() === 'outros')?.id || 
        categories[0]?.id;

      if (!categoryId) {
        return Promise.resolve('❌ Nenhuma categoria encontrada. Crie uma com "criar categoria [nome]".');
      }

      return addRecurringBill({
        name: command.name,
        amount: command.amount,
        type: 'expense',
        dayOfMonth: command.day,
        categoryId,
        active: true,
      }).then(() => {
        return `✅ Conta recorrente "${command.name}" criada!\n💰 R$ ${command.amount.toFixed(2).replace('.', ',')}\n📅 Dia ${command.day} de cada mês`;
      }).catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'desconhecido';
        return `❌ Erro ao criar conta recorrente: ${msg}`;
      });
    }

    case 'list_recurring': {
      if (!recurringBills || recurringBills.length === 0) {
        return Promise.resolve('Nenhuma conta recorrente cadastrada.\n\nCrie uma com:\n• "conta recorrente [nome] [valor] dia [dia]"');
      }

      const sortedBills = [...recurringBills]
        .filter(b => b.active)
        .sort((a, b) => a.dayOfMonth - b.dayOfMonth);

      if (sortedBills.length === 0) {
        return Promise.resolve('Todas as contas recorrentes estão desativadas.');
      }

      const list = sortedBills.map(b => {
        const typeLabel = b.type === 'income' ? '📈' : '📉';
        return `• ${typeLabel} ${b.name}: R$ ${b.amount.toFixed(2).replace('.', ',')} - dia ${b.dayOfMonth}`;
      }).join('\n');

      return Promise.resolve(`📋 Contas recorrentes ativas:\n\n${list}`);
    }

    case 'update_recurring': {
      if (!updateRecurringBill || !recurringBills) {
        return Promise.resolve('❌ Função de atualização não disponível.');
      }

      const billToUpdate = recurringBills.find(
        b => b.name.toLowerCase().includes(command.name.toLowerCase())
      );

      if (!billToUpdate) {
        return Promise.resolve(`❌ Conta recorrente "${command.name}" não encontrada.\n\nUse "contas recorrentes" para ver as existentes.`);
      }

      const updatedBill = {
        ...billToUpdate,
        ...(command.amount !== undefined && { amount: command.amount }),
        ...(command.day !== undefined && { dayOfMonth: command.day }),
      };

      return updateRecurringBill(updatedBill).then(() => {
        const changes: string[] = [];
        if (command.amount !== undefined) changes.push(`💰 Valor: R$ ${command.amount.toFixed(2).replace('.', ',')}`);
        if (command.day !== undefined) changes.push(`📅 Dia: ${command.day}`);
        return `✅ Conta "${billToUpdate.name}" atualizada!\n${changes.join('\n')}`;
      }).catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'desconhecido';
        return `❌ Erro ao atualizar: ${msg}`;
      });
    }

    case 'delete_recurring': {
      if (!deleteRecurringBill || !recurringBills) {
        return Promise.resolve('❌ Função de exclusão não disponível.');
      }

      const billToDelete = recurringBills.find(
        b => b.name.toLowerCase().includes(command.name.toLowerCase())
      );

      if (!billToDelete) {
        return Promise.resolve(`❌ Conta recorrente "${command.name}" não encontrada.`);
      }

      return deleteRecurringBill(billToDelete.id).then(() => {
        return `🗑️ Conta recorrente "${billToDelete.name}" removida.`;
      }).catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'desconhecido';
        return `❌ Erro ao remover: ${msg}`;
      });
    }

    case 'generate_bills': {
      if (!generateRecurringTransactions) {
        return Promise.resolve('❌ Função de geração não disponível.');
      }

      return generateRecurringTransactions().then((newTransactions: unknown[]) => {
        const txArray = newTransactions as Array<{ description: string; amount: number; type: string }>;
        if (txArray.length === 0) {
          return '✅ Nenhuma transação para gerar. Todas as contas já foram processadas este mês.';
        }
        const list = txArray.map(t => {
          const typeLabel = t.type === 'income' ? '📈' : '📉';
          return `• ${typeLabel} ${t.description}: R$ ${t.amount.toFixed(2).replace('.', ',')}`;
        }).join('\n');
        return `✅ ${txArray.length} transação(ões) criada(s):\n\n${list}`;
      }).catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'desconhecido';
        return `❌ Erro ao gerar transações: ${msg}`;
      });
    }

    case 'help': {
      return Promise.resolve(
        `🤖 Comandos disponíveis:\n\n` +
        `📝 Transações:\n` +
        `• "Mercado 150,50" — cria despesa\n` +
        `• "Entrada 4k salário" — cria entrada\n\n` +
        `📂 Categorias:\n` +
        `• "criar categoria [nome]" — nova categoria\n` +
        `• "categorias" — listar todas\n` +
        `• "excluir categoria [nome]" — remover\n\n` +
        `📅 Contas Recorrentes:\n` +
        `• "conta recorrente [nome] [valor] dia [dia]" — criar\n` +
        `• "contas recorrentes" — listar todas\n` +
        `• "editar conta [nome] [novo valor]" — atualizar\n` +
        `• "excluir conta [nome]" — remover\n` +
        `• "gerar contas" — criar transações do mês\n\n` +
        `📊 Análise:\n` +
        `• "resumo" — resumo do mês\n` +
        `• "análise" — análise completa\n` +
        `• "meus gastos" — onde vai o dinheiro\n\n` +
        `❓ "ajuda" — esta mensagem`
      );
    }

    default:
      return Promise.resolve('');
  }
}
