import type { Transaction, Installment } from '../../types';
import { SupabaseTransactionRepository } from '../../infrastructure/repositories/SupabaseTransactionRepository';
import { SupabaseInstallmentRepository } from '../../infrastructure/repositories/SupabaseInstallmentRepository';
import { CreateTransactionWithInstallment } from '../use-cases/CreateTransactionWithInstallment';

/**
 * Facade OOP para a camada de aplicação.
 * Injeção de dependências e composição de UseCases.
 * Pode ser estendido para outros fluxos (ex: chat, importação).
 */
export class FinanceService {
  private readonly txRepo = new SupabaseTransactionRepository();
  private readonly instRepo = new SupabaseInstallmentRepository();
  private readonly createTxWithInstallment = new CreateTransactionWithInstallment(this.txRepo, this.instRepo);

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
}

/** Singleton para uso em hooks/contexts */
export const financeService = new FinanceService();
