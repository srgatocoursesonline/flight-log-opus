/**
 * Flight Log Opus Backend Server
 * Servidor Express para receber dados do MSFS Companion e servir APIs
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { WebSocketServer, WebSocket } from 'ws';

// Importar rotas
import msfsRoutes from './routes/msfs.js';

// Carregar variáveis de ambiente
dotenv.config();

// ============================================
// CONFIGURAÇÕES
// ============================================

const CONFIG = {
  PORT: process.env.PORT || 8080,
  WS_PORT: process.env.WS_PORT || 3003,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Supabase
  SUPABASE_URL: process.env.SUPABASE_URL!,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  
  // Rate limiting
  RATE_LIMIT: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por IP
  },
};

// ============================================
// INICIALIZAÇÃO
// ============================================

class FlightLogServer {
  private app: express.Application;
  private wsServer!: WebSocketServer;
  private supabase: SupabaseClient | null = null;
  private clients: Set<WebSocket> = new Set();

  constructor() {
    this.app = express();
    this.setupSupabase();
    this.setupMiddlewares();
    this.setupRoutes();
    this.setupWebSocket();
    this.setupErrorHandling();
  }

  // ============================================
  // SETUP SUPABASE
  // ============================================

  private setupSupabase() {
    try {
      // Verificar se as credenciais do Supabase estão configuradas
      if (!CONFIG.SUPABASE_URL || CONFIG.SUPABASE_URL.includes('placeholder') ||
          !CONFIG.SUPABASE_SERVICE_KEY || CONFIG.SUPABASE_SERVICE_KEY.includes('placeholder')) {
        console.warn('⚠️  Credenciais do Supabase não configuradas. Servidor iniciando em modo mock.');
        this.supabase = null;
        this.app.locals.supabase = null;
        return;
      }

      this.supabase = createClient(
        CONFIG.SUPABASE_URL,
        CONFIG.SUPABASE_SERVICE_KEY
      );
      
      // Disponibilizar para as rotas
      this.app.locals.supabase = this.supabase;
      
      console.log('✅ Supabase client inicializado');
    } catch (error) {
      console.error('❌ Erro ao inicializar Supabase:', error);
      console.warn('⚠️  Servidor iniciando sem conexão com Supabase');
      this.supabase = null;
      this.app.locals.supabase = null;
    }
  }

  // ============================================
  // MIDDLEWARES
  // ============================================

  private setupMiddlewares() {
    // Segurança
    this.app.use(helmet());
    
    // CORS
    this.app.use(cors({
      origin: CONFIG.NODE_ENV === 'production' 
        ? ['https://flight-log-opus.pages.dev'] 
        : ['http://localhost:8080', 'http://localhost:3001'],
      credentials: true,
    }));
    
    // Compressão
    this.app.use(compression());
    
    // Rate limiting
    const limiter = rateLimit(CONFIG.RATE_LIMIT);
    this.app.use('/api/', limiter);
    
    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    
    // Logging
    if (CONFIG.NODE_ENV === 'development') {
      this.app.use((req, _res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
      });
    }
  }

  // ============================================
  // ROTAS
  // ============================================

  private setupRoutes() {
    // Health check
    this.app.get('/health', (_req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: CONFIG.NODE_ENV,
      });
    });

    // API routes
    this.app.use('/api/msfs', msfsRoutes);

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Endpoint não encontrado',
        path: req.originalUrl,
      });
    });
  }

  // ============================================
  // WEBSOCKET
  // ============================================

  private setupWebSocket() {
    this.wsServer = new WebSocketServer({ port: Number(CONFIG.WS_PORT) });
    
    this.wsServer.on('connection', (ws, req) => {
      console.log('📡 Cliente WebSocket conectado:', req.socket.remoteAddress);
      this.clients.add(ws);
      
      // Enviar mensagem de boas-vindas
      ws.send(JSON.stringify({
        type: 'welcome',
        message: 'Conectado ao Flight Log Opus Backend',
        timestamp: new Date().toISOString(),
      }));
      
      ws.on('close', () => {
        this.clients.delete(ws);
        console.log('📡 Cliente WebSocket desconectado');
      });
      
      ws.on('error', (error) => {
        console.error('❌ Erro WebSocket:', error);
        this.clients.delete(ws);
      });
    });
    
    // Disponibilizar WebSocket para as rotas
    this.app.locals.wsClients = this.clients;
    
    console.log(`🌐 WebSocket Server rodando na porta ${CONFIG.WS_PORT}`);
  }

  // ============================================
  // ERROR HANDLING
  // ============================================

  private setupErrorHandling() {
    // Error handler
    this.app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      console.error('❌ Erro no servidor:', error);
      
      res.status(error.status || 500).json({
        error: CONFIG.NODE_ENV === 'production' 
          ? 'Erro interno do servidor' 
          : error.message,
        timestamp: new Date().toISOString(),
        path: _req.path,
      });
    });

    // Uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      process.exit(1);
    });

    // Unhandled rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });
  }

  // ============================================
  // BROADCAST WEBSOCKET
  // ============================================

  public broadcast(message: Record<string, unknown>) {
    const messageStr = JSON.stringify(message);
    this.clients.forEach(client => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(messageStr);
      }
    });
  }

  // ============================================
  // START SERVER
  // ============================================

  public start() {
    this.app.listen(CONFIG.PORT, () => {
      console.log('🚀 Flight Log Opus Backend iniciado!');
      console.log(`📊 API Server: http://localhost:${CONFIG.PORT}`);
      console.log(`🌐 WebSocket: ws://localhost:${CONFIG.WS_PORT}`);
      console.log(`🌍 Ambiente: ${CONFIG.NODE_ENV}`);
      console.log('\n📋 Endpoints disponíveis:');
      console.log('  GET  /health - Health check');
      console.log('  POST /api/msfs/logbook - Receber dados do MSFS');
      console.log('  GET  /api/airports/nearest - Buscar aeroporto mais próximo');
      console.log('  GET  /api/flights - Listar voos');
    });
  }
}

// ============================================
// INICIALIZAÇÃO
// ============================================

// Iniciar servidor se executado diretamente
const server = new FlightLogServer();
server.start();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Encerrando servidor...');
  process.exit(0);
});

export default FlightLogServer;