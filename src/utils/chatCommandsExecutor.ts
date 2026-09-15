import type { Category, RecurringBill } from '../types';
import { capitalizeFirst, getCategoryStyle } from './chatCommandsParser';

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

export async function executeCommand(
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
      const exists = categories.some(c => c.name.toLowerCase() === command.name.toLowerCase());
      if (exists) return `A categoria "${command.name}" já existe.`;
      const style = getCategoryStyle(command.name);
      return createCategory({ name: command.name, color: style.color, icon: style.icon, defaultType: 'both' })
        .then(() => `✅ Categoria "${command.name}" criada com sucesso!`)
        .catch((err: unknown) => `❌ Erro ao criar categoria: ${err instanceof Error ? err.message : 'desconhecido'}`);
    }
    case 'delete_category': {
      const cat = categories.find(c => c.name.toLowerCase() === command.name.toLowerCase());
      if (!cat) return `Categoria "${command.name}" não encontrada.\n\nCategorias existentes:\n${categories.map(c => `• ${c.name}`).join('\n')}`;
      return deleteCategory(cat.id).then(() => `🗑️ Categoria "${command.name}" removida.`).catch((err: unknown) => `❌ Erro ao remover: ${err instanceof Error ? err.message : 'desconhecido'}`);
    }
    case 'list_categories': {
      if (categories.length === 0) return 'Nenhuma categoria encontrada. Crie uma com "criar categoria [nome]".';
      return `📋 Suas categorias:\n${categories.map(c => `• ${c.name}`).join('\n')}`;
    }
    case 'summary': return generateSummary();
    case 'analysis': return generateAnalysis();
    case 'create_recurring': {
      if (!addRecurringBill || !categories.length) return '❌ Não foi possível criar conta recorrente. Verifique se há categorias disponíveis.';
      const categoryId = command.categoryId || categories.find(c => c.name.toLowerCase() === 'outros')?.id || categories[0]?.id;
      if (!categoryId) return '❌ Nenhuma categoria encontrada. Crie uma com "criar categoria [nome]".';
      return addRecurringBill({ name: command.name, amount: command.amount, type: 'expense', dayOfMonth: command.day, categoryId, active: true })
        .then(() => `✅ Conta recorrente "${command.name}" criada!\n💰 R$ ${command.amount.toFixed(2).replace('.', ',')}\n📅 Dia ${command.day} de cada mês`)
        .catch((err: unknown) => `❌ Erro ao criar conta recorrente: ${err instanceof Error ? err.message : 'desconhecido'}`);
    }
    case 'list_recurring': {
      if (!recurringBills || recurringBills.length === 0) return 'Nenhuma conta recorrente cadastrada.\n\nCrie uma com:\n• "conta recorrente [nome] [valor] dia [dia]"';
      const sorted = [...recurringBills].filter(b => b.active).sort((a, b) => a.dayOfMonth - b.dayOfMonth);
      if (sorted.length === 0) return 'Todas as contas recorrentes estão desativadas.';
      return `📋 Contas recorrentes ativas:\n\n${sorted.map(b => `• ${b.type === 'income' ? '📈' : '📉'} ${b.name}: R$ ${b.amount.toFixed(2).replace('.', ',')} - dia ${b.dayOfMonth}`).join('\n')}`;
    }
    case 'update_recurring': {
      if (!updateRecurringBill || !recurringBills) return '❌ Função de atualização não disponível.';
      const bill = recurringBills.find(b => b.name.toLowerCase().includes(command.name.toLowerCase()));
      if (!bill) return `❌ Conta recorrente "${command.name}" não encontrada.\n\nUse "contas recorrentes" para ver as existentes.`;
      const updated = { ...bill, ...(command.amount !== undefined && { amount: command.amount }), ...(command.day !== undefined && { dayOfMonth: command.day }) };
      return updateRecurringBill(updated).then(() => {
        const changes: string[] = [];
        if (command.amount !== undefined) changes.push(`💰 Valor: R$ ${command.amount.toFixed(2).replace('.', ',')}`);
        if (command.day !== undefined) changes.push(`📅 Dia: ${command.day}`);
        return `✅ Conta "${bill.name}" atualizada!\n${changes.join('\n')}`;
      }).catch((err: unknown) => `❌ Erro ao atualizar: ${err instanceof Error ? err.message : 'desconhecido'}`);
    }
    case 'delete_recurring': {
      if (!deleteRecurringBill || !recurringBills) return '❌ Função de exclusão não disponível.';
      const bill = recurringBills.find(b => b.name.toLowerCase().includes(command.name.toLowerCase()));
      if (!bill) return `❌ Conta recorrente "${command.name}" não encontrada.`;
      return deleteRecurringBill(bill.id).then(() => `🗑️ Conta recorrente "${bill.name}" removida.`).catch((err: unknown) => `❌ Erro ao remover: ${err instanceof Error ? err.message : 'desconhecido'}`);
    }
    case 'generate_bills': {
      if (!generateRecurringTransactions) return '❌ Função de geração não disponível.';
      return generateRecurringTransactions().then((newTransactions: unknown[]) => {
        const txArray = newTransactions as Array<{ description: string; amount: number; type: string }>;
        if (txArray.length === 0) return '✅ Nenhuma transação para gerar. Todas as contas já foram processadas este mês.';
        return `✅ ${txArray.length} transação(ões) criada(s):\n\n${txArray.map(t => `• ${t.type === 'income' ? '📈' : '📉'} ${t.description}: R$ ${t.amount.toFixed(2).replace('.', ',')}`).join('\n')}`;
      }).catch((err: unknown) => `❌ Erro ao gerar transações: ${err instanceof Error ? err.message : 'desconhecido'}`);
    }
    case 'help': {
      return Promise.resolve(
        `🤖 Comandos disponíveis:\n\n📝 Transações:\n• "Mercado 150,50" — cria despesa\n• "Entrada 4k salário" — cria entrada\n\n📂 Categorias:\n• "criar categoria [nome]" — nova categoria\n• "categorias" — listar todas\n• "excluir categoria [nome]" — remover\n\n📅 Contas Recorrentes:\n• "conta recorrente [nome] [valor] dia [dia]" — criar\n• "contas recorrentes" — listar todas\n• "editar conta [nome] [novo valor]" — atualizar\n• "excluir conta [nome]" — remover\n• "gerar contas" — criar transações do mês\n\n📊 Análise:\n• "resumo" — resumo do mês\n• "análise" — análise completa\n• "meus gastos" — onde vai o dinheiro\n\n❓ "ajuda" — esta mensagem`
      );
    }
    default: return Promise.resolve('');
  }
}
