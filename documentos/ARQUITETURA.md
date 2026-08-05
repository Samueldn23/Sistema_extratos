# Arquitetura Atual

## Diagrama resumido

```text
Navegador
  |
  |-- public/index.html
  |-- public/script.js
  |-- public/auth.js
  |-- public/style.css
  |
  v
Express local ou Vercel serverless
  |
  |-- api/dev-local.js     -> launcher de desenvolvimento
  |-- api/index.js         -> rotas de transacoes + status + arquivos estaticos
  |-- api/auth.js          -> login, registro, sessao e logout
  |
  v
Supabase
  |
  |-- usuarios
  |-- transacoes
```

## Execucao

### Local

1. `npm start` executa [api/dev-local.js](../api/dev-local.js).
2. O launcher carrega [.env](../.env).
3. A aplicacao sobe em 3000 ou 3001.

### Deploy

1. A Vercel usa [vercel.json](../vercel.json).
2. O backend principal e [api/index.js](../api/index.js).
3. Os arquivos estaticos vem da pasta [public](../public).

## Autenticacao

1. O frontend chama `/api/auth/login` e `/api/auth/registro`.
2. O backend gera JWT com `jsonwebtoken`.
3. O token e enviado nas rotas protegidas.

## Observacao

O runtime antigo baseado em `src` e SQLite foi removido do projeto ativo.
