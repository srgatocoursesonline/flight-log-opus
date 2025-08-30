/**
 * Serviço para buscar informações de aeroportos pelo código ICAO
 * Utiliza múltiplas APIs com sistema de fallback para garantir cobertura completa
 * APIs suportadas: API Ninjas, AeroDataBox, ICAO Official, AviationStack
 */

// Chaves de API - adicione suas chaves aqui
const API_KEYS = {
  ninjas: '', // https://api.api-ninjas.com/
  aeroDataBox: '', // https://aerodatabox.com/
  aviationStack: '', // https://aviationstack.com/
  icaoOfficial: '' // https://applications.icao.int/dataservices/
};

interface AirportInfo {
  name: string;
  iata_code: string;
  icao_code: string;
  city?: string;
  state?: string;
  country_code?: string;
  lat?: number;
  lng?: number;
  error?: string;
}

/**
 * Busca informações de um aeroporto pelo código ICAO usando múltiplas APIs
 * @param icaoCode Código ICAO do aeroporto (ex: SBGR)
 * @returns Informações do aeroporto ou null se não encontrado
 */
export async function fetchAirportByIcao(icaoCode: string): Promise<AirportInfo | null> {
  if (!icaoCode || icaoCode.length !== 4) {
    console.warn('Código ICAO inválido:', icaoCode);
    return null;
  }

  const upperIcaoCode = icaoCode.toUpperCase();
  
  // Verificar cache primeiro
  const cachedData = localStorage.getItem(`airport_${upperIcaoCode}`);
  if (cachedData) {
    const parsed = JSON.parse(cachedData);
    // Verificar se o cache não é muito antigo (7 dias)
    if (parsed.cached_at && Date.now() - parsed.cached_at < 7 * 24 * 60 * 60 * 1000) {
      console.log(`Dados do aeroporto ${upperIcaoCode} obtidos do cache`);
      return parsed.data;
    }
  }

  console.log(`Buscando informações do aeroporto ${upperIcaoCode} via APIs...`);

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
      console.log(`Tentando buscar via ${api.name}...`);
      const result = await api.fetch();
      if (result) {
        console.log(`✅ Aeroporto ${upperIcaoCode} encontrado via ${api.name}`);
        // Salvar no cache com timestamp
        const cacheData = {
          data: result,
          cached_at: Date.now()
        };
        localStorage.setItem(`airport_${upperIcaoCode}`, JSON.stringify(cacheData));
        return result;
      }
    } catch (error) {
      console.warn(`❌ ${api.name} falhou para ${upperIcaoCode}:`, error);
      continue;
    }
  }

  // Fallback para dados mockados
  console.log(`⚠️ Todas as APIs falharam. Usando dados mockados para ${upperIcaoCode}`);
  const mockData = getMockAirportData(upperIcaoCode);
  
  if (mockData) {
    console.log(`✅ Dados mockados encontrados para ${upperIcaoCode}`);
    // Salvar dados mockados no cache também
    const cacheData = {
      data: mockData,
      cached_at: Date.now()
    };
    localStorage.setItem(`airport_${upperIcaoCode}`, JSON.stringify(cacheData));
  } else {
    console.warn(`❌ Nenhum dado encontrado para ${upperIcaoCode}`);
  }
  
  return mockData;
}

/**
 * Busca informações do aeroporto via API Ninjas
 * @param icaoCode Código ICAO do aeroporto
 * @returns Informações do aeroporto ou null
 */
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
    console.warn('API Ninjas falhou:', error);
  }
  return null;
}

/**
 * Busca informações do aeroporto via AeroDataBox
 * @param icaoCode Código ICAO do aeroporto
 * @returns Informações do aeroporto ou null
 */
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
    console.warn('AeroDataBox falhou:', error);
  }
  return null;
}

/**
 * Busca informações do aeroporto via AviationStack
 * @param icaoCode Código ICAO do aeroporto
 * @returns Informações do aeroporto ou null
 */
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
    console.warn('AviationStack falhou:', error);
  }
  return null;
}

/**
 * Busca informações do aeroporto via ICAO Official API
 * @param icaoCode Código ICAO do aeroporto
 * @returns Informações do aeroporto ou null
 */
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
    console.warn('ICAO Official falhou:', error);
  }
  return null;
}

/**
 * Busca informações do aeroporto no arquivo CSV local
 * @param icaoCode Código ICAO do aeroporto
 * @returns Informações do aeroporto ou null
 */
async function fetchFromCsvFile(icaoCode: string): Promise<AirportInfo | null> {
  try {
    console.log(`Buscando ${icaoCode} no arquivo CSV local...`);
    
    // Buscar o arquivo CSV no diretório público
    const response = await fetch('/airports.csv');
    if (!response.ok) {
      console.warn('Arquivo airports.csv não encontrado');
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
    
    console.log(`Aeroporto ${icaoCode} não encontrado no arquivo CSV`);
    return null;
  } catch (error) {
    console.warn('Erro ao buscar no arquivo CSV:', error);
    return null;
  }
}

/**
 * Dados mockados de aeroportos para uso como fallback final
 * @param icaoCode Código ICAO do aeroporto
 * @returns Dados mockados do aeroporto
 */
function getMockAirportData(icaoCode: string): AirportInfo | null {
  const mockData: Record<string, AirportInfo> = {
    'SBGR': {
      name: 'Aeroporto Internacional de São Paulo/Guarulhos',
      iata_code: 'GRU',
      icao_code: 'SBGR',
      city: 'Guarulhos',
      state: 'SP',
      country_code: 'BR',
      lat: -23.435556,
      lng: -46.473056
    },
    'SBRJ': {
      name: 'Aeroporto Santos Dumont',
      iata_code: 'SDU',
      icao_code: 'SBRJ',
      city: 'Rio de Janeiro',
      state: 'RJ',
      country_code: 'BR',
      lat: -22.910556,
      lng: -43.163333
    },
    'SBSP': {
      name: 'Aeroporto de Congonhas',
      iata_code: 'CGH',
      icao_code: 'SBSP',
      city: 'São Paulo',
      state: 'SP',
      country_code: 'BR',
      lat: -23.626111,
      lng: -46.656389
    },
    'SBCF': {
      name: 'Aeroporto Internacional de Belo Horizonte/Confins',
      iata_code: 'CNF',
      icao_code: 'SBCF',
      city: 'Confins',
      state: 'MG',
      country_code: 'BR',
      lat: -19.624444,
      lng: -43.971944
    },
    'SBBR': {
      name: 'Aeroporto Internacional de Brasília',
      iata_code: 'BSB',
      icao_code: 'SBBR',
      city: 'Brasília',
      state: 'DF',
      country_code: 'BR',
      lat: -15.871111,
      lng: -47.918889
    },
    'SBKP': {
      name: 'Aeroporto Internacional de Campinas/Viracopos',
      iata_code: 'VCP',
      icao_code: 'SBKP',
      city: 'Campinas',
      state: 'SP',
      country_code: 'BR',
      lat: -23.007222,
      lng: -47.134444
    },
    'SBPA': {
      name: 'Aeroporto Internacional de Porto Alegre',
      iata_code: 'POA',
      icao_code: 'SBPA',
      city: 'Porto Alegre',
      state: 'RS',
      country_code: 'BR',
      lat: -29.994444,
      lng: -51.171111
    }
  };
  
  // Retornar dados mockados se existir, ou null
  return mockData[icaoCode.toUpperCase()] || null;
}

/**
 * Busca o país de um aeroporto pelo código ICAO
 * @param icaoCode Código ICAO do aeroporto
 * @returns Código do país do aeroporto, ou string vazia se não encontrado
 */
export async function getCountryCodeByIcao(icaoCode: string): Promise<string> {
  const airportInfo = await fetchAirportByIcao(icaoCode);
  return airportInfo?.country_code || '';
}

export default {
  fetchAirportByIcao,
  getCountryCodeByIcao
};