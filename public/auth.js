// ======================================================================
// Sistema de Autenticação - Frontend
// Gerencia login, registro e persistência de tokens
// ======================================================================

const AUTH_API_URL = '/api/auth';
let authToken = localStorage.getItem('authToken') || null;
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

// ==================== Funções de Autenticação ====================

async function registrarUsuario(email, nome, senha) {
    try {
        const response = await fetch(`${AUTH_API_URL}/registro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, nome, senha })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Erro ao registrar');
        }

        // Salvar token e usuário
        authToken = data.token;
        currentUser = data.usuario;
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        return { sucesso: true, dados: data };
    } catch (error) {
        console.error('Erro ao registrar:', error);
        return { sucesso: false, erro: error.message };
    }
}

async function fazerLogin(email, senha) {
    try {
        const response = await fetch(`${AUTH_API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Erro ao fazer login');
        }

        // Salvar token e usuário
        authToken = data.token;
        currentUser = data.usuario;
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        return { sucesso: true, dados: data };
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        return { sucesso: false, erro: error.message };
    }
}

async function fazerLogout() {
    try {
        // Fazer logout no servidor
        await fetch(`${AUTH_API_URL}/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        });
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
    }

    // Limpar dados locais
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
}

function estaoAutenticado() {
    return authToken !== null && currentUser !== null;
}

function obterToken() {
    return authToken;
}

function obterUsuarioAtual() {
    return currentUser;
}

// ==================== Proteção de Operações ====================

/**
 * Verifica se o usuário está autenticado antes de fazer uma operação protegida.
 * Se não está, mostra um alerta e retorna false.
 */
function verificarAutenticacaoAntes(operacao = 'esta ação') {
    if (!estaoAutenticado()) {
        alert(`Você precisa estar logado para ${operacao}.\n\nClique no botão 'Login' no canto superior direito.`);
        return false;
    }
    return true;
}

// ==================== UI de Autenticação ====================

function mostrarBotaoLogin(container) {
    try {
        if (!container) {
            console.error('❌ mostrarBotaoLogin: container não encontrado');
            return;
        }

        // Remover botão anterior se existir
        const btnExistente = container.querySelector('#btn-auth-toggle');
        if (btnExistente) btnExistente.remove();

        const btnLogin = document.createElement('button');
        btnLogin.id = 'btn-auth-toggle';
        btnLogin.className = 'btn-auth-toggle';
        btnLogin.type = 'button';
        btnLogin.title = 'Fazer login';
        btnLogin.style.zIndex = '1000';
        btnLogin.innerHTML = `<span>🔐</span> <span class="auth-text">Login</span>`;

        // Handler direto
        const clickHandler = (e) => {
            console.log('🖱️ CLIQUE DETECTADO NO BOTÃO DE LOGIN');
            e.preventDefault();
            e.stopPropagation();
            mostrarTelaLoginModal();
        };

        btnLogin.onclick = clickHandler;
        btnLogin.addEventListener('click', clickHandler, true);

        container.appendChild(btnLogin);
    } catch (error) {
        console.error('❌ Erro em mostrarBotaoLogin:', error);
    }
}

function mostrarTelaLoginModal() {
    try {
        console.log('✓ mostrarTelaLoginModal: abrindo modal...');
        const container = document.getElementById('auth-container');
        if (!container) {
            console.error('❌ mostrarTelaLoginModal: auth-container não encontrado');
            return;
        }

    container.innerHTML = `
        <div class="auth-overlay" id="auth-overlay">
            <div class="auth-card">
                <button class="auth-close" id="auth-close" title="Fechar">✕</button>
                <div class="auth-header">
                    <h1>💰 Extratos</h1>
                    <p>Sistema de Controle Financeiro</p>
                </div>

                <!-- Aba de Login -->
                <form id="form-login" class="auth-form active">
                    <div class="form-group">
                        <label for="login-email">Email</label>
                        <input type="email" id="login-email" placeholder="seu@email.com" required>
                    </div>
                    <div class="form-group">
                        <label for="login-senha">Senha</label>
                        <input type="password" id="login-senha" placeholder="Sua senha" required>
                    </div>
                    <button type="submit" class="btn-auth-submit">Entrar</button>
                    <div id="login-error" class="auth-error"></div>
                </form>

                <div class="auth-demo">
                    <p>📝 Teste: email@teste.com / senha123</p>
                </div>
            </div>
        </div>
    `;

    // Submit login
    document.getElementById('form-login').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const senha = document.getElementById('login-senha').value;
        const errorDiv = document.getElementById('login-error');

        errorDiv.textContent = '';
        const resultado = await fazerLogin(email, senha);

        if (resultado.sucesso) {
            errorDiv.classList.remove('error');
            errorDiv.classList.add('success');
            errorDiv.textContent = '✓ Login realizado! Redirecionando...';
            setTimeout(() => location.reload(), 1500);
        } else {
            errorDiv.classList.add('error');
            errorDiv.textContent = `❌ ${resultado.erro}`;
        }
    });

    // Botão de fechar modal
    const btnClose = document.getElementById('auth-close');
    const overlay = document.getElementById('auth-overlay');

    if (btnClose) {
        btnClose.addEventListener('click', (e) => {
            console.log('🖱️ CLIQUE NO BOTÃO X');
            e.preventDefault();
            e.stopPropagation();
            fecharModalLogin();
        });
    }

    if (overlay) {
        overlay.addEventListener('click', (e) => {
            // Fechar ao clicar no fundo
            if (e.target === overlay) {
                console.log('🖱️ CLIQUE NO FUNDO');
                fecharModalLogin();
            }
        });
    }

    console.log('✓ Modal de login criado com sucesso');
    } catch (error) {
        console.error('❌ Erro em mostrarTelaLoginModal:', error);
    }
}

function fecharModalLogin() {
    try {
        const container = document.getElementById('auth-container');
        if (container) {
            console.log('✓ Fechando modal de login');
            const overlay = container.querySelector('.auth-overlay');
            if (overlay) {
                overlay.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('❌ Erro ao fechar modal:', error);
    }
}

function mostrarBotaoLogout(container) {
    if (!container) return;

    // Remover botão anterior se existir
    const btnExistente = container.querySelector('#btn-auth-toggle, #btn-logout');
    if (btnExistente) btnExistente.remove();

    const usuario = obterUsuarioAtual();
    if (!usuario) return;

    const btnLogout = document.createElement('button');
    btnLogout.id = 'btn-logout';
    btnLogout.className = 'btn-auth-toggle btn-logout-active';
    btnLogout.title = `Logado como: ${usuario.email}`;
    btnLogout.innerHTML = `
        <span>👤</span>
        <span class="auth-text">${usuario.nome}</span>
        <span class="auth-sair">Sair</span>
    `;

    btnLogout.addEventListener('click', async () => {
        // Confirmar logout
        if (!confirm(`Tem certeza que deseja sair, ${usuario.nome}?`)) return;

        await fazerLogout();

        // Recarregar para mostrar botão de login
        location.reload();
    });

    container.appendChild(btnLogout);
}

// ==================== Modificar requisições HTTP ====================

// Interceptar funções de API para adicionar token
const originalApiPost = window.apiPost;
const originalApiPut = window.apiPut;
const originalApiDelete = window.apiDelete;
const originalApiPatch = window.apiPatch;

window.apiPost = async function(endpoint, data) {
    // Verificar autenticação para endpoints protegidos
    if (endpoint === '/transactions' || endpoint === '/import-json' || endpoint === '/transactions/clear/all') {
        if (!estaoAutenticado()) {
            verificarAutenticacaoAntes('fazer esta ação');
            throw new Error('Não autenticado');
        }
    }

    // Chamar função original
    return originalApiPost(endpoint, data);
};

window.apiPut = async function(endpoint, data) {
    // PUT /transactions/:id requer autenticação
    if (!estaoAutenticado()) {
        verificarAutenticacaoAntes('editar transações');
        throw new Error('Não autenticado');
    }

    return originalApiPut(endpoint, data);
};

window.apiDelete = async function(endpoint) {
    // DELETE /transactions/:id requer autenticação
    if (!estaoAutenticado()) {
        verificarAutenticacaoAntes('deletar transações');
        throw new Error('Não autenticado');
    }

    return originalApiDelete(endpoint);
};

window.apiPatch = async function(endpoint, data) {
    // PATCH /transactions/:id requer autenticação
    if (!estaoAutenticado()) {
        verificarAutenticacaoAntes('editar transações');
        throw new Error('Não autenticado');
    }

    return originalApiPatch(endpoint, data);
};
