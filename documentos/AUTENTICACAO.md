# Autenticação

## Visão geral

O projeto usa autenticação própria baseada em JWT, com usuários persistidos no Supabase. O frontend roda a partir da pasta [public](../public), e a API atual fica em [api/index.js](../api/index.js) e [api/auth.js](../api/auth.js).

## Execução local

```bash
npm install
npm start
```

O `npm start` sobe [api/dev-local.js](../api/dev-local.js), que:

1. carrega o arquivo [.env](../.env)
2. expõe a API em `/api`
3. serve os arquivos estáticos de [public](../public)

## Variáveis de ambiente

As variáveis mínimas para o fluxo local são:

```env
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
JWT_SECRET=...
```

## Endpoints de autenticação

### Registro

```http
POST /api/auth/registro
Content-Type: application/json

{
  "email": "usuario@email.com",
  "nome": "Seu Nome",
  "senha": "senha123"
}
```

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@email.com",
  "senha": "senha123"
}
```

### Sessão atual

```http
GET /api/auth/me
Authorization: Bearer {token}
```

### Logout

```http
POST /api/auth/logout
Authorization: Bearer {token}
```

## Regras atuais de acesso

1. `GET /api/transactions` é público.
2. Escrita em transações exige token válido.
3. Registro, login e logout usam rotas separadas em `/api/auth`.

## Observações de segurança

1. O token fica no localStorage do navegador.
2. O `JWT_SECRET` deve ser definido explicitamente fora de desenvolvimento.
3. A chave `SUPABASE_ANON_KEY` é usada pelo servidor atual; não coloque chave service role no frontend.

## Troubleshooting

### Erro 401

Refaça o login. Se necessário, limpe o localStorage e recarregue a página.

### Erro de ambiente

Confirme se [.env](../.env) está presente e contém as variáveis exigidas.

### Porta ocupada

O launcher local tenta `3000` e, se necessário, cai para `3001`.
