"use strict";
/**
 * @file server/src/routes/categories.ts
 * @description Rotas de categorias - CRUD completo.
 * Gerencia categorias financeiras associadas a cada usuário.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const database_1 = __importDefault(require("../database"));
const auth_1 = require("../middleware/auth");
const defaultCategories_1 = require("../data/defaultCategories");
const router = (0, express_1.Router)();
/**
 * Cria categorias padrão para um usuário
 * @param userId - ID do usuário
 */
async function createDefaultCategories(userId) {
    for (const cat of defaultCategories_1.DEFAULT_CATEGORIES) {
        const catId = (0, defaultCategories_1.generateCategoryId)(userId, cat.name);
        try {
            await database_1.default.query(`INSERT INTO categories (id, user_id, name, color, icon, default_type)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO NOTHING`, [catId, userId, cat.name, cat.color, cat.icon, cat.defaultType]);
        }
        catch (err) {
            console.error(`Erro ao criar categoria "${cat.name}":`, err.message);
        }
    }
}
/**
 * GET /api/categories
 * Lista categorias do usuário autenticado
 */
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.userId;
        const result = await database_1.default.query('SELECT * FROM categories WHERE user_id = $1 ORDER BY name', [userId]);
        if (result.rows.length === 0) {
            await createDefaultCategories(userId);
            const newResult = await database_1.default.query('SELECT * FROM categories WHERE user_id = $1 ORDER BY name', [userId]);
            return res.json({ success: true, data: newResult.rows });
        }
        res.json({ success: true, data: result.rows });
    }
    catch (error) {
        console.error('Erro ao buscar categorias:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar categorias' });
    }
});
/**
 * POST /api/categories
 * Cria uma nova categoria
 */
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.userId;
        const { name, color, icon, defaultType } = req.body;
        if (!name || !color || !icon || !defaultType) {
            return res.status(400).json({
                success: false,
                error: 'Campos obrigatórios: name, color, icon, defaultType',
            });
        }
        if (!['income', 'expense', 'both'].includes(defaultType)) {
            return res.status(400).json({
                success: false,
                error: 'defaultType deve ser: income, expense ou both',
            });
        }
        const categoryId = (0, uuid_1.v4)();
        const result = await database_1.default.query(`INSERT INTO categories (id, user_id, name, color, icon, default_type)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`, [categoryId, userId, name, color, icon, defaultType]);
        res.status(201).json({
            success: true,
            data: result.rows[0],
            message: 'Categoria criada com sucesso',
        });
    }
    catch (error) {
        console.error('Erro ao criar categoria:', error);
        res.status(500).json({ success: false, error: 'Erro ao criar categoria' });
    }
});
/**
 * DELETE /api/categories/:id
 * Remove uma categoria pelo ID
 */
router.delete('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const existing = await database_1.default.query('SELECT * FROM categories WHERE id = $1 AND user_id = $2', [id, userId]);
        if (existing.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Categoria não encontrada',
            });
        }
        await database_1.default.query('DELETE FROM categories WHERE id = $1 AND user_id = $2', [id, userId]);
        res.json({ success: true, message: 'Categoria removida com sucesso' });
    }
    catch (error) {
        console.error('Erro ao remover categoria:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao remover categoria',
        });
    }
});
exports.default = router;
//# sourceMappingURL=categories.js.map