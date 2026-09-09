/**
 * @file server/src/middleware/auth.ts
 * @description Middleware de autenticação JWT.
 * Verifica tokens de autenticação nas requisições.
 * Suporta modo flexível para migração gradual.
 */
import { Request, Response, NextFunction } from 'express';
/** Interface estendida para requisições autenticadas */
export interface AuthRequest extends Request {
    userId?: string;
}
/**
 * Middleware de autenticação (modo flexível)
 * 1. Se tem token válido → usa userId do token
 * 2. Se não tem token → tenta pegar userId do body ou params
 * 3. Se não tem nenhum → retorna erro
 */
export declare function authenticate(req: AuthRequest, res: Response, next: NextFunction): void;
/**
 * Gera um token JWT para um usuário
 * @param userId - ID do usuário
 * @returns Token JWT assinado
 */
export declare function generateToken(userId: string): string;
//# sourceMappingURL=auth.d.ts.map