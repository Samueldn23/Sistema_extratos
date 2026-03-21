# ⚡ Guia Rápido - Sistema de Autenticação

## 🚀 Iniciar em 3 passos

### Passo 1: Instalar dependências

```bash
npm install
```

### Passo 2: Iniciar o servidor

```bash
npm start
# Ou: node src/servidor.js
```

### Passo 3: Acessar a aplicação

Abra seu navegador em: **http://localhost:3000**

---

## 👤 Primeira Vez? Registre-se!

1. Clique na aba **"Registrar"**
2. Preencha:
   - **Nome**: Seu nome completo
   - **Email**: seu@email.com
   - **Senha**: Mínimo 6 caracteres
3. Clique em **"Criar Conta"**
4. Pronto! Você está logado 🎉

---

## 🔑 Já tem conta? Faça Login

1. Clique na aba **"Login"** (já é a padrão)
2. Preencha:
   - **Email**: seu@email.com
   - **Senha**: Sua senha
3. Clique em **"Entrar"**
4. Prontinho! 🎊

---

## 📝 Agora você pode:

✅ **Criar transações** - Clique em "➕ Nova"
✅ **Editar transações** - Clique no ✏️ da transação
✅ **Deletar transações** - Clique na 🗑️
✅ **Marcar como pago** - Clique no valor
✅ **Importar dados** - Clique em "📂 Dados" → "⬆️ Importar JSON"
✅ **Exportar dados** - Clique em "📂 Dados" → "💾 Exportar DB"

---

## 🚪 Para Sair (Logout)

Clique no seu **nome no canto superior direito** com o ícone 👤

- Confirme que deseja sair
- Você será redirecionado para a tela de login

---

## 🔒 Segurança

Lembre-se:

- ✅ Use uma **senha forte** (mínimo 6 caracteres)
- ✅ **Não compartilhe** sua senha
- ✅ **Logout** ao usar em computadores públicos
- ⚠️ Seus dados são **únicos para você** - ninguém mais vê

---

## 🆘 Esqueceu a Senha?

Sinta-se à vontade para **criar uma nova conta** com um email diferente.
Suas transações antigas ficarão lá (vinculadas ao email anterior).

---

## 💡 Dicas

- Seus dados são salvos **automaticamente** no servidor
- Você pode usar a app de **qualquer dispositivo/navegador** com seu email
- Abra **console** (F12) para ver logs detalhados
- Limpe o **localStorage** se tiver problemas: `localStorage.clear()`

---

## 🐛 Problemas?

### Erro: "Não autenticado"

→ Faça login novamente

### Erro: "Email já registrado"

→ Use outro email ou faça login

### Transações antigas não aparecem

→ Importe-as usando o sistema de importação

### Porta 3000 em uso?

→ Altere em `src/servidor.js` linha 10:

```javascript
const PORT = 3000; // Troque de porta
```

---

## 📞 Mais Informações

Leia os arquivos:

- 📖 `AUTENTICACAO.md` - Documentação completa
- 📊 `SUMARIO_AUTENTICACAO.md` - Resumo técnico
- 🧪 `testes/teste-autenticacao.sh` - Testes automatizados

---

**Bom uso! 🚀**
