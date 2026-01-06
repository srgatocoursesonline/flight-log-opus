/**
 * Hook para preenchimento automático de aeroportos
 * Simplifica o uso do serviço de autoFill em componentes React
 */

import { useCallback, useState } from 'react';
import { 
  autoFillAirportInfo, 
  autoFillFlightAirports, 
  validateIcaoCode,
  clearAirportCache,
  getCacheStats,
  getAuditLogs,
  type AirportInfo 
} from '@/lib/airportAutoFillService';
import { toast } from 'sonner';

interface UseAirportAutoFillReturn {
  // Estado
  loading: boolean;
  error: string | null;
  
  // Funções principais
  fillAirportInfo: (icaoCode: string) => Promise<AirportInfo | null>;
  fillFlightAirports: (departureIcao: string, arrivalIcao: string) => Promise<{
    origin: AirportInfo | null;
    destination: AirportInfo | null;
  } | null>;
  
  // Utilidades
  validateCode: (icaoCode: string) => { valid: boolean; error?: string };
  clearCache: () => void;
  getCacheStatistics: () => { cacheSize: number; oldestEntry: number; newestEntry: number };
  getLogs: (limit?: number) => any[];
}

export function useAirportAutoFill(): UseAirportAutoFillReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Preenche informações de um único aeroporto
   */
  const fillAirportInfo = useCallback(async (icaoCode: string): Promise<AirportInfo | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await autoFillAirportInfo(icaoCode, { enableLogging: true });
      
      if (result.success && result.data) {
        toast.success(`Aeroporto encontrado: ${result.data.name}`);
        return result.data;
      } else {
        setError(result.error || 'Aeroporto não encontrado');
        toast.error(result.error || 'Aeroporto não encontrado');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar aeroporto';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Preenche informações de aeroportos para um voo completo
   */
  const fillFlightAirports = useCallback(async (
    departureIcao: string, 
    arrivalIcao: string
  ): Promise<{ origin: AirportInfo | null; destination: AirportInfo | null } | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await autoFillFlightAirports(departureIcao, arrivalIcao, { enableLogging: true });
      
      if (result.success) {
        toast.success('Informações dos aeroportos atualizadas com sucesso');
        return {
          origin: result.origin || null,
          destination: result.destination || null
        };
      } else {
        const errorMessage = result.errors.join(', ');
        setError(errorMessage);
        toast.error(`Erros encontrados: ${errorMessage}`);
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar aeroportos';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Valida código ICAO
   */
  const validateCode = useCallback((icaoCode: string) => {
    return validateIcaoCode(icaoCode);
  }, []);

  /**
   * Limpa cache de aeroportos
   */
  const clearCache = useCallback(() => {
    clearAirportCache();
    toast.success('Cache de aeroportos limpo');
  }, []);

  /**
   * Retorna estatísticas do cache
   */
  const getCacheStatistics = useCallback(() => {
    return getCacheStats();
  }, []);

  /**
   * Retorna logs de auditoria
   */
  const getLogs = useCallback((limit?: number) => {
    return getAuditLogs(limit);
  }, []);

  return {
    loading,
    error,
    fillAirportInfo,
    fillFlightAirports,
    validateCode,
    clearCache,
    getCacheStatistics,
    getLogs
  };
}