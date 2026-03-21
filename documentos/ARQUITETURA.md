# 🏗️ Arquitetura do Sistema de Autenticação

## 📐 Diagrama da Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTE (Browser)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              index.html                                  │   │
│  │  - Contém app principal                                 │   │
│  │  - Div para auth-container                             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ↑                                    │
│           ┌──────────────────┼──────────────────┐                │
│           │                  │                  │                │
│           ↓                  ↓                  ↓                │
│   ┌─────────────┐    ┌─────────────┐   ┌─────────────┐         │
│   │  style.css  │    │  script.js  │   │  auth.js    │         │
│   │             │    │             │   │             │         │
│   │ - UI do     │    │ - App Logic │   │ - Login UI  │         │
│   │   login     │    │ - Eventos   │   │ - JWT Mgmt  │         │
│   │ - Dark mode │    │ - Requests  │   │ - Requests  │         │
│   └─────────────┘    └─────────────┘   └─────────────┘         │
│           │                  │                  │                │
└───────────┼──────────────────┼──────────────────┼────────────────┘
            │                  │                  │
            └──────────────────┼──────────────────┘
                         HTTP Requests
                         + JWT Token
                               │
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│                    SERVIDOR (Node.js/Express)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │            src/servidor.js (Express App)                │   │
│  │                                                          │   │
│  │  Middleware:                                            │   │
│  │  - CORS                                                 │   │
│  │  - Body Parser                                          │   │
│  │  - Verificar Token (autenticacao.js)                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│            ↑                    ↑                    ↑            │
│            │                    │                    │            │
│     ┌──────┴─────┐     ┌────────┴───────┐     ┌───┴─────────┐  │
│     │   Routes   │     │    Routes      │     │   Routes    │  │
│     │            │     │                │     │             │  │
│     │ Auth       │     │  Transactions  │     │   Status    │  │
│     │ - /registro│     │  - GET /...    │     │  - /status  │  │
│     │ - /login   │     │  - POST /...   │     │             │  │
│     │ - /me      │     │  - PUT /...    │     │             │  │
│     │ - /logout  │     │  - DELETE /... │     │             │  │
│     │            │     │  - PATCH /...  │     │             │  │
│     └──────┬─────┘     └────────┬───────┘     └───┬─────────┘  │
│            │                    │                    │            │
│  ┌─────────┴────────────────────┼────────────────────┴────────┐  │
│  │                              │                             │  │
│  │         src/middlewares/autenticacao.js                   │  │
│  │                                                            │  │
│  │  - verificarToken()     → Valida JWT                      │  │
│  │  - gerarToken()         → Cria JWT                        │  │
│  │  - JWT_SECRET           → Chave secreta                  │  │
│  └────────────────────────────┬─────────────────────────────┘  │
│                               │                                  │
│                               ↓                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         banco/sistema_extratos.db (SQLite)              │   │
│  │                                                          │   │
│  │  Tabela: usuarios                                       │   │
│  │  ├── id (PK)                                            │   │
│  │  ├── email (UNIQUE)                                     │   │
│  │  ├── nome                                               │   │
│  │  ├── senha_hash                                         │   │
│  │  ├── criado_em                                          │   │
│  │  └── ultimo_login                                       │   │
│  │                                                          │   │
│  │  Tabela: transacoes                                     │   │
│  │  ├── id (PK)                                            │   │
│  │  ├── usuario_id (FK → usuarios)                        │   │
│  │  ├── DATA                                               │   │
│  │  ├── DESCRIÇÃO                                          │   │
│  │  ├── VALOR                                              │   │
│  │  ├── CATEGORIA                                          │   │
│  │  ├── pago                                               │   │
│  │  ├── criado_em                                          │   │
│  │  └── atualizado_em                                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo de Autenticação

```
USER ACESS
     │
     ↓
┌─────────────────────────────────┐
│ Verifica localStorage            │
│ tem token?                       │
└─────────────────────────────────┘
     │
     ├─── SIM ─→ ┌─────────────────────┐
     │           │ Envia: GET /api/auth/me
     │           │ header: Authorization: Bearer {token}
     │           └────────────┬────────┘
     │                        │
     │                        ↓
     │                ┌──────────────────┐
     │                │ Servidor valida  │
     │                │ token JWT        │
     │                └─────┬────────┬───┘
     │                      │        │
     │                  Válido    Invalid
     │                      │        │
     │                      ↓        ↓
     │              ┌───────────┐ ┌─────────────┐
     │              │ Carrega   │ │ Limpa token │
     │              │ App       │ │ Mostra login│
     │              └───────────┘ └─────────────┘
     │
     └─── NÃO ──→ ┌──────────────────┐
                  │ Mostra Tela      │
                  │ de Login         │
                  └────────┬─────────┘
                           │
                    ┌──────┴──────┐
                    │             │
                    ↓             ↓
           ┌────────────────┐ ┌────────────────┐
           │ Botão: Registrar│ │ Botão: Login  │
           └────────┬───────┘ └────────┬───────┘
                    │                  │
                    ↓                  ↓
           ┌────────────────────┐ ┌──────────────────┐
           │ POST /auth/registro│ │ POST /auth/login │
           │ {email, nome, pwd} │ │ {email, senha}   │
           └────────┬───────────┘ └────────┬─────────┘
                    │                      │
                    └──────────┬───────────┘
                               ↓
                    ┌─────────────────────┐
                    │ Servidor valida e   │
                    │ retorna token JWT   │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │ localStorage.setItem│
                    │ (token, usuario)    │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │ Recarrega página    │
                    │ volta ao inicio     │
                    └─────────────────────┘
```

---

## 🔐 Fluxo de Requisição com Autenticação

```
┌─────────────────────────────────────┐
│ Usuário clica em "Nova Transação"  │
└────────────┬────────────────────────┘
             │
             ↓
┌─────────────────────────────────────┐
│ Script recolhe dados do formulário   │
└────────────┬────────────────────────┘
             │
             ↓
┌─────────────────────────────────────┐
│ Chama: apiPost('/transactions', {...│
└────────────┬────────────────────────┘
             │
             ↓
┌──────────────────────────────────────────────────┐
│ Função apiPost interceptada:                     │
│ - Pega token de localStorage                    │
│ - Adiciona header: Authorization: Bearer {token}│
│ - Envia requisição POST                         │
└────────────┬─────────────────────────────────────┘
             │
             │ HTTP POST
             │ /api/transactions
             │ Headers: Authorization: Bearer <token>
             │ Body: {...}
             ↓
┌────────────────────────────────────┐
│ Middleware: verificarToken()       │
│                                    │
│ - Pega token do header             │
│ - Verifica JWT_SECRET              │
│ - Decodifica token                 │
└───────────┬────────────┬───────────┘
            │            │
        Válido        Inválido
            │            │
            ↓            ↓
    ┌──────────────┐ ┌──────────────────┐
    │ Continua     │ │ Retorna: 401     │
    │ Requisição   │ │ "Não autenticado"│
    └──────┬───────┘ └──────────────────┘
           │
           ↓
    ┌──────────────┐
    │ req.usuario  │
    │ agora tem os │
    │ dados do JWT │
    └──────┬───────┘
           │
           ↓
    ┌──────────────────────────────┐
    │ app.post('/transactions', ...)│
    │ Processa a requisição        │
    └──────┬───────────────────────┘
           │
           ↓
    ┌──────────────────────────────┐
    │ Insere no banco com:         │
    │ usuario_id = req.usuario.id  │
    └──────┬───────────────────────┘
           │
           ↓
    ┌──────────────────────────────┐
    │ Retorna: 200 OK + transação  │
    └──────────────────────────────┘
```

---

## 🗂️ Estrutura de Arquivos

```
Sistema_extratos/
├── publico/
│   ├── index.html          ← Interface principal
│   ├── style.css           ← Estilos (incluindo login)
│   ├── script.js           ← Lógica da aplicação
│   └── auth.js             ← Sistema de autenticação
│
├── src/
│   ├── servidor.js         ← API Express (modificado)
│   ├── middlewares/
│   │   └── autenticacao.js ← Middleware JWT (novo)
│   ├── controladores/      ← (vazio, para futuro)
│   └── rotas/              ← (vazio, para futuro)
│
├── banco/
│   ├── migracoes/
│   └── sistema_extratos.db ← Banco SQLite (modificado)
│
├── testes/
│   └── teste-autenticacao.sh ← Script de testes (novo)
│
├── package.json            ← Dependências (modificado)
├── AUTENTICACAO.md         ← Documentação completa (novo)
├── SUMARIO_AUTENTICACAO.md ← Resumo técnico (novo)
├── GUIA_RAPIDO.md          ← Guia de uso (novo)
└── TESTES_MANUAIS.md       ← Instruções de testes (novo)
```

---

## 🔑 Tipos de Requisições

### 1. Login (Público - sem autenticação)

```
POST /api/auth/login
Content-Type: application/json

{
    "email": "usuario@email.com",
    "senha": "senha123"
}

Resposta:
{
    "message": "Login realizado com sucesso",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
        "id": "user_123",
        "email": "usuario@email.com",
        "nome": "João Silva"
    }
}
```

### 2. Criar Transação (Privado - requer autenticação)

```
POST /api/transactions
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
    "id": "trans_123",
    "DATA": "2026-03-20",
    "DESCRIÇÃO": "Salário",
    "VALOR": 3000.00,
    "CATEGORIA": "trabalho"
}

Resposta:
{
    "transaction": {
        "id": "trans_123",
        "DATA": "2026-03-20",
        "DESCRIÇÃO": "Salário",
        "VALOR": 3000.00,
        "CATEGORIA": "trabalho",
        "usuario_id": "user_123"
    }
}
```

### 3. Sem Autenticação (Falha)

```
POST /api/transactions
Content-Type: application/json
(SEM TOKEN)

Resposta: 401
{
    "error": "Não autenticado",
    "details": "Token não fornecido"
}
```

---

## 🔄 Token JWT Decodificado

Exemplo de payload JWT decodificado:

```json
{
  "id": "user_abc123def456",
  "email": "joao@teste.com",
  "nome": "João Silva",
  "timestamp": 1711000000000,
  "iat": 1711000000,
  "exp": 1711086400
}
```

- `iat` = Emitido em (em segundos)
- `exp` = Expira em (24h depois)

---

## 🔒 Onde o Token é Armazenado

```javascript
// CLIENTE
localStorage.setItem('authToken', token)

// A cada requisição:
Authorization: Bearer {token}

// Quando expira:
localStorage.removeItem('authToken')
→ Redireciona para login
```

---

## 🚀 Performance e Escalabilidade

```
Usuários Simultâneos: ~1000
- Timeout de conexão: 30s
- Taxa de erro aceitável: < 1%
- Latência média desejada: < 500ms

Banco de Dados:
- Índices em: email, usuario_id, DATA
- Backup: Recomenda-se daily
- Limite de conexões: 5 (configurável)

Segurança:
- HTTPS recomendado em produção
- Rate limiting deve ser implementado
- Logs de auditoria recomendados
```

---

**Arquitetura documentada: 20 de Março de 2026**
