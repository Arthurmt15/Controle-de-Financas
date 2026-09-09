/**
 * @file server/src/routes/transactions.ts
 * @description Rotas de transações financeiras - CRUD completo.
 * Gerencia entradas e saídas associadas a cada usuário.
 */

import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * GET /api/transactions
 * Lista transações do usuário autenticado com paginação
 */
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    const [dataResult, countResult] = await Promise.all([
      pool.query(
        `SELECT t.*, c.name as category_name, c.color as category_color, c.icon as category_icon
         FROM transactions t
         LEFT JOIN categories c ON t.category_id = c.id
         WHERE t.user_id = $1
         ORDER BY t.created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      ),
      pool.query(
        'SELECT COUNT(*) FROM transactions WHERE user_id = $1',
        [userId]
      ),
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
  } catch (error) {
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
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
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

    const transactionId = uuidv4();

    const result = await pool.query(
      `INSERT INTO transactions (id, user_id, description, amount, type, date, category_id, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [transactionId, userId, description, amount, type, date, categoryId, notes || null]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Transação criada com sucesso',
    });
  } catch (error) {
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
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { description, amount, type, date, categoryId, notes } = req.body;

    const existing = await pool.query(
      'SELECT * FROM transactions WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

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

    const result = await pool.query(
      `UPDATE transactions
       SET description = COALESCE($1, description),
           amount = COALESCE($2, amount),
           type = COALESCE($3, type),
           date = COALESCE($4, date),
           category_id = COALESCE($5, category_id),
           notes = $6,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [description, amount, type, date, categoryId, notes || null, id, userId]
    );

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Transação atualizada com sucesso',
    });
  } catch (error) {
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
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const existing = await pool.query(
      'SELECT * FROM transactions WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Transação não encontrada',
      });
    }

    await pool.query('DELETE FROM transactions WHERE id = $1 AND user_id = $2', [id, userId]);

    res.json({
      success: true,
      message: 'Transação removida com sucesso',
    });
  } catch (error) {
    console.error('Erro ao remover transação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao remover transação',
    });
  }
});

export default router;
