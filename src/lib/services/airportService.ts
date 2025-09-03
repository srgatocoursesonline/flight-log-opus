// ============================================
// AIRPORT DATA SERVICE
// Service for fetching airport information from multiple sources
// ============================================

import { AirportInfo } from '@/types/airport';

// API keys (should be in environment variables in production)
const API_KEYS = {
  ninjas: import.meta.env.VITE_API_NINJAS_KEY || '',
  aeroDataBox: import.meta.env.VITE_AERODATABOX_KEY || '',
  aviationStack: import.meta.env.VITE_AVIATIONSTACK_KEY || '',
  icaoOfficial: import.meta.env.VITE_ICAO_OFFICIAL_KEY || ''
};

/**
 * Fetch airport information by ICAO code
 * @param icaoCode ICAO code of the airport (ex: SBGR)
 * @returns Airport information or null if not found
 */
export async function fetchAirportByIcao(icaoCode: string): Promise<AirportInfo | null> {
  if (!icaoCode || icaoCode.length !== 4) {
    return null;
  }

  const upperIcaoCode = icaoCode.toUpperCase();
  
  // Verificar cache primeiro
  const cachedData = localStorage.getItem(`airport_${upperIcaoCode}`);
  if (cachedData) {
    const parsed = JSON.parse(cachedData);
    // Verificar se o cache não é muito antigo (7 dias)
    if (parsed.cached_at && Date.now() - parsed.cached_at < 7 * 24 * 60 * 60 * 1000) {
      return parsed.data;
    }
  }

  // Tentar buscar via APIs em ordem de prioridade
  const apis = [
    { name: 'API Ninjas', fetch: () => fetchFromApiNinjas(upperIcaoCode) },
    { name: 'AeroDataBox', fetch: () => fetchFromAeroDataBox(upperIcaoCode) },
    { name: 'AviationStack', fetch: () => fetchFromAviationStack(upperIcaoCode) },
    { name: 'ICAO Official', fetch: () => fetchFromIcaoOfficial(upperIcaoCode) },
    { name: 'Arquivo CSV Local', fetch: () => fetchFromCsvFile(upperIcaoCode) }
  ];

  for (const api of apis) {
    try {
      const result = await api.fetch();
      if (result) {
        // Salvar no cache com timestamp
        const cacheData = {
          data: result,
          cached_at: Date.now()
        };
        localStorage.setItem(`airport_${upperIcaoCode}`, JSON.stringify(cacheData));
        return result;
      }
    } catch (error) {
      continue;
    }
  }

  // Fallback para dados mockados
  const mockData = getMockAirportData(upperIcaoCode);
  
  if (mockData) {
    // Salvar dados mockados no cache também
    const cacheData = {
      data: mockData,
      cached_at: Date.now()
    };
    localStorage.setItem(`airport_${upperIcaoCode}`, JSON.stringify(cacheData));
  }
  
  return mockData;
}

// ============================================
// API FETCHING FUNCTIONS
// ============================================

async function fetchFromApiNinjas(icaoCode: string): Promise<AirportInfo | null> {
  if (!API_KEYS.ninjas) return null;
  
  try {
    const response = await fetch(`https://api.api-ninjas.com/v1/airports?icao=${icaoCode}`, {
      headers: {
        'X-Api-Key': API_KEYS.ninjas
      }
    });
    
    if (!response.ok) throw new Error(`API Ninjas error: ${response.status}`);
    
    const data = await response.json();
    if (data && data.length > 0) {
      const airport = data[0];
      return {
        name: airport.name,
        iata_code: airport.iata || '',
        icao_code: airport.icao,
        city: airport.city,
        state: airport.region,
        country_code: airport.country,
        lat: parseFloat(airport.latitude),
        lng: parseFloat(airport.longitude)
      };
    }
  } catch (error) {
  }
  return null;
}

async function fetchFromAeroDataBox(icaoCode: string): Promise<AirportInfo | null> {
  if (!API_KEYS.aeroDataBox) return null;
  
  try {
    const response = await fetch(`https://aerodatabox.p.rapidapi.com/airports/icao/${icaoCode}`, {
      headers: {
        'X-RapidAPI-Key': API_KEYS.aeroDataBox,
        'X-RapidAPI-Host': 'aerodatabox.p.rapidapi.com'
      }
    });
    
    if (!response.ok) throw new Error(`AeroDataBox error: ${response.status}`);
    
    const airport = await response.json();
    return {
      name: airport.fullName || airport.shortName,
      iata_code: airport.iata || '',
      icao_code: airport.icao,
      city: airport.municipalityName,
      state: airport.regionName,
      country_code: airport.countryCode,
      lat: airport.location?.lat,
      lng: airport.location?.lon
    };
  } catch (error) {
  }
  return null;
}

async function fetchFromAviationStack(icaoCode: string): Promise<AirportInfo | null> {
  if (!API_KEYS.aviationStack) return null;
  
  try {
    const response = await fetch(`https://api.aviationstack.com/v1/airports?access_key=${API_KEYS.aviationStack}&icao_code=${icaoCode}`);
    
    if (!response.ok) throw new Error(`AviationStack error: ${response.status}`);
    
    const data = await response.json();
    if (data.data && data.data.length > 0) {
      const airport = data.data[0];
      return {
        name: airport.airport_name,
        iata_code: airport.iata_code || '',
        icao_code: airport.icao_code,
        city: airport.city_iata_code,
        state: airport.country_iso2,
        country_code: airport.country_iso2,
        lat: airport.latitude,
        lng: airport.longitude
      };
    }
  } catch (error) {
  }
  return null;
}

async function fetchFromIcaoOfficial(icaoCode: string): Promise<AirportInfo | null> {
  if (!API_KEYS.icaoOfficial) return null;
  
  try {
    const response = await fetch(`https://applications.icao.int/dataservices/api/doc7910?api_key=${API_KEYS.icaoOfficial}&airports=${icaoCode}&format=json`);
    
    if (!response.ok) throw new Error(`ICAO Official error: ${response.status}`);
    
    const data = await response.json();
    if (data && data.length > 0) {
      const airport = data[0];
      return {
        name: airport.AirportName,
        iata_code: '', // ICAO API não fornece IATA
        icao_code: airport.CodeICAO,
        city: airport.CityName,
        state: airport.StateProvinceName,
        country_code: airport.CountryCode,
        lat: airport.Latitude,
        lng: airport.Longitude
      };
    }
  } catch (error) {
  }
  return null;
}

async function fetchFromCsvFile(icaoCode: string): Promise<AirportInfo | null> {
  try {
    // Buscar o arquivo CSV no diretório público
    const response = await fetch('/airports.csv');
    if (!response.ok) {
      return null;
    }
    
    const csvText = await response.text();
    const lines = csvText.split('\n');
    
    // Pular o cabeçalho (primeira linha)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Parse da linha CSV (formato: "IATA","ICAO","Airport name","Country","City","Information")
      const columns = line.match(/"([^"]*)"/g);
      if (!columns || columns.length < 6) continue;
      
      const iata = columns[0].replace(/"/g, '');
      const icao = columns[1].replace(/"/g, '');
      const name = columns[2].replace(/"/g, '');
      const country = columns[3].replace(/"/g, '');
      const city = columns[4].replace(/"/g, '');
      
      if (icao === icaoCode) {
        return {
          name: name,
          iata_code: iata,
          icao_code: icao,
          city: city,
          state: '',
          country_code: country,
          lat: 0, // CSV não contém coordenadas
          lng: 0
        };
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

// ============================================
// MOCK DATA
// ============================================

const getMockAirportData = (icaoCode: string): AirportInfo | null => {
  const mockAirports: Record<string, AirportInfo> = {
    'SBGR': {
      name: 'Aeroporto Internacional de São Paulo/Guarulhos',
      iata_code: 'GRU',
      icao_code: 'SBGR',
      city: 'Guarulhos',
      state: 'SP',
      country_code: 'BR',
      lat: -23.4322,
      lng: -46.4692
    },
    'SBGL': {
      name: 'Aeroporto Internacional do Galeão',
      iata_code: 'GIG',
      icao_code: 'SBGL',
      city: 'Rio de Janeiro',
      state: 'RJ',
      country_code: 'BR',
      lat: -22.8089,
      lng: -43.2436
    },
    'SBRJ': {
      name: 'Aeroporto Santos Dumont',
      iata_code: 'SDU',
      icao_code: 'SBRJ',
      city: 'Rio de Janeiro',
      state: 'RJ',
      country_code: 'BR',
      lat: -22.9105,
      lng: -43.1631
    },
    'SBSP': {
      name: 'Aeroporto de Congonhas',
      iata_code: 'CGH',
      icao_code: 'SBSP',
      city: 'São Paulo',
      state: 'SP',
      country_code: 'BR',
      lat: -23.6261,
      lng: -46.6564
    }
  };

  return mockAirports[icaoCode.toUpperCase()] || null;
};