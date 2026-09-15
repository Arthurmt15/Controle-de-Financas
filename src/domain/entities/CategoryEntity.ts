import { BaseEntity } from './BaseEntity';
import type { Category } from '../../types';

/** Entidade Categoria com validação de cor e tipo */
export class CategoryEntity extends BaseEntity {
  public readonly name: string;
  public readonly color: string;
  public readonly icon: string;
  public readonly defaultType: 'income' | 'expense' | 'both';

  constructor(props: Category) {
    super({ id: props.id });
    this.name = props.name.trim();
    this.color = props.color;
    this.icon = props.icon;
    this.defaultType = props.defaultType;
    if (!this.name) throw new Error('Nome da categoria obrigatório');
    if (!/^#[0-9A-Fa-f]{6}$/.test(this.color)) throw new Error('Cor inválida');
  }

  toDTO(): Category {
    return { id: this.id, name: this.name, color: this.color, icon: this.icon, defaultType: this.defaultType };
  }

  static create(props: Omit<Category, 'id'>): CategoryEntity {
    return new CategoryEntity({ ...props, id: crypto.randomUUID() });
  }
}
