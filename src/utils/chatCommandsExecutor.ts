import type { Category, RecurringBill, Transaction } from '../types';
import { getCategoryStyle, normalizeForMatch } from './chatCommandsParser';
import type { TransactionUpdatePatch } from './chatCommandsParser';

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
  | { type: 'update_transaction'; patch: TransactionUpdatePatch }
  | { type: 'delete_transaction'; target: string; filterAmount?: number; filterDate?: string; txType?: 'income' | 'expense' }
  | { type: null };

function formatBRL(value: number): string {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

function findTransactionsByDescription(
  transactions: Transaction[],
  target: string,
  filters?: { filterAmount?: number; filterDate?: string; txType?: 'income' | 'expense' }
): Transaction[] {
  const needle = normalizeForMatch(target);
  return transactions.filter((t) => {
    if (needle && !normalizeForMatch(t.description).includes(needle)) return false;
    if (filters?.txType && t.type !== filters.txType) return false;
    if (filters?.filterAmount !== undefined && Math.abs(t.amount - filters.filterAmount) > 0.005)
      return false;
    if (filters?.filterDate && t.date.slice(0, 10) !== filters.filterDate) return false;
    return true;
  });
}

/**
 * Candidatos "quase lá" quando os filtros exatos não acham nada
 * (ex.: usuário errou a data — mesmo valor em outro dia).
 */
function findNearMisses(
  transactions: Transaction[],
  filters?: { filterAmount?: number; filterDate?: string; txType?: 'income' | 'expense' },
  limit = 5
): Transaction[] {
  if (!filters || (filters.filterAmount === undefined && !filters.filterDate)) return [];
  const scored = transactions
    .map((t) => {
      let score = 0;
      if (filters.filterAmount !== undefined && Math.abs(t.amount - filters.filterAmount) <= 0.005)
        score += 2;
      if (filters.filterDate && t.date.slice(0, 10) === filters.filterDate) score += 2;
      if (filters.txType && t.type === filters.txType) score += 1;
      return { t, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || new Date(b.t.date).getTime() - new Date(a.t.date).getTime());
  return scored.slice(0, limit).map((s) => s.t);
}

function formatNearMisses(candidates: Transaction[], categories: Category[]): string {
  if (candidates.length === 0) return '';
  return `\n\nMais próximos dos filtros:\n${candidates.map((t) => `• ${describeTransaction(t, categories)}`).join('\n')}`;
}

function describeTransaction(t: Transaction, categories: Category[]): string {
  const cat = categories.find((c) => c.id === t.categoryId);
  const date = new Date(t.date).toLocaleDateString('pt-BR');
  return `${t.description} • ${formatBRL(t.amount)} • ${cat?.name || '?'} • ${date}`;
}

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
  transactions?: Transaction[],
  updateTransaction?: (transaction: Transaction) => Promise<Transaction>,
  deleteTransaction?: (transactionId: string) => Promise<void>
): Promise<string> {
  switch (command.type) {
    case 'create_category': {
      const exists = categories.some((c) => c.name.toLowerCase() === command.name.toLowerCase());
      if (exists) return `A categoria "${command.name}" já existe.`;
      const style = getCategoryStyle(command.name);
      return createCategory({
        name: command.name,
        color: style.color,
        icon: style.icon,
        defaultType: 'both',
      })
        .then(() => ` Categoria "${command.name}" criada com sucesso!`)
        .catch(
          (err: unknown) =>
            ` Erro ao criar categoria: ${err instanceof Error ? err.message : 'desconhecido'}`
        );
    }
    case 'delete_category': {
      const cat = categories.find((c) => c.name.toLowerCase() === command.name.toLowerCase());
      if (!cat)
        return `Categoria "${command.name}" não encontrada.\n\nCategorias existentes:\n${categories.map((c) => `• ${c.name}`).join('\n')}`;
      return deleteCategory(cat.id)
        .then(() => ` Categoria "${command.name}" removida.`)
        .catch(
          (err: unknown) =>
            ` Erro ao remover: ${err instanceof Error ? err.message : 'desconhecido'}`
        );
    }
    case 'list_categories': {
      if (categories.length === 0)
        return 'Nenhuma categoria encontrada. Crie uma com "criar categoria [nome]".';
      return ` Suas categorias:\n${categories.map((c) => `• ${c.name}`).join('\n')}`;
    }
    case 'summary':
      return generateSummary();
    case 'analysis':
      return generateAnalysis();
    case 'create_recurring': {
      if (!addRecurringBill || !categories.length)
        return ' Não foi possível criar conta recorrente. Verifique se há categorias disponíveis.';
      const categoryId =
        command.categoryId ||
        categories.find((c) => c.name.toLowerCase() === 'outros')?.id ||
        categories[0]?.id;
      if (!categoryId)
        return ' Nenhuma categoria encontrada. Crie uma com "criar categoria [nome]".';
      return addRecurringBill({
        name: command.name,
        amount: command.amount,
        type: 'expense',
        dayOfMonth: command.day,
        categoryId,
        active: true,
      })
        .then(
          () =>
            ` Conta recorrente "${command.name}" criada!\n R$ ${command.amount.toFixed(2).replace('.', ',')}\n Dia ${command.day} de cada mês`
        )
        .catch(
          (err: unknown) =>
            ` Erro ao criar conta recorrente: ${err instanceof Error ? err.message : 'desconhecido'}`
        );
    }
    case 'list_recurring': {
      if (!recurringBills || recurringBills.length === 0)
        return 'Nenhuma conta recorrente cadastrada.\n\nCrie uma com:\n• "conta recorrente [nome] [valor] dia [dia]"';
      const sorted = [...recurringBills]
        .filter((b) => b.active)
        .sort((a, b) => a.dayOfMonth - b.dayOfMonth);
      if (sorted.length === 0) return 'Todas as contas recorrentes estão desativadas.';
      return ` Contas recorrentes ativas:\n\n${sorted.map((b) => `• ${b.type === 'income' ? '' : ''} ${b.name}: R$ ${b.amount.toFixed(2).replace('.', ',')} - dia ${b.dayOfMonth}`).join('\n')}`;
    }
    case 'update_recurring': {
      if (!updateRecurringBill || !recurringBills) return ' Função de atualização não disponível.';
      const bill = recurringBills.find((b) =>
        b.name.toLowerCase().includes(command.name.toLowerCase())
      );
      if (!bill)
        return ` Conta recorrente "${command.name}" não encontrada.\n\nUse "contas recorrentes" para ver as existentes.`;
      const updated = {
        ...bill,
        ...(command.amount !== undefined && { amount: command.amount }),
        ...(command.day !== undefined && { dayOfMonth: command.day }),
      };
      return updateRecurringBill(updated)
        .then(() => {
          const changes: string[] = [];
          if (command.amount !== undefined)
            changes.push(` Valor: R$ ${command.amount.toFixed(2).replace('.', ',')}`);
          if (command.day !== undefined) changes.push(` Dia: ${command.day}`);
          return ` Conta "${bill.name}" atualizada!\n${changes.join('\n')}`;
        })
        .catch(
          (err: unknown) =>
            ` Erro ao atualizar: ${err instanceof Error ? err.message : 'desconhecido'}`
        );
    }
    case 'delete_recurring': {
      if (!deleteRecurringBill || !recurringBills) return ' Função de exclusão não disponível.';
      const bill = recurringBills.find((b) =>
        b.name.toLowerCase().includes(command.name.toLowerCase())
      );
      if (!bill) return ` Conta recorrente "${command.name}" não encontrada.`;
      return deleteRecurringBill(bill.id)
        .then(() => ` Conta recorrente "${bill.name}" removida.`)
        .catch(
          (err: unknown) =>
            ` Erro ao remover: ${err instanceof Error ? err.message : 'desconhecido'}`
        );
    }
    case 'generate_bills': {
      if (!generateRecurringTransactions) return ' Função de geração não disponível.';
      return generateRecurringTransactions()
        .then((newTransactions: unknown[]) => {
          const txArray = newTransactions as Array<{
            description: string;
            amount: number;
            type: string;
          }>;
          if (txArray.length === 0)
            return ' Nenhuma transação para gerar. Todas as contas já foram processadas este mês.';
          return ` ${txArray.length} transação(ões) criada(s):\n\n${txArray.map((t) => `• ${t.type === 'income' ? '' : ''} ${t.description}: R$ ${t.amount.toFixed(2).replace('.', ',')}`).join('\n')}`;
        })
        .catch(
          (err: unknown) =>
            ` Erro ao gerar transações: ${err instanceof Error ? err.message : 'desconhecido'}`
        );
    }
    case 'update_transaction': {
      if (!updateTransaction || !transactions)
        return ' Função de edição de transação não disponível.';
      const { patch } = command;
      const matches = findTransactionsByDescription(transactions, patch.target, patch);
      if (matches.length === 0) {
        const label = patch.target || 'os filtros informados';
        const near = findNearMisses(transactions, patch);
        if (near.length > 0) {
          return ` Não encontrei exatamente com esses filtros.${formatNearMisses(near, categories)}\n\nSe for um deles, repita o comando com a data/valor exatos.`;
        }
        const recent = [...transactions]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 8);
        const hint =
          recent.length > 0
            ? `\n\nÚltimos lançamentos:\n${recent.map((t) => `• ${describeTransaction(t, categories)}`).join('\n')}`
            : '\n\nNenhuma transação cadastrada ainda.';
        return ` Nenhuma transação parecida com "${label}".${hint}`;
      }
      let categoryId: string | undefined;
      if (patch.categoryName) {
        const needle = patch.categoryName.toLowerCase();
        const cat =
          categories.find((c) => c.name.toLowerCase() === needle) ||
          categories.find((c) => c.name.toLowerCase().includes(needle));
        if (!cat)
          return ` Categoria "${patch.categoryName}" não encontrada.\n\nCategorias existentes:\n${categories.map((c) => `• ${c.name}`).join('\n')}`;
        categoryId = cat.id;
      }
      try {
        const lines: string[] = [];
        for (const t of matches) {
          const before = describeTransaction(t, categories);
          const updated: Transaction = {
            ...t,
            ...(patch.amount !== undefined && { amount: patch.amount }),
            ...(categoryId && { categoryId }),
            ...(patch.date && { date: new Date(`${patch.date}T12:00:00`).toISOString() }),
            ...(patch.newDescription && { description: patch.newDescription }),
          };
          await updateTransaction(updated);
          lines.push(`• ${before}\n  → ${describeTransaction(updated, categories)}`);
        }
        return ` ${matches.length === 1 ? 'Transação atualizada!' : `${matches.length} transações atualizadas!`}\n\n${lines.join('\n')}`;
      } catch (err: unknown) {
        return ` Erro ao atualizar: ${err instanceof Error ? err.message : 'desconhecido'}`;
      }
    }
    case 'delete_transaction': {
      if (!deleteTransaction || !transactions)
        return ' Função de exclusão de transação não disponível.';
      const matches = findTransactionsByDescription(transactions, command.target, command);
      if (matches.length === 0) {
        const near = findNearMisses(transactions, command);
        if (near.length > 0) {
          return ` Não encontrei exatamente com esses filtros.${formatNearMisses(near, categories)}\n\nSe for um deles, repita o comando com a data/valor exatos.`;
        }
        return ` Nenhuma transação parecida com "${command.target || 'os filtros informados'}".\n\nUse "resumo" para ver seus lançamentos.`;
      }
      try {
        for (const t of matches) {
          await deleteTransaction(t.id);
        }
        return ` ${matches.length === 1 ? 'Transação removida!' : `${matches.length} transações removidas!`}\n\n${matches.map((t) => `• ${describeTransaction(t, categories)}`).join('\n')}`;
      } catch (err: unknown) {
        return ` Erro ao remover: ${err instanceof Error ? err.message : 'desconhecido'}`;
      }
    }
    case 'help': {
      return Promise.resolve(
        ` Comandos disponíveis:\n\n Transações:\n• "Mercado 150,50" — cria despesa\n• "Entrada 4k salário" — cria entrada\n• "alterar [descrição] para [valor]" — corrige o valor\n• "mudar [descrição] para categoria [nome]" — troca a categoria\n• "alterar [descrição] para [data]" — muda a data (ex.: "para hoje")\n• "renomear [descrição] para [novo nome]" — muda a descrição\n• "apagar [descrição]" — remove o(s) lançamento(s)\n\n Categorias:\n• "criar categoria [nome]" — nova categoria\n• "categorias" — listar todas\n• "excluir categoria [nome]" — remover\n\n Contas Recorrentes:\n• "conta recorrente [nome] [valor] dia [dia]" — criar\n• "contas recorrentes" — listar todas\n• "editar conta [nome] [novo valor]" — atualizar\n• "excluir conta [nome]" — remover\n• "gerar contas" — criar transações do mês\n\n Análise:\n• "resumo" — resumo do mês\n• "análise" — análise completa\n• "meus gastos" — onde vai o dinheiro\n\n "ajuda" — esta mensagem`
      );
    }
    default:
      return Promise.resolve('');
  }
}
