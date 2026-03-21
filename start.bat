@echo off
echo.
echo ================================================
echo  SISTEMA DE EXTRATOS - SERVIDOR LOCAL
echo ================================================
echo.

REM Verificar se Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo [X] Node.js nao encontrado!
    echo.
    echo Instale Node.js em: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [V] Node.js detectado:
node --version

REM Verificar se npm está instalado
npm --version >nul 2>&1
if errorlevel 1 (
    echo [X] NPM nao encontrado!
    pause
    exit /b 1
)

echo [V] NPM detectado:
npm --version

echo.
echo [*] Instalando dependências...
call npm install

echo.
echo ================================================
echo  Iniciando servidor...
echo ================================================
echo.

npm start

pause
