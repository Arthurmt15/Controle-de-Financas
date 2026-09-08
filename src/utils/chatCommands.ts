/**
 * @file utils/chatCommands.ts
 * @description Detector de comandos para o Chat Rápido.
 * Interpreta mensagens do usuário e retorna a intenção detectada.
 */

import type { Category } from '../types';
import { CATEGORY_STYLES } from './categories';

export type CommandType =
  | { type: 'create_category'; name: string }
  | { type: 'delete_category'; name: string }
  | { type: 'list_categories' }
  | { type: 'summary' }
  | { type: 'analysis'; text: string }
  | { type: 'help' }
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
      }).catch((err: any) => {
        return `❌ Erro ao criar categoria: ${err?.message || 'desconhecido'}`;
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
      }).catch((err: any) => {
        return `❌ Erro ao remover: ${err?.message || 'desconhecido'}`;
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
