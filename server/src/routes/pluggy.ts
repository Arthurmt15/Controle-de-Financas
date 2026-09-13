/**
 * @file server/src/routes/pluggy.ts
 * @description Rotas de integração com a Pluggy API (Open Finance Brasil).
 * Fornece endpoints para autenticação, consulta de contas e transações.
 */

import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import pool from '../database';
import {
  getConnectToken,
  getAccountsByItem,
  getTransactionsByAccount,
  getItem,
  deleteItem,
} from '../services/pluggyService';

const router = Router();

/**
 * POST /api/pluggy/token
 * Gera um connect token para o widget Pluggy Connect.
 * O token é usado no frontend para autenticar a sessão de conexão.
 */
router.post('/token', authenticate, async (_req: AuthRequest, res: Response) => {
  try {
    const connectToken = await getConnectToken();
    res.json({ success: true, data: connectToken });
  } catch (error) {
    console.error('Erro ao gerar connect token:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao gerar token de conexão',
    });
  }
});

/**
 * POST /api/pluggy/items
 * Salva um item (conexão) criado pelo widget no banco de dados local.
 * Chamado após o sucesso do widget Pluggy Connect.
 */
router.post('/items', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { pluggyItemId, connectorId, institutionName } = req.body;

    if (!pluggyItemId || !connectorId || !institutionName) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: pluggyItemId, connectorId, institutionName',
      });
    }

    const existingItem = await pool.query(
      'SELECT * FROM openfinance_items WHERE pluggy_item_id = $1',
      [pluggyItemId]
    );

    if (existingItem.rows.length > 0) {
      return res.json({ success: true, data: existingItem.rows[0] });
    }

    const result = await pool.query(
      `INSERT INTO openfinance_items (id, user_id, pluggy_item_id, connector_id, institution_name, status)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, 'CREATED')
       RETURNING *`,
      [userId, pluggyItemId, connectorId, institutionName]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Erro ao salvar item:', error);
    res.status(500).json({ success: false, error: 'Erro ao salvar conexão' });
  }
});

/**
 * GET /api/pluggy/items
 * Lista todos os itens conectados do usuário autenticado.
 */
router.get('/items', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      'SELECT * FROM openfinance_items WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Erro ao listar itens:', error);
    res.status(500).json({ success: false, error: 'Erro ao listar conexões' });
  }
});

/**
 * GET /api/pluggy/items/:itemId/accounts
 * Lista as contas de um item específico.
 * @param itemId ID do item no banco local
 */
router.get('/items/:itemId/accounts', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { itemId } = req.params;

    const itemResult = await pool.query(
      'SELECT * FROM openfinance_items WHERE id = $1 AND user_id = $2',
      [itemId, userId]
    );

    if (itemResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Item não encontrado',
      });
    }

    const item = itemResult.rows[0];
    const accounts = await getAccountsByItem(item.pluggy_item_id);

    res.json({ success: true, data: accounts });
  } catch (error) {
    console.error('Erro ao listar contas:', error);
    res.status(500).json({ success: false, error: 'Erro ao listar contas' });
  }
});

/**
 * GET /api/pluggy/accounts/:accountId/transactions
 * Lista as transações de uma conta específica.
 * @param accountId ID da conta na Pluggy
 * @query from Data inicial (opcional, formato ISO)
 * @query to Data final (opcional, formato ISO)
 * @query limit Limite de resultados (opcional, padrão 100)
 */
router.get(
  '/accounts/:accountId/transactions',
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const { accountId } = req.params;
      const { from, to, limit } = req.query;

      const transactions = await getTransactionsByAccount(accountId, {
        from: from as string,
        to: to as string,
        limit: limit ? parseInt(limit as string) : 100,
      });

      res.json({ success: true, data: transactions });
    } catch (error) {
      console.error('Erro ao listar transações:', error);
      res.status(500).json({ success: false, error: 'Erro ao listar transações' });
    }
  }
);

/**
 * DELETE /api/pluggy/items/:itemId
 * Remove um item e todas as suas contas e transações associadas.
 * @param itemId ID do item no banco local
 */
router.delete('/items/:itemId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { itemId } = req.params;

    const itemResult = await pool.query(
      'SELECT * FROM openfinance_items WHERE id = $1 AND user_id = $2',
      [itemId, userId]
    );

    if (itemResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Item não encontrado',
      });
    }

    const item = itemResult.rows[0];

    try {
      await deleteItem(item.pluggy_item_id);
    } catch (pluggyError) {
      console.error('Erro ao deletar na Pluggy:', pluggyError);
    }

    await pool.query('DELETE FROM openfinance_items WHERE id = $1', [itemId]);

    res.json({ success: true, message: 'Conexão removida com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar item:', error);
    res.status(500).json({ success: false, error: 'Erro ao remover conexão' });
  }
});

export default router;
