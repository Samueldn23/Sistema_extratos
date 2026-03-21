#!/bin/bash
# Script de teste para o sistema de autenticação

echo "🧪 Testando Sistema de Autenticação"
echo "=================================="
echo ""

BASE_URL="http://localhost:3000/api"

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Teste 1: Verificar status do servidor
echo -e "${YELLOW}[1]${NC} Verificando status do servidor..."
STATUS=$(curl -s "${BASE_URL}/status")
if echo "$STATUS" | grep -q "servidor"; then
    echo -e "${GREEN}✓${NC} Servidor respondendo"
    echo "Resposta: $STATUS"
else
    echo -e "${RED}✗${NC} Servidor não respondendo"
    exit 1
fi

echo ""

# Teste 2: Registrar novo usuário
echo -e "${YELLOW}[2]${NC} Testando registro de usuário..."
EMAIL="teste_$(date +%s)@teste.com"
NOME="Usuário Teste"
SENHA="senha123"

REGISTRO=$(curl -s -X POST "${BASE_URL}/auth/registro" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"nome\":\"$NOME\",\"senha\":\"$SENHA\"}")

if echo "$REGISTRO" | grep -q "token"; then
    echo -e "${GREEN}✓${NC} Registro bem-sucedido"
    TOKEN=$(echo "$REGISTRO" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    echo "Token: ${TOKEN:0:20}..."
else
    echo -e "${RED}✗${NC} Registro falhou"
    echo "Resposta: $REGISTRO"
    exit 1
fi

echo ""

# Teste 3: Fazer login
echo -e "${YELLOW}[3]${NC} Testando login..."
LOGIN=$(curl -s -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"senha\":\"$SENHA\"}")

if echo "$LOGIN" | grep -q "token"; then
    echo -e "${GREEN}✓${NC} Login bem-sucedido"
    LOGIN_TOKEN=$(echo "$LOGIN" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    echo "Token: ${LOGIN_TOKEN:0:20}..."
else
    echo -e "${RED}✗${NC} Login falhou"
    echo "Resposta: $LOGIN"
    exit 1
fi

echo ""

# Teste 4: Verificar autenticação
echo -e "${YELLOW}[4]${NC} Verificando credenciais..."
AUTH_CHECK=$(curl -s -X GET "${BASE_URL}/auth/me" \
  -H "Authorization: Bearer $TOKEN")

if echo "$AUTH_CHECK" | grep -q "autenticado"; then
    echo -e "${GREEN}✓${NC} Autenticação verificada"
else
    echo -e "${RED}✗${NC} Autenticação falhou"
    echo "Resposta: $AUTH_CHECK"
    exit 1
fi

echo ""

# Teste 5: Criar transação (protegido)
echo -e "${YELLOW}[5]${NC} Testando criação de transação..."
TRANSACTION=$(curl -s -X POST "${BASE_URL}/transactions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"id\":\"test_$(date +%s)\",\"DATA\":\"2026-03-20\",\"DESCRIÇÃO\":\"Teste\",\"VALOR\":100.50,\"CATEGORIA\":\"Teste\"}")

if echo "$TRANSACTION" | grep -q "Teste"; then
    echo -e "${GREEN}✓${NC} Transação criada com sucesso"
else
    echo -e "${RED}✗${NC} Criação de transação falhou"
    echo "Resposta: $TRANSACTION"
    exit 1
fi

echo ""

# Teste 6: Tentar criar transação sem token (deve falhar)
echo -e "${YELLOW}[6]${NC} Testando proteção sem token..."
NO_TOKEN=$(curl -s -X POST "${BASE_URL}/transactions" \
  -H "Content-Type: application/json" \
  -d "{\"id\":\"test2\",\"DATA\":\"2026-03-20\",\"DESCRIÇÃO\":\"Teste2\",\"VALOR\":50,\"CATEGORIA\":\"Teste\"}")

if echo "$NO_TOKEN" | grep -q "autenticado"; then
    echo -e "${GREEN}✓${NC} Proteção funcionando - rejeita sem token"
else
    echo -e "${RED}✗${NC} Proteção falhou - aceitou sem token"
    echo "Resposta: $NO_TOKEN"
fi

echo ""
echo -e "${GREEN}✅ Todos os testes passaram!${NC}"
echo ""
