/**
 * Value Object Money - encapsula valor monetário e operações.
 * Imutável e valida domínio.
 */
export class Money {
  private readonly _amount: number;
  private readonly _currency: string = 'BRL';

  constructor(amount: number, currency: string = 'BRL') {
    if (!Number.isFinite(amount) || amount < 0) throw new Error('Money inválido');
    this._amount = Math.round(amount * 100) / 100;
    this._currency = currency;
  }

  /** Valor bruto */
  get amount(): number { return this._amount; }
  get currency(): string { return this._currency; }

  /** Soma, retorna novo Money (imutável) */
  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this._amount + other._amount, this._currency);
  }

  /** Divide por divisor */
  divide(divisor: number): Money {
    if (divisor <= 0) throw new Error('Divisor inválido');
    return new Money(this._amount / divisor, this._currency);
  }

  /** Multiplica */
  multiply(factor: number): Money {
    return new Money(this._amount * factor, this._currency);
  }

  /** Formata para BRL */
  format(): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: this._currency }).format(this._amount);
  }

  private assertSameCurrency(other: Money): void {
    if (other._currency !== this._currency) throw new Error('Moedas diferentes');
  }
}
