/**
 * @file server/src/routes/recurringBills.ts
 * @description Rotas de contas recorrentes - CRUD completo e geração automática de transações.
 */

import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * GET /api/recurring-bills
 * Lista contas recorrentes do usuário autenticado
 */
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      `SELECT rb.*, c.name as category_name, c.color as category_color, c.icon as category_icon
       FROM recurring_bills rb
       LEFT JOIN categories c ON rb.category_id = c.id
       WHERE rb.user_id = $1
       ORDER BY rb.day_of_month ASC`,
      [userId]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Erro ao buscar contas recorrentes:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar contas recorrentes',
    });
  }
});

/**
 * POST /api/recurring-bills
 * Cria uma nova conta recorrente
 */
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { name, amount, type, dayOfMonth, categoryId, notes } = req.body;

    if (!name || amount === undefined || !type || !dayOfMonth || !categoryId) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: name, amount, type, dayOfMonth, categoryId',
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

    if (typeof dayOfMonth !== 'number' || dayOfMonth < 1 || dayOfMonth > 31) {
      return res.status(400).json({
        success: false,
        error: 'dayOfMonth deve ser entre 1 e 31',
      });
    }

    const billId = uuidv4();

    const result = await pool.query(
      `INSERT INTO recurring_bills (id, user_id, name, amount, type, day_of_month, category_id, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [billId, userId, name, amount, type, dayOfMonth, categoryId, notes || null]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Conta recorrente criada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao criar conta recorrente:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao criar conta recorrente',
    });
  }
});

/**
 * PUT /api/recurring-bills/:id
 * Atualiza uma conta recorrente existente
 */
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { name, amount, type, dayOfMonth, categoryId, active, notes } = req.body;

    const existing = await pool.query(
      'SELECT * FROM recurring_bills WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Conta recorrente não encontrada',
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

    if (dayOfMonth !== undefined && (typeof dayOfMonth !== 'number' || dayOfMonth < 1 || dayOfMonth > 31)) {
      return res.status(400).json({
        success: false,
        error: 'dayOfMonth deve ser entre 1 e 31',
      });
    }

    const result = await pool.query(
      `UPDATE recurring_bills
       SET name = COALESCE($1, name),
           amount = COALESCE($2, amount),
           type = COALESCE($3, type),
           day_of_month = COALESCE($4, day_of_month),
           category_id = COALESCE($5, category_id),
           active = COALESCE($6, active),
           notes = $7,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 AND user_id = $9
       RETURNING *`,
      [name, amount, type, dayOfMonth, categoryId, active, notes || null, id, userId]
    );

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Conta recorrente atualizada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao atualizar conta recorrente:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar conta recorrente',
    });
  }
});

/**
 * DELETE /api/recurring-bills/:id
 * Remove uma conta recorrente pelo ID
 */
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const existing = await pool.query(
      'SELECT * FROM recurring_bills WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Conta recorrente não encontrada',
      });
    }

    await pool.query('DELETE FROM recurring_bills WHERE id = $1 AND user_id = $2', [id, userId]);

    res.json({
      success: true,
      message: 'Conta recorrente removida com sucesso',
    });
  } catch (error) {
    console.error('Erro ao remover conta recorrente:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao remover conta recorrente',
    });
  }
});

/**
 * POST /api/recurring-bills/generate
 * Gera transações automáticas para contas recorrentes do mês atual
 */
router.post('/generate', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Busca contas ativas
    const billsResult = await pool.query(
      'SELECT * FROM recurring_bills WHERE user_id = $1 AND active = true',
      [userId]
    );

    const bills = billsResult.rows;
    const createdTransactions = [];

    for (const bill of bills) {
      // Verifica se a conta vence hoje ou já venceu este mês
      if (bill.day_of_month > currentDay) continue;

      // Verifica se já existe transação gerada este mês para esta conta
      const monthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
      const existingTx = await pool.query(
        `SELECT id FROM transactions
         WHERE user_id = $1
           AND description = $2
           AND date >= $3
           AND date < $4
           AND notes = 'auto_generated_recurring'`,
        [
          userId,
          bill.name,
          `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`,
          `${currentYear}-${String(currentMonth + 2 > 12 ? 1 : currentMonth + 2).padStart(2, '0')}-01`,
        ]
      );

      if (existingTx.rows.length > 0) continue;

      // Cria a transação
      const txId = uuidv4();
      const txDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(bill.day_of_month).padStart(2, '0')}`;

      const result = await pool.query(
        `INSERT INTO transactions (id, user_id, description, amount, type, date, category_id, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [txId, userId, bill.name, bill.amount, bill.type, txDate, bill.category_id, 'auto_generated_recurring']
      );

      createdTransactions.push(result.rows[0]);
    }

    res.json({
      success: true,
      data: createdTransactions,
      message: createdTransactions.length > 0
        ? `${createdTransactions.length} transação(ões) criada(s) com sucesso`
        : 'Nenhuma transação para gerar',
    });
  } catch (error) {
    console.error('Erro ao gerar transações:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao gerar transações automáticas',
    });
  }
});

export default router;
