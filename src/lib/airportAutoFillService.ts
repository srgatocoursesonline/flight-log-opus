/**
 * Serviço de preenchimento automático de aeroportos
 * Responsável por capturar automaticamente nomes dos aeroportos durante o cadastro de voos
 */

import { fetchAirportByIcao, type AirportInfo } from './airportService';

// Interface para logs de auditoria
interface AirportAuditLog {
  timestamp: string;
  icaoCode: string;
  success: boolean;
  airportName?: string;
  error?: string;
  source: 'ourairports' | 'supabase' | 'manual' | 'cache';
  responseTime: number;
}

// Configuração do serviço
interface AirportAutoFillConfig {
  enableCache: boolean;
  enableLogging: boolean;
  maxRetries: number;
  timeoutMs: number;
}

// Cache em memória para otimizar performance
const airportCache = new Map<string, { data: AirportInfo; timestamp: number }>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hora

// Logs de auditoria
const auditLogs: AirportAuditLog[] = [];

// Configuração padrão
const defaultConfig: AirportAutoFillConfig = {
  enableCache: true,
  enableLogging: true,
  maxRetries: 3,
  timeoutMs: 10000
};

/**
 * Busca informações do aeroporto com preenchimento automático
 * Implementa cache, retry e logging
 */
export async function autoFillAirportInfo(
  icaoCode: string,
  config: Partial<AirportAutoFillConfig> = {}
): Promise<{ success: boolean; data?: AirportInfo; error?: string }> {
  const mergedConfig = { ...defaultConfig, ...config };
  const startTime = Date.now();
  
  try {
    // Validação do código ICAO
    const validation = validateIcaoCode(icaoCode);
    if (!validation.valid) {
      throw new Error(validation.error || 'Código ICAO inválido');
    }

    const normalizedCode = icaoCode.toUpperCase().trim();

    // Verificar cache se habilitado
    if (mergedConfig.enableCache) {
      const cached = airportCache.get(normalizedCode);
      if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        logAudit({
          timestamp: new Date().toISOString(),
          icaoCode: normalizedCode,
          success: true,
          airportName: cached.data.name,
          source: 'cache',
          responseTime: Date.now() - startTime
        }, mergedConfig.enableLogging);
        
        return { success: true, data: cached.data };
      }
    }

    // Tentar buscar com retry
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= mergedConfig.maxRetries; attempt++) {
      try {
        const result = await fetchAirportByIcao(normalizedCode);
        
        if (result.success && result.data) {
          // Armazenar em cache se habilitado
          if (mergedConfig.enableCache) {
            airportCache.set(normalizedCode, {
              data: result.data,
              timestamp: Date.now()
            });
          }

          logAudit({
            timestamp: new Date().toISOString(),
            icaoCode: normalizedCode,
            success: true,
            airportName: result.data.name,
            source: 'ourairports',
            responseTime: Date.now() - startTime
          }, mergedConfig.enableLogging);

          return { success: true, data: result.data };
        } else {
          throw new Error(result.error || 'Aeroporto não encontrado');
        }
      } catch (error) {
        lastError = error as Error;
        
        // Log do erro para este attempt
        console.warn(`Tentativa ${attempt} falhou para ${normalizedCode}:`, error);
        
        // Aguardar antes de retry (exponential backoff)
        if (attempt < mergedConfig.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    // Se todas as tentativas falharam
    throw lastError || new Error('Falha ao buscar informações do aeroporto');

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    
    logAudit({
      timestamp: new Date().toISOString(),
      icaoCode: icaoCode.toUpperCase().trim(),
      success: false,
      error: errorMessage,
      source: 'ourairports',
      responseTime: Date.now() - startTime
    }, mergedConfig.enableLogging);

    return { success: false, error: errorMessage };
  }
}

/**
 * Preenche automaticamente informações de aeroportos para um voo
 * Usado durante o processo de cadastro/edição de voos
 */
export async function autoFillFlightAirports(
  departureIcao: string,
  arrivalIcao: string,
  config: Partial<AirportAutoFillConfig> = {}
): Promise<{
  success: boolean;
  origin?: AirportInfo;
  destination?: AirportInfo;
  errors: string[];
}> {
  const errors: string[] = [];
  let origin: AirportInfo | undefined;
  let destination: AirportInfo | undefined;

  try {
    // Validar códigos ICAO
    const departureValidation = validateIcaoCode(departureIcao);
    const arrivalValidation = validateIcaoCode(arrivalIcao);
    
    if (!departureValidation.valid) {
      errors.push(`Origem (${departureIcao}): ${departureValidation.error}`);
    } else {
      // Buscar informações do aeroporto de origem
      const originResult = await autoFillAirportInfo(departureIcao, config);
      
      if (originResult.success && originResult.data) {
        origin = originResult.data;
      } else {
        errors.push(`Origem (${departureIcao}): ${originResult.error || 'Não encontrado'}`);
      }
    }
    
    if (!arrivalValidation.valid) {
      errors.push(`Destino (${arrivalIcao}): ${arrivalValidation.error}`);
    } else {
      // Buscar informações do aeroporto de destino
      const destinationResult = await autoFillAirportInfo(arrivalIcao, config);
      
      if (destinationResult.success && destinationResult.data) {
        destination = destinationResult.data;
      } else {
        errors.push(`Destino (${arrivalIcao}): ${destinationResult.error || 'Não encontrado'}`);
      }
    }

    const success = errors.length === 0;
    
    if (success) {
      logAudit({
        timestamp: new Date().toISOString(),
        icaoCode: `${departureIcao}-${arrivalIcao}`,
        success: true,
        airportName: `${origin?.name} → ${destination?.name}`,
        source: 'ourairports',
        responseTime: 0
      }, config.enableLogging ?? defaultConfig.enableLogging);
    }

    return { success, origin, destination, errors };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro ao preencher aeroportos';
    errors.push(errorMessage);
    
    return { success: false, errors };
  }
}

/**
 * Limpa o cache de aeroportos
 */
export function clearAirportCache(): void {
  airportCache.clear();
  console.log('Cache de aeroportos limpo');
}

/**
 * Retorna estatísticas do cache
 */
export function getCacheStats(): {
  cacheSize: number;
  oldestEntry: number;
  newestEntry: number;
} {
  const now = Date.now();
  let oldestEntry = now;
  let newestEntry = 0;

  for (const [, entry] of airportCache) {
    oldestEntry = Math.min(oldestEntry, entry.timestamp);
    newestEntry = Math.max(newestEntry, entry.timestamp);
  }

  return {
    cacheSize: airportCache.size,
    oldestEntry: oldestEntry === now ? 0 : oldestEntry,
    newestEntry: newestEntry === 0 ? 0 : newestEntry
  };
}

/**
 * Retorna logs de auditoria
 */
export function getAuditLogs(limit?: number): AirportAuditLog[] {
  const logs = [...auditLogs].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  return limit ? logs.slice(0, limit) : logs;
}

/**
 * Exporta logs para análise
 */
export function exportAuditLogs(): string {
  const logs = getAuditLogs();
  return JSON.stringify(logs, null, 2);
}

/**
 * Registra log de auditoria
 */
function logAudit(log: AirportAuditLog, enableLogging: boolean): void {
  if (enableLogging) {
    auditLogs.push(log);
    
    // Limitar tamanho dos logs (manter últimos 1000)
    if (auditLogs.length > 1000) {
      auditLogs.shift();
    }
    
    // Log no console para debug
    if (log.success) {
      console.log(`✈️ Aeroporto ${log.icaoCode}: ${log.airportName} (${log.source})`);
    } else {
      console.warn(`❌ Aeroporto ${log.icaoCode}: ${log.error} (${log.source})`);
    }
  }
}

/**
 * Validação de códigos ICAO
 */
export function validateIcaoCode(icaoCode: string): { valid: boolean; error?: string } {
  if (!icaoCode) {
    return { valid: false, error: 'Código ICAO é obrigatório' };
  }
  
  if (icaoCode.length !== 4) {
    return { valid: false, error: 'Código ICAO deve ter 4 caracteres' };
  }
  
  if (!/^[A-Z]{4}$/i.test(icaoCode)) {
    return { valid: false, error: 'Código ICAO deve conter apenas letras' };
  }
  
  return { valid: true };
}