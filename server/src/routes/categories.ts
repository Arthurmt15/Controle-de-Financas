/**
 * @file server/src/routes/categories.ts
 * @description Rotas de categorias - CRUD completo.
 * Gerencia categorias financeiras associadas a cada usuário.
 */

import { Router, Request, Response } from 'express';
import pool from '../database';

const router = Router();

/**
 * GET /api/categories/:userId
 * Lista todas as categorias de um usuário
 * @param userId - ID do usuário (Google ID)
 */
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Busca categorias ordenadas por nome
    const result = await pool.query(
      'SELECT * FROM categories WHERE user_id = $1 ORDER BY name',
      [userId]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar categorias',
    });
  }
});

/**
 * POST /api/categories
 * Cria uma nova categoria
 * @body { userId, name, color, icon, defaultType }
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { userId, name, color, icon, defaultType } = req.body;

    // Validação dos campos obrigatórios
    if (!userId || !name || !color || !icon || !defaultType) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: userId, name, color, icon, defaultType',
      });
    }

    // Valida o tipo da categoria
    if (!['income', 'expense', 'both'].includes(defaultType)) {
      return res.status(400).json({
        success: false,
        error: 'defaultType deve ser: income, expense ou both',
      });
    }

    // Gera ID único baseado no timestamp
    const categoryId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Insere a categoria no banco
    const result = await pool.query(
      `INSERT INTO categories (id, user_id, name, color, icon, default_type)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [categoryId, userId, name, color, icon, defaultType]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Categoria criada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao criar categoria',
    });
  }
});

/**
 * DELETE /api/categories/:id
 * Remove uma categoria pelo ID
 * @param id - ID da categoria
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verifica se a categoria existe
    const existing = await pool.query(
      'SELECT * FROM categories WHERE id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Categoria não encontrada',
      });
    }

    // Remove a categoria (ON DELETE CASCADE cuida das dependências)
    await pool.query('DELETE FROM categories WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Categoria removida com sucesso',
    });
  } catch (error) {
    console.error('Erro ao remover categoria:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao remover categoria. Verifique se não há transações associadas.',
    });
  }
});

export default router;
