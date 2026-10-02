/**
 * Flight Tracking Server - Versão de Desenvolvimento
 * Servidor simplificado para testes sem Supabase
 */

import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Configurações
const PORT = process.env.FLIGHT_TRACKING_PORT ? parseInt(process.env.FLIGHT_TRACKING_PORT) : 8081;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Estado em memória (para desenvolvimento)
interface FlightSession {
  sessionId: string;
  userId: string;
  deviceId: string;
  aircraft: string;
  startTime: string;
  lastUpdate: string;
  positions: Array<{
    latitude: number;
    longitude: number;
    altitude: number;
    speed: number;
    heading: number;
    timestamp: string;
  }>;
}

interface AuthenticatedClient {
  ws: WebSocket;
  deviceId: string;
  deviceName: string;
  userId: string;
  authenticated: boolean;
}

// Estado global
const sessions = new Map<string, FlightSession>();
const authenticatedClients = new Map<WebSocket, AuthenticatedClient>();

// Criar servidor HTTP
const app = express();
const server = app.listen(PORT, () => {
  console.log(`🚀 Flight Tracking Server (DEV) rodando na porta ${PORT}`);
  console.log(`📊 Ambiente: ${NODE_ENV}`);
  console.log(`🌐 WebSocket: ws://localhost:${PORT}/flight-tracking`);
});

// Configurar middlewares
app.use(cors());
app.use(express.json());

// WebSocket Server
const wss = new WebSocketServer({ server, path: '/flight-tracking' });

wss.on('connection', (ws: WebSocket) => {
  console.log('📡 Cliente WebSocket conectado');
  
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      handleMessage(ws, message);
    } catch (error) {
      console.error('❌ Erro ao processar mensagem:', error);
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
    }
  });
  
  ws.on('close', () => {
    console.log('📡 Cliente WebSocket desconectado');
    // Remover cliente autenticado
    authenticatedClients.delete(ws);
  });
  
  ws.on('error', (error) => {
    console.error('❌ Erro WebSocket:', error);
    authenticatedClients.delete(ws);
  });
});

// Função para lidar com mensagens
function handleMessage(ws: WebSocket, message: any) {
  console.log('📨 Mensagem recebida:', message.type);
  
  switch (message.type) {
    case 'auth':
      handleAuth(ws, message);
      break;
    case 'flight_data':
      handleFlightData(ws, message);
      break;
    case 'start_flight':
      handleStartFlight(ws, message);
      break;
    case 'end_flight':
      handleEndFlight(ws, message);
      break;
    default:
      ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
  }
}

// Função de autenticação
function handleAuth(ws: WebSocket, message: any) {
  const { deviceToken } = message;
  
  // Em desenvolvimento, aceitar qualquer token
  if (!deviceToken) {
    ws.send(JSON.stringify({ type: 'error', message: 'Device token required' }));
    return;
  }
  
  // Simular autenticação bem-sucedida
  const client: AuthenticatedClient = {
    ws,
    deviceId: 'demo-device-123',
    deviceName: 'Demo Device',
    userId: 'demo-user-123',
    authenticated: true
  };
  
  authenticatedClients.set(ws, client);
  
  ws.send(JSON.stringify({
    type: 'auth_success',
    deviceId: client.deviceId,
    userId: client.userId,
    message: 'Authentication successful'
  }));
  
  console.log(`✅ Cliente autenticado: ${client.deviceId}`);
}

// Função para lidar com dados de voo
function handleFlightData(ws: WebSocket, message: any) {
  const client = authenticatedClients.get(ws);
  if (!client?.authenticated) {
    ws.send(JSON.stringify({ type: 'error', message: 'Not authenticated' }));
    return;
  }
  
  const { sessionId, data } = message;
  if (!sessionId || !data) {
    ws.send(JSON.stringify({ type: 'error', message: 'Session ID and data required' }));
    return;
  }
  
  // Buscar ou criar sessão
  let session = sessions.get(sessionId);
  if (!session) {
    session = {
      sessionId,
      userId: client.userId,
      deviceId: client.deviceId,
      aircraft: data.aircraft || 'Unknown Aircraft',
      startTime: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
      positions: []
    };
    sessions.set(sessionId, session);
  }
  
  // Adicionar posição
  session.positions.push({
    latitude: data.latitude,
    longitude: data.longitude,
    altitude: data.altitude,
    speed: data.groundSpeed || data.speed || 0,
    heading: data.heading || 0,
    timestamp: new Date().toISOString()
  });
  
  session.lastUpdate = new Date().toISOString();
  
  // Broadcast para todos os clientes autenticados
  broadcastFlightUpdate(sessionId, data);
  
  console.log(`📍 Posição atualizada - Sessão: ${sessionId}, Lat: ${data.latitude}, Lng: ${data.longitude}`);
}

// Função para iniciar voo
function handleStartFlight(ws: WebSocket, message: any) {
  const client = authenticatedClients.get(ws);
  if (!client?.authenticated) {
    ws.send(JSON.stringify({ type: 'error', message: 'Not authenticated' }));
    return;
  }
  
  const { sessionId, data } = message;
  const session: FlightSession = {
    sessionId,
    userId: client.userId,
    deviceId: client.deviceId,
    aircraft: data?.aircraft || 'Unknown Aircraft',
    startTime: new Date().toISOString(),
    lastUpdate: new Date().toISOString(),
    positions: []
  };
  
  sessions.set(sessionId, session);
  
  // Broadcast para todos os clientes
  broadcastToAll({
    type: 'flight_start',
    sessionId,
    data: {
      aircraft: session.aircraft,
      startTime: session.startTime
    }
  });
  
  console.log(`✈️  Voo iniciado: ${sessionId} - ${session.aircraft}`);
}

// Função para encerrar voo
function handleEndFlight(ws: WebSocket, message: any) {
  const client = authenticatedClients.get(ws);
  if (!client?.authenticated) {
    ws.send(JSON.stringify({ type: 'error', message: 'Not authenticated' }));
    return;
  }
  
  const { sessionId, data } = message;
  const session = sessions.get(sessionId);
  
  if (session) {
    // Broadcast para todos os clientes
    broadcastToAll({
      type: 'flight_end',
      sessionId,
      data: {
        aircraft: session.aircraft,
        duration: data?.duration || 0,
        distance: data?.distance || 0,
        maxAltitude: data?.maxAltitude || 0,
        maxSpeed: data?.maxSpeed || 0
      }
    });
    
    console.log(`🛬 Voo encerrado: ${sessionId}`);
    
    // Opcionalmente, remover a sessão após algum tempo
    setTimeout(() => {
      sessions.delete(sessionId);
      console.log(`🗑️  Sessão removida: ${sessionId}`);
    }, 60000); // 1 minuto
  }
}

// Função para broadcast de atualização de voo
function broadcastFlightUpdate(sessionId: string, data: any) {
  const message = JSON.stringify({
    type: 'flight_update',
    sessionId,
    data
  });
  
  authenticatedClients.forEach((client) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(message);
    }
  });
}

// Função para broadcast geral
function broadcastToAll(message: any) {
  const messageStr = JSON.stringify(message);
  
  authenticatedClients.forEach((client) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(messageStr);
    }
  });
}

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    connectedClients: authenticatedClients.size,
    activeSessions: sessions.size,
    version: '1.0.0-dev'
  });
});

// Listar sessões ativas
app.get('/sessions', (_req, res) => {
  const sessionList = Array.from(sessions.values()).map(session => ({
    sessionId: session.sessionId,
    userId: session.userId,
    deviceId: session.deviceId,
    aircraft: session.aircraft,
    startTime: session.startTime,
    lastUpdate: session.lastUpdate,
    positionCount: session.positions.length
  }));
  
  res.json({
    sessions: sessionList,
    total: sessionList.length
  });
});

// Limpeza periódica de sessões antigas
setInterval(() => {
  const now = new Date();
  const maxAge = 30 * 60 * 1000; // 30 minutos
  
  sessions.forEach((session, sessionId) => {
    const lastUpdate = new Date(session.lastUpdate);
    if (now.getTime() - lastUpdate.getTime() > maxAge) {
      sessions.delete(sessionId);
      console.log(`🧹 Sessão antiga removida: ${sessionId}`);
    }
  });
}, 5 * 60 * 1000); // Executar a cada 5 minutos

// Handlers de processo
process.on('SIGINT', () => {
  console.log('\n🛑 Recebido SIGINT, parando servidor...');
  server.close(() => {
    console.log('✅ Servidor encerrado');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Recebido SIGTERM, parando servidor...');
  server.close(() => {
    console.log('✅ Servidor encerrado');
    process.exit(0);
  });
});

console.log('');
console.log('📋 Endpoints disponíveis:');
console.log(`   - Health Check: http://localhost:${PORT}/health`);
console.log(`   - List Sessions: GET http://localhost:${PORT}/sessions`);
console.log(`   - WebSocket: ws://localhost:${PORT}/flight-tracking`);
console.log('');