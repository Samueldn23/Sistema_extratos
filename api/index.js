// ======================================================================
// API Principal - Vercel Serverless + Supabase
// ======================================================================

const express = require('express');
const path = require('path');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

const app = express();

// Configuração do Supabase
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const JWT_SECRET = process.env.JWT_SECRET || 'extratos_jwt_secret_2024';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Middleware de verificação de token
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

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Servir arquivos estáticos da pasta public (renomeada de publico)
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));

// ==================== ROTAS DE AUTENTICAÇÃO ====================

const authRoutes = require('./auth');
app.use('/api/auth', authRoutes);

// ==================== ROTAS DE TRANSAÇÕES ====================

// GET - Listar todas as transações
app.get('/api/transactions', verificarToken, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('transacoes')
            .select('*')
            .eq('usuario_id', req.usuario.id)
            .order('DATA', { ascending: false });

        if (error) {
            console.error('Erro ao buscar transações:', error);
            return res.status(500).json({ error: 'Erro ao buscar transações' });
        }

        res.json({ data: data || [] });
    } catch (error) {
        console.error('Erro:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// POST - Criar nova transação
app.post('/api/transactions', verificarToken, async (req, res) => {
    try {
        const { id, DATA, DESCRIÇÃO, VALOR, CATEGORIA, pago, data_referencia } = req.body;

        // Validação
        if (!DATA || !DESCRIÇÃO || VALOR === undefined) {
            return res.status(400).json({ error: 'DATA, DESCRIÇÃO e VALOR são obrigatórios' });
        }

        const dataRef = data_referencia || DATA;

        const { data, error } = await supabase
            .from('transacoes')
            .insert({
                id: id || `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                DATA,
                DESCRIÇÃO: DESCRIÇÃO.trim(),
                VALOR: parseFloat(VALOR),
                CATEGORIA: (CATEGORIA || 'Sem categoria').trim(),
                pago: pago ? 1 : 0,
                data_referencia: dataRef,
                usuario_id: req.usuario.id,
                criado_em: new Date().toISOString(),
                atualizado_em: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error('Erro ao criar transação:', error);
            return res.status(500).json({ error: 'Erro ao criar transação' });
        }

        res.json({ transaction: data });
    } catch (error) {
        console.error('Erro:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// PUT - Atualizar transação
app.put('/api/transactions/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { DATA, DESCRIÇÃO, VALOR, CATEGORIA, pago, data_referencia } = req.body;

        // Verificar se a transação pertence ao usuário
        const { data: existing } = await supabase
            .from('transacoes')
            .select('usuario_id')
            .eq('id', id)
            .single();

        if (!existing || existing.usuario_id !== req.usuario.id) {
            return res.status(404).json({ error: 'Transação não encontrada' });
        }

        const dataRef = data_referencia || DATA;

        const { data, error } = await supabase
            .from('transacoes')
            .update({
                DATA,
                DESCRIÇÃO: DESCRIÇÃO.trim(),
                VALOR: parseFloat(VALOR),
                CATEGORIA: (CATEGORIA || 'Sem categoria').trim(),
                pago: pago ? 1 : 0,
                data_referencia: dataRef,
                atualizado_em: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Erro ao atualizar transação:', error);
            return res.status(500).json({ error: 'Erro ao atualizar transação' });
        }

        res.json({ transaction: data });
    } catch (error) {
        console.error('Erro:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// DELETE - Deletar transação
app.delete('/api/transactions/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar se a transação pertence ao usuário
        const { data: existing } = await supabase
            .from('transacoes')
            .select('usuario_id')
            .eq('id', id)
            .single();

        if (!existing || existing.usuario_id !== req.usuario.id) {
            return res.status(404).json({ error: 'Transação não encontrada' });
        }

        const { error } = await supabase
            .from('transacoes')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Erro ao deletar transação:', error);
            return res.status(500).json({ error: 'Erro ao deletar transação' });
        }

        res.json({ message: 'Transação deletada com sucesso' });
    } catch (error) {
        console.error('Erro:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// PATCH - Toggle status de pagamento
app.patch('/api/transactions/:id/pago', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { pago } = req.body;

        // Verificar se a transação pertence ao usuário
        const { data: existing } = await supabase
            .from('transacoes')
            .select('usuario_id')
            .eq('id', id)
            .single();

        if (!existing || existing.usuario_id !== req.usuario.id) {
            return res.status(404).json({ error: 'Transação não encontrada' });
        }

        const newPago = pago ? 1 : 0;

        const { error } = await supabase
            .from('transacoes')
            .update({
                pago: newPago,
                atualizado_em: new Date().toISOString()
            })
            .eq('id', id);

        if (error) {
            console.error('Erro ao atualizar pagamento:', error);
            return res.status(500).json({ error: 'Erro ao atualizar pagamento' });
        }

        res.json({ message: 'Status atualizado', pago: newPago });
    } catch (error) {
        console.error('Erro:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// POST - Limpar todas as transações do usuário
app.post('/api/transactions/clear/all', verificarToken, async (req, res) => {
    try {
        const { error } = await supabase
            .from('transacoes')
            .delete()
            .eq('usuario_id', req.usuario.id);

        if (error) {
            console.error('Erro ao limpar transações:', error);
            return res.status(500).json({ error: 'Erro ao limpar transações' });
        }

        res.json({ message: 'Transações deletadas com sucesso' });
    } catch (error) {
        console.error('Erro:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// POST - Importar dados do JSON
app.post('/api/import-json', verificarToken, async (req, res) => {
    try {
        const { transactions } = req.body;

        if (!Array.isArray(transactions)) {
            return res.status(400).json({ error: 'Formato inválido. Esperado array de transações.' });
        }

        let importados = 0;
        let erros = 0;

        for (const trans of transactions) {
            try {
                if (!trans.DATA || !trans.DESCRIÇÃO || trans.VALOR === undefined) {
                    erros++;
                    continue;
                }

                const id = trans.id || `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

                await supabase.from('transacoes').insert({
                    id,
                    DATA: trans.DATA,
                    DESCRIÇÃO: (trans.DESCRIÇÃO || '').trim(),
                    VALOR: parseFloat(trans.VALOR),
                    CATEGORIA: (trans.CATEGORIA || 'Sem categoria').trim(),
                    pago: trans.pago ? 1 : 0,
                    data_referencia: trans.data_referencia || trans.DATA,
                    usuario_id: req.usuario.id,
                    criado_em: new Date().toISOString(),
                    atualizado_em: new Date().toISOString()
                });

                importados++;
            } catch (err) {
                erros++;
                console.error('Erro ao importar transação:', err);
            }
        }

        res.json({
            message: `Importação concluída: ${importados} transações importadas, ${erros} erros`,
            importados,
            erros
        });
    } catch (error) {
        console.error('Erro:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// GET - Status do servidor
app.get('/api/status', async (req, res) => {
    try {
        const { count } = await supabase
            .from('transacoes')
            .select('*', { count: 'exact', head: true });

        res.json({
            servidor: 'ativo',
            timestamp: new Date().toISOString(),
            banco_de_dados: 'supabase',
            transacoes_totais: count || 0,
            versao: '3.0.0'
        });
    } catch (error) {
        res.json({
            servidor: 'ativo',
            timestamp: new Date().toISOString(),
            banco_de_dados: 'supabase (verificando...)',
            transacoes_totais: 0,
            versao: '3.0.0'
        });
    }
});

// Rota raiz - servir index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Exportar para Vercel
module.exports = app;
