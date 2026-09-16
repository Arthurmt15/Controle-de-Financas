import { BaseEntity } from './BaseEntity';
import type { Debt } from '../../types';

/**
 * Entidade Debt com mesma lógica de Installment: progresso e vencimentos.
 * Reutiliza regras de parcelamento para dívidas divididas.
 */
export class DebtEntity extends BaseEntity {
  public readonly description: string;
  public readonly totalAmount: number;
  public readonly installmentAmount: number;
  public readonly totalInstallments: number;
  public readonly currentInstallment: number;
  public readonly startDate: string;
  public readonly categoryId: string;
  public readonly notes?: string;
  public readonly source: 'manual';

  constructor(props: Debt) {
    super({ id: props.id, createdAt: props.createdAt, updatedAt: props.updatedAt });
    this.description = props.description;
    this.totalAmount = props.totalAmount;
    this.installmentAmount = props.installmentAmount;
    this.totalInstallments = props.totalInstallments;
    this.currentInstallment = props.currentInstallment;
    this.startDate = props.startDate;
    this.categoryId = props.categoryId;
    this.notes = props.notes;
    this.source = props.source;
  }

  getProgress(): number { return this.currentInstallment / this.totalInstallments; }
  isCompleted(): boolean { return this.currentInstallment >= this.totalInstallments; }
  getRemainingAmount(): number { return (this.totalInstallments - this.currentInstallment) * this.installmentAmount; }
  getNextDueDate(): Date | null {
    if (this.isCompleted()) return null;
    const d = new Date(this.startDate + 'T12:00:00');
    const day = d.getDate();
    d.setMonth(d.getMonth() + this.currentInstallment);
    if (d.getDate() < day) d.setDate(0);
    return d;
  }
  getDaysUntilDue(): number | null {
    const next = this.getNextDueDate();
    if (!next) return null;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const t = new Date(next); t.setHours(0, 0, 0, 0);
    return Math.round((t.getTime() - today.getTime()) / 86400000);
  }
  advance(): DebtEntity {
    const next = Math.min(this.currentInstallment + 1, this.totalInstallments);
    return new DebtEntity({ ...this.toDTO(), currentInstallment: next });
  }
  toDTO(): Debt {
    return {
      id: this.id,
      description: this.description,
      totalAmount: this.totalAmount,
      installmentAmount: this.installmentAmount,
      totalInstallments: this.totalInstallments,
      currentInstallment: this.currentInstallment,
      startDate: this.startDate,
      categoryId: this.categoryId,
      notes: this.notes,
      source: this.source,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
  static create(props: Omit<Debt, 'id'>): DebtEntity {
    return new DebtEntity({ ...props, id: crypto.randomUUID() });
  }
}
