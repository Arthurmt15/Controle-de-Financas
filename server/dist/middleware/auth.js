"use strict";
/**
 * @file server/src/middleware/auth.ts
 * @description Middleware de autenticação JWT.
 * Verifica tokens de autenticação nas requisições.
 * Suporta modo flexível para migração gradual.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.generateToken = generateToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/** Chave secreta para verificar assinatura JWT */
const JWT_SECRET = process.env.JWT_SECRET || 'financas-secret-key';
/**
 * Decodifica e verifica um token JWT
 * @param token - Token JWT para verificar
 * @returns Payload decodificado com o userId
 */
function verifyToken(token) {
    return jsonwebtoken_1.default.verify(token, JWT_SECRET);
}
/**
 * Middleware de autenticação (modo flexível)
 * 1. Se tem token válido → usa userId do token
 * 2. Se não tem token → tenta pegar userId do body ou params
 * 3. Se não tem nenhum → retorna erro
 */
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    // Tenta extrair userId do token JWT
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = verifyToken(token);
            req.userId = decoded.userId;
            return next();
        }
        catch {
            // Token inválido, continua para verificar body/params
        }
    }
    // Modo flexível: tenta pegar userId do body ou params
    const bodyUserId = req.body?.userId;
    const paramsUserId = req.params?.userId;
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
function generateToken(userId) {
    return jsonwebtoken_1.default.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}
//# sourceMappingURL=auth.js.map