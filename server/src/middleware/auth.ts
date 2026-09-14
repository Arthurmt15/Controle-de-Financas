/**
 * @file server/src/middleware/auth.ts
 * @description Middleware de autenticação JWT.
 * Verifica tokens de autenticação nas requisições.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/**
 * Obtém o JWT_SECRET das variáveis de ambiente.
 * Em produção, falha se não estiver definido.
 */
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ JWT_SECRET é obrigatório em produção');
      process.exit(1);
    }
    console.warn('⚠️ JWT_SECRET não definido. Use variável de ambiente.');
    return 'dev-secret-not-for-production';
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
