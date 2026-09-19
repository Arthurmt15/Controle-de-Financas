import { BaseEntity } from './BaseEntity';
import type { Transaction } from '../../types';

/**
 * Entidade Transação com comportamento de domínio.
 * Encapsula regras: validação e formatação.
 */
export class TransactionEntity extends BaseEntity {
  public readonly description: string;
  public readonly amount: number;
  public readonly type: 'income' | 'expense';
  public readonly date: string;
  public readonly categoryId: string;
  public readonly notes?: string;

  constructor(props: Transaction) {
    super({ id: props.id, createdAt: props.createdAt });
    this.description = props.description.trim();
    this.amount = props.amount;
    this.type = props.type;
    this.date = props.date;
    this.categoryId = props.categoryId;
    this.notes = props.notes;
    this.validate();
  }

  /** Validação de domínio */
  private validate(): void {
    if (!this.description) throw new Error('Descrição obrigatória');
    if (this.amount <= 0) throw new Error('Valor deve ser positivo');
    if (!['income', 'expense'].includes(this.type)) throw new Error('Tipo inválido');
    if (!this.categoryId) throw new Error('Categoria obrigatória');
  }

  /** É despesa? */
  isExpense(): boolean {
    return this.type === 'expense';
  }

  /** É receita? */
  isIncome(): boolean {
    return this.type === 'income';
  }

  /** Converte para DTO puro (para persistência) */
  toDTO(): Transaction {
    return {
      id: this.id,
      description: this.description,
      amount: this.amount,
      type: this.type,
      date: this.date,
      categoryId: this.categoryId,
      notes: this.notes,
      createdAt: this.createdAt,
    };
  }

  /** Factory para criar nova transação (gera ID) */
  static create(props: Omit<Transaction, 'id'>): TransactionEntity {
    return new TransactionEntity({ ...props, id: crypto.randomUUID() });
  }
}
