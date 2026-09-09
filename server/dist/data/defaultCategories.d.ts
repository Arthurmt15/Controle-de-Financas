/**
 * @file server/src/data/defaultCategories.ts
 * @description Categorias padrão para novos usuários.
 * Consolidado em um único arquivo para evitar duplicação.
 */
/** Interface para categoria padrão */
interface DefaultCategory {
    name: string;
    color: string;
    icon: string;
    defaultType: 'income' | 'expense' | 'both';
}
/**
 * Lista de categorias padrão criadas para cada novo usuário
 * Inclui categorias de despesa, receita e uma genérica "Outros"
 */
export declare const DEFAULT_CATEGORIES: DefaultCategory[];
/**
 * Gera o ID de uma categoria baseado no userId e nome
 * @param userId - ID do usuário
 * @param categoryName - Nome da categoria
 * @returns ID único da categoria
 */
export declare function generateCategoryId(userId: string, categoryName: string): string;
export {};
//# sourceMappingURL=defaultCategories.d.ts.map