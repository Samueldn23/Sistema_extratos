// ======================================================================
// Autenticação via Supabase - Serverless Function
// ======================================================================

const express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

// Configuração do Supabase
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const JWT_SECRET = process.env.JWT_SECRET || 'extratos_jwt_secret_2024';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Middleware de autenticação
function verificarToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token de autenticação não fornecido' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.usuario = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
}

// Gerar token JWT
function gerarToken(usuarioId, email, nome) {
    return jwt.sign(
        { id: usuarioId, email, nome },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
}

// POST - Registrar novo usuário
router.post('/registro', async (req, res) => {
    try {
        const { email, nome, senha } = req.body;

        if (!email || !nome || !senha) {
            return res.status(400).json({ error: 'Email, nome e senha são obrigatórios' });
        }

        if (senha.length < 6) {
            return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });
        }

        // Verificar se email já existe
        const { data: existing } = await supabase
            .from('usuarios')
            .select('id')
            .eq('email', email.toLowerCase())
            .single();

        if (existing) {
            return res.status(400).json({ error: 'Email já registrado' });
        }

        // Gerar hash da senha
        const salt = await bcryptjs.genSalt(10);
        const senha_hash = await bcryptjs.hash(senha, salt);

        // Criar usuário
        const usuarioId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const { data, error } = await supabase
            .from('usuarios')
            .insert({
                id: usuarioId,
                email: email.toLowerCase(),
                nome,
                senha_hash,
                criado_em: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error('Erro ao registrar usuário:', error);
            return res.status(500).json({ error: 'Erro ao registrar usuário' });
        }

        const token = gerarToken(usuarioId, email, nome);

        res.json({
            message: 'Usuário registrado com sucesso',
            token,
            usuario: { id: usuarioId, email, nome }
        });
    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// POST - Login
router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ error: 'Email e senha são obrigatórios' });
        }

        // Buscar usuário
        const { data: usuario, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', email.toLowerCase())
            .single();

        if (error || !usuario) {
            return res.status(401).json({ error: 'Email ou senha incorretos' });
        }

        // Comparar senha
        const isMatch = await bcryptjs.compare(senha, usuario.senha_hash);

        if (!isMatch) {
            return res.status(401).json({ error: 'Email ou senha incorretos' });
        }

        // Atualizar último login
        await supabase
            .from('usuarios')
            .update({ ultimo_login: new Date().toISOString() })
            .eq('id', usuario.id);

        const token = gerarToken(usuario.id, usuario.email, usuario.nome);

        res.json({
            message: 'Login realizado com sucesso',
            token,
            usuario: { id: usuario.id, email: usuario.email, nome: usuario.nome }
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// GET - Verificar autenticação
router.get('/me', verificarToken, (req, res) => {
    res.json({
        message: 'Autenticado',
        usuario: req.usuario
    });
});

// POST - Logout
router.post('/logout', verificarToken, (req, res) => {
    res.json({ message: 'Logout realizado com sucesso' });
});

module.exports = router;
module.exports.verificarToken = verificarToken;
