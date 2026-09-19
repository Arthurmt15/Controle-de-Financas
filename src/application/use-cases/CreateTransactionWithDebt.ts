import type { Transaction, Debt } from '../../types';
import { InstallmentPlan } from '../../domain/value-objects/InstallmentPlan';
import type {
  ITransactionRepository,
  IDebtRepository,
} from '../../domain/repositories/IRepository';

export class CreateTransactionWithDebt {
  constructor(
    private readonly txRepo: ITransactionRepository,
    private readonly debtRepo: IDebtRepository
  ) {}
  async execute(
    tx: Omit<Transaction, 'id'>,
    debtOpt?: { totalInstallments: number }
  ): Promise<{ transaction: Transaction; debt: Debt | null }> {
    const transaction = await this.txRepo.create(tx);
    let debt: Debt | null = null;
    if (debtOpt && debtOpt.totalInstallments > 1) {
      const plan = new InstallmentPlan(tx.amount, debtOpt.totalInstallments);
      debt = await this.debtRepo.create({
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
    } else if (!debtOpt) {
      // Dívida à vista (1x) também aparece em Dívidas
      debt = await this.debtRepo.create({
        description: tx.description,
        totalAmount: tx.amount,
        installmentAmount: tx.amount,
        totalInstallments: 1,
        currentInstallment: 0,
        startDate: tx.date.split('T')[0],
        categoryId: tx.categoryId,
        notes: tx.notes,
        source: 'manual',
      });
    }
    return { transaction, debt };
  }
}
