# Índice da Documentação

## Ordem sugerida

1. [GUIA_RAPIDO.md](GUIA_RAPIDO.md)
2. [TESTES_MANUAIS.md](TESTES_MANUAIS.md)
3. [AUTENTICACAO.md](AUTENTICACAO.md)
4. [SUMARIO_AUTENTICACAO.md](SUMARIO_AUTENTICACAO.md)
5. [ARQUITETURA.md](ARQUITETURA.md)

## Documentos e foco

1. [GUIA_RAPIDO.md](GUIA_RAPIDO.md)
   Início local e uso básico.

2. [TESTES_MANUAIS.md](TESTES_MANUAIS.md)
   Checklist de validação funcional.

3. [AUTENTICACAO.md](AUTENTICACAO.md)
   Rotas, variáveis de ambiente e comportamento de login.

4. [SUMARIO_AUTENTICACAO.md](SUMARIO_AUTENTICACAO.md)
   Resumo técnico da implementação atual.

5. [ARQUITETURA.md](ARQUITETURA.md)
   Mapa das peças do runtime ativo.

6. [CHECKLIST.md](CHECKLIST.md)
   Pendências, ideias e acompanhamento.

## Arquivos principais do projeto

1. [api/index.js](../api/index.js)
2. [api/auth.js](../api/auth.js)
3. [api/dev-local.js](../api/dev-local.js)
4. [public/index.html](../public/index.html)
5. [public/script.js](../public/script.js)
6. [public/auth.js](../public/auth.js)
7. [vercel.json](../vercel.json)
8. [package.json](../package.json)

## Fluxos importantes

1. Local: `npm start`
2. Deploy: Vercel com [vercel.json](../vercel.json)
3. Banco atual: Supabase

## Observação

A documentação foi alinhada ao runtime atual. Referências antigas a `src`, `publico` e SQLite não representam mais o fluxo ativo do projeto.
