"use strict";
/**
 * @file server/src/routes/transactions.ts
 * @description Rotas de transações financeiras - CRUD completo.
 * Gerencia entradas e saídas associadas a cada usuário.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const database_1 = __importDefault(require("../database"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * GET /api/transactions
 * Lista transações do usuário autenticado com paginação
 */
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const offset = (page - 1) * limit;
        const [dataResult, countResult] = await Promise.all([
            database_1.default.query(`SELECT t.*, c.name as category_name, c.color as category_color, c.icon as category_icon
         FROM transactions t
         LEFT JOIN categories c ON t.category_id = c.id
         WHERE t.user_id = $1
         ORDER BY t.created_at DESC
         LIMIT $2 OFFSET $3`, [userId, limit, offset]),
            database_1.default.query('SELECT COUNT(*) FROM transactions WHERE user_id = $1', [userId]),
        ]);
        const total = parseInt(countResult.rows[0].count);
        res.json({
            success: true,
            data: dataResult.rows,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        console.error('Erro ao buscar transações:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar transações',
        });
    }
});
/**
 * POST /api/transactions
 * Cria uma nova transação
 */
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.userId;
        const { description, amount, type, date, categoryId, notes } = req.body;
        if (!description || amount === undefined || !type || !date || !categoryId) {
            return res.status(400).json({
                success: false,
                error: 'Campos obrigatórios: description, amount, type, date, categoryId',
            });
        }
        if (!['income', 'expense'].includes(type)) {
            return res.status(400).json({
                success: false,
                error: 'type deve ser: income ou expense',
            });
        }
        if (typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'amount deve ser um número positivo',
            });
        }
        const transactionId = (0, uuid_1.v4)();
        const result = await database_1.default.query(`INSERT INTO transactions (id, user_id, description, amount, type, date, category_id, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`, [transactionId, userId, description, amount, type, date, categoryId, notes || null]);
        res.status(201).json({
            success: true,
            data: result.rows[0],
            message: 'Transação criada com sucesso',
        });
    }
    catch (error) {
        console.error('Erro ao criar transação:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao criar transação',
        });
    }
});
/**
 * PUT /api/transactions/:id
 * Atualiza uma transação existente
 */
router.put('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const { description, amount, type, date, categoryId, notes } = req.body;
        const existing = await database_1.default.query('SELECT * FROM transactions WHERE id = $1 AND user_id = $2', [id, userId]);
        if (existing.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Transação não encontrada',
            });
        }
        if (type && !['income', 'expense'].includes(type)) {
            return res.status(400).json({
                success: false,
                error: 'type deve ser: income ou expense',
            });
        }
        if (amount !== undefined && (typeof amount !== 'number' || amount <= 0)) {
            return res.status(400).json({
                success: false,
                error: 'amount deve ser um número positivo',
            });
        }
        const result = await database_1.default.query(`UPDATE transactions
       SET description = COALESCE($1, description),
           amount = COALESCE($2, amount),
           type = COALESCE($3, type),
           date = COALESCE($4, date),
           category_id = COALESCE($5, category_id),
           notes = $6,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND user_id = $8
       RETURNING *`, [description, amount, type, date, categoryId, notes || null, id, userId]);
        res.json({
            success: true,
            data: result.rows[0],
            message: 'Transação atualizada com sucesso',
        });
    }
    catch (error) {
        console.error('Erro ao atualizar transação:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao atualizar transação',
        });
    }
});
/**
 * DELETE /api/transactions/:id
 * Remove uma transação pelo ID
 */
router.delete('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const existing = await database_1.default.query('SELECT * FROM transactions WHERE id = $1 AND user_id = $2', [id, userId]);
        if (existing.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Transação não encontrada',
            });
        }
        await database_1.default.query('DELETE FROM transactions WHERE id = $1 AND user_id = $2', [id, userId]);
        res.json({
            success: true,
            message: 'Transação removida com sucesso',
        });
    }
    catch (error) {
        console.error('Erro ao remover transação:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao remover transação',
        });
    }
});
exports.default = router;
//# sourceMappingURL=transactions.js.map