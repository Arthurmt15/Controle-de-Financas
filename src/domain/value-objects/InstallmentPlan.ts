import { Money } from './Money';

/**
 * Value Object InstallmentPlan - encapsula lógica de parcelamento.
 * Single Responsibility: cálculos de parcelas.
 */
export class InstallmentPlan {
  private readonly total: Money;
  private readonly count: number;

  constructor(totalAmount: number, totalInstallments: number) {
    if (totalInstallments < 2 || totalInstallments > 60) throw new Error('Parcelas deve ser 2-60');
    this.total = new Money(totalAmount);
    this.count = totalInstallments;
  }

  /** Valor por parcela */
  get installmentAmount(): Money { return this.total.divide(this.count); }

  /** Total */
  get totalAmount(): Money { return this.total; }

  /** Quantidade */
  get totalInstallments(): number { return this.count; }

  /** Valida se plano é consistente */
  isValid(): boolean { return this.count > 1 && this.total.amount > 0; }
}
