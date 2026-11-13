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

interface GoogleProfile {
  sub: string;
  name: string;
  email: string;
  picture?: string;
}

/**
 * Valida um Google ID token (credential) diretamente com o Google.
 * Nunca confia em identidade enviada pelo cliente: o `sub` é derivado
 * do token verificado, não do body da requisição.
 */
async function verifyGoogleCredential(credential: string): Promise<GoogleProfile | null> {
  const expectedAudience =
    process.env.GOOGLE_CLIENT_ID || process.env.REACT_APP_GOOGLE_CLIENT_ID;

  if (!expectedAudience) {
    console.error('❌ GOOGLE_CLIENT_ID não configurado — login recusado');
    return null;
  }

  try {
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
    );
    if (!response.ok) return null;

    const data = (await response.json()) as {
      aud?: string;
      sub?: string;
      email?: string;
      email_verified?: string | boolean;
      name?: string;
      picture?: string;
    };

    if (data.aud !== expectedAudience) return null;
    if (!data.sub || !data.email) return null;
    if (data.email_verified === false || data.email_verified === 'false') return null;

    return {
      sub: data.sub,
      name: data.name || data.email,
      email: data.email,
      picture: data.picture,
    };
  } catch {
    return null;
  }
}

/**
 * POST /api/users
 * Cria ou busca usuário existente a partir de um Google ID token VERIFICADO.
 * Retorna JWT para autenticação.
 */
router.post('/', async (req, res: Response) => {
  try {
    const { credential } = req.body;

    if (!credential || typeof credential !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'credential (Google ID token) é obrigatório',
      });
    }

    const profile = await verifyGoogleCredential(credential);
    if (!profile) {
      return res.status(401).json({
        success: false,
        error: 'Credencial Google inválida',
      });
    }

    const googleId = profile.sub;
    const name = profile.name;
    const email = profile.email;
    const avatar = profile.picture;

    const existingUser = await pool.query(
      'SELECT id, google_id, name, email, avatar FROM users WHERE google_id = $1',
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

      const existing = existingUser.rows[0];
      const token = generateToken(googleId);
      return res.json({
        success: true,
        data: {
          id: existing.id,
          name: existing.name,
          email: existing.email,
          avatar: existing.avatar,
        },
        token,
        message: 'Usuário já existe',
      });
    }

    const result = await pool.query(
      `INSERT INTO users (id, google_id, name, email, avatar)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, google_id, name, email, avatar`,
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

    const created = result.rows[0];
    const token = generateToken(googleId);
    res.status(201).json({
      success: true,
      data: {
        id: created.id,
        name: created.name,
        email: created.email,
        avatar: created.avatar,
      },
      token,
      message: 'Usuário criado com categorias padrão',
    });
  } catch (error) {
    console.error('Erro ao criar/buscar usuário:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/users/me
 * Retorna os dados do usuário autenticado (via JWT)
 */
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      'SELECT id, name, email, avatar FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado',
      });
    }

    const user = result.rows[0];
    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar usuário autenticado:', error);
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

    const result = await pool.query(
      'SELECT id, name, email, avatar FROM users WHERE id = $1',
      [id]
    );

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
