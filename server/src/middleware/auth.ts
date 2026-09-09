/**
 * @file server/src/middleware/auth.ts
 * @description Middleware de autenticação JWT.
 * Verifica tokens de autenticação nas requisições.
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
 * @throws Error se o token for inválido
 */
function verifyToken(token: string): { userId: string } {
  const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
  return decoded;
}

/**
 * Middleware de autenticação
 * Verifica se a requisição contém um JWT válido
 * Se válido, adiciona o userId ao request
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
      error: 'Token de autenticação não fornecido',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Token de autenticação inválido',
    });
  }
}

/**
 * Gera um token JWT para um usuário
 * @param userId - ID do usuário
 * @returns Token JWT assinado
 */
export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}
