# Testes Manuais

## Pré-requisitos

1. Node.js instalado.
2. Arquivo [.env](../.env) configurado.
3. Dependências instaladas com `npm install`.

## Subida local

```bash
npm start
```

Resultado esperado:

1. A aplicação sobe em http://localhost:3000.
2. Se 3000 estiver ocupada, sobe em http://localhost:3001.
3. O endpoint `/api/status` responde JSON com `banco_de_dados: "supabase"`.

## Teste de interface

1. Abrir a aplicação no navegador.
2. Validar carregamento da tela de login ou da lista de transações.
3. Registrar um usuário novo.
4. Fazer logout.
5. Fazer login com o mesmo usuário.

## Teste de operações protegidas

Depois do login:

1. Criar uma transação.
2. Editar a transação criada.
3. Marcar como paga ou pendente.
4. Excluir a transação.
5. Importar um JSON válido.

## Teste de proteção sem token

No console do navegador:

```javascript
localStorage.clear();
```

Depois recarregue a página e tente uma operação de escrita. O esperado é receber erro de autenticação.

## Teste rápido por API

### Status

```bash
curl -s http://localhost:3000/api/status
```

### Registro

```bash
curl -X POST http://localhost:3000/api/auth/registro \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@exemplo.com","nome":"Teste","senha":"senha123"}'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@exemplo.com","senha":"senha123"}'
```

## Checklist

1. A aplicação sobe sem erro.
2. Registro funciona.
3. Login funciona.
4. Operações de escrita exigem token.
5. A listagem pública funciona.
6. O status da API responde corretamente.

## Troubleshooting

### Porta já em uso

O launcher local troca automaticamente para 3001.

### Erro de ambiente

Confirme as variáveis `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `JWT_SECRET`.

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
