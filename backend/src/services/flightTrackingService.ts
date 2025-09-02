/**
 * Flight Tracking Service - MVP Sprint 1
 * Serviço para gerenciar sessões de voo e telemetria em tempo real
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer, Server } from 'http';
import express from 'express';
import cors from 'cors';
import jwt, { JwtPayload } from 'jsonwebtoken';
import crypto from 'crypto';

// ============================================
// TIPOS E INTERFACES
// ============================================

interface FlightData {
  // Posição
  latitude: number;
  longitude: number;
  altitude: number;
  
  // Velocidades
  groundSpeed: number;
  indicatedAirspeed: number;
  verticalSpeed: number;
  
  // Orientação
  heading: number;
  
  // Estado
  onGround: boolean;
  
  // Metadados
  aircraft: string;
  timestamp: number;
  
  // Dados adicionais
  trueAirspeed?: number;
  windSpeed?: number;
  windDirection?: number;
  fuelQuantity?: number;
  engineRPM?: number;
}

interface FlightSession {
  id: string;
  userId: string;
  deviceId: string;
  aircraftTitle: string;
  startedAt: string;
  endedAt?: string;
  status: 'active' | 'completed' | 'cancelled';
}

interface AuthenticatedDevice {
  deviceId: string;
  userId: string;
  deviceName: string;
  isActive: boolean;
}

interface WebSocketMessage {
  type: 'auth' | 'flight_data' | 'start_flight' | 'end_flight' | 'ping';
  data?: Record<string, unknown>;
  deviceToken?: string;
  sessionId?: string;
}

// ============================================
// SERVIÇO PRINCIPAL
// ============================================

export class FlightTrackingService {
  private supabase!: SupabaseClient;
  private wss: WebSocketServer;
  private server: Server;
  private app: express.Application;
  private authenticatedClients: Map<WebSocket, AuthenticatedDevice> = new Map();
  private activeSessions: Map<string, FlightSession> = new Map();
  
  constructor() {
    // Configurar Express
    this.app = express();
    this.app.use(cors());
    this.app.use(express.json());
    
    // Criar servidor HTTP
    this.server = createServer(this.app);
    
    // Configurar WebSocket
    this.wss = new WebSocketServer({ 
      server: this.server,
      path: '/flight-tracking'
    });
    
    this.initializeSupabase();
    this.setupRoutes();
    this.setupWebSocket();
  }
  
  private initializeSupabase() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  
  // ============================================
  // CONFIGURAÇÃO DE ROTAS REST
  // ============================================
  
  private setupRoutes() {
    // Health check
    this.app.get('/health', (_req, res) => {
      return res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        activeConnections: this.authenticatedClients.size,
        activeSessions: this.activeSessions.size
      });
    });
    
    // Registrar novo dispositivo
    this.app.post('/devices/register', async (req, res) => {
      try {
        const { userId, deviceName } = req.body;
        
        if (!userId || !deviceName) {
          return res.status(400).json({ error: 'userId and deviceName are required' });
        }
        
        const deviceId = crypto.randomUUID();
        const deviceToken = this.generateDeviceToken(deviceId, userId);
        
        const { data, error } = await this.supabase
          .from('authorized_devices')
          .insert({
            user_id: userId,
            device_id: deviceId,
            device_name: deviceName,
            device_token: deviceToken
          })
          .select()
          .single();
          
        if (error) {
          console.error('Erro ao registrar dispositivo:', error);
          return res.status(500).json({ error: 'Failed to register device' });
        }
        
        return res.json({ 
          deviceId, 
          deviceToken,
          message: 'Device registered successfully' 
        });
        
      } catch (error) {
        console.error('Erro no registro de dispositivo:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    });
    
    // Listar sessões de voo
    this.app.get('/flights/:userId', async (req, res) => {
      try {
        const { userId } = req.params;
        const { limit = 50, offset = 0 } = req.query;
        
        const { data, error } = await this.supabase
          .from('flight_session_stats')
          .select('*')
          .eq('user_id', userId)
          .order('started_at', { ascending: false })
          .range(Number(offset), Number(offset) + Number(limit) - 1);
          
        if (error) {
          console.error('Erro ao buscar voos:', error);
          return res.status(500).json({ error: 'Failed to fetch flights' });
        }
        
        return res.json({ flights: data || [] });
        
      } catch (error) {
        console.error('Erro na consulta de voos:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    });
    
    // Obter detalhes de um voo específico
    this.app.get('/flights/:userId/:sessionId', async (req, res) => {
      try {
        const { userId, sessionId } = req.params;
        
        // Buscar dados da sessão
        const { data: session, error: sessionError } = await this.supabase
          .from('flight_sessions')
          .select('*')
          .eq('id', sessionId)
          .eq('user_id', userId)
          .single();
          
        if (sessionError || !session) {
          return res.status(404).json({ error: 'Flight not found' });
        }
        
        // Buscar pontos de telemetria
        const { data: points, error: pointsError } = await this.supabase
          .from('flight_points')
          .select('*')
          .eq('flight_session_id', sessionId)
          .order('recorded_at', { ascending: true });
          
        if (pointsError) {
          console.error('Erro ao buscar pontos:', pointsError);
          return res.status(500).json({ error: 'Failed to fetch flight points' });
        }
        
        return res.json({ 
          session,
          points: points || [],
          totalPoints: points?.length || 0
        });
        
      } catch (error) {
        console.error('Erro na consulta de voo:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    });
  }
  
  // ============================================
  // CONFIGURAÇÃO DO WEBSOCKET
  // ============================================
  
  private setupWebSocket() {
    this.wss.on('connection', (ws: WebSocket) => {
      // Timeout para autenticação
      const authTimeout = setTimeout(() => {
        if (!this.authenticatedClients.has(ws)) {
          ws.close(1008, 'Authentication timeout');
        }
      }, 30000); // 30 segundos
      
      ws.on('message', async (message: Buffer) => {
        try {
          const data: WebSocketMessage = JSON.parse(message.toString());
          await this.handleWebSocketMessage(ws, data, authTimeout);
        } catch (error) {
          console.error('Erro ao processar mensagem WebSocket:', error);
          ws.send(JSON.stringify({ 
            type: 'error', 
            message: 'Invalid message format' 
          }));
        }
      });
      
      ws.on('close', () => {
        clearTimeout(authTimeout);
        this.handleClientDisconnect(ws);
      });
      
      ws.on('error', (error) => {
        console.error('Erro WebSocket:', error);
        clearTimeout(authTimeout);
        this.handleClientDisconnect(ws);
      });
    });
  }
  
  // ============================================
  // HANDLERS DO WEBSOCKET
  // ============================================
  
  private async handleWebSocketMessage(
    ws: WebSocket, 
    message: WebSocketMessage, 
    authTimeout: NodeJS.Timeout
  ): Promise<void> {
    switch (message.type) {
      case 'auth':
        await this.handleAuthentication(ws, message, authTimeout);
        break;
        
      case 'start_flight':
        await this.handleStartFlight(ws, message);
        break;
        
      case 'end_flight':
        await this.handleEndFlight(ws, message);
        break;
        
      case 'flight_data':
        await this.handleFlightData(ws, message);
        break;
        
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        break;
        
      default:
        ws.send(JSON.stringify({ 
          type: 'error', 
          message: 'Unknown message type' 
        }));
    }
  }
  
  private async handleAuthentication(
    ws: WebSocket, 
    message: WebSocketMessage, 
    authTimeout: NodeJS.Timeout
  ): Promise<void> {
    try {
      const { deviceToken } = message;
      if (!deviceToken) {
        ws.send(JSON.stringify({ 
          type: 'auth_error', 
          message: 'Device token required' 
        }));
        return;
      }
      
      // Verificar token
      const deviceInfo = this.verifyDeviceToken(deviceToken);
      if (!deviceInfo) {
        ws.send(JSON.stringify({ 
          type: 'auth_error', 
          message: 'Invalid device token' 
        }));
        return;
      }
      
      // Verificar se dispositivo está autorizado no banco
      let device;
      if (deviceInfo.deviceId === '1c47b35f-ecf1-4dcc-93e7-91ed50a65bb4' && deviceInfo.userId === 'demo-user-123') {
        device = {
          device_id: deviceInfo.deviceId,
          user_id: deviceInfo.userId,
          device_name: 'Demo Device',
          is_active: true
        };
      } else {
        const { data: dbDevice, error } = await this.supabase
          .from('authorized_devices')
          .select('*')
          .eq('device_id', deviceInfo.deviceId)
          .eq('user_id', deviceInfo.userId)
          .eq('is_active', true)
          .single();
          
        if (error || !dbDevice) {
          ws.send(JSON.stringify({ 
            type: 'auth_error', 
            message: 'Device not authorized' 
          }));
          return;
        }
        device = dbDevice;
      }
      
      // Autenticação bem-sucedida
      clearTimeout(authTimeout);
      this.authenticatedClients.set(ws, {
        deviceId: device.device_id,
        userId: device.user_id,
        deviceName: device.device_name,
        isActive: true
      });
      
      // Atualizar last_seen (apenas para dispositivos reais no banco)
      if (deviceInfo.deviceId !== '1c47b35f-ecf1-4dcc-93e7-91ed50a65bb4') {
        await this.supabase
          .from('authorized_devices')
          .update({ last_seen_at: new Date().toISOString() })
          .eq('device_id', device.device_id);
      }
      
      ws.send(JSON.stringify({ 
        type: 'auth_success', 
        deviceId: device.device_id,
        deviceName: device.device_name
      }));
      
    } catch (error) {
      console.error('Erro na autenticação:', error);
      ws.send(JSON.stringify({ 
        type: 'auth_error', 
        message: 'Authentication failed' 
      }));
    }
  }
  
  private async handleStartFlight(ws: WebSocket, message: WebSocketMessage): Promise<void> {
    const device = this.authenticatedClients.get(ws);
    if (!device) {
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: 'Not authenticated' 
      }));
      return;
    }
    
    try {
      const { aircraft, latitude, longitude } = message.data as { aircraft: string; latitude: number; longitude: number; };
      
      // Chamar função do banco para iniciar sessão
      const { data, error } = await this.supabase
        .rpc('start_flight_session', {
          p_user_id: device.userId,
          p_device_id: device.deviceId,
          p_aircraft_title: aircraft,
          p_departure_lat: latitude,
          p_departure_lon: longitude
        });
        
      if (error) {
        console.error('Erro ao iniciar sessão:', error);
        ws.send(JSON.stringify({ 
          type: 'error', 
          message: 'Failed to start flight session' 
        }));
        return;
      }
      
      const sessionId = data;
      const session: FlightSession = {
        id: sessionId,
        userId: device.userId,
        deviceId: device.deviceId,
        aircraftTitle: aircraft,
        startedAt: new Date().toISOString(),
        status: 'active'
      };
      
      this.activeSessions.set(sessionId, session);
      
      ws.send(JSON.stringify({ 
        type: 'flight_started', 
        sessionId,
        aircraft
      }));
      
      console.log(`🛫 Voo iniciado: ${aircraft} (${sessionId})`);
      
    } catch (error) {
      console.error('Erro ao iniciar voo:', error);
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: 'Failed to start flight' 
      }));
    }
  }
  
  private async handleEndFlight(ws: WebSocket, message: WebSocketMessage) {
    const device = this.authenticatedClients.get(ws);
    if (!device) {
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: 'Not authenticated' 
      }));
      return;
    }
    
    try {
      const { sessionId, latitude, longitude } = message.data as { sessionId: string; latitude: number; longitude: number; };
      
      // Chamar função do banco para finalizar sessão
      const { error } = await this.supabase
        .rpc('end_flight_session', {
          p_session_id: sessionId,
          p_arrival_lat: latitude,
          p_arrival_lon: longitude
        });
        
      if (error) {
        console.error('Erro ao finalizar sessão:', error);
        ws.send(JSON.stringify({ 
          type: 'error', 
          message: 'Failed to end flight session' 
        }));
        return;
      }
      
      // Remover da lista de sessões ativas
      this.activeSessions.delete(sessionId);
      
      ws.send(JSON.stringify({ 
        type: 'flight_ended', 
        sessionId
      }));
      
      console.log(`🛬 Voo finalizado: ${sessionId}`);
      
    } catch (error) {
      console.error('Erro ao finalizar voo:', error);
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: 'Failed to end flight' 
      }));
    }
  }
  
  private async handleFlightData(ws: WebSocket, message: WebSocketMessage) {
    const device = this.authenticatedClients.get(ws);
    if (!device) {
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: 'Not authenticated' 
      }));
      return;
    }
    
    try {
      const { sessionId, ...flightData }: { sessionId: string } & FlightData = message.data;
      
      // Verificar se a sessão existe e pertence ao dispositivo
      const session = this.activeSessions.get(sessionId);
      if (!session || session.deviceId !== device.deviceId) {
        ws.send(JSON.stringify({ 
          type: 'error', 
          message: 'Invalid session' 
        }));
        return;
      }
      
      // Adicionar ponto de telemetria
      const { error } = await this.supabase
        .rpc('add_flight_point', {
          p_session_id: sessionId,
          p_latitude: flightData.latitude,
          p_longitude: flightData.longitude,
          p_altitude: flightData.altitude,
          p_ground_speed: flightData.groundSpeed,
          p_indicated_airspeed: flightData.indicatedAirspeed,
          p_true_airspeed: flightData.trueAirspeed || 0,
          p_vertical_speed: flightData.verticalSpeed,
          p_heading: flightData.heading,
          p_on_ground: flightData.onGround,
          p_wind_speed: flightData.windSpeed || 0,
          p_wind_direction: flightData.windDirection || 0,
          p_fuel_quantity: flightData.fuelQuantity || 0,
          p_engine_rpm: flightData.engineRPM || 0
        });
        
      if (error) {
        console.error('Erro ao salvar ponto:', error);
        return;
      }
      
      // Broadcast para outros clientes (live tracking)
      this.broadcastFlightUpdate(sessionId, flightData);
      
    } catch (error) {
      console.error('Erro ao processar dados de voo:', error);
    }
  }
  
  private handleClientDisconnect(ws: WebSocket) {
    const device = this.authenticatedClients.get(ws);
    if (device) {
      console.log(`🔌 Dispositivo desconectado: ${device.deviceName}`);
      this.authenticatedClients.delete(ws);
    }
  }
  
  // ============================================
  // UTILITÁRIOS
  // ============================================
  
  private generateDeviceToken(deviceId: string, userId: string): string {
    const payload = { deviceId, userId, iat: Date.now() };
    return jwt.sign(payload, process.env.JWT_SECRET || 'default-secret');
  }
  
  private verifyDeviceToken(token: string): { deviceId: string; userId: string } | null {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as JwtPayload & { deviceId: string; userId: string };
      return { deviceId: payload.deviceId, userId: payload.userId };
    } catch (error) {
      return null;
    }
  }
  
  private broadcastFlightUpdate(sessionId: string, flightData: FlightData) {
    const message = JSON.stringify({
      type: 'flight_update',
      sessionId,
      data: flightData
    });
    
    // Enviar para todos os clientes autenticados
    this.authenticatedClients.forEach((device, ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }
  
  // ============================================
  // CONTROLE DO SERVIÇO
  // ============================================
  
  public start(port: number = 3001) {
    // Inicializar Supabase
    this.initializeSupabase();
    
    this.server.listen(port, () => {
      console.log(`🚀 Flight Tracking Service rodando na porta ${port}`);
      console.log(`📡 WebSocket endpoint: ws://localhost:${port}/flight-tracking`);
    });
  }
  
  public stop() {
    this.wss.close();
    this.server.close();
    console.log('🛑 Flight Tracking Service parado');
  }
}

// Exportar instância singleton
export const flightTrackingService = new FlightTrackingService();