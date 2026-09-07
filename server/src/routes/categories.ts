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
 * Se não existir nenhuma, cria as categorias padrão automaticamente
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

    // Se não tem categorias, cria as padrão
    if (result.rows.length === 0) {
      console.log(`Categorias não encontradas para user ${userId}, criando padrão...`);

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

      for (const cat of defaultCategories) {
        const catId = `${userId}_${cat.name.toLowerCase().replace(/\s/g, '_')}`;
        try {
          await pool.query(
            `INSERT INTO categories (id, user_id, name, color, icon, default_type)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (id) DO NOTHING`,
            [catId, userId, cat.name, cat.color, cat.icon, cat.defaultType]
          );
          console.log(`Categoria "${cat.name}" criada para user ${userId}`);
        } catch (catError: any) {
          console.error(`Erro ao criar categoria "${cat.name}":`, catError.message);
        }
      }

      // Busca novamente após criar
      const newResult = await pool.query(
        'SELECT * FROM categories WHERE user_id = $1 ORDER BY name',
        [userId]
      );
      console.log(`Categorias após criação: ${newResult.rows.length}`);

      return res.json({
        success: true,
        data: newResult.rows,
      });
    }

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
