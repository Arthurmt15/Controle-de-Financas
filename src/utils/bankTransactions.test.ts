import { classifyBankTransaction } from './bankTransactions';

describe('classifyBankTransaction', () => {
  it('classifies a negative merchant charge as an expense', () => {
    expect(
      classifyBankTransaction({
        amount: -42.9,
        description: 'IFOOD PEDIDO 123',
        type: 'DEBIT',
      })
    ).toEqual({ type: 'expense', categoryName: 'Alimentação' });
  });

  it('classifies a positive payment as income', () => {
    expect(
      classifyBankTransaction({
        amount: 1800,
        description: 'SALARIO EMPRESA LTDA',
        type: 'CREDIT',
      })
    ).toEqual({ type: 'income', categoryName: 'Salário' });
  });

  it('marks transfers so they are not imported as expenses', () => {
    expect(
      classifyBankTransaction({
        amount: -100,
        description: 'PIX TRANSFERENCIA ENTRE CONTAS',
        type: 'TRANSFER',
      })
    ).toEqual({ type: 'transfer', categoryName: null });
  });
});
