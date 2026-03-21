# 📚 Índice de Documentação - Sistema de Autenticação

## 🎯 Comece Aqui

Se você é novo, leia nesta ordem:

1. **[GUIA_RAPIDO.md](GUIA_RAPIDO.md)** ⭐ START HERE
   - Guia em 3 passos para começar
   - Modo de uso rápido
   - Tipo: Tutorial rápido (5 minutos)

2. **[TESTES_MANUAIS.md](TESTES_MANUAIS.md)** 🧪
   - Como testar cada funcionalidade
   - Passo a passo detalhado
   - Tipo: Guia de testes (30 minutos)

3. **[AUTENTICACAO.md](AUTENTICACAO.md)** 📖
   - Documentação completa
   - Explicação de todas as features
   - Tipo: Referência (1 hora)

---

## 📖 Documentação Detalhada

### Para Desenvolvedores

- **[SUMARIO_AUTENTICACAO.md](SUMARIO_AUTENTICACAO.md)** 🏗️
  - Resumo técnico das mudanças
  - Estrutura do banco de dados
  - Endpoints de API
  - Tipo: Referência técnica (30 minutos)

- **[ARQUITETURA.md](ARQUITETURA.md)** 📐
  - Diagramas ASCII da arquitetura
  - Fluxos de autenticação
  - Estrutura de arquivos
  - Tipo: Documentação de arquitetura (45 minutos)

### Para Administradores

- **[CHECKLIST.md](CHECKLIST.md)** ✅
  - O que foi implementado
  - O que falta fazer
  - Roadmap futuro
  - Tipo: Planejamento (15 minutos)

---

## 🚀 Guias Rápidos por Tema

### 🔐 Autenticação

- Como registrar → [GUIA_RAPIDO.md](GUIA_RAPIDO.md#-fazer-login)
- Como fazer login → [GUIA_RAPIDO.md](GUIA_RAPIDO.md#-já-tem-conta-faça-login)
- Como fazer logout → [GUIA_RAPIDO.md](GUIA_RAPIDO.md#-para-sair-logout)
- API de autenticação → [AUTENTICACAO.md](AUTENTICACAO.md#-features-de-autenticação)

### 🛡️ Segurança

- Como funciona → [SUMARIO_AUTENTICACAO.md](SUMARIO_AUTENTICACAO.md#-segurança-implementada)
- Boas práticas → [AUTENTICACAO.md](AUTENTICACAO.md#-notas-importantes)
- Estrutura de senhas → [SUMARIO_AUTENTICACAO.md](SUMARIO_AUTENTICACAO.md#-mudanças-no-banco-de-dados)

### 📊 Banco de Dados

- Estrutura → [SUMARIO_AUTENTICACAO.md](SUMARIO_AUTENTICACAO.md#-mudanças-no-banco-de-dados)
- Schema → [ARQUITETURA.md](ARQUITETURA.md#-estrutura-de-arquivos)
- Migrations → [AUTENTICACAO.md](AUTENTICACAO.md#-estrutura-de-dados)

### 🔌 API

- Endpoints → [SUMARIO_AUTENTICACAO.md](SUMARIO_AUTENTICACAO.md#-endpoints-disponíveis)
- Exemplos → [AUTENTICACAO.md](AUTENTICACAO.md#-como-usar)
- Curl examples → [TESTES_MANUAIS.md](TESTES_MANUAIS.md#-teste-b-tentar-criar-transação-sem-token-avançado)

### 🎯 Testes

- Guia completo → [TESTES_MANUAIS.md](TESTES_MANUAIS.md)
- Script automático → [testes/teste-autenticacao.sh](testes/teste-autenticacao.sh)
- Problemas comuns → [GUIA_RAPIDO.md](GUIA_RAPIDO.md#-problemas)

### 🏗️ Arquitetura

- Diagrama geral → [ARQUITETURA.md](ARQUITETURA.md#-diagrama-da-arquitetura)
- Fluxos → [ARQUITETURA.md](ARQUITETURA.md#-fluxo-de-autenticação)
- Estrutura → [ARQUITETURA.md](ARQUITETURA.md#-fluxo-de-requisição-com-autenticação)

---

## 🔍 Buscar por Pergunta

### "Como faço para...?"

- **...registrar uma conta?**
  → [GUIA_RAPIDO.md - Primeira Vez](GUIA_RAPIDO.md#-primeira-vez-registre-se)

- **...fazer login?**
  → [GUIA_RAPIDO.md - Login](GUIA_RAPIDO.md#-já-tem-conta-faça-login)

- **...fazer logout?**
  → [GUIA_RAPIDO.md - Logout](GUIA_RAPIDO.md#-para-sair-logout)

- **...iniciar o servidor?**
  → [GUIA_RAPIDO.md - Iniciar](GUIA_RAPIDO.md#-passo-1-instalar-dependências)

- **...usar a API via curl?**
  → [TESTES_MANUAIS.md - Curl](TESTES_MANUAIS.md#-teste-b-tentar-criar-transação-sem-token-avançado)

- **...testar o sistema?**
  → [TESTES_MANUAIS.md](TESTES_MANUAIS.md)

- **...entender a segurança?**
  → [SUMARIO_AUTENTICACAO.md - Segurança](SUMARIO_AUTENTICACAO.md#-segurança-implementada)

- **...adicionar uma nova feature?**
  → [CHECKLIST.md - Futuro](CHECKLIST.md#-não-implementado-futuro)

- **...corrigir um erro?**
  → [GUIA_RAPIDO.md - Troubleshooting](GUIA_RAPIDO.md#-problemas)

- **...entender a arquitetura?**
  → [ARQUITETURA.md](ARQUITETURA.md)

- **...saber o que foi feito?**
  → [SUMARIO_AUTENTICACAO.md](SUMARIO_AUTENTICACAO.md)

---

## 📁 Localização de Arquivos

### Código

- **Backend**
  - `src/servidor.js` - API principal (modificado)
  - `src/middlewares/autenticacao.js` - Autenticação (novo)
  - `package.json` - Dependências (modificado)

- **Frontend**
  - `publico/index.html` - Interface (modificado)
  - `publico/script.js` - Lógica principal (modificado)
  - `publico/auth.js` - Autenticação (novo)
  - `publico/style.css` - Estilos (modificado)

- **Banco de Dados**
  - `banco/sistema_extratos.db` - SQLite (modificado)

### Documentação

- `GUIA_RAPIDO.md` - Comece aqui! ⭐
- `AUTENTICACAO.md` - Documentação completa
- `SUMARIO_AUTENTICACAO.md` - Resumo técnico
- `ARQUITETURA.md` - Diagramas e estrutura
- `TESTES_MANUAIS.md` - Guia de testes
- `CHECKLIST.md` - O que foi feito
- `INDICE.md` - Este arquivo

### Testes

- `testes/teste-autenticacao.sh` - Script de testes

---

## ⏱️ Tempo de Leitura por Documento

| Documento               | Tempo  | Foco                  |
| ----------------------- | ------ | --------------------- |
| GUIA_RAPIDO.md          | 5 min  | Usuário final         |
| TESTES_MANUAIS.md       | 30 min | QA/Tester             |
| AUTENTICACAO.md         | 1 hora | Desenvolvedor         |
| SUMARIO_AUTENTICACAO.md | 30 min | Desenvolvedor técnico |
| ARQUITETURA.md          | 45 min | Arquiteto             |
| CHECKLIST.md            | 15 min | PM/Lider              |

---

## 🎓 Mapa de Aprendizado

```
Iniciante
    ↓
┌─────────────────────┐
│ 1. GUIA_RAPIDO.md   │ ← Comece aqui
└──────────┬──────────┘
           ↓
     Experimento prático
           ↓
┌─────────────────────┐
│ 2. TESTES_MANUAIS   │ ← Teste as funcionalidades
└──────────┬──────────┘
           ↓
     Entender melhor
           ↓
┌─────────────────────┐
│ 3. AUTENTICACAO.md  │ ← Leia a documentação
└──────────┬──────────┘
           ↓
     Aprofundar
           ↓
┌──────────────────────┐
│ 4. SUMARIO_AUTH.md   │ ← Resumo técnico
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ 5. ARQUITETURA.md    │ ← Entender design
└──────────┬───────────┘
           ↓
Avançado - Pronto para Modificar
```

---

## 🔗 Links Rápidos

- **Iniciar Servidor**: `npm start`
- **Acessar App**: http://localhost:3000
- **Testar API**: `bash testes/teste-autenticacao.sh`
- **Ver Banco**: `sqlite3 banco/sistema_extratos.db`

---

## 📞 Suporte

### Se você tem dúvida sobre...

- **Como usar**: Leia [GUIA_RAPIDO.md](GUIA_RAPIDO.md)
- **Erros/Problemas**: Veja [GUIA_RAPIDO.md#-problemas](GUIA_RAPIDO.md#-problemas)
- **Como funciona**: Leia [AUTENTICACAO.md](AUTENTICACAO.md)
- **Arquitetura**: Veja [ARQUITETURA.md](ARQUITETURA.md)
- **O que fazer agora**: Confira [CHECKLIST.md](CHECKLIST.md)
- **Como testar**: Use [TESTES_MANUAIS.md](TESTES_MANUAIS.md)

---

## ✨ Destaque

### Arquivos Essenciais (por prioridade)

1. ⭐⭐⭐ **GUIA_RAPIDO.md** - TODO MUNDO LEIA
2. ⭐⭐ **AUTENTICACAO.md** - Essencial para desenvolvimento
3. ⭐ **TESTES_MANUAIS.md** - Para garantir qualidade
4. **SUMARIO_AUTENTICACAO.md** - Para aprofundamento
5. **ARQUITETURA.md** - Para decisões de design

---

## 🎯 Próximos Passos

1. Leia [GUIA_RAPIDO.md](GUIA_RAPIDO.md)
2. Instale: `npm install`
3. Inicie: `npm start`
4. Acesse: http://localhost:3000
5. Teste: Registre e faça login
6. Leia [TESTES_MANUAIS.md](TESTES_MANUAIS.md) para testes completos

---

**Última atualização: 20 de Março de 2026**

**Desenvolvido com ❤️ para você**
