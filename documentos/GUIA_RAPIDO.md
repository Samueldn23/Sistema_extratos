# Guia Rápido

## Iniciar localmente

### 1. Instale as dependências

```bash
npm install
```

### 2. Inicie a aplicação

```bash
npm start
```

O start local sobe o launcher [api/dev-local.js](../api/dev-local.js), que serve a pasta [public](../public) e a API atual em [api/index.js](../api/index.js).

### 3. Abra no navegador

Use http://localhost:3000

Se a porta 3000 estiver ocupada, o launcher tenta automaticamente a 3001.

## Fluxo de uso

1. Abra a tela de login ou registro.
2. Crie uma conta ou entre com uma conta existente.
3. Gerencie transações normalmente pela interface.
4. Use os botões de importação, exportação, edição e exclusão conforme necessário.

## O que funciona sem login

1. Visualização de transações.
2. Consulta de status da API.

## O que exige login

1. Criar transações.
2. Editar transações.
3. Excluir transações.
4. Marcar pagamento.
5. Importar dados.
6. Limpar dados.

## Problemas comuns

### Erro de autenticação

Faça login novamente. Se necessário, limpe o localStorage com `localStorage.clear()` e recarregue a página.

### Porta em uso

O launcher local muda para 3001 automaticamente. Se quiser forçar outra porta, defina a variável `PORT` antes de iniciar.

### Erro de ambiente

Verifique se o arquivo [.env](../.env) contém `SUPABASE_URL`, `SUPABASE_ANON_KEY` e, quando necessário, `JWT_SECRET`.

## Referências

1. [AUTENTICACAO.md](AUTENTICACAO.md)
2. [SUMARIO_AUTENTICACAO.md](SUMARIO_AUTENTICACAO.md)
3. [TESTES_MANUAIS.md](TESTES_MANUAIS.md)
