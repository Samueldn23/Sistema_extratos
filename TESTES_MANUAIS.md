# 🧪 Como Testar o Sistema de Autenticação

## 📋 Pré-requisitos

- Node.js instalado
- npm instalado
- Porta 3000 disponível (ou altere conforme necessário)

---

## 🚀 Teste Completo Passo a Passo

### 1️⃣ Instalar Dependências

```bash
cd c:\Users\Samuel Neves\.openclaw\workspace\Sistema_extratos
npm install
```

**✓ Esperado**: Pacotes bcryptjs e jsonwebtoken instalados

---

### 2️⃣ Iniciar o Servidor

```bash
npm start
```

**✓ Esperado**: Saída similar a:

```
╔════════════════════════════════════════╗
║   EXTRATO BANCÁRIO - SISTEMA LOCAL    ║
║        Rodando com SQLite 3           ║
║          Versão 2.0.0                 ║
╚════════════════════════════════════════╝

✓ Servidor rodando em: http://localhost:3000
✓ Banco de dados: banco/sistema_extratos.db
✓ Endpoints disponíveis: ...
```

---

### 3️⃣ Acessar a Aplicação

Abra seu navegador em: `http://localhost:3000`

**✓ Esperado**:

- Tela de login/registro aparece (não tem token)
- Dois abas: "Login" e "Registrar"
- Campos de entrada funcionam

---

### 4️⃣ Testar Registro

📝 **Preencher formulário de registro:**

- Nome: `João Silva`
- Email: `joao@teste.com`
- Senha: `senha123456`
- Confirmar: `senha123456`

🔘 **Clicar: "Criar Conta"**

**✓ Esperado**:

- Mensagem de sucesso
- Página recarrega
- App carrega normalmente (AGORA ELA VÊ A APLICAÇÃO)

---

### 5️⃣ Testar Criar Transação

🆕 **Após estar logado:**

1. Clique em **"➕ Nova"** ou **"Nova Transação"**
2. Preencha:
   - Data: `2026-03-20`
   - Descrição: `Teste de Autenticação`
   - Valor: `150.00`
   - Categoria: `Teste`
3. Clique em **"Salvar"**

**✓ Esperado**:

- Transação aparece na lista
- Sem erros de autenticação
- Transação salva no banco

---

### 6️⃣ Testar Edição

✏️ **Clique no ✏️ de uma transação:**

1. Altere a descrição para: `Teste Editado`
2. Clique em **"Salvar Alterações"**

**✓ Esperado**:

- Transação atualizada inmediatamente
- Descrição reflete a mudança

---

### 7️⃣ Testar Logout

👤 **Clique no seu nome no canto superior direito**

**✓ Esperado**:

- Diálogo de confirmação aparece
- Você é logado
- Página volta para tela de login

---

### 8️⃣ Testar Login com Conta Existente

🔑 **Na tela de login:**

1. Email: `joao@teste.com`
2. Senha: `senha123456`
3. Clique em **"Entrar"**

**✓ Esperado**:

- Login bem-sucedido
- Suas transações anteriores aparecem
- Você está autenticado

---

### 9️⃣ Testar Proteção (parte importante!)

🔒 **Todos esses testes verificam que SEM LOGIN não funciona:**

#### Teste A: Abrir console (F12) e limpar localStorage

```javascript
localStorage.clear();
```

Depois recarregue a página (F5)

**✓ Esperado**:

- Volta para tela de login
- Não consegue acessar a app

#### Teste B: Tentar criar transação sem token (avançado)

```javascript
// No console (F12):
fetch("http://localhost:3000/api/transactions", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    id: "teste",
    DATA: "2026-03-20",
    DESCRIÇÃO: "Sem Token",
    VALOR: 100,
    CATEGORIA: "Teste",
  }),
})
  .then((r) => r.json())
  .then(console.log);
```

**✓ Esperado**:

- Resposta: `{"error":"Não autenticado"}`
- NÃO deve criar a transação

---

### 🔟 Testar com Outro Usuário

👥 **Registre uma segunda conta:**

1. Logout (clique no nome)
2. Crie outra conta: `maria@teste.com` / `senha456789`
3. Crie uma transação como Maria

**✓ Esperado**:

- Apenas as transações de Maria aparecem
- As transações de João NÃO aparecem
- Dados isolados por usuário

---

### 1️⃣1️⃣ Testar Importação de Dados

📂 **Teste proteção de importação:**

1. Logout
2. Limpe localStorage: `localStorage.clear()`
3. Tente acessar: `http://localhost:3000/api/import-json`

**✓ Esperado**:

- Erro ou recusa de acesso
- Necessário token de autenticação

---

### 1️⃣2️⃣ Verificar Banco de Dados

💾 **Abra o banco SQLite:**

```bash
# Windows - usando sqlite3 CLI (se instalado)
cd banco
sqlite3 sistema_extratos.db

# Dentro do sqlite3:
> SELECT * FROM usuarios;
> SELECT * FROM transacoes;
```

**✓ Esperado**:

- Tabela `usuarios` com seus usuários
- Tabela `transacoes` com campo `usuario_id` preenchido
- Senhas hasheadas (não em texto plano)

---

## 📊 Checklist de Testes

- [ ] Servidor inicia sem erros
- [ ] Registro funciona
- [ ] Login funciona
- [ ] Criar transação funciona (logado)
- [ ] Editar transação funciona
- [ ] Logout funciona
- [ ] Sem token não consegue criar transação
- [ ] Dados isolados por usuário
- [ ] Banco de dados tem estrutura correta
- [ ] LocalStorage armazena token
- [ ] Sessão expira após 24h (ou pode testar reduzindo tempo)

---

## 🐛 Troubleshooting

### Erro: "address already in use :::3000"

```bash
# Mude a porta no src/servidor.js:
const PORT = 3001; // ao invés de 3000
```

### Erro: "Cannot find module 'bcryptjs'"

```bash
npm install bcryptjs jsonwebtoken
```

### Erro no console do navegador: "API_URL is not defined"

- Certifique-se de que `script.js` está carregando antes
- Verifique ordem de scripts no `index.html`

### Token expirado mesmo com 24h

- Cheque a data/hora do sistema
- Recarregue a página
- Limpe localStorage e faça login novamente

---

## 🎯 Resultados Esperados Finais

✅ Sistema totalmente funcional com:

1. ✓ Autenticação segura de usuários
2. ✓ Isolamento de dados por usuário
3. ✓ Proteção de operações de escrita
4. ✓ Interface amigável
5. ✓ Tokens JWT com expiração
6. ✓ Senhas seguras (hasheadas)
7. ✓ Banco de dados normalizado

---

## 🚀 Próximos Testes Avançados

- [ ] Teste de carga (muitos usuários)
- [ ] Teste de segurança (injeção SQL, XSS)
- [ ] Teste com navegadores diferentes
- [ ] Teste em dispositivos móveis
- [ ] Teste de sincronização entre abas/janelas
- [ ] Teste de offline/online (PWA)

---

**Bom teste! 🧪✨**
