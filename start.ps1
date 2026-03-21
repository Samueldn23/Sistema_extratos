#!/usr/bin/env pwsh

Write-Host ""
Write-Host "════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🏦 SISTEMA DE EXTRATOS - SERVIDOR LOCAL" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "[✗] Node.js não encontrado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Instale Node.js em: https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host "[✓] Node.js detectado: $nodeVersion" -ForegroundColor Green

# Verificar npm
$npmVersion = npm --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "[✗] NPM não encontrado!" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host "[✓] NPM detectado: v$npmVersion" -ForegroundColor Green

Write-Host ""
Write-Host "[*] Instalando dependências..." -ForegroundColor Blue
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[✗] Erro ao instalar dependências!" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host ""
Write-Host "════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Iniciando servidor..." -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

npm start
