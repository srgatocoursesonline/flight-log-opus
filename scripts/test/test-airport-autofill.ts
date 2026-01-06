/**
 * Script de teste para validar o sistema de preenchimento automático de aeroportos
 * Executa testes de integração e validação completa
 */

import { 
  autoFillAirportInfo, 
  autoFillFlightAirports, 
  validateIcaoCode,
  clearAirportCache,
  getCacheStats,
  getAuditLogs,
  exportAuditLogs
} from '../src/lib/airportAutoFillService';

// Códigos ICAO de teste conhecidos
const TEST_AIRPORTS = [
  { code: 'SBGR', name: 'Guarulhos', country: 'BR' },
  { code: 'SBGL', name: 'Galeão', country: 'BR' },
  { code: 'KJFK', name: 'John F. Kennedy', country: 'US' },
  { code: 'EGLL', name: 'Heathrow', country: 'GB' },
  { code: 'LFPG', name: 'Charles de Gaulle', country: 'FR' },
  { code: 'EDDF', name: 'Frankfurt', country: 'DE' },
  { code: 'XXXX', name: 'Invalid', country: null } // Código inválido para teste de erro
];

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

function log(message: string, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message: string) {
  log(`✅ ${message}`, colors.green);
}

function logError(message: string) {
  log(`❌ ${message}`, colors.red);
}

function logInfo(message: string) {
  log(`ℹ️  ${message}`, colors.blue);
}

function logWarning(message: string) {
  log(`⚠️  ${message}`, colors.yellow);
}

async function testValidation() {
  log('\n🧪 TESTANDO VALIDAÇÃO DE CÓDIGOS ICAO', colors.bright);
  
  const testCases = [
    { code: 'SBGR', expected: true },
    { code: 'KJFK', expected: true },
    { code: 'EGLL', expected: true },
    { code: 'sbgr', expected: true }, // lowercase
    { code: 'SB12', expected: false }, // números
    { code: 'SBGRX', expected: false }, // 5 caracteres
    { code: 'SB', expected: false }, // 2 caracteres
    { code: '', expected: false }, // vazio
  ];

  for (const testCase of testCases) {
    const result = validateIcaoCode(testCase.code);
    const passed = result.valid === testCase.expected;
    
    if (passed) {
      logSuccess(`Validação ${testCase.code}: ${result.valid ? 'VÁLIDO' : 'INVÁLIDO'}`);
    } else {
      logError(`Validação ${testCase.code}: Esperado ${testCase.expected}, obtido ${result.valid}`);
    }
  }
}

async function testSingleAirportFetch() {
  log('\n🛫 TESTANDO BUSCA DE AEROPORTOS INDIVIDUAIS', colors.bright);
  
  for (const airport of TEST_AIRPORTS) {
    try {
      const startTime = Date.now();
      const result = await autoFillAirportInfo(airport.code, { enableLogging: true });
      const responseTime = Date.now() - startTime;
      
      if (result.success && result.data) {
        logSuccess(`${airport.code}: ${result.data.name} (${responseTime}ms)`);
        
        // Validar dados
        if (result.data.icao_code !== airport.code) {
          logError(`Código ICAO não corresponde: esperado ${airport.code}, obtido ${result.data.icao_code}`);
        }
        
        if (airport.country && result.data.country_code !== airport.country) {
          logWarning(`País diferente do esperado: ${result.data.country_code} vs ${airport.country}`);
        }
      } else {
        if (airport.code === 'XXXX') {
          logSuccess(`${airport.code}: Falha esperada - ${result.error}`);
        } else {
          logError(`${airport.code}: ${result.error}`);
        }
      }
    } catch (error) {
      logError(`${airport.code}: Erro inesperado - ${error}`);
    }
  }
}

async function testFlightAirports() {
  log('\n✈️ TESTANDO BUSCA DE PARES DE AEROPORTOS', colors.bright);
  
  const flightTests = [
    { departure: 'SBGR', arrival: 'SBGL', description: 'Guarulhos → Galeão' },
    { departure: 'KJFK', arrival: 'EGLL', description: 'JFK → Heathrow' },
    { departure: 'LFPG', arrival: 'EDDF', description: 'CDG → Frankfurt' },
    { departure: 'SBGR', arrival: 'XXXX', description: 'Guarulhos → Inválido' },
  ];

  for (const flight of flightTests) {
    try {
      const startTime = Date.now();
      const result = await autoFillFlightAirports(flight.departure, flight.arrival, { enableLogging: true });
      const responseTime = Date.now() - startTime;
      
      if (result.success && result.origin && result.destination) {
        logSuccess(`${flight.description}: ${result.origin.name} → ${result.destination.destination} (${responseTime}ms)`);
      } else {
        if (flight.arrival === 'XXXX') {
          logSuccess(`${flight.description}: Falha esperada - ${result.errors.join(', ')}`);
        } else {
          logError(`${flight.description}: ${result.errors.join(', ')}`);
        }
      }
    } catch (error) {
      logError(`${flight.description}: Erro inesperado - ${error}`);
    }
  }
}

async function testCachePerformance() {
  log('\n⚡ TESTANDO PERFORMANCE DO CACHE', colors.bright);
  
  // Limpar cache
  clearAirportCache();
  
  const testCode = 'SBGR';
  
  // Primeira chamada (sem cache)
  const start1 = Date.now();
  await autoFillAirportInfo(testCode);
  const time1 = Date.now() - start1;
  
  // Segunda chamada (com cache)
  const start2 = Date.now();
  await autoFillAirportInfo(testCode);
  const time2 = Date.now() - start2;
  
  logInfo(`Primeira chamada (sem cache): ${time1}ms`);
  logInfo(`Segunda chamada (com cache): ${time2}ms`);
  
  if (time2 < time1) {
    logSuccess(`Cache melhorou performance em ${Math.round((1 - time2/time1) * 100)}%`);
  } else {
    logWarning('Cache não melhorou performance significativamente');
  }
  
  const stats = getCacheStats();
  logInfo(`Cache stats: ${stats.cacheSize} aeroportos, mais antigo: ${stats.oldestEntry}ms, mais novo: ${stats.newestEntry}ms`);
}

async function testAuditLogs() {
  log('\n📋 TESTANDO SISTEMA DE LOGS', colors.bright);
  
  // Executar algumas operações para gerar logs
  await autoFillAirportInfo('SBGR');
  await autoFillAirportInfo('XXXX'); // Falha esperada
  await autoFillFlightAirports('SBGR', 'SBGL');
  
  const logs = getAuditLogs(10);
  logInfo(`Total de logs: ${logs.length}`);
  
  if (logs.length > 0) {
    logSuccess('Sistema de logs está funcionando');
    
    // Testar exportação
    try {
      const exportedLogs = exportAuditLogs();
      const parsedLogs = JSON.parse(exportedLogs);
      logSuccess(`Exportação de logs: ${parsedLogs.length} entradas`);
    } catch (error) {
      logError('Erro ao exportar logs');
    }
  } else {
    logError('Nenhum log encontrado');
  }
}

async function runAllTests() {
  log('\n' + '='.repeat(60), colors.bright);
  log('🚀 INICIANDO TESTES DO SISTEMA DE PREENCHIMENTO AUTOMÁTICO DE AEROPORTOS', colors.bright);
  log('='.repeat(60), colors.bright);
  
  const startTime = Date.now();
  
  try {
    await testValidation();
    await testSingleAirportFetch();
    await testFlightAirports();
    await testCachePerformance();
    await testAuditLogs();
    
    const totalTime = Date.now() - startTime;
    
    log('\n' + '='.repeat(60), colors.bright);
    log(`✅ TODOS OS TESTES CONCLUÍDOS EM ${totalTime}ms`, colors.green);
    log('='.repeat(60), colors.bright);
    
  } catch (error) {
    logError(`Erro durante execução dos testes: ${error}`);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runAllTests().catch(console.error);
}

export { runAllTests };