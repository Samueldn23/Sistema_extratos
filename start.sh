#!/usr/bin/env bash

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

print_line() {
  echo "================================================"
}

echo
print_line
echo "  SISTEMA DE EXTRATOS - SERVIDOR LOCAL (LINUX)"
print_line
echo

# Verificar Node.js
if ! command -v node >/dev/null 2>&1; then
  echo "[X] Node.js nao encontrado!"
  echo
  echo "No Fedora 44, instale com:"
  echo "sudo dnf install -y nodejs npm"
  exit 1
fi

NODE_VERSION="$(node --version 2>/dev/null)"
echo "[V] Node.js detectado: ${NODE_VERSION}"

# Verificar npm
if ! command -v npm >/dev/null 2>&1; then
  echo "[X] npm nao encontrado!"
  echo
  echo "No Fedora 44, instale com:"
  echo "sudo dnf install -y nodejs npm"
  exit 1
fi

NPM_VERSION="$(npm --version 2>/dev/null)"
echo "[V] npm detectado: v${NPM_VERSION}"

echo
echo "[*] Instalando dependencias..."
if ! npm install --ignore-scripts; then
  echo
  echo "[X] Erro ao instalar dependencias!"
  exit 1
fi

echo
print_line
echo "  Iniciando servidor..."
print_line
echo

npm run local:dev
