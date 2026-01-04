@echo off
echo 🚀 Iniciando Flight Log Opus - Modo Desenvolvimento
echo.

:: Verificar se o backend está disponível
if not exist "backend\package.json" (
    echo ❌ Backend não encontrado! Verifique o diretório.
    pause
    exit /b 1
)

:: Verificar se o frontend está disponível
if not exist "package.json" (
    echo ❌ Frontend não encontrado! Verifique o diretório.
    pause
    exit /b 1
)

echo 📦 Iniciando Flight Tracking Service (desenvolvimento)...
cd backend
start cmd /k "npm run start:tracking:simple"
cd ..

timeout /t 3 /nobreak > nul

echo 🌐 Iniciando Frontend (Vite)...
start cmd /k "npm run dev"

echo.
echo ✅ Todos os serviços foram iniciados!
echo 📡 Flight Tracking Service: http://localhost:8081/health
echo 🌍 Frontend: http://localhost:5173
echo 🔗 WebSocket: ws://localhost:8081/flight-tracking
echo.
echo Pressione qualquer tecla para encerrar todos os processos...
pause > nul

echo 🛑 Encerrando processos...
taskkill /F /IM node.exe 2>nul
echo ✅ Processos encerrados!