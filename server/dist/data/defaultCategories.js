"use strict";
/**
 * @file server/src/data/defaultCategories.ts
 * @description Categorias padrão para novos usuários.
 * Consolidado em um único arquivo para evitar duplicação.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CATEGORIES = void 0;
exports.generateCategoryId = generateCategoryId;
/**
 * Lista de categorias padrão criadas para cada novo usuário
 * Inclui categorias de despesa, receita e uma genérica "Outros"
 */
exports.DEFAULT_CATEGORIES = [
    { name: 'Alimentação', color: '#FF6B6B', icon: 'FaUtensils', defaultType: 'expense' },
    { name: 'Transporte', color: '#4ECDC4', icon: 'FaCar', defaultType: 'expense' },
    { name: 'Moradia', color: '#45B7D1', icon: 'FaHome', defaultType: 'expense' },
    { name: 'Lazer', color: '#96CEB4', icon: 'FaGamepad', defaultType: 'expense' },
    { name: 'Saúde', color: '#FFEAA7', icon: 'FaHeartbeat', defaultType: 'expense' },
    { name: 'Educação', color: '#DDA0DD', icon: 'FaGraduationCap', defaultType: 'expense' },
    { name: 'Salário', color: '#00B894', icon: 'FaMoneyBillWave', defaultType: 'income' },
    { name: 'Freelance', color: '#6C5CE7', icon: 'FaLaptop', defaultType: 'income' },
    { name: 'Investimentos', color: '#FDCB6E', icon: 'FaChartLine', defaultType: 'income' },
    { name: 'Outros', color: '#636E72', icon: 'FaEllipsisH', defaultType: 'both' },
];
/**
 * Gera o ID de uma categoria baseado no userId e nome
 * @param userId - ID do usuário
 * @param categoryName - Nome da categoria
 * @returns ID único da categoria
 */
function generateCategoryId(userId, categoryName) {
    return `${userId}_${categoryName.toLowerCase().replace(/\s/g, '_')}`;
}
//# sourceMappingURL=defaultCategories.js.map