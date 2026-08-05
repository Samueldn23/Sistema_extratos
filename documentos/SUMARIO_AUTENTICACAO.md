# Sumario Tecnico da Autenticacao

## Componentes atuais

1. [api/auth.js](../api/auth.js)
   Registro, login, verificacao de sessao e logout.

2. [api/index.js](../api/index.js)
   Rotas de transacoes, status e entrega dos arquivos estaticos da pasta [public](../public).

3. [api/dev-local.js](../api/dev-local.js)
   Launcher local para desenvolvimento, com leitura de [.env](../.env).

4. [public/auth.js](../public/auth.js)
   Fluxo de autenticacao do frontend.

5. [public/script.js](../public/script.js)
   Consumo da API e envio do token nas operacoes protegidas.

## Fluxo resumido

1. O navegador carrega [public/index.html](../public/index.html).
2. O frontend faz login ou registro em `/api/auth`.
3. O backend gera um JWT com `jsonwebtoken`.
4. O token e salvo no navegador e enviado nas rotas protegidas.
5. O Supabase persiste usuarios e transacoes.

## Dependencias principais

1. `@supabase/supabase-js`
2. `express`
3. `cors`
4. `body-parser`
5. `bcryptjs`
6. `jsonwebtoken`

## Regras atuais

1. O deploy da Vercel continua baseado em [vercel.json](../vercel.json).
2. O fluxo local nao depende mais de SQLite nem da antiga pasta `src`.
3. `npm start` e `npm run dev` usam o mesmo launcher local.

## Pontos de atencao

1. O token ainda fica em localStorage.
2. O backend atual usa `SUPABASE_ANON_KEY`; qualquer ampliacao de privilegio deve ser tratada com cuidado.
3. A politica de acesso as tabelas do Supabase precisa continuar coerente com o modelo do app.
