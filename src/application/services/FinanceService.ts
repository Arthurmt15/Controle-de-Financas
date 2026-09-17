import type { Transaction, Installment, Debt, EmergencyReserve } from '../../types';
import { SupabaseTransactionRepository } from '../../infrastructure/repositories/SupabaseTransactionRepository';
import { SupabaseInstallmentRepository } from '../../infrastructure/repositories/SupabaseInstallmentRepository';
import { SupabaseDebtRepository } from '../../infrastructure/repositories/SupabaseDebtRepository';
import { SupabaseEmergencyReserveRepository } from '../../infrastructure/repositories/SupabaseEmergencyReserveRepository';
import { CreateTransactionWithInstallment } from '../use-cases/CreateTransactionWithInstallment';
import { CreateTransactionWithDebt } from '../use-cases/CreateTransactionWithDebt';

/**
 * Facade OOP para a camada de aplicação.
 * Injeção de dependências e composição de UseCases.
 * Pode ser estendido para outros fluxos (ex: chat, importação).
 */
export class FinanceService {
  private readonly txRepo = new SupabaseTransactionRepository();
  private readonly instRepo = new SupabaseInstallmentRepository();
  private readonly debtRepo = new SupabaseDebtRepository();
  private readonly reserveRepo = new SupabaseEmergencyReserveRepository();
  private readonly createTxWithInstallment = new CreateTransactionWithInstallment(this.txRepo, this.instRepo);
  private readonly createTxWithDebt = new CreateTransactionWithDebt(this.txRepo, this.debtRepo);

  /** Lista transações com paginação */
  listTransactions(page?: number, limit?: number) { return this.txRepo.getAll(page, limit); }

  /** Lista parcelados */
  listInstallments() { return this.instRepo.getAll(); }

  /** Cria transação simples */
  createTransaction(dto: Omit<Transaction, 'id'>) { return this.txRepo.create(dto); }

  /** Atualiza transação */
  updateTransaction(entity: Transaction) { return this.txRepo.update(entity); }

  /** Remove transação */
  deleteTransaction(id: string) { return this.txRepo.delete(id); }

  /** Cria parcelado simples */
  createInstallment(dto: Omit<Installment, 'id'>) { return this.instRepo.create(dto); }

  /** Atualiza parcelado */
  updateInstallment(entity: Installment) { return this.instRepo.update(entity); }

  /** Remove parcelado */
  deleteInstallment(id: string) { return this.instRepo.delete(id); }

  /** Fluxo parcelado: transação + parcelado atômico */
  createParcelledTransaction(tx: Omit<Transaction, 'id'>, totalInstallments: number) {
    return this.createTxWithInstallment.execute(tx, { totalInstallments });
  }

  /** Avança parcela */
  advanceInstallment(id: string) { return this.instRepo.advance(id); }

  /** Dívidas divididas */
  listDebts() { return this.debtRepo.getAll(); }
  createDebt(dto: Omit<Debt, 'id'>) { return this.debtRepo.create(dto); }
  updateDebt(entity: Debt) { return this.debtRepo.update(entity); }
  deleteDebt(id: string) { return this.debtRepo.delete(id); }
  advanceDebt(id: string) { return this.debtRepo.advance(id); }
  createDividedTransaction(tx: Omit<Transaction, 'id'>, totalInstallments: number) {
    return this.createTxWithDebt.execute(tx, { totalInstallments });
  }

  /** Reserva de emergência */
  getEmergencyReserve() { return this.reserveRepo.getByUser(); }
  listEmergencyReserves() { return this.reserveRepo.getAll(); }
  createEmergencyReserve(dto: Omit<EmergencyReserve, 'id'>) { return this.reserveRepo.create(dto); }
  updateEmergencyReserve(entity: EmergencyReserve) { return this.reserveRepo.update(entity); }
  deleteEmergencyReserve(id: string) { return this.reserveRepo.delete(id); }
  depositEmergencyReserve(amount: number) { return this.reserveRepo.deposit(amount); }
  withdrawEmergencyReserve(amount: number) { return this.reserveRepo.withdraw(amount); }
  setEmergencyReserveAmount(amount: number) { return this.reserveRepo.setCurrentAmount(amount); }
}

/** Singleton para uso em hooks/contexts */
export const financeService = new FinanceService();
