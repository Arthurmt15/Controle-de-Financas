/**
 * @file utils/exportData.test.ts
 * @description Testes para exportação CSV com fix de separador e CSV injection.
 */
import { vi } from 'vitest';
import { convertToCSV } from './exportData';
import type { Transaction, Category } from '../types';

// Mock jspdf para evitar TextEncoder error no jsdom
vi.mock('jspdf', () => ({
  __esModule: true,
  default: vi.fn().mockImplementation(() => ({
    setFontSize: vi.fn(),
    text: vi.fn(),
    save: vi.fn(),
    autoTable: vi.fn(),
  })),
}));
vi.mock('jspdf-autotable', () => ({}));

const mockCategory: Category = {
  id: 'cat-1',
  name: 'Alimentação',
  color: '#ef4444',
  icon: 'FaUtensils',
  defaultType: 'expense',
};

const mockCategories: Category[] = [mockCategory];

function makeTx(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: 'tx-1',
    description: 'Mercado',
    amount: 150.5,
    type: 'expense',
    date: '2026-09-03T12:00:00.000Z',
    categoryId: 'cat-1',
    notes: '',
    ...overrides,
  };
}

describe('exportData - convertToCSV', () => {
  it('usa separador ; consistente em header e linhas', () => {
    const csv = convertToCSV({ transactions: [makeTx()], categories: mockCategories });
    const lines = csv.split('\n');
    expect(lines[0]).toBe('Data;Descrição;Tipo;Categoria;Valor;Observações');
    // linha deve ter 5 separadores ;
    expect(lines[1].split(';').length).toBe(6);
    // não deve conter , como separador de coluna (fora de valores escapados)
    // verifica que header usa ; e não ,
    expect(lines[0]).not.toContain(',');
  });

  it('previne CSV injection com prefixo single-quote', () => {
    const malicious = makeTx({ description: '=SUM(A1:A10)' });
    const csv = convertToCSV({ transactions: [malicious], categories: mockCategories });
    expect(csv).toContain("'=SUM(A1:A10)");
    // deve estar escapado e não executar como fórmula
  });

  it('previne injection para +, -, @', () => {
    const cases = ['+2+3', '-2-3', '@malicious'];
    for (const desc of cases) {
      const csv = convertToCSV({
        transactions: [makeTx({ description: desc })],
        categories: mockCategories,
      });
      expect(csv).toContain(`'${desc}`);
    }
  });

  it('previne fórmulas precedidas por espaço ou marcador invisível', () => {
    const cases = [
      { description: ' =SUM(A1:A10)', expected: "' =SUM(A1:A10)" },
      {
        description: `${'\uFEFF'}=HYPERLINK("https://attacker.test")`,
        expected: `"'${'\uFEFF'}=HYPERLINK(""https://attacker.test"")"`,
      },
    ];
    for (const { description, expected } of cases) {
      const csv = convertToCSV({
        transactions: [makeTx({ description })],
        categories: mockCategories,
      });
      expect(csv).toContain(expected);
    }
  });

  it('escapa aspas e ponto e vírgula em campos', () => {
    const tx = makeTx({ description: 'Compra "especial"; urgente', notes: 'obs; com "aspas"' });
    const csv = convertToCSV({ transactions: [tx], categories: mockCategories });
    // campos com ; ou " devem estar entre aspas duplas
    expect(csv).toContain('"Compra ""especial""; urgente"');
  });

  it('formata valores com 2 casas decimais', () => {
    const csv = convertToCSV({
      transactions: [makeTx({ amount: 100 })],
      categories: mockCategories,
    });
    expect(csv).toContain('100.00');
  });

  it('lida com lista vazia', () => {
    const csv = convertToCSV({ transactions: [], categories: mockCategories });
    expect(csv).toBe('Data;Descrição;Tipo;Categoria;Valor;Observações');
  });
});
