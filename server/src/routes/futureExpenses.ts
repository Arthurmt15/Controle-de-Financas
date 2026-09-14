/**
 * @file server/src/routes/futureExpenses.ts
 * @description Rotas de despesas futuras - CRUD completo.
 */

import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

/** GET / - Lista despesas futuras do usuário */
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM future_expenses WHERE user_id = $1 ORDER BY expected_date ASC',
      [req.userId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Erro ao buscar despesas futuras:', error);
    res.status(500).json({ success: false, error: 'Erro ao buscar despesas futuras' });
  }
});

/** POST - Cria uma nova despesa futura */
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { description, amount, expectedDate, categoryId, notes, status } = req.body;

    if (!description || !amount || !expectedDate || !categoryId) {
      return res.status(400).json({ success: false, error: 'Campos obrigatórios: description, amount, expectedDate, categoryId' });
    }

    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO future_expenses (id, user_id, description, amount, expected_date, category_id, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [id, req.userId, description, amount, expectedDate, categoryId, notes || null, status || 'pending']
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Erro ao criar despesa futura:', error);
    res.status(500).json({ success: false, error: 'Erro ao criar despesa futura' });
  }
});

/** PUT /:id - Atualiza uma despesa futura */
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { description, amount, expectedDate, categoryId, notes, status } = req.body;

    const result = await pool.query(
      `UPDATE future_expenses SET description = COALESCE($1, description), amount = COALESCE($2, amount),
       expected_date = COALESCE($3, expected_date), category_id = COALESCE($4, category_id),
       notes = $5, status = COALESCE($6, status), updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND user_id = $8 RETURNING *`,
      [description, amount, expectedDate, categoryId, notes || null, status, id, req.userId]
    );

    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Despesa futura não encontrada' });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Erro ao atualizar despesa futura:', error);
    res.status(500).json({ success: false, error: 'Erro ao atualizar despesa futura' });
  }
});

/** DELETE /:id - Remove uma despesa futura */
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM future_expenses WHERE id = $1 AND user_id = $2 RETURNING id', [id, req.userId]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Despesa futura não encontrada' });
    res.json({ success: true, message: 'Despesa futura removida com sucesso' });
  } catch (error) {
    console.error('Erro ao remover despesa futura:', error);
    res.status(500).json({ success: false, error: 'Erro ao remover despesa futura' });
  }
});

/** POST /:id/pay - Marca como paga */
router.post('/:id/pay', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'UPDATE future_expenses SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3 RETURNING *',
      ['paid', id, req.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Despesa futura não encontrada' });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Erro ao marcar despesa como paga:', error);
    res.status(500).json({ success: false, error: 'Erro ao marcar despesa como paga' });
  }
});

export default router;
