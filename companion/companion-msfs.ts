/**
 * MSFS 2024 Companion Service
 * Conecta com Microsoft Flight Simulator via SimConnect para capturar telemetria
 * e enviar dados de voo para o backend do Flight Log Opus
 */

import { open, Protocol, ConnectionHandle } from 'node-simconnect';
import axios from 'axios';
import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';

// ============================================
// CONFIGURAÇÕES
// ============================================

const CONFIG = {
  // Servidor local para status e controle
  EXPRESS_PORT: 3003,
  
  // WebSocket para comunicação em tempo real
  WS_PORT: 3002,
  
  // Backend do Flight Log Opus
  BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:3001',
  
  // Configurações de detecção de voo
  FLIGHT_DETECTION: {
    MIN_SPEED_TAKEOFF: 30, // knots
    MIN_SPEED_LANDING: 10, // knots
    MIN_ALTITUDE_FLIGHT: 100, // feet
    GROUND_THRESHOLD: 5, // feet
  },
  
  // Intervalo de coleta de dados (ms)
  DATA_INTERVAL: 1000,
};

// ============================================
// TIPOS E INTERFACES
// ============================================

interface FlightData {
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  onGround: boolean;
  aircraft: string;
  heading: number;
  verticalSpeed: number;
  timestamp: number;
}

interface FlightLog {
  aircraft: string;
  startTime: number;
  endTime?: number;
  departureLatLon: [number, number];
  arrivalLatLon?: [number, number];
  maxAltitude: number;
  maxSpeed: number;
  distance: number;
  duration?: number;
}

// ============================================
// CLASSE PRINCIPAL
// ============================================

class MSFSCompanion {
  private simConnect: ConnectionHandle | null = null;
  private expressApp: express.Application;
  private wsServer: WebSocketServer;
  private isConnected = false;
  private isFlying = false;
  private currentFlight: FlightLog | null = null;
  private lastData: FlightData | null = null;
  private dataInterval: NodeJS.Timeout | null = null;
  private clients: Set<any> = new Set();

  constructor() {
    this.setupExpress();
    this.setupWebSocket();
    this.setupSimConnect();
  }

  // ============================================
  // SETUP SERVIDORES
  // ============================================

  private setupExpress() {
    this.expressApp = express();
    this.expressApp.use(cors());
    this.expressApp.use(express.json());

    // Status endpoint
    this.expressApp.get('/status', (req, res) => {
      res.json({
        connected: this.isConnected,
        flying: this.isFlying,
        currentFlight: this.currentFlight,
        lastData: this.lastData,
      });
    });

    // Controle manual
    this.expressApp.post('/connect', (req, res) => {
      this.connectToMSFS();
      res.json({ message: 'Tentando conectar ao MSFS...' });
    });

    this.expressApp.post('/disconnect', (req, res) => {
      this.disconnect();
      res.json({ message: 'Desconectado do MSFS' });
    });

    this.expressApp.listen(CONFIG.EXPRESS_PORT, () => {
      console.log(`🚀 Companion Service rodando na porta ${CONFIG.EXPRESS_PORT}`);
    });
  }

  private setupWebSocket() {
    this.wsServer = new WebSocketServer({ port: CONFIG.WS_PORT });
    
    this.wsServer.on('connection', (ws) => {
      console.log('📡 Cliente WebSocket conectado');
      this.clients.add(ws);
      
      // Enviar status atual
      ws.send(JSON.stringify({
        type: 'status',
        data: {
          connected: this.isConnected,
          flying: this.isFlying,
          currentFlight: this.currentFlight,
        }
      }));
      
      ws.on('close', () => {
        this.clients.delete(ws);
        console.log('📡 Cliente WebSocket desconectado');
      });
    });
    
    console.log(`🌐 WebSocket Server rodando na porta ${CONFIG.WS_PORT}`);
  }

  // ============================================
  // SIMCONNECT SETUP
  // ============================================

  private setupSimConnect() {
    try {
      this.connectToMSFS();
    } catch (error) {
      console.error('❌ Erro ao inicializar SimConnect:', error);
    }
  }

  private setupSimConnectEvents() {
    if (!this.simConnect) return;

    // Evento de desconexão
    this.simConnect.on('close', () => {
      console.log('❌ Desconectado do MSFS');
      this.isConnected = false;
      this.isFlying = false;
      this.broadcastStatus();
      this.stopDataCollection();
    });

    // Evento de erro
    this.simConnect.on('error', (error: any) => {
      console.error('❌ Erro SimConnect:', error);
    });

    // Dados recebidos
    this.simConnect.on('simObjectData', (data: any) => {
      this.processFlightData(data);
    });
  }

  private requestDataDefinitions() {
    if (!this.simConnect) return;

    // Definir dados que queremos receber - cada um individualmente
    this.simConnect.addToDataDefinition(0, 'PLANE LATITUDE', 'degrees');
    this.simConnect.addToDataDefinition(0, 'PLANE LONGITUDE', 'degrees');
    this.simConnect.addToDataDefinition(0, 'PLANE ALTITUDE', 'feet');
    this.simConnect.addToDataDefinition(0, 'AIRSPEED INDICATED', 'knots');
    this.simConnect.addToDataDefinition(0, 'SIM ON GROUND', 'bool');
    this.simConnect.addToDataDefinition(0, 'TITLE', null);
    this.simConnect.addToDataDefinition(0, 'PLANE HEADING DEGREES TRUE', 'degrees');
    this.simConnect.addToDataDefinition(0, 'VERTICAL SPEED', 'feet per minute');
  }

  // ============================================
  // COLETA E PROCESSAMENTO DE DADOS
  // ============================================

  private startDataCollection() {
    this.dataInterval = setInterval(() => {
      if (this.isConnected && this.simConnect) {
        this.simConnect.requestDataOnSimObject(0, 0, 0, 1, 0);
      }
    }, CONFIG.DATA_INTERVAL);
  }

  private stopDataCollection() {
    if (this.dataInterval) {
      clearInterval(this.dataInterval);
      this.dataInterval = null;
    }
  }

  private processFlightData(rawData: any) {
    try {
      // Extrair dados do buffer corretamente
      const buffer = rawData.data;
      if (!buffer || !buffer.readDouble) {
        console.log('❌ Buffer inválido ou sem dados');
        return;
      }
      
      // Ler dados na ordem definida em requestDataDefinitions
      const latitude = buffer.readDouble();     // PLANE LATITUDE
      const longitude = buffer.readDouble();    // PLANE LONGITUDE  
      const altitude = buffer.readDouble();     // PLANE ALTITUDE
      const speed = buffer.readDouble();        // AIRSPEED INDICATED
      const onGround = buffer.readInt() === 1;  // SIM ON GROUND (boolean)
      
      // Para TITLE (string), vamos pular por enquanto e usar um valor fixo
      let aircraft = 'Aircraft';
      
      // Calcular e pular os bytes da string TITLE
      const currentOffset = buffer.buffer.offset;
      const remainingBytes = buffer.buffer.limit - currentOffset;
      
      // Se temos 16 bytes restantes (2 doubles), a string ocupa o espaço entre
      const stringSize = remainingBytes - 16; // 2 doubles = 16 bytes
      if (stringSize > 0) {
        buffer.buffer.offset += stringSize;
      }
      
      const heading = buffer.readDouble();      // PLANE HEADING DEGREES TRUE
      const verticalSpeed = buffer.readDouble(); // VERTICAL SPEED
      
      const flightData: FlightData = {
        latitude: latitude || 0,
        longitude: longitude || 0,
        altitude: altitude || 0,
        speed: speed || 0,
        onGround: onGround,
        aircraft: aircraft,
        heading: heading || 0,
        verticalSpeed: verticalSpeed || 0,
        timestamp: Date.now(),
      };

      this.lastData = flightData;
      this.detectFlightPhase(flightData);
      this.broadcastData(flightData);
      
    } catch (error) {
      console.error('❌ Erro ao processar dados de voo:', error);
    }
  }

  // ============================================
  // DETECÇÃO DE FASES DE VOO
  // ============================================

  private detectFlightPhase(data: FlightData) {
    const { MIN_SPEED_TAKEOFF, MIN_SPEED_LANDING, MIN_ALTITUDE_FLIGHT } = CONFIG.FLIGHT_DETECTION;

    // Detectar início de voo
    if (!this.isFlying && !data.onGround && data.speed > MIN_SPEED_TAKEOFF && data.altitude > MIN_ALTITUDE_FLIGHT) {
      this.startFlight(data);
    }

    // Detectar fim de voo
    if (this.isFlying && data.onGround && data.speed < MIN_SPEED_LANDING) {
      this.endFlight(data);
    }

    // Atualizar dados do voo atual
    if (this.isFlying && this.currentFlight) {
      this.updateCurrentFlight(data);
    }
  }

  private startFlight(data: FlightData) {
    console.log('🛫 Início de voo detectado!');
    
    this.isFlying = true;
    this.currentFlight = {
      aircraft: data.aircraft,
      startTime: data.timestamp,
      departureLatLon: [data.latitude, data.longitude],
      maxAltitude: data.altitude,
      maxSpeed: data.speed,
      distance: 0,
    };

    this.broadcastEvent('flightStart', this.currentFlight);
  }

  private updateCurrentFlight(data: FlightData) {
    if (!this.currentFlight) return;

    // Atualizar máximos
    this.currentFlight.maxAltitude = Math.max(this.currentFlight.maxAltitude, data.altitude);
    this.currentFlight.maxSpeed = Math.max(this.currentFlight.maxSpeed, data.speed);

    // Calcular distância (aproximada)
    if (this.lastData) {
      const distance = this.calculateDistance(
        this.lastData.latitude, this.lastData.longitude,
        data.latitude, data.longitude
      );
      this.currentFlight.distance += distance;
    }
  }

  private endFlight(data: FlightData) {
    if (!this.currentFlight) return;

    console.log('🛬 Fim de voo detectado!');
    
    this.isFlying = false;
    this.currentFlight.endTime = data.timestamp;
    this.currentFlight.arrivalLatLon = [data.latitude, data.longitude];
    this.currentFlight.duration = this.currentFlight.endTime - this.currentFlight.startTime;

    // Enviar para o backend
    this.sendFlightToBackend(this.currentFlight);
    
    this.broadcastEvent('flightEnd', this.currentFlight);
    this.currentFlight = null;
  }

  // ============================================
  // COMUNICAÇÃO COM BACKEND
  // ============================================

  private async sendFlightToBackend(flight: FlightLog) {
    try {
      console.log('📤 Enviando voo para o backend...');
      
      const response = await axios.post(`${CONFIG.BACKEND_URL}/api/msfs/logbook`, {
        aircraft: flight.aircraft,
        startTime: new Date(flight.startTime).toISOString(),
        endTime: new Date(flight.endTime!).toISOString(),
        departureLatLon: flight.departureLatLon,
        arrivalLatLon: flight.arrivalLatLon,
        maxAltitude: flight.maxAltitude,
        maxSpeed: flight.maxSpeed,
        distance: flight.distance,
        duration: flight.duration,
      });

      console.log('✅ Voo enviado com sucesso:', response.data);
      this.broadcastEvent('flightSaved', response.data);
      
    } catch (error) {
      console.error('❌ Erro ao enviar voo para o backend:', error);
      this.broadcastEvent('flightSaveError', { error: error.message });
    }
  }

  // ============================================
  // UTILITÁRIOS
  // ============================================

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Raio da Terra em km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  // ============================================
  // COMUNICAÇÃO WEBSOCKET
  // ============================================

  private broadcastStatus() {
    this.broadcast({
      type: 'status',
      data: {
        connected: this.isConnected,
        flying: this.isFlying,
        currentFlight: this.currentFlight,
      }
    });
  }

  private broadcastData(data: FlightData) {
    this.broadcast({
      type: 'telemetry',
      data: data
    });
  }

  private broadcastEvent(event: string, data: any) {
    this.broadcast({
      type: 'event',
      event: event,
      data: data
    });
  }

  private broadcast(message: any) {
    const messageStr = JSON.stringify(message);
    this.clients.forEach(client => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(messageStr);
      }
    });
  }

  // ============================================
  // CONTROLE DE CONEXÃO
  // ============================================

  private async connectToMSFS() {
    try {
      if (!this.isConnected) {
        console.log('🔄 Tentando conectar ao MSFS...');
        
        const connection = await open('Flight Log Opus Companion', Protocol.KittyHawk);
        this.simConnect = connection.handle;
        
        console.log('✅ Conectado ao MSFS via SimConnect');
        console.log('Informações do simulador:', connection.recvOpen);
        
        this.isConnected = true;
        this.setupSimConnectEvents();
        this.broadcastStatus();
        this.requestDataDefinitions();
        this.startDataCollection();
      }
    } catch (error) {
      console.error('❌ Erro ao conectar:', error);
    }
  }

  private disconnect() {
    if (this.isConnected && this.simConnect) {
      this.simConnect.close();
    }
  }

  // ============================================
  // INICIALIZAÇÃO
  // ============================================

  public start() {
    console.log('🚀 Iniciando MSFS Companion Service...');
    console.log(`📊 Status: http://localhost:${CONFIG.EXPRESS_PORT}/status`);
    console.log(`🌐 WebSocket: ws://localhost:${CONFIG.WS_PORT}`);
    console.log('⚠️  Certifique-se de que o MSFS 2024 está rodando!');
  }
}

// ============================================
// INICIALIZAÇÃO
// ============================================

const companion = new MSFSCompanion();
companion.start();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Encerrando Companion Service...');
  process.exit(0);
});

export default MSFSCompanion;