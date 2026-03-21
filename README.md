# 💰 Sistema de Extratos - Documentação Completa

## 📋 Visão Geral

Sistema web de gestão de extratos bancários com interface responsiva, construído com Node.js/Express no backend e JavaScript vanilla no frontend, usando SQLite3 como banco de dados.

**Versão:** 2.0.0
**Banco de Dados:** SQLite 3 (local)
**Status:** ✅ Em Operação

---

## 🎯 Funcionalidades Principais

### ✅ Gerenciamento de Transações

- ➕ **Adicionar** novas transações (receitas e despesas)
- ✏️ **Editar** transações existentes
- 🗑️ **Remover** transações
- 📊 **Visualizar** transações em tabela interativa

### 💳 Gestão de Pagamentos

- ✓ Marcar despesas como "Pago" ou "Pendente"
- 📅 Visualizar despesas vencidas (períodos anteriores)
- 🎨 Diferenciação visual por status

### 📁 Importação/Exportação

- 📥 Importar dados de arquivo JSON
- 📤 Exportar transações como JSON
- 📊 Suporte a importação em lote com validação

### 🔍 Busca e Filtros

- 🔎 Pesquisar por data, descrição ou valor
- 📅 Navegação por mês/ano
- 📈 Visualização de despesas não pagas de períodos anteriores

### 💹 Resumo Financeiro

- 📊 Saldo anterior (acumulado de meses anteriores)
- 📈 Total de receitas do período
- 📉 Total de despesas do período
- 💵 Saldo total (anterior + atual)

---

## 🛠️ Stack Tecnológico

### Backend

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **SQLite3** - Banco de dados local
- **CORS** - Suporte a requisições cross-origin

### Frontend

- **HTML5** - Estrutura
- **CSS3** - Estilos responsivos
- **JavaScript Vanilla** - Sem frameworks
- **Fetch API** - Requisições HTTP

---

## 📦 Estrutura do Projeto

```
sistema-extratos/
├── server.js                    # Servidor Express
├── script.js                    # Lógica do frontend
├── index.html                   # Estrutura HTML
├── style.css                    # Estilos CSS
├── dados.json                   # Dados de exemplo
├── package.json                 # Dependências
├── .env                         # Configurações
├── sistema_extratos.db          # Banco SQLite (criado automaticamente)
├── start.bat                    # Script Windows
├── start.ps1                    # Script PowerShell
└── README.md                    # Esta documentação
```

---

## 🚀 Instalação e Execução

### Opção 1: Windows (Automático)

```bash
# CMD
start.bat

# ou PowerShell
.\start.ps1
```

### Opção 2: Manual

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor
npm start
# ou
node server.js
```

### 3. Acessar a Aplicação

Abra no navegador:

```
http://localhost:3000
```

---

## 📚 API REST

### Base URL: `http://localhost:3000/api`

| Método | Endpoint                  | Descrição                  |
| ------ | ------------------------- | -------------------------- |
| GET    | `/transactions`           | Listar todas as transações |
| POST   | `/transactions`           | Criar nova transação       |
| PUT    | `/transactions/:id`       | Atualizar transação        |
| DELETE | `/transactions/:id`       | Deletar transação          |
| PATCH  | `/transactions/:id/pago`  | Toggle status de pagamento |
| POST   | `/import-json`            | Importar em lote           |
| GET    | `/export-json`            | Exportar como JSON         |
| GET    | `/status`                 | Status do servidor         |
| POST   | `/transactions/clear/all` | Limpar banco               |

---

## 📊 Estrutura do Banco de Dados

### Tabela: transacoes

```sql
CREATE TABLE IF NOT EXISTS transacoes (
    id TEXT PRIMARY KEY,
    DATA TEXT NOT NULL,
    DESCRIÇÃO TEXT NOT NULL,
    VALOR REAL NOT NULL,
    CATEGORIA TEXT NOT NULL,
    pago INTEGER DEFAULT 0,
    criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TEXT DEFAULT CURRENT_TIMESTAMP
)
```

**Índices:**

- `idx_data` em DATA (busca rápida por período)
- `idx_pago` em pago (filtro rápido de status)

---

## ✅ Validações

### Backend

- ✅ Data em formato ISO 8601
- ✅ Descrição: 1-255 caracteres obrigatório
- ✅ Valor: número válido obrigatório
- ✅ Categoria: 1-50 caracteres obrigatório
- ✅ ID gerado automaticamente se não fornecido

### Frontend

- ✅ Campos obrigatórios
- ✅ Formato de data válido
- ✅ Valores numéricos
- ✅ Tamanho máximo de arquivo (5MB)

---

## 🎨 Categorias

- 🍕 Alimentação
- 🚗 Transporte
- 🏥 Saúde
- 🎮 Lazer
- 💼 Trabalho
- 🛍️ Compras
- 📌 Outros

---

## 📝 Exemplos de Uso

### Adicionar Transação

```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "id": "trans_001",
    "DATA": "2026-03-15T14:30:00",
    "DESCRIÇÃO": "Supermercado",
    "VALOR": -150.50,
    "CATEGORIA": "alimentacao",
    "pago": false
  }'
```

### Importar JSON

```bash
curl -X POST http://localhost:3000/api/import-json \
  -H "Content-Type: application/json" \
  -d '{
    "transactions": [
      {"id": "t1", "DATA": "2026-03-01T10:00:00", "DESCRIÇÃO": "T1", "VALOR": 100, "CATEGORIA": "outros", "pago": false}
    ]
  }'
```

---

## 🔧 Troubleshooting

### Port 3000 já em uso

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Erro ao conectar servidor

- Verifique se `node server.js` está rodando
- Veja os logs do console
- Reinicie o servidor

### Banco de dados bloqueado

- Feche todas as abas do navegador
- Reinicie o servidor
- Delete `sistema_extratos.db` (irá recriar)

---

## 📞 Suporte

1. Verifique o **Troubleshooting** acima
2. Consulte **logs do servidor** (console)
3. Abra **Console do Navegador** (F12)

---

**v2.0.0 - Março 2026**

3. **Portas utilizadas:**
   - `3000` - Servidor Web e API

## 📁 Estrutura do Projeto

```
Sistema_extratos/
├── index.html              # Interface da aplicação
├── script.js               # Lógica frontend (requisições HTTP)
├── style.css               # Estilos CSS
├── server.js               # Servidor Node.js + API REST
├── dados.json              # Banco de dados (JSON)
├── package.json            # Dependências do Node.js
├── start.bat               # Script de execução (Windows)
├── start.ps1               # Script PowerShell (Windows)
└── README.md               # Este arquivo
```

## 🔌 API REST

O servidor roda em `http://localhost:3000/api/` com os endpoints:

| Método     | Endpoint                  | Descrição                    |
| ---------- | ------------------------- | ---------------------------- |
| **GET**    | `/transactions`           | Retorna todas as transações  |
| **POST**   | `/transactions`           | Cria nova transação          |
| **PUT**    | `/transactions/:id`       | Edita transação              |
| **DELETE** | `/transactions/:id`       | Deleta transação             |
| **PATCH**  | `/transactions/:id/pago`  | Atualiza status de pagamento |
| **POST**   | `/transactions/clear/all` | Limpa todas as transações    |

## 💾 Dados

As transações são armazenadas no arquivo `dados.json` no formato:

```json
[
  {
    "id": "custom_1234567890_abc123",
    "DATA": "2025-08-15",
    "DESCRIÇÃO": "Salário",
    "VALOR": 5000,
    "CATEGORIA": "trabalho",
    "pago": true
  }
]
```

## 🎨 Funcionalidades

✅ Adicionar receitas e despesas
✅ Editar transações
✅ Remover transações
✅ Marcar despesas como pagas
✅ Buscar transações por data/descrição/valor
✅ Navegação por mês
✅ Resumo mensal com saldos
✅ Despesas vencidas (de meses anteriores)
✅ Categorias de transações
✅ Interface responsiva

## 🛠️ Desenvolvimento

Se quiser parar o servidor:

- **Windows:** Pressione `Ctrl+C` no terminal
- **Mac/Linux:** Pressione `Ctrl+C` no terminal

Para ver logs da API:

- Abra o terminal onde o servidor está rodando
- Verifique as mensagens em tempo real

## 📦 Dependências

- **Express.js** - Framework web
- **CORS** - Suporte a cross-origin requests
- **Body-Parser** - Parse de JSON

Todas são instaladas automaticamente com `npm install`.

## ⚠️ Notas Importantes

1. **Localstorage foi removido** - Agora usa servidor local
2. **SQLite foi removido** - Agora usa JSON
3. **Dados persistem** no arquivo `dados.json`
4. **Nenhuma instalação visual** - Rode o `.bat` ou `.ps1`
5. **Conexão é local** - Não conecta à internet

## 🔄 Primeira Execução

Na primeira vez que você roda:

1. O servidor cria o arquivo `dados.json`
2. Você pode adicionar transações manualmente
3. Dados são salvos automaticamente

## 🐛 Troubleshooting

**Erro: "Port 3000 already in use"**

- Outra aplicação está usando a porta 3000
- Feche a aplicação anterior ou mude a porta em `server.js`

**Erro: "Cannot find module express"**

- Rode `npm install` antes de `npm start`

**Página não carrega**

- Verifique se o servidor está rodando (terminal deve estar exibindo logs)
- Tente abrir http://localhost:3000 novamente

## 📝 Licença

Livre para uso pessoal e comercial.

---

**Desenvolvido com ❤️ em JavaScript**
