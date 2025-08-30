/**
 * Serviço para busca e resolução de aeroportos
 * Utiliza dados da OurAirports para encontrar aeroportos mais próximos
 */

import axios from 'axios';

// ============================================
// INTERFACES
// ============================================

interface Airport {
  id: string;
  ident: string;
  type: string;
  name: string;
  latitude_deg: number;
  longitude_deg: number;
  elevation_ft: number;
  continent: string;
  iso_country: string;
  iso_region: string;
  municipality: string;
  scheduled_service: string;
  gps_code: string;
  iata_code: string;
  local_code: string;
  home_link: string;
  wikipedia_link: string;
  keywords: string;
}

interface NearestAirport {
  icao_code: string;
  iata_code: string;
  name: string;
  municipality: string;
  country: string;
  latitude: number;
  longitude: number;
  elevation_ft: number;
  distance_km: number;
  type: string;
}

// ============================================
// CACHE E CONFIGURAÇÕES
// ============================================

// Cache simples em memória para aeroportos
let airportsCache: Airport[] = [];
let cacheLastUpdated: number = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas

// URLs das APIs
const OURAIRPORTS_CSV_URL = 'https://davidmegginson.github.io/ourairports-data/airports.csv';
const BACKUP_API_URLS = [
  'https://api.aviationapi.com/v1/airports/search',
  'https://airport-info.p.rapidapi.com/airport',
];

// ============================================
// UTILITÁRIOS
// ============================================

/**
 * Calcula a distância entre duas coordenadas usando a fórmula de Haversine
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Raio da Terra em km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Converte CSV para array de objetos
 */
function parseCSV(csvText: string): Airport[] {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
  const airports: Airport[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    
    // Parse CSV considerando aspas
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    // Criar objeto aeroporto
    if (values.length >= headers.length) {
      const airport: any = {};
      headers.forEach((header, index) => {
        airport[header] = values[index] || '';
      });
      
      // Converter tipos numéricos
      airport.latitude_deg = parseFloat(airport.latitude_deg) || 0;
      airport.longitude_deg = parseFloat(airport.longitude_deg) || 0;
      airport.elevation_ft = parseInt(airport.elevation_ft) || 0;
      
      // Filtrar apenas aeroportos válidos
      if (
        airport.latitude_deg !== 0 &&
        airport.longitude_deg !== 0 &&
        airport.ident &&
        (airport.type === 'large_airport' ||
          airport.type === 'medium_airport' ||
          airport.type === 'small_airport')
      ) {
        airports.push(airport as Airport);
      }
    }
  }
  
  return airports;
}

// ============================================
// FUNÇÕES PRINCIPAIS
// ============================================

/**
 * Carrega dados de aeroportos da OurAirports
 */
async function loadAirportsData(): Promise<void> {
  try {
    console.log('📡 Carregando dados de aeroportos...');
    
    const response = await axios.get(OURAIRPORTS_CSV_URL, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Flight-Log-Opus/1.0',
      },
    });
    
    const airports = parseCSV(response.data);
    
    if (airports.length > 0) {
      airportsCache = airports;
      cacheLastUpdated = Date.now();
      console.log(`✅ ${airports.length} aeroportos carregados com sucesso`);
    } else {
      throw new Error('Nenhum aeroporto válido encontrado');
    }
    
  } catch (error) {
    console.error('❌ Erro ao carregar dados de aeroportos:', error);
    throw error;
  }
}

/**
 * Verifica se o cache precisa ser atualizado
 */
function shouldUpdateCache(): boolean {
  return (
    airportsCache.length === 0 ||
    Date.now() - cacheLastUpdated > CACHE_DURATION
  );
}

/**
 * Encontra o aeroporto mais próximo de uma coordenada
 */
export async function findNearestAirport(
  latitude: number,
  longitude: number,
  maxDistance: number = 100 // km
): Promise<NearestAirport | null> {
  try {
    // Verificar se precisa atualizar cache
    if (shouldUpdateCache()) {
      await loadAirportsData();
    }
    
    if (airportsCache.length === 0) {
      console.warn('⚠️ Cache de aeroportos vazio');
      return null;
    }
    
    let nearestAirport: Airport | null = null;
    let minDistance = Infinity;
    
    // Buscar aeroporto mais próximo
    for (const airport of airportsCache) {
      const distance = calculateDistance(
        latitude,
        longitude,
        airport.latitude_deg,
        airport.longitude_deg
      );
      
      if (distance < minDistance && distance <= maxDistance) {
        minDistance = distance;
        nearestAirport = airport;
      }
    }
    
    if (!nearestAirport) {
      console.warn(`⚠️ Nenhum aeroporto encontrado em ${maxDistance}km de ${latitude}, ${longitude}`);
      return null;
    }
    
    // Formatar resultado
    const result: NearestAirport = {
      icao_code: nearestAirport.ident,
      iata_code: nearestAirport.iata_code || '',
      name: nearestAirport.name,
      municipality: nearestAirport.municipality || '',
      country: nearestAirport.iso_country || '',
      latitude: nearestAirport.latitude_deg,
      longitude: nearestAirport.longitude_deg,
      elevation_ft: nearestAirport.elevation_ft,
      distance_km: Math.round(minDistance * 100) / 100,
      type: nearestAirport.type,
    };
    
    console.log(`✅ Aeroporto mais próximo: ${result.icao_code} (${result.name}) - ${result.distance_km}km`);
    return result;
    
  } catch (error) {
    console.error('❌ Erro ao buscar aeroporto mais próximo:', error);
    return null;
  }
}

/**
 * Busca aeroporto por código ICAO
 */
export async function findAirportByICAO(icaoCode: string): Promise<NearestAirport | null> {
  try {
    // Verificar se precisa atualizar cache
    if (shouldUpdateCache()) {
      await loadAirportsData();
    }
    
    const airport = airportsCache.find(
      (a) => a.ident.toLowerCase() === icaoCode.toLowerCase()
    );
    
    if (!airport) {
      console.warn(`⚠️ Aeroporto ${icaoCode} não encontrado`);
      return null;
    }
    
    return {
      icao_code: airport.ident,
      iata_code: airport.iata_code || '',
      name: airport.name,
      municipality: airport.municipality || '',
      country: airport.iso_country || '',
      latitude: airport.latitude_deg,
      longitude: airport.longitude_deg,
      elevation_ft: airport.elevation_ft,
      distance_km: 0,
      type: airport.type,
    };
    
  } catch (error) {
    console.error('❌ Erro ao buscar aeroporto por ICAO:', error);
    return null;
  }
}

/**
 * Busca aeroportos por região/país
 */
export async function findAirportsByRegion(
  country: string,
  limit: number = 50
): Promise<NearestAirport[]> {
  try {
    // Verificar se precisa atualizar cache
    if (shouldUpdateCache()) {
      await loadAirportsData();
    }
    
    const airports = airportsCache
      .filter((a) => 
        a.iso_country.toLowerCase() === country.toLowerCase() &&
        (a.type === 'large_airport' || a.type === 'medium_airport')
      )
      .slice(0, limit)
      .map((airport) => ({
        icao_code: airport.ident,
        iata_code: airport.iata_code || '',
        name: airport.name,
        municipality: airport.municipality || '',
        country: airport.iso_country || '',
        latitude: airport.latitude_deg,
        longitude: airport.longitude_deg,
        elevation_ft: airport.elevation_ft,
        distance_km: 0,
        type: airport.type,
      }));
    
    return airports;
    
  } catch (error) {
    console.error('❌ Erro ao buscar aeroportos por região:', error);
    return [];
  }
}

/**
 * Inicializa o serviço carregando dados
 */
export async function initializeAirportService(): Promise<void> {
  try {
    await loadAirportsData();
    console.log('✅ Serviço de aeroportos inicializado');
  } catch (error) {
    console.error('❌ Erro ao inicializar serviço de aeroportos:', error);
    // Não falhar a aplicação, apenas logar o erro
  }
}

/**
 * Obtém estatísticas do cache
 */
export function getCacheStats() {
  return {
    totalAirports: airportsCache.length,
    lastUpdated: new Date(cacheLastUpdated).toISOString(),
    cacheAge: Date.now() - cacheLastUpdated,
    needsUpdate: shouldUpdateCache(),
  };
}