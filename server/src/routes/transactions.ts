/**
 * @file server/src/routes/transactions.ts
 * @description Rotas de transações financeiras - CRUD completo.
 * Gerencia entradas e saídas associadas a cada usuário.
 */

import { Router, Request, Response } from 'express';
import pool from '../database';

const router = Router();

/**
 * GET /api/transactions/:userId
 * Lista todas as transações de um usuário
 * @param userId - ID do usuário (Google ID)
 */
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Busca transações com JOIN na categoria para obter detalhes
    const result = await pool.query(
      `SELECT t.*, c.name as category_name, c.color as category_color, c.icon as category_icon
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = $1
       ORDER BY t.date DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: result.rows,
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
 * @body { userId, description, amount, type, date, categoryId, notes }
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { userId, description, amount, type, date, categoryId, notes } = req.body;

    // Validação dos campos obrigatórios
    if (!userId || !description || amount === undefined || !type || !date || !categoryId) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: userId, description, amount, type, date, categoryId',
      });
    }

    // Valida o tipo da transação
    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'type deve ser: income ou expense',
      });
    }

    // Valida o valor (deve ser positivo)
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'amount deve ser um número positivo',
      });
    }

    // Gera ID único baseado no timestamp
    const transactionId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Insere a transação no banco
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
 * @param id - ID da transação
 * @body { description, amount, type, date, categoryId, notes }
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { description, amount, type, date, categoryId, notes } = req.body;

    // Verifica se a transação existe
    const existing = await pool.query(
      'SELECT * FROM transactions WHERE id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Transação não encontrada',
      });
    }

    // Atualiza a transação com os novos valores
    const result = await pool.query(
      `UPDATE transactions
       SET description = COALESCE($1, description),
           amount = COALESCE($2, amount),
           type = COALESCE($3, type),
           date = COALESCE($4, date),
           category_id = COALESCE($5, category_id),
           notes = $6,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [description, amount, type, date, categoryId, notes || null, id]
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
 * @param id - ID da transação
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verifica se a transação existe
    const existing = await pool.query(
      'SELECT * FROM transactions WHERE id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Transação não encontrada',
      });
    }

    // Remove a transação
    await pool.query('DELETE FROM transactions WHERE id = $1', [id]);

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
