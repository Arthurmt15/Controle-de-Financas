/**
 * @file server/src/routes/installments.ts
 * @description Rotas de compras parceladas - CRUD completo.
 */

import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

/** GET / - Lista parcelados do usuário */
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM installments WHERE user_id = $1 ORDER BY start_date DESC',
      [req.userId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Erro ao buscar parcelados:', error);
    res.status(500).json({ success: false, error: 'Erro ao buscar parcelados' });
  }
});

/** POST - Cria um novo parcelado */
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { description, totalAmount, installmentAmount, totalInstallments, currentInstallment, startDate, categoryId, notes, source } = req.body;

    if (!description || !totalAmount || !totalInstallments || !startDate || !categoryId) {
      return res.status(400).json({ success: false, error: 'Campos obrigatórios: description, totalAmount, totalInstallments, startDate, categoryId' });
    }

    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO installments (id, user_id, description, total_amount, installment_amount, total_installments, current_installment, start_date, category_id, notes, source)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [id, req.userId, description, totalAmount, installmentAmount || totalAmount / totalInstallments, totalInstallments, currentInstallment || 0, startDate, categoryId, notes || null, source || 'manual']
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Erro ao criar parcelado:', error);
    res.status(500).json({ success: false, error: 'Erro ao criar parcelado' });
  }
});

/** PUT /:id - Atualiza um parcelado */
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { description, totalAmount, installmentAmount, totalInstallments, currentInstallment, startDate, categoryId, notes, source } = req.body;

    const result = await pool.query(
      `UPDATE installments SET description = COALESCE($1, description), total_amount = COALESCE($2, total_amount),
       installment_amount = COALESCE($3, installment_amount), total_installments = COALESCE($4, total_installments),
       current_installment = COALESCE($5, current_installment), start_date = COALESCE($6, start_date),
       category_id = COALESCE($7, category_id), notes = $8, source = COALESCE($9, source), updated_at = CURRENT_TIMESTAMP
       WHERE id = $10 AND user_id = $11 RETURNING *`,
      [description, totalAmount, installmentAmount, totalInstallments, currentInstallment, startDate, categoryId, notes || null, source, id, req.userId]
    );

    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Parcelado não encontrado' });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Erro ao atualizar parcelado:', error);
    res.status(500).json({ success: false, error: 'Erro ao atualizar parcelado' });
  }
});

/** DELETE /:id - Remove um parcelado */
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM installments WHERE id = $1 AND user_id = $2 RETURNING id', [id, req.userId]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Parcelado não encontrado' });
    res.json({ success: true, message: 'Parcelado removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover parcelado:', error);
    res.status(500).json({ success: false, error: 'Erro ao remover parcelado' });
  }
});

/** POST /:id/advance - Avança uma parcela */
router.post('/:id/advance', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const current = await pool.query('SELECT * FROM installments WHERE id = $1 AND user_id = $2', [id, req.userId]);
    if (current.rows.length === 0) return res.status(404).json({ success: false, error: 'Parcelado não encontrado' });

    const installment = current.rows[0];
    const next = Math.min(installment.current_installment + 1, installment.total_installments);

    const result = await pool.query(
      'UPDATE installments SET current_installment = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3 RETURNING *',
      [next, id, req.userId]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Erro ao avançar parcela:', error);
    res.status(500).json({ success: false, error: 'Erro ao avançar parcela' });
  }
});

export default router;
