@echo off
REM Script para limpar porta 3000 e reiniciar servidor

echo Tentando liberar porta 3000...

REM Verificar se a porta está em uso
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo Processo encontrado com PID: %%a
)

REM Tentar usar PowerShell para matar o processo
powershell -Command "Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" 2>nul

timeout /t 1 /nobreak

echo Iniciando servidor...
cd /d "%~dp0"
npm start
