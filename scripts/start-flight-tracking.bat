@echo off
echo 🚀 Iniciando Flight Tracking Service...
cd /d "%~dp0\..\backend"

REM Verificar se o arquivo existe
if not exist "src\flight-tracking-server.ts" (
    echo ❌ Arquivo flight-tracking-server.ts não encontrado!
    exit /b 1
)

REM Iniciar o serviço
echo 📡 Iniciando servidor WebSocket na porta 3001...
npm run start:tracking

if %errorlevel% neq 0 (
    echo ❌ Erro ao iniciar o Flight Tracking Service
    echo 💡 Verifique se as dependências estão instaladas: npm install
    exit /b 1
)

echo ✅ Flight Tracking Service iniciado com sucesso!