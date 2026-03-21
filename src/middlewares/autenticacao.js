const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'seu_segredo_super_secreto_2026';

/**
 * Middleware para verificar token JWT
 * Adiciona req.usuario com dados do token se autenticado
 */
function verificarToken(req, res, next) {
    try {
        // Tentar obter token do header
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.startsWith('Bearer ')
            ? authHeader.slice(7)
            : req.headers.x_access_token || req.query.token;

        if (!token) {
            return res.status(401).json({
                error: 'Não autenticado',
                details: 'Token não fornecido'
            });
        }

        // Verificar e decodificar token
        const decoded = jwt.verify(token, JWT_SECRET);
        req.usuario = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            error: 'Token inválido ou expirado',
            details: error.message
        });
    }
}

/**
 * Gerar um novo JWT token
 */
function gerarToken(usuarioId, email, nome) {
    return jwt.sign(
        {
            id: usuarioId,
            email: email,
            nome: nome,
            timestamp: Date.now()
        },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
}

module.exports = {
    verificarToken,
    gerarToken,
    JWT_SECRET
};
