/**
 * Serviço para buscar informações de aeroportos pelo código ICAO
 * Utiliza a API AirLabs (https://airlabs.co/api)
 */

const AIRLABS_API_KEY = ''; // Adicione sua chave API aqui

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
 * Busca informações de um aeroporto pelo código ICAO
 * @param icaoCode Código ICAO do aeroporto (ex: SBGR)
 * @returns Informações do aeroporto ou null se não encontrado
 */
export async function fetchAirportByIcao(icaoCode: string): Promise<AirportInfo | null> {
  if (!icaoCode || icaoCode.length !== 4) {
    console.error('Código ICAO inválido:', icaoCode);
    return {
      name: 'Código ICAO inválido',
      iata_code: '',
      icao_code: icaoCode,
      error: 'Código ICAO inválido'
    };
  }

  try {
    // Verificar primeiro no cache local para economia de API
    const cachedData = localStorage.getItem(`airport_${icaoCode}`);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    // Sem chave API, usar dados mockados temporariamente para não depender de API externa
    if (!AIRLABS_API_KEY) {
      return getMockAirportData(icaoCode);
    }

    // Buscar dados reais da API
    const response = await fetch(
      `https://airlabs.co/api/v9/airports?icao_code=${icaoCode}&api_key=${AIRLABS_API_KEY}`
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
        lng: airport.lng
      };
      
      // Salvar no cache para uso futuro
      localStorage.setItem(`airport_${icaoCode}`, JSON.stringify(airportInfo));
      return airportInfo;
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao buscar informações do aeroporto:', error);
    return {
      name: 'Erro ao buscar informações',
      iata_code: '',
      icao_code: icaoCode,
      error: 'Erro na API'
    };
  }
}

/**
 * Dados mockados de aeroportos para uso quando não tiver API key
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