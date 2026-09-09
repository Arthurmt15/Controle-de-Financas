/**
 * @file server/src/middleware/auth.ts
 * @description Middleware de autenticação JWT.
 * Verifica tokens de autenticação nas requisições.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET: string = process.env.JWT_SECRET || '';
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET não configurado. Defina a variável de ambiente.');
}

export interface AuthRequest extends Request {
  userId?: string;
}

function verifyToken(token: string): { userId: string } {
  return jwt.verify(token, JWT_SECRET) as { userId: string };
}

/**
 * Middleware de autenticação - requer JWT válido
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

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}
