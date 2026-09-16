/**
 * Interface genérica de Repositório (Dependency Inversion).
 * Abstrai persistência para testes e troca de infra.
 */
export interface IRepository<T, CreateDTO = Omit<T, 'id'>> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  create(dto: CreateDTO): Promise<T>;
  update(entity: T): Promise<T>;
  delete(id: string): Promise<void>;
}

/** Repositório de transações com paginação */
export interface ITransactionRepository extends IRepository<import('../../types').Transaction> {
  getAll(page?: number, limit?: number): Promise<import('../../types').Transaction[]>;
}

/** Repositório de parcelados com avanço de parcela */
export interface IInstallmentRepository extends IRepository<import('../../types').Installment> {
  advance(id: string): Promise<import('../../types').Installment>;
}

/** Repositório de dívidas divididas com avanço de parcela */
export interface IDebtRepository extends IRepository<import('../../types').Debt> {
  advance(id: string): Promise<import('../../types').Debt>;
}
