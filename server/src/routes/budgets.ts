/**
 * @file server/src/routes/budgets.ts
 * @description Rotas de orçamentos mensais - CRUD completo.
 * Gerencia limites de gasto por categoria e mês.
 */

import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * GET /api/budgets
 * Lista orçamentos do usuário autenticado
 */
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      `SELECT b.id, b.user_id, b.category_id, b."budget_limit" as "limit", b.month, b.created_at,
              c.name as category_name, c.color as category_color, c.icon as category_icon
       FROM budgets b
       LEFT JOIN categories c ON b.category_id = c.id
       WHERE b.user_id = $1
       ORDER BY b.month DESC, c.name`,
      [userId]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Erro ao buscar orçamentos:', error);
    res.status(500).json({ success: false, error: 'Erro ao buscar orçamentos' });
  }
});

/**
 * POST /api/budgets
 * Cria um novo orçamento
 */
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { categoryId, limit, month } = req.body;

    if (!categoryId || limit === undefined || !month) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: categoryId, limit, month',
      });
    }

    if (!/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({
        success: false,
        error: 'month deve estar no formato YYYY-MM',
      });
    }

    const existing = await pool.query(
      'SELECT * FROM budgets WHERE user_id = $1 AND category_id = $2 AND month = $3',
      [userId, categoryId, month]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Já existe orçamento para esta categoria neste mês',
      });
    }

    const budgetId = uuidv4();

    const result = await pool.query(
      `INSERT INTO budgets (id, user_id, category_id, "budget_limit", month)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, user_id, category_id, "budget_limit" as "limit", month, created_at`,
      [budgetId, userId, categoryId, limit, month]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Orçamento criado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao criar orçamento:', error);
    res.status(500).json({ success: false, error: 'Erro ao criar orçamento' });
  }
});

/**
 * DELETE /api/budgets/:id
 * Remove um orçamento pelo ID
 */
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const existing = await pool.query(
      'SELECT * FROM budgets WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Orçamento não encontrado',
      });
    }

    await pool.query('DELETE FROM budgets WHERE id = $1 AND user_id = $2', [id, userId]);

    res.json({ success: true, message: 'Orçamento removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover orçamento:', error);
    res.status(500).json({ success: false, error: 'Erro ao remover orçamento' });
  }
});

export default router;
