/**
 * Testes unitários para o serviço de preenchimento automático de aeroportos
 */

import { 
  autoFillAirportInfo, 
  autoFillFlightAirports, 
  validateIcaoCode,
  clearAirportCache,
  getCacheStats,
  getAuditLogs,
  exportAuditLogs
} from '@/lib/airportAutoFillService';

// Mock do serviço de aeroportos
jest.mock('@/lib/airportService', () => ({
  fetchAirportByIcao: jest.fn()
}));

import { fetchAirportByIcao } from '@/lib/airportService';

const mockFetchAirportByIcao = fetchAirportByIcao as jest.MockedFunction<typeof fetchAirportByIcao>;

describe('AirportAutoFillService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearAirportCache();
  });

  describe('validateIcaoCode', () => {
    it('deve validar código ICAO válido', () => {
      const result = validateIcaoCode('SBGR');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('deve rejeitar código ICAO vazio', () => {
      const result = validateIcaoCode('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Código ICAO é obrigatório');
    });

    it('deve rejeitar código ICAO com tamanho incorreto', () => {
      const result = validateIcaoCode('SBGRX');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Código ICAO deve ter 4 caracteres');
    });

    it('deve rejeitar código ICAO com caracteres inválidos', () => {
      const result = validateIcaoCode('SB12');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Código ICAO deve conter apenas letras');
    });
  });

  describe('autoFillAirportInfo', () => {
    it('deve buscar informações do aeroporto com sucesso', async () => {
      const mockAirport = {
        name: 'Guarulhos - Governador André Franco Montoro International Airport',
        iata_code: 'GRU',
        icao_code: 'SBGR',
        city: 'São Paulo',
        state: 'SP',
        country_code: 'BR'
      };

      mockFetchAirportByIcao.mockResolvedValue({
        success: true,
        source: 'api',
        data: mockAirport
      });

      const result = await autoFillAirportInfo('SBGR');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAirport);
      expect(result.error).toBeUndefined();
    });

    it('deve usar cache na segunda chamada', async () => {
      const mockAirport = {
        name: 'Guarulhos International Airport',
        iata_code: 'GRU',
        icao_code: 'SBGR',
        city: 'São Paulo',
        state: 'SP',
        country_code: 'BR'
      };

      mockFetchAirportByIcao.mockResolvedValue({
        success: true,
        source: 'api',
        data: mockAirport
      });

      // Primeira chamada
      const result1 = await autoFillAirportInfo('SBGR');
      expect(result1.success).toBe(true);
      expect(mockFetchAirportByIcao).toHaveBeenCalledTimes(1);

      // Segunda chamada (deve usar cache)
      const result2 = await autoFillAirportInfo('SBGR');
      expect(result2.success).toBe(true);
      expect(result2.data).toEqual(mockAirport);
      expect(mockFetchAirportByIcao).toHaveBeenCalledTimes(1); // Não deve chamar novamente
    });

    it('deve tratar código ICAO inválido', async () => {
      const result = await autoFillAirportInfo('SB12');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Código ICAO deve conter apenas letras');
      expect(result.data).toBeUndefined();
    });

    it('deve tentar novamente em caso de falha', async () => {
      jest.setTimeout(10000);
      mockFetchAirportByIcao
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          success: true,
          source: 'api',
          data: {
            name: 'Test Airport',
            iata_code: 'TST',
            icao_code: 'XXXX',
            city: 'Test City',
            country_code: 'BR'
          }
        });

      const result = await autoFillAirportInfo('XXXX', { maxRetries: 2 });

      expect(result.success).toBe(true);
      expect(result.data?.name).toBe('Test Airport');
      expect(mockFetchAirportByIcao).toHaveBeenCalledTimes(2);
    });

    it('deve falhar após todas as tentativas', async () => {
      mockFetchAirportByIcao.mockRejectedValue(new Error('Network error'));

      const result = await autoFillAirportInfo('SBGR', { maxRetries: 2 });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
      expect(mockFetchAirportByIcao).toHaveBeenCalledTimes(2);
    });
  });

  describe('autoFillFlightAirports', () => {
    it('deve preencher informações de ambos os aeroportos', async () => {
      const originAirport = {
        name: 'Guarulhos International Airport',
        iata_code: 'GRU',
        icao_code: 'SBGR',
        city: 'São Paulo',
        state: 'SP',
        country_code: 'BR'
      };

      const destinationAirport = {
        name: 'Galeão International Airport',
        iata_code: 'GIG',
        icao_code: 'SBGL',
        city: 'Rio de Janeiro',
        state: 'RJ',
        country_code: 'BR'
      };

      mockFetchAirportByIcao
        .mockResolvedValueOnce({ success: true, source: 'api', data: originAirport })
        .mockResolvedValueOnce({ success: true, source: 'api', data: destinationAirport });

      const result = await autoFillFlightAirports('SBGR', 'SBGL');

      expect(result.success).toBe(true);
      expect(result.origin).toEqual(originAirport);
      expect(result.destination).toEqual(destinationAirport);
      expect(result.errors).toHaveLength(0);
    });

    it('deve tratar erro quando um aeroporto não for encontrado', async () => {
      jest.setTimeout(10000);
      const originAirport = {
        name: 'Guarulhos International Airport',
        iata_code: 'GRU',
        icao_code: 'SBGR',
        city: 'São Paulo',
        country_code: 'BR'
      };

      mockFetchAirportByIcao
        .mockResolvedValueOnce({ success: true, source: 'api', data: originAirport })
        .mockResolvedValueOnce({ success: false, source: 'api', error: 'Airport not found' })
        .mockResolvedValueOnce({ success: false, source: 'api', error: 'Airport not found' });

      const result = await autoFillFlightAirports('SBGR', 'XXXX', { maxRetries: 1 });

      expect(result.success).toBe(false);
      expect(result.origin).toEqual(originAirport);
      expect(result.destination).toBeUndefined();
      expect(result.errors).toContain('Destino (XXXX): Airport not found');
    });

    it('deve validar códigos ICAO antes de buscar', async () => {
      const result = await autoFillFlightAirports('SB1', 'SB2');

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0]).toContain('Origem (SB1): Código ICAO deve ter 4 caracteres');
      expect(result.errors[1]).toContain('Destino (SB2): Código ICAO deve ter 4 caracteres');
    });
  });

  describe('Cache e Logs', () => {
    it('deve limpar cache corretamente', async () => {
      const mockAirport = {
        name: 'Test Airport',
        iata_code: 'TST',
        icao_code: 'XXXX',
        city: 'Test City',
        country_code: 'BR'
      };

      mockFetchAirportByIcao.mockResolvedValue({ success: true, source: 'api', data: mockAirport });

      // Buscar e armazenar em cache
      await autoFillAirportInfo('XXXX');
      
      let stats = getCacheStats();
      expect(stats.cacheSize).toBe(1);

      // Limpar cache
      clearAirportCache();
      
      stats = getCacheStats();
      expect(stats.cacheSize).toBe(0);
    });

    it('deve registrar logs de auditoria', async () => {
      const mockAirport = {
        name: 'Test Airport',
        iata_code: 'TST',
        icao_code: 'XXXX',
        city: 'Test City',
        country_code: 'BR'
      };

      mockFetchAirportByIcao.mockResolvedValue({ success: true, source: 'api', data: mockAirport });

      await autoFillAirportInfo('XXXX', { enableLogging: true });

      const logs = getAuditLogs();
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].icaoCode).toBe('XXXX');
      expect(logs[0].success).toBe(true);
      expect(logs[0].airportName).toBe('Test Airport');
    });

    it('deve exportar logs em formato JSON', async () => {
      const mockAirport = {
        name: 'Test Airport',
        iata_code: 'TST',
        icao_code: 'XXXX',
        city: 'Test City',
        country_code: 'BR'
      };

      mockFetchAirportByIcao.mockResolvedValue({ success: true, source: 'api', data: mockAirport });

      await autoFillAirportInfo('XXXX', { enableLogging: true });

      const exportedLogs = exportAuditLogs();
      const parsedLogs = JSON.parse(exportedLogs);
      
      expect(Array.isArray(parsedLogs)).toBe(true);
      expect(parsedLogs.length).toBeGreaterThan(0);
    });
  });
});