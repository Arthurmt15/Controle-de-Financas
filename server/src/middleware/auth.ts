/**
 * @file server/src/middleware/auth.ts
 * @description Middleware de autenticação JWT.
 * Verifica tokens de autenticação nas requisições.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/**
 * Obtém o JWT_SECRET das variáveis de ambiente.
 * Falha em qualquer ambiente se não estiver definido (fail-fast).
 * Em ambiente de teste, permite secret de teste previsível.
 */
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === 'test') {
      return 'test-secret-not-for-production';
    }
    console.error('❌ JWT_SECRET é obrigatório. Defina JWT_SECRET nas variáveis de ambiente.');
    process.exit(1);
    throw new Error('JWT_SECRET é obrigatório');
  }

  return secret;
}

const JWT_SECRET = getJwtSecret();

/** Interface estendida para requisições autenticadas */
export interface AuthRequest extends Request {
  userId?: string;
}

/**
 * Verifica e decodifica um token JWT.
 * @param token Token JWT a ser verificado
 * @returns Payload decodificado com userId
 * @throws Erro se o token for inválido ou expirado
 */
function verifyToken(token: string): { userId: string } {
  return jwt.verify(token, JWT_SECRET) as { userId: string };
}

/**
 * Middleware de autenticação - requer JWT válido.
 * Verifica header Authorization e valida o token.
 */
export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Autenticação necessária',
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({
      success: false,
      error: 'Token inválido ou expirado',
    });
  }
}

/**
 * Gera um token JWT para o usuário.
 * @param userId ID do usuário
 * @returns Token JWT válido por 7 dias
 */
export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}
