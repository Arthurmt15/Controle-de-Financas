/**
 * @file server/src/routes/categories.ts
 * @description Rotas de categorias - CRUD completo.
 * Gerencia categorias financeiras associadas a cada usuário.
 */

import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { DEFAULT_CATEGORIES, generateCategoryId } from '../data/defaultCategories';

const router = Router();

/**
 * Cria categorias padrão para um usuário
 * @param userId - ID do usuário
 */
async function createDefaultCategories(userId: string): Promise<void> {
  for (const cat of DEFAULT_CATEGORIES) {
    const catId = generateCategoryId(userId, cat.name);
    try {
      await pool.query(
        `INSERT INTO categories (id, user_id, name, color, icon, default_type)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO NOTHING`,
        [catId, userId, cat.name, cat.color, cat.icon, cat.defaultType]
      );
    } catch (err: any) {
      console.error(`Erro ao criar categoria "${cat.name}":`, err.message);
    }
  }
}

/**
 * GET /api/categories
 * Lista categorias do usuário autenticado
 */
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      'SELECT * FROM categories WHERE user_id = $1 ORDER BY name',
      [userId]
    );

    if (result.rows.length === 0) {
      await createDefaultCategories(userId!);
      const newResult = await pool.query(
        'SELECT * FROM categories WHERE user_id = $1 ORDER BY name',
        [userId]
      );
      return res.json({ success: true, data: newResult.rows });
    }

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({ success: false, error: 'Erro ao buscar categorias' });
  }
});

/**
 * POST /api/categories
 * Cria uma nova categoria
 */
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { name, color, icon, defaultType } = req.body;

    if (!name || !color || !icon || !defaultType) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: name, color, icon, defaultType',
      });
    }

    if (!['income', 'expense', 'both'].includes(defaultType)) {
      return res.status(400).json({
        success: false,
        error: 'defaultType deve ser: income, expense ou both',
      });
    }

    const categoryId = uuidv4();

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
    res.status(500).json({ success: false, error: 'Erro ao criar categoria' });
  }
});

/**
 * DELETE /api/categories/:id
 * Remove uma categoria pelo ID
 */
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const existing = await pool.query(
      'SELECT * FROM categories WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Categoria não encontrada',
      });
    }

    await pool.query('DELETE FROM categories WHERE id = $1 AND user_id = $2', [id, userId]);

    res.json({ success: true, message: 'Categoria removida com sucesso' });
  } catch (error) {
    console.error('Erro ao remover categoria:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao remover categoria',
    });
  }
});

export default router;
