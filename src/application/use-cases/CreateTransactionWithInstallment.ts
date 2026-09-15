import type { Transaction, Installment } from '../../types';
import { InstallmentPlan } from '../../domain/value-objects/InstallmentPlan';
import type { ITransactionRepository, IInstallmentRepository } from '../../domain/repositories/IRepository';

/**
 * Use Case: cria transação e, se parcelado, cria parcelado automaticamente.
 * Encapsula regra de negócio que antes estava espalhada em Forms/Chat.
 * OOP: Single Responsibility + Dependency Inversion (recebe repos via construtor).
 */
export class CreateTransactionWithInstallment {
  constructor(
    private readonly txRepo: ITransactionRepository,
    private readonly instRepo: IInstallmentRepository,
  ) {}

  /**
   * Executa criação.
   * @param tx - transação base
   * @param installmentOpt - se parcelado, dados do parcelamento
   */
  async execute(
    tx: Omit<Transaction, 'id'>,
    installmentOpt?: { totalInstallments: number },
  ): Promise<{ transaction: Transaction; installment: Installment | null }> {
    const transaction = await this.txRepo.create(tx);

    let installment: Installment | null = null;

    if (installmentOpt && installmentOpt.totalInstallments > 1) {
      const plan = new InstallmentPlan(tx.amount, installmentOpt.totalInstallments);
      installment = await this.instRepo.create({
        description: tx.description,
        totalAmount: tx.amount,
        installmentAmount: plan.installmentAmount.amount,
        totalInstallments: plan.totalInstallments,
        currentInstallment: 1,
        startDate: tx.date.split('T')[0],
        categoryId: tx.categoryId,
        notes: tx.notes,
        source: 'manual',
      });
    }

    return { transaction, installment };
  }
}
