/**
 * @file server/src/middleware/auth.ts
 * @description Middleware de autenticação JWT.
 * Verifica tokens de autenticação nas requisições.
 * Suporta modo flexível para migração gradual.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/** Chave secreta para verificar assinatura JWT */
const JWT_SECRET = process.env.JWT_SECRET || 'financas-secret-key';

/** Interface estendida para requisições autenticadas */
export interface AuthRequest extends Request {
  userId?: string;
}

/**
 * Decodifica e verifica um token JWT
 * @param token - Token JWT para verificar
 * @returns Payload decodificado com o userId
 */
function verifyToken(token: string): { userId: string } {
  return jwt.verify(token, JWT_SECRET) as { userId: string };
}

/**
 * Middleware de autenticação (modo flexível)
 * 1. Se tem token válido → usa userId do token
 * 2. Se não tem token → tenta pegar userId do body ou params
 * 3. Se não tem nenhum → retorna erro
 */
export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  // Tenta extrair userId do token JWT
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = verifyToken(token);
      req.userId = decoded.userId;
      return next();
    } catch {
      // Token inválido, continua para verificar body/params
    }
  }

  // Modo flexível: tenta pegar userId do body ou params
  const bodyUserId = (req.body as Record<string, unknown>)?.userId;
  const paramsUserId = (req.params as Record<string, unknown>)?.userId;

  if (typeof bodyUserId === 'string' && bodyUserId) {
    req.userId = bodyUserId;
    return next();
  }

  if (typeof paramsUserId === 'string' && paramsUserId) {
    req.userId = paramsUserId;
    return next();
  }

  // Nenhum userId encontrado
  res.status(401).json({
    success: false,
    error: 'Autenticação necessária',
  });
}

/**
 * Gera um token JWT para um usuário
 * @param userId - ID do usuário
 * @returns Token JWT assinado
 */
export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}
