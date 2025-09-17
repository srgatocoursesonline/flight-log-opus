# Flight Log Opus - Flight Tracking Service Manager
# Script para gerenciar o Flight Tracking Service

$ErrorActionPreference = "Stop"

function Test-Port {
    param([int]$Port)
    try {
        $tcpConnection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        return $null -ne $tcpConnection
    } catch {
        return $false
    }
}

function Start-FlightTrackingService {
    Write-Host "🚀 Iniciando Flight Tracking Service..." -ForegroundColor Green
    
    # Verificar se a porta já está em uso
    if (Test-Port -Port 3001) {
        Write-Host "⚠️  A porta 3001 já está em uso!" -ForegroundColor Yellow
        $process = Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess
        Write-Host "📋 Processo atual: $($process.ProcessName) (PID: $($process.Id))" -ForegroundColor Cyan
        
        $response = Read-Host "Deseja encerrar o processo atual? (s/n)"
        if ($response -eq 's' -or $response -eq 'S') {
            Stop-Process -Id $process.Id -Force
            Start-Sleep -Seconds 2
            Write-Host "✅ Processo encerrado" -ForegroundColor Green
        } else {
            Write-Host "❌ Operação cancelada" -ForegroundColor Red
            return
        }
    }
    
    # Navegar para o diretório do backend
    $backendPath = Join-Path $PSScriptRoot ".." "backend"
    if (-not (Test-Path $backendPath)) {
        Write-Host "❌ Diretório backend não encontrado: $backendPath" -ForegroundColor Red
        return
    }
    
    Set-Location $backendPath
    
    # Verificar se o arquivo existe
    $serverFile = "src\flight-tracking-server.ts"
    if (-not (Test-Path $serverFile)) {
        Write-Host "❌ Arquivo flight-tracking-server.ts não encontrado!" -ForegroundColor Red
        return
    }
    
    Write-Host "📡 Iniciando servidor WebSocket na porta 3001..." -ForegroundColor Cyan
    Write-Host "💡 Para parar o serviço: Ctrl+C" -ForegroundColor Yellow
    Write-Host ""
    
    try {
        # Executar o comando npm
        npm run start:tracking
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Flight Tracking Service iniciado com sucesso!" -ForegroundColor Green
        } else {
            Write-Host "❌ Erro ao iniciar o Flight Tracking Service" -ForegroundColor Red
            Write-Host "💡 Verifique se as dependências estão instaladas: npm install" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Erro ao executar o comando: $_" -ForegroundColor Red
    }
}

function Show-Status {
    Write-Host "📊 Status do Flight Tracking Service" -ForegroundColor Cyan
    Write-Host "=====================================" -ForegroundColor Cyan
    
    $isRunning = Test-Port -Port 3001
    
    if ($isRunning) {
        Write-Host "✅ Serviço está RODANDO" -ForegroundColor Green
        $process = Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess
        Write-Host "📋 Processo: $($process.ProcessName) (PID: $($process.Id))" -ForegroundColor Cyan
        Write-Host "🔗 WebSocket URL: ws://localhost:3001/flight-tracking" -ForegroundColor Blue
    } else {
        Write-Host "❌ Serviço está PARADO" -ForegroundColor Red
        Write-Host "💡 Para iniciar: .\start-flight-tracking.ps1 -Start" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "📋 Endpoints disponíveis quando o serviço estiver rodando:" -ForegroundColor Cyan
    Write-Host "   - Health Check: http://localhost:3001/health" -ForegroundColor Blue
    Write-Host "   - WebSocket: ws://localhost:3001/flight-tracking" -ForegroundColor Blue
}

# Menu principal
Write-Host "🛩️  Flight Log Opus - Flight Tracking Service Manager" -ForegroundColor Blue
Write-Host "=======================================================" -ForegroundColor Blue
Write-Host ""

if ($args[0] -eq "-Start") {
    Start-FlightTrackingService
} elseif ($args[0] -eq "-Status") {
    Show-Status
} else {
    Write-Host "Uso: .\start-flight-tracking.ps1 [-Start] [-Status]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Opções:" -ForegroundColor Cyan
    Write-Host "  -Start   : Inicia o Flight Tracking Service" -ForegroundColor White
    Write-Host "  -Status  : Mostra o status do serviço" -ForegroundColor White
    Write-Host ""
    
    # Mostrar status por padrão
    Show-Status
}