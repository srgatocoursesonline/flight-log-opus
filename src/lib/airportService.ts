/**
 * Serviço para buscar informações de aeroportos pelo código ICAO
 * Implementa busca em camadas: Cache -> CSV local -> APIs externas -> Supabase -> Input manual
 */

import { supabase } from './supabase';

const AIRLABS_API_KEY = ''; // Adicione sua chave API aqui

/**
 * Busca informações de aeroporto no arquivo CSV local
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
  source: 'csv' | 'api' | 'manual' | 'cache';
  data?: AirportInfo;
  error?: string;
}

export interface AirportInfo {
  name: string;
  iata_code: string;
  icao_code: string;
  city?: string;
  state?: string;
  country_code?: string;
  lat?: number;
  lng?: number;
  manually_added?: boolean;
  last_updated?: number;
}

// Cache em memória para aeroportos buscados
const airportCache = new Map<string, AirportInfo>();

/**
 * Busca informações de um aeroporto pelo código ICAO
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

  // 1. Verificar cache local
  const cachedData = airportCache.get(upperIcaoCode);
  if (cachedData) {
    return {
      success: true,
      source: 'cache',
      data: cachedData
    };
  }

  // 2. Buscar no arquivo CSV local
  try {
    const csvResult = await fetchFromCsvFile(upperIcaoCode);
    if (csvResult) {
      airportCache.set(upperIcaoCode, csvResult);
      return {
        success: true,
        source: 'csv',
        data: csvResult
      };
    }
  } catch (error) {
    console.error('Erro ao buscar no CSV:', error);
  }

  // 3. Buscar aeroportos manuais do Supabase
  try {
    const supabaseResult = await fetchFromSupabase(upperIcaoCode);
    if (supabaseResult) {
      airportCache.set(upperIcaoCode, supabaseResult);
      return {
        success: true,
        source: 'supabase',
        data: supabaseResult
      };
    }
  } catch (error) {
    console.error('Erro ao buscar no Supabase:', error);
  }

  // 4. Tentar APIs externas se disponíveis
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

  // 4. Retornar erro específico para entrada manual (último recurso)
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
        iata_code: airportInfo.iata_code
      }, {
        onConflict: 'user_id,icao_code'
      });

    if (error) {
      console.error('Erro ao salvar no Supabase:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao salvar aeroporto manual:', error);
    return false;
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
      console.error('Erro ao carregar aeroportos manuais:', error);
      return;
    }

    if (data) {
      data.forEach(airport => {
        const airportInfo: AirportInfo = {
          name: airport.name,
          iata_code: airport.iata_code || '',
          icao_code: airport.icao_code,
          city: airport.city,
          country_code: airport.country,
          lat: airport.latitude,
          lng: airport.longitude,
          manually_added: true,
          last_updated: Date.now()
        };
        airportCache.set(airport.icao_code.toUpperCase(), airportInfo);
      });
    }
  } catch (error) {
    console.error('Erro ao carregar aeroportos manuais:', error);
  }
}

// Inicializar o serviço
loadManualAirports().catch(console.error);

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

    if (error || !data) return null;

    return {
      name: data.name,
      iata_code: data.iata_code || '',
      icao_code: data.icao_code,
      city: data.city,
      country_code: data.country,
      lat: data.latitude,
      lng: data.longitude,
      manually_added: true,
      last_updated: Date.now()
    };
  } catch (error) {
    console.error('Erro ao buscar no Supabase:', error);
    return null;
  }
}