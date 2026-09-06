/**
 * @file server/src/routes/budgets.ts
 * @description Rotas de orçamentos mensais - CRUD completo.
 * Gerencia limites de gasto por categoria e mês.
 */

import { Router, Request, Response } from 'express';
import pool from '../database';

const router = Router();

/**
 * GET /api/budgets/:userId
 * Lista todos os orçamentos de um usuário
 * @param userId - ID do usuário (Google ID)
 */
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Busca orçamentos com JOIN na categoria para obter detalhes
    // Mapeia budget_limit para limit para manter compatibilidade com o frontend
    const result = await pool.query(
      `SELECT b.id, b.user_id, b.category_id, b."budget_limit" as "limit", b.month, b.created_at,
              c.name as category_name, c.color as category_color, c.icon as category_icon
       FROM budgets b
       LEFT JOIN categories c ON b.category_id = c.id
       WHERE b.user_id = $1
       ORDER BY b.month DESC, c.name`,
      [userId]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Erro ao buscar orçamentos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar orçamentos',
    });
  }
});

/**
 * POST /api/budgets
 * Cria um novo orçamento
 * @body { userId, categoryId, limit, month }
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { userId, categoryId, limit, month } = req.body;

    // Validação dos campos obrigatórios
    if (!userId || !categoryId || limit === undefined || !month) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: userId, categoryId, limit, month',
      });
    }

    // Valida o formato do mês (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({
        success: false,
        error: 'month deve estar no formato YYYY-MM',
      });
    }

    // Verifica se já existe orçamento para esta categoria no mês
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

    // Gera ID único baseado no timestamp
    const budgetId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Insere o orçamento no banco (limit -> budget_limit)
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
    res.status(500).json({
      success: false,
      error: 'Erro ao criar orçamento',
    });
  }
});

/**
 * DELETE /api/budgets/:id
 * Remove um orçamento pelo ID
 * @param id - ID do orçamento
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verifica se o orçamento existe
    const existing = await pool.query(
      'SELECT * FROM budgets WHERE id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Orçamento não encontrado',
      });
    }

    // Remove o orçamento
    await pool.query('DELETE FROM budgets WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Orçamento removido com sucesso',
    });
  } catch (error) {
    console.error('Erro ao remover orçamento:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao remover orçamento',
    });
  }
});

export default router;
