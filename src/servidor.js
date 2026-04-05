const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const bcryptjs = require('bcryptjs');
const { verificarToken, gerarToken } = require('./middlewares/autenticacao');

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== Configuração de Logging ====================
const LOG_ENABLED = true;

function logInfo(msg) {
    if (LOG_ENABLED) console.log(`[ℹ️  ${new Date().toISOString()}] ${msg}`);
}

function logSuccess(msg) {
    if (LOG_ENABLED) console.log(`[✓ ${new Date().toISOString()}] ${msg}`);
}

function logError(msg, error = null) {
    if (LOG_ENABLED) {
        console.error(`[❌ ${new Date().toISOString()}] ${msg}`);
        if (error) console.error(`    Detalhes: ${error.message}`);
    }
}

function logWarn(msg) {
    if (LOG_ENABLED) console.warn(`[⚠️  ${new Date().toISOString()}] ${msg}`);
}

// ==================== Validação ====================
/**
 * Valida se uma data é válida em formato ISO
 */
function isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}

/**
 * Valida se um valor é um número válido
 */
function isValidValue(value) {
    const num = parseFloat(value);
    return !isNaN(num) && isFinite(num);
}

/**
 * Valida uma transação
 */
function validateTransaction(trans, requireId = false) {
    const errors = [];

    if (requireId && !trans.id) errors.push('ID é obrigatório');
    if (!trans.DATA || !isValidDate(trans.DATA)) errors.push('DATA inválida (use formato ISO 8601)');
    if (!trans.DESCRIÇÃO || trans.DESCRIÇÃO.trim().length === 0) errors.push('DESCRIÇÃO não pode estar vazia');
    if (trans.DESCRIÇÃO && trans.DESCRIÇÃO.length > 255) errors.push('DESCRIÇÃO muito longa (máx 255 caracteres)');
    if (!isValidValue(trans.VALOR)) errors.push('VALOR inválido (deve ser um número)');
    // CATEGORIA é opcional - usa valor padrão se não fornecido
    if (trans.CATEGORIA && trans.CATEGORIA.length > 50) errors.push('CATEGORIA muito longa (máx 50 caracteres)');

    return {
        valid: errors.length === 0,
        errors: errors.length > 0 ? errors.join('; ') : null
    };
}

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'publico')));

// Logging de requisições
app.use((req, res, next) => {
    logInfo(`${req.method} ${req.path}`);
    next();
});

// Inicializar banco de dados SQLite
const DB_PATH = path.join(__dirname, '..', 'banco', 'sistema_extratos.db');
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        logError('Erro ao conectar ao banco de dados', err);
    } else {
        logSuccess('Conectado ao banco de dados SQLite');
        initializeDatabase();
    }
});

// Função para inicializar o banco de dados
function initializeDatabase() {
    // Criar tabela de usuários
    db.run(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            nome TEXT NOT NULL,
            senha_hash TEXT NOT NULL,
            criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
            ultimo_login TEXT
        )
    `, (err) => {
        if (err) {
            logError('Erro ao criar tabela de usuários', err);
        } else {
            logSuccess('Tabela de usuários verificada/criada');
        }
    });

    // Criar tabela de transações
    db.run(`
        CREATE TABLE IF NOT EXISTS transacoes (
            id TEXT PRIMARY KEY,
            DATA TEXT NOT NULL,
            DESCRIÇÃO TEXT NOT NULL,
            VALOR REAL NOT NULL,
            CATEGORIA TEXT NOT NULL,
            pago INTEGER DEFAULT 0,
            usuario_id TEXT NOT NULL,
            criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
            atualizado_em TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
        )
    `, (err) => {
        if (err) {
            logError('Erro ao criar tabela', err);
        } else {
            logSuccess('Tabela de transações verificada/criada');

            // Criar índices para melhor performance
            db.run('CREATE INDEX IF NOT EXISTS idx_data ON transacoes(DATA)', (err) => {
                if (err) logWarn('Erro ao criar índice em DATA');
                else logSuccess('Índice em DATA criado');
            });

            db.run('CREATE INDEX IF NOT EXISTS idx_pago ON transacoes(pago)', (err) => {
                if (err) logWarn('Erro ao criar índice em pago');
                else logSuccess('Índice em pago criado');
            });

            // Contar transações existentes
            db.get('SELECT COUNT(*) as count FROM transacoes', (err, row) => {
                if (!err) {
                    logSuccess(`${row.count} transações no banco de dados`);
                }
            });

            // Migração: garantir colunas adicionadas após criação inicial
            const migrations = [
                { col: 'usuario_id', sql: 'ALTER TABLE transacoes ADD COLUMN usuario_id TEXT' },
                { col: 'data_referencia', sql: 'ALTER TABLE transacoes ADD COLUMN data_referencia TEXT' }
            ];
            db.all('PRAGMA table_info(transacoes)', (err, cols) => {
                if (err || !cols) return;
                const existing = cols.map(c => c.name);
                migrations.forEach(({ col, sql }) => {
                    if (!existing.includes(col)) {
                        db.run(sql, (e) => {
                            if (e) logWarn(`Migração da coluna ${col} falhou: ${e.message}`);
                            else logSuccess(`Migração: coluna ${col} adicionada à tabela transacoes`);
                        });
                    }
                });
            });
        }
    });
}

// ==================== API ENDPOINTS ====================

// ==================== AUTENTICAÇÃO ====================

// POST - Registrar novo usuário
app.post('/api/auth/registro', (req, res) => {
    const { email, nome, senha } = req.body;

    if (!email || !nome || !senha) {
        logWarn('Tentativa de registro com dados incompletos');
        return res.status(400).json({ error: 'Email, nome e senha são obrigatórios' });
    }

    if (senha.length < 6) {
        return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });
    }

    // Gerar salt e hash da senha
    bcryptjs.genSalt(10, (err, salt) => {
        if (err) {
            logError('Erro ao gerar salt', err);
            return res.status(500).json({ error: 'Erro ao registrar usuário' });
        }

        bcryptjs.hash(senha, salt, (err, senha_hash) => {
            if (err) {
                logError('Erro ao fazer hash da senha', err);
                return res.status(500).json({ error: 'Erro ao registrar usuário' });
            }

            const usuarioId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const query = `INSERT INTO usuarios (id, email, nome, senha_hash) VALUES (?, ?, ?, ?)`;

            db.run(query, [usuarioId, email.toLowerCase(), nome, senha_hash], function(err) {
                if (err) {
                    logWarn(`Erro ao registrar usuário ${email}: ${err.message}`);
                    if (err.message.includes('UNIQUE')) {
                        return res.status(400).json({ error: 'Email já registrado' });
                    }
                    return res.status(500).json({ error: 'Erro ao registrar usuário' });
                }

                logSuccess(`Novo usuário registrado: ${email}`);
                const token = gerarToken(usuarioId, email, nome);
                res.json({
                    message: 'Usuário registrado com sucesso',
                    token,
                    usuario: { id: usuarioId, email, nome }
                });
            });
        });
    });
});

// POST - Login
app.post('/api/auth/login', (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        logWarn('Tentativa de login com dados incompletos');
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const query = `SELECT * FROM usuarios WHERE LOWER(email) = ?`;
    db.get(query, [email.toLowerCase()], (err, usuario) => {
        if (err) {
            logError('Erro ao buscar usuário', err);
            return res.status(500).json({ error: 'Erro ao fazer login' });
        }

        if (!usuario) {
            logWarn(`Login falhou para email: ${email}`);
            return res.status(401).json({ error: 'Email ou senha incorretos' });
        }

        // Comparar senha
        bcryptjs.compare(senha, usuario.senha_hash, (err, isMatch) => {
            if (err) {
                logError('Erro ao comparar senhas', err);
                return res.status(500).json({ error: 'Erro ao fazer login' });
            }

            if (!isMatch) {
                logWarn(`Login falhou por senha incorreta: ${email}`);
                return res.status(401).json({ error: 'Email ou senha incorretos' });
            }

            // Atualizar último login
            db.run(`UPDATE usuarios SET ultimo_login = CURRENT_TIMESTAMP WHERE id = ?`, [usuario.id]);

            logSuccess(`Login bem-sucedido: ${email}`);
            const token = gerarToken(usuario.id, usuario.email, usuario.nome);
            res.json({
                message: 'Login realizado com sucesso',
                token,
                usuario: { id: usuario.id, email: usuario.email, nome: usuario.nome }
            });
        });
    });
});

// GET - Verificar autenticação (verifica se token é válido)
app.get('/api/auth/me', verificarToken, (req, res) => {
    res.json({
        message: 'Autenticado',
        usuario: req.usuario
    });
});

// POST - Logout (sem lógica server, apenas confirmação)
app.post('/api/auth/logout', verificarToken, (req, res) => {
    logInfo(`Logout do usuário: ${req.usuario.email}`);
    res.json({ message: 'Logout realizado com sucesso' });
});

// ==================== TRANSAÇÕES ====================
app.get('/api/transactions', (req, res) => {
    logInfo('Fetching all transactions');
    db.all('SELECT * FROM transacoes ORDER BY DATA DESC', (err, rows) => {
        if (err) {
            logError('Erro ao buscar transações', err);
            res.status(500).json({ error: 'Erro ao buscar transações', details: err.message });
        } else {
            logSuccess(`Retornadas ${rows ? rows.length : 0} transações`);
            res.json({ data: rows || [] });
        }
    });
});

// POST - Criar nova transação
app.post('/api/transactions', verificarToken, (req, res) => {
    const { id, DATA, DESCRIÇÃO, VALOR, CATEGORIA, pago, data_referencia } = req.body;
    const usuario_id = req.usuario.id;

    // Log de debug
    logInfo(`POST /api/transactions: data_referencia=${data_referencia}, usuario=${req.usuario.email}`);

    // Validar entrada
    const validation = validateTransaction({ id, DATA, DESCRIÇÃO, VALOR, CATEGORIA }, true);
    if (!validation.valid) {
        logWarn(`Validação falhou: ${validation.errors}`);
        return res.status(400).json({ error: 'Validação falhou', details: validation.errors });
    }

    // Se não houver data_referencia, usar DATA
    const dataRef = data_referencia || DATA;
    logInfo(`POST /api/transactions: Entrada data_referencia="${data_referencia}", Final="${dataRef}"`);

    const query = `
        INSERT INTO transacoes (id, DATA, DESCRIÇÃO, VALOR, CATEGORIA, pago, data_referencia, usuario_id, atualizado_em)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;

    const params = [id, DATA, DESCRIÇÃO.trim(), parseFloat(VALOR), CATEGORIA.trim(), pago ? 1 : 0, dataRef, usuario_id];
    logInfo(`Executando INSERT com params: id=${params[0]}, data_ref=${params[6]}, usuario=${usuario_id}`);

    db.run(query, params, function(err) {
        if (err) {
            logError('Erro ao inserir transação', err);
            res.status(500).json({ error: 'Erro ao criar transação', details: err.message });
        } else {
            const transaction = { id, DATA, DESCRIÇÃO: DESCRIÇÃO.trim(), VALOR: parseFloat(VALOR), CATEGORIA: CATEGORIA.trim(), pago: pago ? 1 : 0, data_referencia: dataRef, usuario_id };
            logSuccess(`Transação criada: ${id} com data_referencia=${dataRef} por ${req.usuario.email}`);
            logInfo(`Respondendo com: ${JSON.stringify(transaction)}`);
            res.json({ transaction });
        }
    });
});

// PUT - Atualizar transação
app.put('/api/transactions/:id', verificarToken, (req, res) => {
    const { id } = req.params;
    const { DATA, DESCRIÇÃO, VALOR, CATEGORIA, pago, data_referencia } = req.body;
    const usuario_id = req.usuario.id;

    // Validar entrada
    const validation = validateTransaction({ DATA, DESCRIÇÃO, VALOR, CATEGORIA });
    if (!validation.valid) {
        logWarn(`Validação falhou: ${validation.errors}`);
        return res.status(400).json({ error: 'Validação falhou', details: validation.errors });
    }

    // Se não houver data_referencia, usar DATA
    const dataRef = data_referencia || DATA;

    // Verificar se transação pertence ao usuário
    db.get('SELECT usuario_id FROM transacoes WHERE id = ?', [id], (err, row) => {
        if (err) {
            logError(`Erro ao buscar transação ${id}`, err);
            return res.status(500).json({ error: 'Erro ao atualizar transação' });
        }

        if (!row) {
            logWarn(`Transação não encontrada: ${id}`);
            return res.status(404).json({ error: 'Transação não encontrada' });
        }

        if (row.usuario_id !== usuario_id) {
            logWarn(`Tentativa de atualizar transação de outro usuário: ${id} por ${usuario_id}`);
            return res.status(403).json({ error: 'Você não tem permissão para atualizar esta transação' });
        }

        const query = `
            UPDATE transacoes
            SET DATA = ?, DESCRIÇÃO = ?, VALOR = ?, CATEGORIA = ?, pago = ?, data_referencia = ?, atualizado_em = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

        db.run(query, [DATA, DESCRIÇÃO.trim(), parseFloat(VALOR), CATEGORIA.trim(), pago ? 1 : 0, dataRef, id], function(err) {
            if (err) {
                logError(`Erro ao atualizar transação ${id}`, err);
                res.status(500).json({ error: 'Erro ao atualizar transação', details: err.message });
            } else if (this.changes === 0) {
                logWarn(`Transação não encontrada: ${id}`);
                res.status(404).json({ error: 'Transação não encontrada' });
            } else {
                const transaction = { id, DATA, DESCRIÇÃO: DESCRIÇÃO.trim(), VALOR: parseFloat(VALOR), CATEGORIA: CATEGORIA.trim(), pago: pago ? 1 : 0, data_referencia: dataRef, usuario_id };
                logSuccess(`Transação atualizada: ${id} por ${req.usuario.email}`);
                res.json({ transaction });
            }
        });
    });
});

// DELETE - Deletar transação
app.delete('/api/transactions/:id', verificarToken, (req, res) => {
    const { id } = req.params;
    const usuario_id = req.usuario.id;

    // Verificar se transação pertence ao usuário
    db.get('SELECT usuario_id FROM transacoes WHERE id = ?', [id], (err, row) => {
        if (err) {
            logError(`Erro ao buscar transação ${id}`, err);
            return res.status(500).json({ error: 'Erro ao deletar transação' });
        }

        if (!row) {
            logWarn(`Transação não encontrada para delete: ${id}`);
            return res.status(404).json({ error: 'Transação não encontrada' });
        }

        if (row.usuario_id !== usuario_id) {
            logWarn(`Tentativa de deletar transação de outro usuário: ${id} por ${usuario_id}`);
            return res.status(403).json({ error: 'Você não tem permissão para deletar esta transação' });
        }

        db.run('DELETE FROM transacoes WHERE id = ?', [id], function(err) {
            if (err) {
                logError(`Erro ao deletar transação ${id}`, err);
                res.status(500).json({ error: 'Erro ao deletar transação', details: err.message });
            } else if (this.changes === 0) {
                logWarn(`Transação não encontrada para delete: ${id}`);
                res.status(404).json({ error: 'Transação não encontrada' });
            } else {
                logSuccess(`Transação deletada: ${id} por ${req.usuario.email}`);
                res.json({ message: 'Transação deletada com sucesso' });
            }
        });
    });
});

// PATCH - Toggle status de pagamento
app.patch('/api/transactions/:id/pago', verificarToken, (req, res) => {
    const { id } = req.params;
    const { pago } = req.body;
    const usuario_id = req.usuario.id;

    // Validar se pago foi enviado
    if (typeof pago !== 'boolean' && pago !== 0 && pago !== 1) {
        logWarn(`Valor de pago inválido para ${id}: ${pago}`);
        return res.status(400).json({ error: 'Campo "pago" deve ser um booleano ou 0/1' });
    }

    // Verificar se transação pertence ao usuário
    db.get('SELECT usuario_id FROM transacoes WHERE id = ?', [id], (err, row) => {
        if (err) {
            logError(`Erro ao buscar transação ${id}`, err);
            return res.status(500).json({ error: 'Erro ao atualizar pagamento' });
        }

        if (!row) {
            logWarn(`Transação não encontrada: ${id}`);
            return res.status(404).json({ error: 'Transação não encontrada' });
        }

        if (row.usuario_id !== usuario_id) {
            logWarn(`Tentativa de atualizar pagamento de transação de outro usuário: ${id} por ${usuario_id}`);
            return res.status(403).json({ error: 'Você não tem permissão para atualizar esta transação' });
        }

        const newPago = pago ? 1 : 0;
        db.run('UPDATE transacoes SET pago = ?, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?', [newPago, id], function(err) {
            if (err) {
                logError(`Erro ao atualizar pagamento de ${id}`, err);
                res.status(500).json({ error: 'Erro ao atualizar pagamento', details: err.message });
            } else {
                logSuccess(`Status pago atualizado para ${id}: ${newPago} por ${req.usuario.email}`);
                res.json({ message: 'Status atualizado', pago: newPago });
            }
        });
    });
});

// POST - Limpar todas as transações do usuário
app.post('/api/transactions/clear/all', verificarToken, (req, res) => {
    const usuario_id = req.usuario.id;

    db.run('DELETE FROM transacoes WHERE usuario_id = ?', [usuario_id], function(err) {
        if (err) {
            logError('Erro ao limpar transações do usuário', err);
            res.status(500).json({ error: 'Erro ao limpar transações', details: err.message });
        } else {
            logSuccess(`Transações do usuário ${req.usuario.email} deletadas. Linhas: ${this.changes}`);
            res.json({ message: 'Transações deletadas com sucesso', deleted: this.changes });
        }
    });
});

// POST - Importar dados do JSON
app.post('/api/import-json', verificarToken, (req, res) => {
    const { transactions } = req.body;
    const usuario_id = req.usuario.id;

    if (!Array.isArray(transactions)) {
        logWarn('Formato inválido em import-json');
        return res.status(400).json({ error: 'Formato inválido. Esperado array de transações.' });
    }

    logInfo(`Iniciando importação de ${transactions.length} transações para usuário ${req.usuario.email}`);

    let importados = 0;
    let erros = 0;
    const errosList = [];

    // Começar transação
    db.run('BEGIN TRANSACTION', (err) => {
        if (err) {
            logError('Erro ao iniciar transação', err);
            return res.status(500).json({ error: 'Erro ao iniciar importação', details: err.message });
        }

        let processados = 0;

        const inserirProxima = () => {
            if (processados >= transactions.length) {
                // Fazer commit
                db.run('COMMIT', (commitErr) => {
                    if (commitErr) {
                        logError('Erro ao fazer commit', commitErr);
                        db.run('ROLLBACK');
                        return res.status(500).json({
                            error: 'Erro ao confirmar importação',
                            details: commitErr.message
                        });
                    }
                    logSuccess(`Importação concluída: ${importados} importadas, ${erros} erros`);
                    res.json({
                        message: `Importação concluída: ${importados} transações importadas, ${erros} erros`,
                        importados,
                        erros,
                        errosList: erros > 0 ? errosList : undefined
                    });
                });
                return;
            }

            const trans = transactions[processados];
            processados++;

            // Validar
            const validation = validateTransaction(trans, false);
            if (!validation.valid) {
                erros++;
                errosList.push({
                    index: processados - 1,
                    erro: validation.errors,
                    descricao: trans.DESCRIÇÃO
                });
                logWarn(`Erro de validação na linha ${processados}: ${validation.errors}`);
                inserirProxima();
                return;
            }

            const id = trans.id || `auto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const query = `
                INSERT OR REPLACE INTO transacoes (id, DATA, DESCRIÇÃO, VALOR, CATEGORIA, pago, usuario_id, atualizado_em)
                VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            `;

            db.run(query, [
                id,
                trans.DATA,
                (trans.DESCRIÇÃO || '').trim(),
                parseFloat(trans.VALOR),
                (trans.CATEGORIA || 'Sem categoria').trim(),
                trans.pago ? 1 : 0,
                usuario_id
            ], (err) => {
                if (err) {
                    erros++;
                    errosList.push({
                        index: processados - 1,
                        erro: err.message,
                        descricao: trans.DESCRIÇÃO
                    });
                    logWarn(`Erro ao inserir na linha ${processados}: ${err.message}`);
                } else {
                    importados++;
                }
                inserirProxima();
            });
        };

        inserirProxima();
    });
});

// GET - Exportar todas as transações como JSON
app.get('/api/export-json', (req, res) => {
    db.all('SELECT * FROM transacoes ORDER BY DATA DESC', (err, rows) => {
        if (err) {
            logError('Erro ao exportar transações', err);
            res.status(500).json({ error: 'Erro ao exportar transações', details: err.message });
        } else {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="extratos_${timestamp}.json"`);
            logSuccess(`Exportadas ${rows.length} transações`);
            res.json(rows || []);
        }
    });
});

// GET - Status do servidor
app.get('/api/status', (req, res) => {
    db.get('SELECT COUNT(*) as total FROM transacoes', (err, row) => {
        const status = {
            servidor: 'ativo',
            timestamp: new Date().toISOString(),
            banco_de_dados: err ? 'erro' : 'ativo',
            transacoes_totais: row ? row.total : 0,
            versao: '2.0.0'
        };
        res.json(status);
    });
});

// Rota raiz - servir HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'publico', 'index.html'));
});

// ==================== INICIAR SERVIDOR ====================

const server = app.listen(PORT, () => {
    console.log('\n');
    console.log('╔════════════════════════════════════════╗');
    console.log('║   EXTRATO BANCÁRIO - SISTEMA LOCAL    ║');
    console.log('║        Rodando com SQLite 3           ║');
    console.log('║          Versão 2.0.0                 ║');
    console.log('╚════════════════════════════════════════╝');
    console.log(`\n✓ Servidor rodando em: http://localhost:${PORT}`);
    console.log(`✓ Banco de dados: ${DB_PATH}`);
    console.log(`✓ Endpoints disponíveis:`);
    console.log(`   • GET    /api/transactions`);
    console.log(`   • POST   /api/transactions`);
    console.log(`   • PUT    /api/transactions/:id`);
    console.log(`   • DELETE /api/transactions/:id`);
    console.log(`   • PATCH  /api/transactions/:id/pago`);
    console.log(`   • POST   /api/import-json`);
    console.log(`   • GET    /api/export-json`);
    console.log(`   • GET    /api/status`);
    console.log(`   • POST   /api/transactions/clear/all\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n✓ Encerrando servidor...');
    db.close((err) => {
        if (err) {
            logError('Erro ao fechar banco', err);
        } else {
            logSuccess('Banco de dados fechado');
        }
        server.close(() => {
            logSuccess('Servidor encerrado');
            process.exit(0);
        });
    });
});
