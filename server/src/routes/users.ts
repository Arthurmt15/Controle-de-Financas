/**
 * @file server/src/routes/users.ts
 * @description Rotas de usuários - criação e busca.
 * Gerencia usuários autenticados via Google OAuth.
 */

import { Router, Response } from 'express';
import pool from '../database';
import { authenticate, generateToken, AuthRequest } from '../middleware/auth';
import { DEFAULT_CATEGORIES, generateCategoryId } from '../data/defaultCategories';

const router = Router();

/**
 * POST /api/users
 * Cria ou busca usuário existente (baseado no Google ID)
 * Retorna JWT para autenticação
 */
router.post('/', async (req, res: Response) => {
  try {
    const { googleId, name, email, avatar } = req.body;

    if (!googleId || !name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: googleId, name, email',
      });
    }

    const existingUser = await pool.query(
      'SELECT * FROM users WHERE google_id = $1',
      [googleId]
    );

    if (existingUser.rows.length > 0) {
      const userCategories = await pool.query(
        'SELECT COUNT(*) FROM categories WHERE user_id = $1',
        [googleId]
      );

      if (parseInt(userCategories.rows[0].count) === 0) {
        for (const cat of DEFAULT_CATEGORIES) {
          const catId = generateCategoryId(googleId, cat.name);
          await pool.query(
            `INSERT INTO categories (id, user_id, name, color, icon, default_type)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [catId, googleId, cat.name, cat.color, cat.icon, cat.defaultType]
          );
        }
      }

      const token = generateToken(googleId);
      return res.json({
        success: true,
        data: existingUser.rows[0],
        token,
        message: 'Usuário já existe',
      });
    }

    const result = await pool.query(
      `INSERT INTO users (id, google_id, name, email, avatar)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [googleId, googleId, name, email, avatar || null]
    );

    for (const cat of DEFAULT_CATEGORIES) {
      const catId = generateCategoryId(googleId, cat.name);
      await pool.query(
        `INSERT INTO categories (id, user_id, name, color, icon, default_type)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [catId, googleId, cat.name, cat.color, cat.icon, cat.defaultType]
      );
    }

    const token = generateToken(googleId);
    res.status(201).json({
      success: true,
      data: result.rows[0],
      token,
      message: 'Usuário criado com categorias padrão',
    });
  } catch (error) {
    console.error('Erro ao criar/buscar usuário:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/users/:id
 * Busca um usuário autenticado pelo ID
 */
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (req.userId !== id) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado',
      });
    }

    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado',
      });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

export default router;
