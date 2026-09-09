"use strict";
/**
 * @file server/src/index.ts
 * @description Servidor Express principal da API de Controle Financeiro.
 * Configura middlewares, rotas e inicia o servidor na porta definida.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./database");
const users_1 = __importDefault(require("./routes/users"));
const transactions_1 = __importDefault(require("./routes/transactions"));
const categories_1 = __importDefault(require("./routes/categories"));
const budgets_1 = __importDefault(require("./routes/budgets"));
const ai_1 = __importDefault(require("./routes/ai"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
/** URL do frontend configurada via variável de ambiente */
const FRONTEND_URL = process.env.FRONTEND_URL || '';
/**
 * Middleware de CORS
 * Permite requisições do frontend autorizado e localhost
 */
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Permite requisições sem origin (mobile apps, Postman, etc)
        if (!origin)
            return callback(null, true);
        // Lista de origens permitidas
        const allowedOrigins = [
            FRONTEND_URL,
            'http://localhost:3000',
            'http://localhost:5173',
        ].filter(Boolean);
        // Verifica se a origem está na lista ou se é domínio Vercel
        if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
            callback(null, true);
        }
        else {
            callback(null, true); // Permitir temporariamente para debug
        }
    },
    credentials: true,
}));
app.use(express_1.default.json());
/**
 * Rota de health check
 */
app.get('/api/health', (_req, res) => {
    res.json({
        success: true,
        message: 'API de Controle Financeiro está funcionando',
        timestamp: new Date().toISOString(),
    });
});
/**
 * Rotas da API (versão v1)
 */
app.use('/api/users', users_1.default);
app.use('/api/transactions', transactions_1.default);
app.use('/api/categories', categories_1.default);
app.use('/api/budgets', budgets_1.default);
app.use('/api/ai', ai_1.default);
/**
 * Middleware de tratamento de erros globais
 */
app.use((err, _req, res, _next) => {
    console.error('Erro não tratado:', err.message);
    // Garante que CORS headers sejam enviados mesmo em erros
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
    });
});
/**
 * Inicializa o servidor
 * 1. Testa conexão com o banco
 * 2. Cria tabelas se necessário
 * 3. Inicia a escuta na porta definida
 */
async function startServer() {
    const connected = await (0, database_1.testConnection)();
    if (!connected) {
        console.error('Não foi possível conectar ao banco de dados');
        process.exit(1);
    }
    await (0, database_1.createTables)();
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
        console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
}
startServer().catch((error) => {
    console.error('Erro ao iniciar servidor:', error);
    process.exit(1);
});
exports.default = app;
//# sourceMappingURL=index.js.map