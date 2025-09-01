/**
 * MSFS 2024 Companion Service
 * Conecta com Microsoft Flight Simulator via SimConnect para capturar telemetria
 * e enviar dados de voo para o backend do Flight Log Opus
 */

import { open, Protocol, ConnectionHandle } from 'node-simconnect';
import axios from 'axios';
import express from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';

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
  
  // Flight Tracking WebSocket
  FLIGHT_TRACKING_WS: process.env.FLIGHT_TRACKING_WS || 'ws://localhost:3001/flight-tracking',
  DEVICE_TOKEN: process.env.DEVICE_TOKEN || '',
  
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
  // Posição
  latitude: number;           // LAT - Latitude em graus
  longitude: number;          // LON - Longitude em graus
  altitude: number;           // ALT - Altitude em pés
  
  // Velocidades
  groundSpeed: number;        // GS - Ground Speed em knots
  indicatedAirspeed: number;  // IAS - Indicated Airspeed em knots
  verticalSpeed: number;      // VS - Vertical Speed em pés/min
  
  // Orientação
  heading: number;            // HDG - Heading magnético em graus
  
  // Estado
  onGround: boolean;          // OnGround - Se a aeronave está no solo
  
  // Metadados
  aircraft: string;
  timestamp: number;
  
  // Dados adicionais para análise
  trueAirspeed?: number;
  windSpeed?: number;
  windDirection?: number;
  fuelQuantity?: number;
  engineRPM?: number;
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
  
  // Flight Tracking WebSocket
  private flightTrackingWS: WebSocket | null = null;
  private isFlightTrackingConnected = false;
  private currentSessionId: string | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.setupExpress();
    this.setupWebSocket();
    this.setupSimConnect();
    this.connectToFlightTracking();
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

    // Definir estrutura de dados que queremos receber
    this.simConnect.addToDataDefinition(
      'FlightData',
      'PLANE LATITUDE',
      'degrees',
      Protocol.SIMCONNECT_DATATYPE_FLOAT64
    );
    
    this.simConnect.addToDataDefinition(
      'FlightData',
      'PLANE LONGITUDE', 
      'degrees',
      Protocol.SIMCONNECT_DATATYPE_FLOAT64
    );
    
    this.simConnect.addToDataDefinition(
      'FlightData',
      'PLANE ALTITUDE',
      'feet',
      Protocol.SIMCONNECT_DATATYPE_FLOAT64
    );
    
    this.simConnect.addToDataDefinition(
      'FlightData',
      'GROUND VELOCITY',
      'knots',
      Protocol.SIMCONNECT_DATATYPE_FLOAT64
    );
    
    this.simConnect.addToDataDefinition(
      'FlightData',
      'AIRSPEED INDICATED',
      'knots', 
      Protocol.SIMCONNECT_DATATYPE_FLOAT64
    );
    
    this.simConnect.addToDataDefinition(
      'FlightData',
      'VERTICAL SPEED',
      'feet per minute',
      Protocol.SIMCONNECT_DATATYPE_FLOAT64
    );
    
    this.simConnect.addToDataDefinition(
      'FlightData',
      'PLANE HEADING DEGREES MAGNETIC',
      'degrees',
      Protocol.SIMCONNECT_DATATYPE_FLOAT64
    );
    
    this.simConnect.addToDataDefinition(
      'FlightData',
      'SIM ON GROUND',
      'bool',
      Protocol.SIMCONNECT_DATATYPE_INT32
    );
    
    this.simConnect.addToDataDefinition(
      'FlightData',
      'TITLE',
      null,
      Protocol.SIMCONNECT_DATATYPE_STRING256
    );
    
    // Dados adicionais para análise
    this.simConnect.addToDataDefinition(
      'FlightData',
      'AIRSPEED TRUE',
      'knots',
      Protocol.SIMCONNECT_DATATYPE_FLOAT64
    );
    
    this.simConnect.addToDataDefinition(
      'FlightData',
      'AMBIENT WIND VELOCITY',
      'knots',
      Protocol.SIMCONNECT_DATATYPE_FLOAT64
    );
    
    this.simConnect.addToDataDefinition(
      'FlightData',
      'AMBIENT WIND DIRECTION',
      'degrees',
      Protocol.SIMCONNECT_DATATYPE_FLOAT64
    );
    
    this.simConnect.addToDataDefinition(
      'FlightData',
      'FUEL TOTAL QUANTITY',
      'gallons',
      Protocol.SIMCONNECT_DATATYPE_FLOAT64
    );
    
    this.simConnect.addToDataDefinition(
      'FlightData',
      'GENERAL ENG RPM:1',
      'rpm',
      Protocol.SIMCONNECT_DATATYPE_FLOAT64
    );

    // Solicitar dados a cada frame do simulador
    this.simConnect.requestDataOnSimObject(
      'FlightData',
      'FlightData',
      0, // User aircraft
      Protocol.SIMCONNECT_PERIOD_SIM_FRAME,
      Protocol.SIMCONNECT_DATA_REQUEST_FLAG_CHANGED
    );
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
      // Mapear dados do SimConnect para nossa estrutura
      const data: FlightData = {
        // Posição
        latitude: rawData[0] || 0,           // PLANE LATITUDE
        longitude: rawData[1] || 0,          // PLANE LONGITUDE  
        altitude: rawData[2] || 0,           // PLANE ALTITUDE
        
        // Velocidades
        groundSpeed: rawData[3] || 0,        // GROUND VELOCITY
        indicatedAirspeed: rawData[4] || 0,  // AIRSPEED INDICATED
        verticalSpeed: rawData[5] || 0,      // VERTICAL SPEED
        
        // Orientação
        heading: rawData[6] || 0,            // PLANE HEADING DEGREES MAGNETIC
        
        // Estado
        onGround: Boolean(rawData[7]),       // SIM ON GROUND
        
        // Metadados
        aircraft: rawData[8] || 'Unknown',   // TITLE
        timestamp: Date.now(),
        
        // Dados adicionais
        trueAirspeed: rawData[9] || 0,       // AIRSPEED TRUE
        windSpeed: rawData[10] || 0,         // AMBIENT WIND VELOCITY
        windDirection: rawData[11] || 0,     // AMBIENT WIND DIRECTION
        fuelQuantity: rawData[12] || 0,      // FUEL TOTAL QUANTITY
        engineRPM: rawData[13] || 0,         // GENERAL ENG RPM:1
      };

      this.lastData = data;
      this.detectFlightPhase(data);
      this.broadcastData(data);

      // Log para debug com dados expandidos
      if (process.env.NODE_ENV === 'development') {
        console.log(`Flight Data: ${data.aircraft}`);
        console.log(`  Position: ${data.latitude.toFixed(6)}, ${data.longitude.toFixed(6)} @ ${data.altitude}ft`);
        console.log(`  Speed: GS=${data.groundSpeed}kts, IAS=${data.indicatedAirspeed}kts, VS=${data.verticalSpeed}fpm`);
        console.log(`  Heading: ${data.heading}°, OnGround: ${data.onGround}`);
        console.log(`  Wind: ${data.windSpeed}kts @ ${data.windDirection}°, Fuel: ${data.fuelQuantity}gal`);
      }
    } catch (error) {
      console.error('❌ Erro ao processar dados de voo:', error);
    }
  }

  // ============================================
  // DETECÇÃO DE FASES DE VOO
  // ============================================

  private detectFlightPhase(data: FlightData) {
    const { groundSpeed, indicatedAirspeed, onGround, altitude } = data;
    const config = CONFIG.FLIGHT_DETECTION;

    // Usar ground speed para detecção mais precisa
    const effectiveSpeed = Math.max(groundSpeed, indicatedAirspeed);

    // Detectar início de voo (takeoff)
    if (!this.isFlying && !onGround && effectiveSpeed > config.MIN_SPEED_TAKEOFF && altitude > config.MIN_ALTITUDE_FLIGHT) {
      this.startFlight(data);
      this.broadcastEvent('flight_started', {
        aircraft: data.aircraft,
        position: [data.latitude, data.longitude],
        altitude: data.altitude,
        timestamp: data.timestamp
      });
    }

    // Detectar fim de voo (landing)
    if (this.isFlying && onGround && effectiveSpeed < config.MIN_SPEED_LANDING) {
      this.endFlight(data);
      this.broadcastEvent('flight_ended', {
        aircraft: data.aircraft,
        position: [data.latitude, data.longitude],
        flightTime: this.currentFlight?.duration || 0,
        timestamp: data.timestamp
      });
    }

    // Atualizar dados do voo atual
    if (this.isFlying && this.currentFlight) {
      this.updateCurrentFlight(data);
    }
  }

  private startFlight(data: FlightData) {
    console.log('🛫 Iniciando voo:', data.aircraft);
    
    this.isFlying = true;
    this.currentFlight = {
      aircraft: data.aircraft,
      startTime: data.timestamp,
      departureLatLon: [data.latitude, data.longitude],
      maxAltitude: data.altitude,
      maxSpeed: Math.max(data.groundSpeed, data.indicatedAirspeed),
      distance: 0,
    };

    // Log detalhado do início do voo
    console.log(`  Posição inicial: ${data.latitude.toFixed(6)}, ${data.longitude.toFixed(6)}`);
    console.log(`  Altitude inicial: ${data.altitude}ft`);
    console.log(`  Velocidade inicial: GS=${data.groundSpeed}kts, IAS=${data.indicatedAirspeed}kts`);
    
    // Enviar para Flight Tracking WebSocket
    if (this.isFlightTrackingConnected) {
      this.sendToFlightTracking({
        type: 'start_flight',
        data: {
          aircraft: data.aircraft,
          latitude: data.latitude,
          longitude: data.longitude
        }
      });
    }
  }

  private updateCurrentFlight(data: FlightData) {
    if (!this.currentFlight) return;

    const currentSpeed = Math.max(data.groundSpeed, data.indicatedAirspeed);

    // Atualizar máximos
    this.currentFlight.maxAltitude = Math.max(this.currentFlight.maxAltitude, data.altitude);
    this.currentFlight.maxSpeed = Math.max(this.currentFlight.maxSpeed, currentSpeed);

    // Calcular distância percorrida
    if (this.lastData) {
      const distance = this.calculateDistance(
        this.lastData.latitude,
        this.lastData.longitude,
        data.latitude,
        data.longitude
      );
      this.currentFlight.distance += distance;
    }

    // Broadcast de atualização de voo em tempo real
    this.broadcastEvent('flight_update', {
      flightTime: data.timestamp - this.currentFlight.startTime,
      distance: this.currentFlight.distance,
      altitude: data.altitude,
      speed: currentSpeed,
      position: [data.latitude, data.longitude],
      heading: data.heading,
      verticalSpeed: data.verticalSpeed,
      fuel: data.fuelQuantity
    });
    
    // Enviar telemetria para Flight Tracking WebSocket
     if (this.isFlightTrackingConnected && this.currentSessionId) {
       this.sendToFlightTracking({
         type: 'flight_data',
         data: {
           sessionId: this.currentSessionId,
           latitude: data.latitude,
           longitude: data.longitude,
           altitude: data.altitude,
           groundSpeed: data.groundSpeed,
           indicatedAirspeed: data.indicatedAirspeed,
           verticalSpeed: data.verticalSpeed,
           heading: data.heading,
           onGround: data.onGround,
           aircraft: data.aircraft,
           timestamp: data.timestamp,
           trueAirspeed: data.trueAirspeed,
           windSpeed: data.windSpeed,
           windDirection: data.windDirection,
           fuelQuantity: data.fuelQuantity,
           engineRPM: data.engineRPM
         }
       });
     }
  }

  private endFlight(data: FlightData) {
    if (!this.currentFlight) return;

    console.log('🛬 Fim de voo detectado!');
    
    this.isFlying = false;
    this.currentFlight.endTime = data.timestamp;
    this.currentFlight.arrivalLatLon = [data.latitude, data.longitude];
    this.currentFlight.duration = this.currentFlight.endTime - this.currentFlight.startTime;

    // Enviar para Flight Tracking WebSocket
    if (this.isFlightTrackingConnected && this.currentSessionId) {
      this.sendToFlightTracking({
        type: 'end_flight',
        sessionId: this.currentSessionId,
        data: {
          aircraft: data.aircraft,
          latitude: data.latitude,
          longitude: data.longitude,
          duration: this.currentFlight.duration,
          distance: this.currentFlight.distance,
          maxAltitude: this.currentFlight.maxAltitude,
          maxSpeed: this.currentFlight.maxSpeed
        }
      });
    }
    
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
      if (client.readyState === client.OPEN) {
        client.send(messageStr);
      } else {
        this.clients.delete(client);
      }
    });
  }
  
  // ============================================
  // FLIGHT TRACKING WEBSOCKET
  // ============================================
  
  private connectToFlightTracking() {
    if (!CONFIG.DEVICE_TOKEN) {
      console.log('⚠️  DEVICE_TOKEN não configurado, pulando conexão com Flight Tracking');
      return;
    }
    
    console.log('🔌 Conectando ao Flight Tracking WebSocket...');
    
    try {
      this.flightTrackingWS = new WebSocket(CONFIG.FLIGHT_TRACKING_WS);
      
      this.flightTrackingWS.on('open', () => {
        console.log('✅ Conectado ao Flight Tracking WebSocket');
        
        // Autenticar
        this.sendToFlightTracking({
          type: 'auth',
          deviceToken: CONFIG.DEVICE_TOKEN
        });
      });
      
      this.flightTrackingWS.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleFlightTrackingMessage(message);
        } catch (error) {
          console.error('Erro ao processar mensagem do Flight Tracking:', error);
        }
      });
      
      this.flightTrackingWS.on('close', (code, reason) => {
        console.log(`🔌 Conexão Flight Tracking fechada: ${code} - ${reason}`);
        this.isFlightTrackingConnected = false;
        this.currentSessionId = null;
        
        // Reconectar após 5 segundos
        this.reconnectTimeout = setTimeout(() => {
          this.connectToFlightTracking();
        }, 5000);
      });
      
      this.flightTrackingWS.on('error', (error) => {
        console.error('❌ Erro no Flight Tracking WebSocket:', error);
      });
      
    } catch (error) {
      console.error('❌ Erro ao conectar Flight Tracking WebSocket:', error);
      
      // Tentar reconectar após 10 segundos
      this.reconnectTimeout = setTimeout(() => {
        this.connectToFlightTracking();
      }, 10000);
    }
  }
  
  private handleFlightTrackingMessage(message: any) {
    switch (message.type) {
      case 'auth_success':
        console.log(`✅ Autenticado no Flight Tracking: ${message.deviceName}`);
        this.isFlightTrackingConnected = true;
        break;
        
      case 'auth_error':
        console.error(`❌ Erro de autenticação Flight Tracking: ${message.message}`);
        break;
        
      case 'flight_started':
        console.log(`🛫 Sessão de voo iniciada: ${message.sessionId}`);
        this.currentSessionId = message.sessionId;
        break;
        
      case 'flight_ended':
        console.log(`🛬 Sessão de voo finalizada: ${message.sessionId}`);
        this.currentSessionId = null;
        break;
        
      case 'error':
        console.error(`❌ Erro Flight Tracking: ${message.message}`);
        break;
        
      case 'pong':
        // Resposta ao ping
        break;
        
      default:
        console.log('📨 Mensagem Flight Tracking não reconhecida:', message.type);
    }
  }
  
  private sendToFlightTracking(message: any) {
    if (this.flightTrackingWS && this.flightTrackingWS.readyState === WebSocket.OPEN) {
      this.flightTrackingWS.send(JSON.stringify(message));
    }
  }
  
  private disconnectFlightTracking() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.flightTrackingWS) {
      this.flightTrackingWS.close();
      this.flightTrackingWS = null;
    }
    
    this.isFlightTrackingConnected = false;
    this.currentSessionId = null;
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
    if (this.dataInterval) {
      clearInterval(this.dataInterval);
      this.dataInterval = null;
    }
    
    if (this.simConnect) {
      this.simConnect.close();
      this.simConnect = null;
    }
    
    // Desconectar Flight Tracking WebSocket
    this.disconnectFlightTracking();
    
    this.isConnected = false;
    console.log('🔌 Desconectado do MSFS');
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