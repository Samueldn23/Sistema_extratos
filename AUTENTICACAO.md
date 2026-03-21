# 🔐 Sistema de Autenticação - Extratos Bancários

## 📋 Resumo das Mudanças

Você agora tem um **sistema completo de autenticação** no seu aplicativo de extratos!

### ✨ O que foi implementado:

1. **Tabela de Usuários** no banco de dados SQLite
2. **Sistema de Registro** - Novos usuários podem se registrar
3. **Sistema de Login** - Usuários autenticados com tokens JWT (24 horas)
4. **Proteção de Dados** - Apenas usuários logados podem:
   - Criar transações ✅
   - Editar transações ✅
   - Deletar transações ✅
   - Marcar como pago ✅
   - Importar/exportar dados ✅

5. **Visualização Pública** - Qualquer um pode ver as transações (pode ser alterado)
6. **Botão de Logout** - Interface intuitiva com nome do usuário

---

## 🚀 Como Usar

### 1️⃣ Iniciar o Servidor

```bash
npm start
# ou
node src/servidor.js
```

O servidor iniciará em `http://localhost:3000`

### 2️⃣ Acessar a Aplicação

Abra `http://localhost:3000` no seu navegador.

### 3️⃣ Criar uma Conta

- Clique na aba **"Registrar"**
- Preencha: Nome, Email e Senha (mínimo 6 caracteres)
- Clique em **"Criar Conta"**
- Você será automaticamente autenticado

### 4️⃣ Fazer Login

- Clique na aba **"Login"**
- Digite seu Email e Senha
- Clique em **"Entrar"**

### 5️⃣ Usar a Aplicação

- Agora você pode criar, editar e deletar suas transações
- Seu nome aparecerá no canto superior direito
- Clique em qualquer lugar para ver mais opções de logout

---

## 🧪 Dados de Teste

Após criar sua primeira conta, você pode usar:

- **Email**: teste@exemplo.com
- **Senha**: senha123

---

## 🔑 Features de Autenticação

### Registro

```
POST /api/auth/registro
{
  "email": "usuario@email.com",
  "nome": "Seu Nome",
  "senha": "senha123"
}
```

### Login

```
POST /api/auth/login
{
  "email": "usuario@email.com",
  "senha": "senha123"
}
```

### Verificar Status (com token)

```
GET /api/auth/me
Headers: Authorization: Bearer {token}
```

### Logout

```
POST /api/auth/logout
Headers: Authorization: Bearer {token}
```

---

## 🛡️ Segurança

- ✅ Senhas são **hasheadas com bcryptjs**
- ✅ Tokens JWT com **expiração de 24 horas**
- ✅ Cada usuário vê apenas **suas próprias transações**
- ✅ Operações de escrita requerem **autenticação válida**
- ✅ Tokens armazenados no **localStorage** (pode ser melhorado para httpOnly cookies)

---

## 📊 Estrutura de Dados

### Tabela: `usuarios`

```sql
CREATE TABLE usuarios (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    senha_hash TEXT NOT NULL,
    criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
    ultimo_login TEXT
)
```

### Tabela: `transacoes` (atualizada)

```sql
CREATE TABLE transacoes (
    id TEXT PRIMARY KEY,
    DATA TEXT NOT NULL,
    DESCRIÇÃO TEXT NOT NULL,
    VALOR REAL NOT NULL,
    CATEGORIA TEXT NOT NULL,
    pago INTEGER DEFAULT 0,
    usuario_id TEXT NOT NULL,  -- ← Novo: vinculado ao usuário
    criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
)
```

---

## 🔄 Fluxo de Autenticação

```
1. Usuário acessa http://localhost:3000
   ↓
2. localStorage verificado
   ├── Token válido? → Carrega app normalmente
   └── Token inválido? → Mostra tela de login

3. Usuário faz Login/Registro
   ↓
4. Servidor valida e retorna token JWT
   ↓
5. Token armazenado em localStorage
   ↓
6. Token enviado em todas as requisições de escrita
   ↓
7. Servidor valida token e verifica permissões
```

---

## 🚨 Possíveis Melhorias Futuras

- [ ] Recuperação de senha por email
- [ ] Autenticação de dois fatores (2FA)
- [ ] Compartilhamento de transações entre usuários
- [ ] Controle de papéis (Admin, User)
- [ ] Webhooks para sincronização
- [ ] Tokens refresh automáticos
- [ ] Auditoria completa de ações
- [ ] Backup automático por usuário

---

## ⚠️ Notas Importantes

1. **JWT Secret**: No arquivo `src/middlewares/autenticacao.js`, há uma chave padrão. **Mude em produção!**

   ```javascript
   const JWT_SECRET =
     process.env.JWT_SECRET || "seu_segredo_super_secreto_2026";
   ```

2. **Banco de Dados**: Cada usuário vê apenas suas transações. Transações antigas sem `usuario_id` serão inacessíveis após a atualização.

3. **CORS**: Está configurado para aceitar qualquer origem. Restrinja em produção.

---

## 🐛 Troubleshooting

### "Token não oferecido"

- Verifique se você está logado
- Limpe o localStorage: `localStorage.clear()`
- Faça login novamente

### "Email já registrado"

- Use um email diferente ou faça login
- Se esqueceu a senha, crie uma nova conta

### Transações antigas não aparecem

- Após a migração, transações antigas sem `usuario_id` não aparecem
- Importe seus dados pelo sistema de importação

---

## 📞 Suporte

Se tiver dúvidas ou encontrar bugs, verifique:

1. Console do navegador (F12) para erros de frontend
2. Terminal do servidor para erros de backend
3. Arquivos de log `banco/sistema_extratos.db` para problemas de BD

---

**Desenvolvido em: 20 de Março de 2026**
