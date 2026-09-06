/**
 * @file server/src/routes/users.ts
 * @description Rotas de usuários - criação e busca.
 * Gerencia usuários autenticados via Google OAuth.
 */

import { Router, Request, Response } from 'express';
import pool from '../database';

const router = Router();

/**
 * POST /api/users
 * Cria um novo usuário ou retorna o existente (baseado no Google ID)
 * @body { googleId, name, email, avatar }
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { googleId, name, email, avatar } = req.body;

    // Validação dos campos obrigatórios
    if (!googleId || !name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: googleId, name, email',
      });
    }

    // Verifica se o usuário já existe pelo Google ID
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE google_id = $1',
      [googleId]
    );

    if (existingUser.rows.length > 0) {
      // Usuário já existe - retorna os dados
      return res.json({
        success: true,
        data: existingUser.rows[0],
        message: 'Usuário já existe',
      });
    }

    // Cria novo usuário no banco de dados
    const result = await pool.query(
      `INSERT INTO users (id, google_id, name, email, avatar)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [googleId, googleId, name, email, avatar || null]
    );

    // Cria categorias padrão para o novo usuário
    const defaultCategories = [
      { name: 'Alimentação', color: '#FF6B6B', icon: 'FaUtensils', defaultType: 'expense' },
      { name: 'Transporte', color: '#4ECDC4', icon: 'FaCar', defaultType: 'expense' },
      { name: 'Moradia', color: '#45B7D1', icon: 'FaHome', defaultType: 'expense' },
      { name: 'Lazer', color: '#96CEB4', icon: 'FaGamepad', defaultType: 'expense' },
      { name: 'Saúde', color: '#FFEAA7', icon: 'FaHeartbeat', defaultType: 'expense' },
      { name: 'Educação', color: '#DDA0DD', icon: 'FaGraduationCap', defaultType: 'expense' },
      { name: 'Salário', color: '#00B894', icon: 'FaMoneyBillWave', defaultType: 'income' },
      { name: 'Freelance', color: '#6C5CE7', icon: 'FaLaptop', defaultType: 'income' },
      { name: 'Investimentos', color: '#FDCB6E', icon: 'FaChartLine', defaultType: 'income' },
      { name: 'Outros', color: '#636E72', icon: 'FaEllipsisH', defaultType: 'both' },
    ];

    // Insere cada categoria padrão associada ao usuário
    for (const cat of defaultCategories) {
      const catId = `${googleId}_${cat.name.toLowerCase().replace(/\s/g, '_')}`;
      await pool.query(
        `INSERT INTO categories (id, user_id, name, color, icon, default_type)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [catId, googleId, cat.name, cat.color, cat.icon, cat.defaultType]
      );
    }

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Usuário criado com categorias padrão',
    });
  } catch (error) {
    console.error('Erro ao criar/buscar usuário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

/**
 * GET /api/users/:id
 * Busca um usuário pelo ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

export default router;
