import { BaseEntity } from './BaseEntity';
import type { EmergencyReserve } from '../../types';

/**
 * Entidade Reserva de Emergência — lógica de domínio para progresso e operações.
 */
export class EmergencyReserveEntity extends BaseEntity {
  public readonly goalAmount: number;
  public readonly currentAmount: number;
  public readonly notes?: string;

  constructor(props: EmergencyReserve) {
    super({ id: props.id, createdAt: props.createdAt, updatedAt: props.updatedAt });
    this.goalAmount = props.goalAmount;
    this.currentAmount = props.currentAmount;
    this.notes = props.notes;
  }

  getProgress(): number {
    if (this.goalAmount <= 0) return 0;
    return Math.min(100, (this.currentAmount / this.goalAmount) * 100);
  }

  isCompleted(): boolean {
    return this.currentAmount >= this.goalAmount && this.goalAmount > 0;
  }

  getRemaining(): number {
    return Math.max(0, this.goalAmount - this.currentAmount);
  }

  deposit(amount: number): EmergencyReserveEntity {
    if (amount <= 0) throw new Error('Valor deve ser positivo');
    return new EmergencyReserveEntity({
      ...this.toDTO(),
      currentAmount: this.currentAmount + amount,
    });
  }

  withdraw(amount: number): EmergencyReserveEntity {
    if (amount <= 0) throw new Error('Valor deve ser positivo');
    if (amount > this.currentAmount) throw new Error('Saldo insuficiente');
    return new EmergencyReserveEntity({
      ...this.toDTO(),
      currentAmount: this.currentAmount - amount,
    });
  }

  updateGoal(newGoal: number): EmergencyReserveEntity {
    if (newGoal < 0) throw new Error('Meta inválida');
    return new EmergencyReserveEntity({ ...this.toDTO(), goalAmount: newGoal });
  }

  setCurrentAmount(newAmount: number): EmergencyReserveEntity {
    if (newAmount < 0) throw new Error('Valor guardado inválido');
    return new EmergencyReserveEntity({ ...this.toDTO(), currentAmount: newAmount });
  }

  toDTO(): EmergencyReserve {
    return {
      id: this.id,
      goalAmount: this.goalAmount,
      currentAmount: this.currentAmount,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static create(props: Omit<EmergencyReserve, 'id'>): EmergencyReserveEntity {
    return new EmergencyReserveEntity({ ...props, id: crypto.randomUUID() });
  }
}
