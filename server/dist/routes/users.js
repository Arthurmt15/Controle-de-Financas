"use strict";
/**
 * @file server/src/routes/users.ts
 * @description Rotas de usuários - criação e busca.
 * Gerencia usuários autenticados via Google OAuth.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../database"));
const auth_1 = require("../middleware/auth");
const defaultCategories_1 = require("../data/defaultCategories");
const router = (0, express_1.Router)();
/**
 * POST /api/users
 * Cria ou busca usuário existente (baseado no Google ID)
 * Retorna JWT para autenticação
 */
router.post('/', async (req, res) => {
    try {
        const { googleId, name, email, avatar } = req.body;
        if (!googleId || !name || !email) {
            return res.status(400).json({
                success: false,
                error: 'Campos obrigatórios: googleId, name, email',
            });
        }
        const existingUser = await database_1.default.query('SELECT * FROM users WHERE google_id = $1', [googleId]);
        if (existingUser.rows.length > 0) {
            const userCategories = await database_1.default.query('SELECT COUNT(*) FROM categories WHERE user_id = $1', [googleId]);
            if (parseInt(userCategories.rows[0].count) === 0) {
                for (const cat of defaultCategories_1.DEFAULT_CATEGORIES) {
                    const catId = (0, defaultCategories_1.generateCategoryId)(googleId, cat.name);
                    await database_1.default.query(`INSERT INTO categories (id, user_id, name, color, icon, default_type)
             VALUES ($1, $2, $3, $4, $5, $6)`, [catId, googleId, cat.name, cat.color, cat.icon, cat.defaultType]);
                }
            }
            const token = (0, auth_1.generateToken)(googleId);
            return res.json({
                success: true,
                data: existingUser.rows[0],
                token,
                message: 'Usuário já existe',
            });
        }
        const result = await database_1.default.query(`INSERT INTO users (id, google_id, name, email, avatar)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`, [googleId, googleId, name, email, avatar || null]);
        for (const cat of defaultCategories_1.DEFAULT_CATEGORIES) {
            const catId = (0, defaultCategories_1.generateCategoryId)(googleId, cat.name);
            await database_1.default.query(`INSERT INTO categories (id, user_id, name, color, icon, default_type)
         VALUES ($1, $2, $3, $4, $5, $6)`, [catId, googleId, cat.name, cat.color, cat.icon, cat.defaultType]);
        }
        const token = (0, auth_1.generateToken)(googleId);
        res.status(201).json({
            success: true,
            data: result.rows[0],
            token,
            message: 'Usuário criado com categorias padrão',
        });
    }
    catch (error) {
        console.error('Erro ao criar/buscar usuário:', error);
        res.status(500).json({ success: false, error: 'Erro interno do servidor' });
    }
});
/**
 * GET /api/users/:id
 * Busca um usuário pelo ID
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await database_1.default.query('SELECT * FROM users WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Usuário não encontrado',
            });
        }
        res.json({ success: true, data: result.rows[0] });
    }
    catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({ success: false, error: 'Erro interno do servidor' });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map