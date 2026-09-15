/**
 * Entidade base com identidade e timestamps.
 * Princípio OOP: herança e encapsulamento.
 */
export abstract class BaseEntity {
  /** Identificador único */
  public readonly id: string;
  /** Data de criação ISO */
  public readonly createdAt?: string;
  /** Data de atualização ISO */
  public readonly updatedAt?: string;

  constructor(props: { id: string; createdAt?: string; updatedAt?: string }) {
    this.id = props.id;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  /** Compara identidade */
  equals(other: BaseEntity): boolean {
    return this.id === other.id;
  }
}
