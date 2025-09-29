/**
 * Serviço para buscar informações de aeroportos pelo código ICAO
 * Implementa busca em camadas: Cache -> OurAirports (76k+) -> Supabase -> CSV local -> Input manual
 */

import { supabase } from './supabase';

const AIRLABS_API_KEY = ''; // Adicione sua chave API aqui

// URL da base de dados OurAirports (atualizada diariamente)
const OURAIRPORTS_CSV_URL = 'https://davidmegginson.github.io/ourairports-data/airports.csv';

// Cache da OurAirports em memória
let ourAirportsCache: Map<string, AirportInfo> | null = null;
let ourAirportsCacheTime = 0;
const OURAIRPORTS_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas

/**
 * Busca informações de aeroporto na base de dados OurAirports
 * Base com 76.000+ aeroportos incluindo pequenos, privados, heliportos e fechados
 * @param icaoCode Código ICAO do aeroporto
 * @returns Informações do aeroporto ou null se não encontrado
 */
async function fetchFromOurAirports(icaoCode: string): Promise<AirportInfo | null> {
  try {
    // Verificar se o cache da OurAirports precisa ser atualizado
    const needsUpdate = !ourAirportsCache || (Date.now() - ourAirportsCacheTime > OURAIRPORTS_CACHE_DURATION);
    
    if (needsUpdate) {
      console.log('📡 Baixando base de dados OurAirports (76k+ aeroportos)...');
      const response = await fetch(OURAIRPORTS_CSV_URL);
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar OurAirports: ${response.status}`);
      }
      
      const csvText = await response.text();
      const lines = csvText.split('\n');
      
      // Criar novo cache
      const newCache = new Map<string, AirportInfo>();
      
      // Headers da OurAirports:
      // id,ident,type,name,latitude_deg,longitude_deg,elevation_ft,continent,iso_country,iso_region,municipality,scheduled_service,gps_code,iata_code,local_code,home_link,wikipedia_link,keywords
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Parse CSV com aspas
        const columns: string[] = [];
        let current = '';
        let inQuotes = false;
        
        for (let j = 0; j < line.length; j++) {
          const char = line[j];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            columns.push(current);
            current = '';
          } else {
            current += char;
          }
        }
        columns.push(current);
        
        if (columns.length >= 13) {
          const ident = columns[1]?.trim(); // ICAO code
          const type = columns[2]?.trim();
          const name = columns[3]?.trim();
          const lat = parseFloat(columns[4]) || 0;
          const lng = parseFloat(columns[5]) || 0;
          const elevation = parseInt(columns[6]) || 0;
          const iso_country = columns[8]?.trim();
          const iso_region = columns[9]?.trim(); // Ex: BR-SP
          const municipality = columns[10]?.trim(); // Cidade
          const iata = columns[13]?.trim();
          
          // Extrair estado do iso_region (ex: BR-SP -> SP)
          const state = iso_region?.includes('-') ? iso_region.split('-')[1] : '';
          
          if (ident && ident.length === 4) {
            const airportInfo: AirportInfo = {
              name: name || 'Unknown Airport',
              iata_code: iata || '',
              icao_code: ident.toUpperCase(),
              city: municipality || undefined,
              state: state || undefined,
              region: iso_region || undefined,
              country_code: iso_country || undefined,
              lat: lat || undefined,
              lng: lng || undefined,
              elevation_ft: elevation || undefined,
              airport_type: type || undefined,
              last_updated: Date.now()
            };
            
            newCache.set(ident.toUpperCase(), airportInfo);
          }
        }
      }
      
      ourAirportsCache = newCache;
      ourAirportsCacheTime = Date.now();
      console.log(`✅ OurAirports carregada: ${newCache.size} aeroportos em cache`);
    }
    
    // Buscar no cache da OurAirports
    const result = ourAirportsCache?.get(icaoCode.toUpperCase());
    return result || null;
    
  } catch (error) {
    console.error('Erro ao buscar na OurAirports:', error);
    return null;
  }
}

/**
 * Busca informações de aeroporto no arquivo CSV local (fallback)
 * @param icaoCode Código ICAO do aeroporto
 * @returns Informações do aeroporto ou null se não encontrado
 */
async function fetchFromCsvFile(icaoCode: string): Promise<AirportInfo | null> {
  try {
    const response = await fetch('/airports.csv');
    if (!response.ok) {
      throw new Error(`Erro ao carregar CSV: ${response.status}`);
    }
    
    const csvText = await response.text();
    const lines = csvText.split('\n');
    
    // Pular cabeçalho e processar linhas
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Lidar com CSV com aspas: "IATA","ICAO","Airport name","Country","City"
      const columns = line.match(/"([^"]*)"/g);
      if (columns && columns.length >= 5) {
        const iata_code = columns[0].replace(/"/g, '').trim();
        const icao_code = columns[1].replace(/"/g, '').trim();
        const name = columns[2].replace(/"/g, '').trim();
        const country = columns[3].replace(/"/g, '').trim();
        const city = columns[4].replace(/"/g, '').trim();
        
        if (icao_code.toUpperCase() === icaoCode.toUpperCase()) {
          return {
            name: name,
            iata_code: iata_code,
            icao_code: icao_code,
            city: city || undefined,
            country_code: country || undefined,
            last_updated: Date.now()
          };
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao buscar no CSV:', error);
    return null;
  }
}

export interface AirportSearchResult {
  success: boolean;
  source: 'cache' | 'ourairports' | 'manual' | 'csv' | 'api';
  data?: AirportInfo;
  error?: string;
}

export interface AirportInfo {
  name: string;
  iata_code: string;
  icao_code: string;
  city?: string;
  state?: string;
  region?: string; // Código da região ISO (ex: BR-SP)
  country_code?: string;
  lat?: number;
  lng?: number;
  elevation_ft?: number; // Elevação em pés
  airport_type?: string; // small_airport, medium_airport, large_airport, heliport, closed, etc
  manually_added?: boolean;
  last_updated?: number;
}

// Cache em memória para aeroportos buscados com persistência no localStorage
const CACHE_KEY = 'airportCache';
const CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 dias
const CACHE_MAX_SIZE = 500; // Máximo de aeroportos no cache

// Inicializar cache do localStorage
const initCache = (): Map<string, AirportInfo> => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      const cache = new Map<string, AirportInfo>();
      
      // Carregar apenas itens não expirados
      Object.entries(parsed).forEach(([key, value]) => {
        const airport = value as AirportInfo;
        if (airport.last_updated && (Date.now() - airport.last_updated) < CACHE_MAX_AGE) {
          cache.set(key, airport);
        }
      });
      
      return cache;
    }
  } catch (error) {
    console.error('Erro ao carregar cache de aeroportos:', error);
  }
  return new Map<string, AirportInfo>();
};

const airportCache = initCache();

// Salvar cache no localStorage periodicamente
const saveCacheToStorage = () => {
  try {
    // Limitar tamanho do cache
    if (airportCache.size > CACHE_MAX_SIZE) {
      // Remover itens mais antigos
      const sorted = Array.from(airportCache.entries())
        .sort((a, b) => (b[1].last_updated || 0) - (a[1].last_updated || 0));
      
      airportCache.clear();
      sorted.slice(0, CACHE_MAX_SIZE).forEach(([key, value]) => {
        airportCache.set(key, value);
      });
    }
    
    const cacheObj = Object.fromEntries(airportCache);
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheObj));
  } catch (error) {
    console.error('Erro ao salvar cache de aeroportos:', error);
  }
};

/**
 * Busca informações de um aeroporto pelo código ICAO
 * Ordem de busca: Cache -> OurAirports (76k+) -> Supabase -> CSV Local -> Input Manual
 * @param icaoCode Código ICAO do aeroporto (ex: SBGR)
 * @returns Resultado da busca com informações do aeroporto
 */
export async function fetchAirportByIcao(icaoCode: string): Promise<AirportSearchResult> {
  if (!icaoCode || icaoCode.length !== 4) {
    return {
      success: false,
      source: 'cache',
      error: 'Código ICAO inválido'
    };
  }

  const upperIcaoCode = icaoCode.toUpperCase();

  // 1. Verificar cache local (mais rápido)
  const cachedData = airportCache.get(upperIcaoCode);
  if (cachedData) {
    return {
      success: true,
      source: 'cache',
      data: cachedData
    };
  }

  // 2. Buscar na base OurAirports (76.000+ aeroportos)
  try {
    const ourAirportsResult = await fetchFromOurAirports(upperIcaoCode);
    if (ourAirportsResult) {
      airportCache.set(upperIcaoCode, ourAirportsResult);
      saveCacheToStorage(); // Persistir no localStorage
      return {
        success: true,
        source: 'ourairports',
        data: ourAirportsResult
      };
    }
  } catch (error) {
    console.error('Erro ao buscar na OurAirports:', error);
  }

  // 3. Buscar aeroportos manuais do Supabase (aeroportos que você cadastrou)
  try {
    const supabaseResult = await fetchFromSupabase(upperIcaoCode);
    if (supabaseResult) {
      airportCache.set(upperIcaoCode, supabaseResult);
      saveCacheToStorage(); // Persistir no localStorage
      return {
        success: true,
        source: 'manual',
        data: supabaseResult
      };
    }
  } catch (error) {
    console.error('Erro ao buscar no Supabase:', error);
  }

  // 4. Buscar no arquivo CSV local (fallback final - 8.560 aeroportos)
  try {
    const csvResult = await fetchFromCsvFile(upperIcaoCode);
    if (csvResult) {
      airportCache.set(upperIcaoCode, csvResult);
      saveCacheToStorage(); // Persistir no localStorage
      return {
        success: true,
        source: 'csv',
        data: csvResult
      };
    }
  } catch (error) {
    console.error('Erro ao buscar no CSV local:', error);
  }

  // 5. Tentar APIs externas se disponíveis (AirLabs)
  if (AIRLABS_API_KEY) {
    try {
      const response = await fetch(
        `https://airlabs.co/api/v9/airports?icao_code=${upperIcaoCode}&api_key=${AIRLABS_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.response && data.response.length > 0) {
        const airport = data.response[0];
        const airportInfo: AirportInfo = {
          name: airport.name,
          iata_code: airport.iata_code || '',
          icao_code: airport.icao_code,
          city: airport.city,
          state: airport.state,
          country_code: airport.country_code,
          lat: airport.lat,
          lng: airport.lng,
          last_updated: Date.now()
        };
        
        airportCache.set(upperIcaoCode, airportInfo);
        saveCacheToStorage(); // Persistir no localStorage
        return {
          success: true,
          source: 'api',
          data: airportInfo
        };
      }
    } catch (error) {
      console.error('Erro ao buscar na API:', error);
    }
  }

  // 6. Retornar erro específico para entrada manual (último recurso)
  return {
    success: false,
    source: 'manual',
    error: 'Aeroporto não encontrado nas fontes disponíveis'
  };
}

/**
 * Salva informações de um aeroporto informado manualmente no Supabase
 * @param airportInfo Informações do aeroporto
 */
export async function saveManualAirport(airportInfo: AirportInfo): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('Usuário não autenticado');
      return false;
    }

    const icaoCode = airportInfo.icao_code.toUpperCase();
    airportInfo.manually_added = true;
    airportInfo.last_updated = Date.now();
    
    // Atualizar cache local
    airportCache.set(icaoCode, airportInfo);
    saveCacheToStorage(); // Persistir no localStorage
    
    // Salvar no Supabase
    const { error } = await supabase
      .from('manual_airports')
      .upsert({
        user_id: user.id,
        icao_code: icaoCode,
        name: airportInfo.name,
        city: airportInfo.city,
        country: airportInfo.country_code,
        latitude: airportInfo.lat,
        longitude: airportInfo.lng,
        iata_code: airportInfo.iata_code,
        region: airportInfo.region,
        elevation: airportInfo.elevation_ft,
        airport_type: airportInfo.airport_type
      }, {
        onConflict: 'user_id,icao_code'
      });

    if (error) {
      // Se tabela não existe, apenas manter no cache local
      if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        return true; // Sucesso local
      }
      console.warn('Erro ao salvar no Supabase:', error);
      return true; // Ainda retorna true porque está no cache local
    }

    return true;
  } catch (error) {
    // Erro geral, mas mantém no cache local
    return true;
  }
}

/**
 * Carrega aeroportos salvos manualmente do Supabase
 */
export async function loadManualAirports(): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('manual_airports')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      // Se tabela não existe, ignorar silenciosamente
      if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        return;
      }
      console.warn('Erro ao carregar aeroportos manuais:', error);
      return;
    }

    if (data) {
      data.forEach(airport => {
        const airportInfo: AirportInfo = {
          name: airport.name,
          iata_code: airport.iata_code || '',
          icao_code: airport.icao_code,
          city: airport.city,
          state: airport.region?.split('-')[1], // Extrair estado da região
          region: airport.region,
          country_code: airport.country,
          lat: airport.latitude,
          lng: airport.longitude,
          elevation_ft: airport.elevation,
          airport_type: airport.airport_type || 'unknown',
          manually_added: true,
          last_updated: Date.now()
        };
        airportCache.set(airport.icao_code.toUpperCase(), airportInfo);
      });
    }
  } catch (error) {
    // Não mostrar erro no console para evitar spam
  }
}

/**
 * Pré-carrega a base OurAirports em background para melhorar performance
 * Chamado automaticamente ao inicializar o serviço
 */
export async function preloadOurAirports(): Promise<void> {
  try {
    // Fazer uma busca dummy para forçar o download do cache
    await fetchFromOurAirports('SBGR');
  } catch (error) {
    // Ignorar erros - será tentado novamente na próxima busca
  }
}

/**
 * Retorna estatísticas sobre o cache de aeroportos
 */
export function getCacheStats() {
  return {
    localCacheSize: airportCache.size,
    ourAirportsCacheSize: ourAirportsCache?.size || 0,
    ourAirportsLastUpdate: ourAirportsCacheTime ? new Date(ourAirportsCacheTime).toLocaleString('pt-BR') : 'Nunca',
    cacheAge: ourAirportsCacheTime ? Math.floor((Date.now() - ourAirportsCacheTime) / 1000 / 60 / 60) + 'h' : 'N/A'
  };
}

// Inicializar o serviço silenciosamente
loadManualAirports().catch(() => {
  // Ignorar erros de inicialização se tabela não existir
});

// Pré-carregar OurAirports em background (após 2 segundos)
setTimeout(() => {
  preloadOurAirports().catch(() => {
    // Ignorar erros - será carregado na primeira busca
  });
}, 2000);

/**
 * Busca aeroportos manuais do Supabase para o usuário atual
 * @param icaoCode Código ICAO do aeroporto
 * @returns Informações do aeroporto ou null se não encontrado
 */
async function fetchFromSupabase(icaoCode: string): Promise<AirportInfo | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('manual_airports')
      .select('*')
      .eq('user_id', user.id)
      .eq('icao_code', icaoCode.toUpperCase())
      .single();

    // Se erro 406 ou erro de tabela não encontrada, retornar null silenciosamente
    if (error) {
      if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        // Tabela não existe, ignorar silenciosamente
        return null;
      }
      console.warn('Erro ao buscar no Supabase:', error);
      return null;
    }

    if (!data) return null;

    return {
      name: data.name,
      iata_code: data.iata_code || '',
      icao_code: data.icao_code,
      city: data.city,
      state: data.region?.split('-')[1], // Extrair estado da região
      region: data.region,
      country_code: data.country,
      lat: data.latitude,
      lng: data.longitude,
      elevation_ft: data.elevation,
      airport_type: data.airport_type || 'unknown',
      manually_added: true,
      last_updated: Date.now()
    };
  } catch (error) {
    // Não mostrar erro no console para evitar spam
    return null;
  }
}