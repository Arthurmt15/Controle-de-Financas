/**
 * @file utils/chatCommands.test.ts
 * @description Testes para edição/exclusão de transações via chat.
 */
import { detectCommand } from './chatCommands';
import { parseTransactionUpdate } from './chatCommandsParser';
import { executeCommand } from './chatCommandsExecutor';
import type { Transaction, Category } from '../types';

const mockCategories: Category[] = [
  { id: 'cat-1', name: 'Alimentação', color: '#ef4444', icon: 'FaUtensils', defaultType: 'expense' },
  { id: 'cat-2', name: 'Transporte', color: '#4ECDC4', icon: 'FaTag', defaultType: 'expense' },
];

function makeTx(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: 'tx-1',
    description: 'Lanche',
    amount: 30,
    type: 'expense',
    date: '2026-10-01T12:00:00.000Z',
    categoryId: 'cat-1',
    notes: '',
    ...overrides,
  } as Transaction;
}

describe('chatCommands - update_transaction', () => {
  it('detecta "altera o lanche para 50" com valor', () => {
    const cmd = detectCommand('altera o lanche para 50');
    expect(cmd.type).toBe('update_transaction');
    if (cmd.type === 'update_transaction') {
      expect(cmd.patch.target.toLowerCase()).toContain('lanche');
      expect(cmd.patch.amount).toBe(50);
    }
  });

  it('detecta troca de categoria', () => {
    const cmd = detectCommand('muda o mercado pra categoria alimentação');
    expect(cmd.type).toBe('update_transaction');
    if (cmd.type === 'update_transaction') {
      expect(cmd.patch.categoryName).toBe('Alimentação');
    }
  });

  it('detecta mudança de data (para hoje)', () => {
    const cmd = detectCommand('altera o uber para hoje');
    expect(cmd.type).toBe('update_transaction');
    if (cmd.type === 'update_transaction') {
      expect(cmd.patch.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('detecta renomear', () => {
    const cmd = detectCommand('renomeia mercado para supermercado');
    expect(cmd.type).toBe('update_transaction');
    if (cmd.type === 'update_transaction') {
      expect(cmd.patch.newDescription?.toLowerCase()).toContain('supermercado');
    }
  });

  it('detecta "altere" (imperativo) com alvo por data+valor e renomeia', () => {
    const cmd = detectCommand('altere a despesa de 08/10/2026 de R$ 70 para festa rave');
    expect(cmd.type).toBe('update_transaction');
    if (cmd.type === 'update_transaction') {
      expect(cmd.patch.filterDate).toBe('2026-10-08');
      expect(cmd.patch.filterAmount).toBe(70);
      expect(cmd.patch.txType).toBe('expense');
      expect(cmd.patch.newDescription?.toLowerCase()).toContain('festa rave');
    }
  });

  it('detecta "mude" (imperativo)', () => {
    const cmd = detectCommand('mude o lanche para 50');
    expect(cmd.type).toBe('update_transaction');
    if (cmd.type === 'update_transaction') {
      expect(cmd.patch.amount).toBe(50);
    }
  });

  it('não rouba "excluir categoria"', () => {
    expect(detectCommand('excluir categoria Lazer').type).toBe('delete_category');
  });

  it('não rouba "editar recorrente" (sem valor, cai em update_recurring)', () => {
    expect(detectCommand('editar recorrente luz').type).toBe('update_recurring');
  });
});

describe('chatCommands - delete_transaction', () => {
  it('detecta "apaga a netflix"', () => {
    const cmd = detectCommand('apaga a netflix');
    expect(cmd.type).toBe('delete_transaction');
    if (cmd.type === 'delete_transaction') {
      expect(cmd.target.toLowerCase()).toContain('netflix');
    }
  });
});

describe('chatCommands - parseTransactionUpdate', () => {
  it('extrai valor com R$', () => {
    const patch = parseTransactionUpdate('o lanche para R$ 45,90');
    expect(patch?.amount).toBeCloseTo(45.9);
    expect(patch?.target.toLowerCase()).toContain('lanche');
  });

  it('retorna null sem mudança identificável', () => {
    expect(parseTransactionUpdate('o lanche')).toBeNull();
  });
});

describe('chatCommands - executeCommand transações', () => {
  const noopAsync = () => Promise.resolve('');
  const minimal = {
    createCategory: (() => Promise.reject(new Error('noop'))) as never,
    deleteCategory: (() => Promise.reject(new Error('noop'))) as never,
  };

  it('atualiza todas as coincidentes e mostra antes/depois', async () => {
    const txs = [
      makeTx({ id: 'a', description: 'Mercado', amount: 100 }),
      makeTx({ id: 'b', description: 'Mercado semana', amount: 50 }),
    ];
    const updated: Transaction[] = [];
    const msg = await executeCommand(
      { type: 'update_transaction', patch: { target: 'mercado', amount: 200 } },
      mockCategories,
      minimal.createCategory,
      minimal.deleteCategory,
      noopAsync,
      noopAsync,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      txs,
      async (t) => {
        updated.push(t);
        return t;
      },
      async () => {}
    );
    expect(updated).toHaveLength(2);
    expect(updated.every((t) => t.amount === 200)).toBe(true);
    expect(msg).toContain('2 transações atualizadas');
  });

  it('avisa quando nada é encontrado (com sugestões)', async () => {
    const msg = await executeCommand(
      { type: 'delete_transaction', target: 'netflix' },
      mockCategories,
      minimal.createCategory,
      minimal.deleteCategory,
      noopAsync,
      noopAsync,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      [makeTx()],
      async (t) => t,
      async () => {}
    );
    expect(msg).toContain('Nenhuma transação parecida');
  });

  it('limpa "de de" e resolve alvo genérico só com filtros', () => {
    const cmd = detectCommand('altere a despesa de 08/10/2026 de R$ 70 para festa rave');
    expect(cmd.type).toBe('update_transaction');
    if (cmd.type === 'update_transaction') {
      expect(cmd.patch.target).toBe('');
      expect(cmd.patch.filterDate).toBe('2026-10-08');
      expect(cmd.patch.filterAmount).toBe(70);
    }
  });

  it('sugere candidatos próximos quando a data está errada', async () => {
    const txs = [
      makeTx({ id: 'a', description: 'Colocar custo de 1/2', amount: 70, date: '2026-10-07T12:00:00.000Z' }),
    ];
    let calls = 0;
    const msg = await executeCommand(
      {
        type: 'update_transaction',
        patch: { target: '', filterAmount: 70, filterDate: '2026-10-08', txType: 'expense', newDescription: 'Festa Rave' },
      },
      mockCategories,
      minimal.createCategory,
      minimal.deleteCategory,
      noopAsync,
      noopAsync,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      txs,
      async (t) => {
        calls += 1;
        return t;
      },
      async () => {}
    );
    expect(calls).toBe(0);
    expect(msg).toContain('Mais próximos');
    expect(msg).toContain('Colocar custo de 1/2');
  });

  it('casa descrição ignorando preposições ("custo" acha "Colocar custo de 1/2")', async () => {
    const txs = [
      makeTx({ id: 'a', description: 'Colocar custo de 1/2', amount: 70, date: '2026-10-07T12:00:00.000Z' }),
    ];
    const updated: Transaction[] = [];
    const msg = await executeCommand(
      { type: 'update_transaction', patch: { target: 'custo de', newDescription: 'Festa Rave' } },
      mockCategories,
      minimal.createCategory,
      minimal.deleteCategory,
      noopAsync,
      noopAsync,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      txs,
      async (t) => {
        updated.push(t);
        return t;
      },
      async () => {}
    );
    expect(updated).toHaveLength(1);
    expect(msg).toContain('Transação atualizada');
  });

  it('localiza por data+valor e renomeia (cenário festa rave)', async () => {
    const txs = [
      makeTx({ id: 'a', description: 'Lanche', amount: 70, date: '2026-10-08T12:00:00.000Z' }),
      makeTx({ id: 'b', description: 'Uber', amount: 70, date: '2026-10-08T12:00:00.000Z' }),
      makeTx({ id: 'c', description: 'Lanche', amount: 30, date: '2026-10-01T12:00:00.000Z' }),
    ];
    const updated: Transaction[] = [];
    const msg = await executeCommand(
      {
        type: 'update_transaction',
        patch: {
          target: '',
          filterAmount: 70,
          filterDate: '2026-10-08',
          txType: 'expense',
          newDescription: 'Festa Rave',
        },
      },
      mockCategories,
      minimal.createCategory,
      minimal.deleteCategory,
      noopAsync,
      noopAsync,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      txs,
      async (t) => {
        updated.push(t);
        return t;
      },
      async () => {}
    );
    expect(updated).toHaveLength(2);
    expect(updated.every((t) => t.description === 'Festa Rave')).toBe(true);
    expect(msg).toContain('2 transações atualizadas');
  });

  it('recusa categoria inexistente sem aplicar nada', async () => {
    let calls = 0;
    const msg = await executeCommand(
      { type: 'update_transaction', patch: { target: 'lanche', categoryName: 'Inexistente' } },
      mockCategories,
      minimal.createCategory,
      minimal.deleteCategory,
      noopAsync,
      noopAsync,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      [makeTx()],
      async (t) => {
        calls += 1;
        return t;
      },
      async () => {}
    );
    expect(calls).toBe(0);
    expect(msg).toContain('não encontrada');
  });
});
