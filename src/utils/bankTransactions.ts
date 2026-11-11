export interface BankTransactionInput {
  amount: number;
  description: string;
  type?: string | null;
}

export interface BankTransactionClassification {
  type: 'income' | 'expense' | 'transfer';
  categoryName: string | null;
}

const categoryMatchers: Array<{ categoryName: string; pattern: RegExp }> = [
  {
    categoryName: 'Alimentação',
    pattern: /\b(ifood|uber\s*eats|rappi|restaurante|mercado|supermercado)\b/i,
  },
  {
    categoryName: 'Transporte',
    pattern: /\b(uber|99\s*(pop|taxi)?|posto|combustivel|gasolina)\b/i,
  },
  {
    categoryName: 'Moradia',
    pattern: /\b(aluguel|condominio|energia|luz|agua|saneamento|internet)\b/i,
  },
  { categoryName: 'Saúde', pattern: /\b(farmacia|drogaria|hospital|clinica|laboratorio)\b/i },
  { categoryName: 'Educação', pattern: /\b(escola|faculdade|curso|udemy|alura)\b/i },
  { categoryName: 'Lazer', pattern: /\b(netflix|spotify|cinema|steam|playstation)\b/i },
];

const transferPattern = /\b(pix|ted|doc|transferencia)\b/i;
const incomePattern = /\b(salario|pagamento|provento|rendimento|freelance)\b/i;

export function classifyBankTransaction({
  amount,
  description,
  type,
}: BankTransactionInput): BankTransactionClassification {
  if (type?.toUpperCase() === 'TRANSFER' || transferPattern.test(description)) {
    return { type: 'transfer', categoryName: null };
  }

  if (amount > 0) {
    return {
      type: 'income',
      categoryName: incomePattern.test(description) ? 'Salário' : 'Outros',
    };
  }

  const category = categoryMatchers.find(({ pattern }) => pattern.test(description));
  return { type: 'expense', categoryName: category?.categoryName ?? 'Outros' };
}
