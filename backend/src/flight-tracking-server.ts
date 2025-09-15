/**
 * Flight Tracking Server - MVP Sprint 1
 * Servidor principal para o sistema de tracking de voos MSFS
 */

import dotenv from 'dotenv';
import { flightTrackingService } from './services/flightTrackingService';

// Carregar variáveis de ambiente
dotenv.config();

// Configurações
const PORT = process.env.FLIGHT_TRACKING_PORT ? parseInt(process.env.FLIGHT_TRACKING_PORT) : 8081;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Validar variáveis de ambiente obrigatórias
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Variáveis de ambiente obrigatórias não encontradas:');
  missingEnvVars.forEach(envVar => console.error(`   - ${envVar}`));
  console.error('\nCrie um arquivo .env com as variáveis necessárias.');
  process.exit(1);
}

// Handlers de processo
process.on('SIGINT', () => {
  console.log('\n🛑 Recebido SIGINT, parando servidor...');
  flightTrackingService.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Recebido SIGTERM, parando servidor...');
  flightTrackingService.stop();
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  flightTrackingService.stop();
  process.exit(1);
});

// Inicializar servidor
console.log('🚀 Iniciando Flight Tracking Server...');
console.log(`📊 Ambiente: ${NODE_ENV}`);
console.log(`🔌 Porta: ${PORT}`);
console.log(`🗄️  Supabase URL: ${process.env.SUPABASE_URL}`);

flightTrackingService.start(PORT);

console.log('✅ Servidor iniciado com sucesso!');
console.log('\n📋 Endpoints disponíveis:');
console.log(`   - Health Check: http://localhost:${PORT}/health`);
console.log(`   - Register Device: POST http://localhost:${PORT}/devices/register`);
console.log(`   - List Flights: GET http://localhost:${PORT}/flights/:userId`);
console.log(`   - Flight Details: GET http://localhost:${PORT}/flights/:userId/:sessionId`);
console.log(`   - WebSocket: ws://localhost:${PORT}/flight-tracking`);
console.log('\n🔧 Para parar o servidor: Ctrl+C');