import { useState, useEffect } from 'react';
import { Search, Plane } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const OURAIRPORTS_URL = 'https://davidmegginson.github.io/ourairports-data/airports.csv';

interface Airport {
  icao: string;
  type: string;
  name: string;
  lat: number;
  lng: number;
  elevation: number;
  country: string;
  region: string;
  city: string;
  iata: string;
}

let airportsCache: Map<string, Airport> | null = null;
let cacheTime = 0;

const typeLabels: Record<string, string> = {
  'large_airport': '🏢 Grande',
  'medium_airport': '🏛️ Médio',
  'small_airport': '🏠 Pequeno',
  'heliport': '🚁 Heliporto',
  'seaplane_base': '🛥️ Hidroavião',
  'balloonport': '🎈 Balão',
  'closed': '🚫 Fechado'
};

async function loadOurAirports(): Promise<Map<string, Airport>> {
  if (airportsCache && (Date.now() - cacheTime < 24 * 60 * 60 * 1000)) {
    return airportsCache;
  }

  const response = await fetch(OURAIRPORTS_URL);
  const text = await response.text();
  const lines = text.split('\n');
  
  const airports = new Map<string, Airport>();
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
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
    
    if (columns.length >= 14) {
      const icao = columns[1]?.trim();
      if (icao && icao.length === 4) {
        airports.set(icao.toUpperCase(), {
          icao: icao,
          type: columns[2],
          name: columns[3],
          lat: parseFloat(columns[4]) || 0,
          lng: parseFloat(columns[5]) || 0,
          elevation: parseInt(columns[6]) || 0,
          country: columns[8],
          region: columns[9],
          city: columns[10],
          iata: columns[13]
        });
      }
    }
  }
  
  airportsCache = airports;
  cacheTime = Date.now();
  
  return airports;
}

export default function AirportSearchTool() {
  const [icao, setIcao] = useState('');
  const [searching, setSearching] = useState(false);
  const [airport, setAirport] = useState<Airport | null>(null);
  const [error, setError] = useState('');
  const [searchTime, setSearchTime] = useState(0);
  const [cacheStats, setCacheStats] = useState({ size: 0, lastUpdate: '', age: '' });

  const examples = [
    { code: 'SBGR', desc: 'Guarulhos/SP' },
    { code: 'SNJR', desc: 'Fazenda Jaragua/MT' },
    { code: 'KJFK', desc: 'JFK New York' },
    { code: 'EGLL', desc: 'London Heathrow' },
    { code: 'SSYA', desc: 'Arapoti/PR' },
    { code: 'SBSP', desc: 'Congonhas/SP' }
  ];

  useEffect(() => {
    // Pré-carregar cache
    loadOurAirports().then((cache) => {
      updateCacheStats(cache);
    });
  }, []);

  const updateCacheStats = (cache: Map<string, Airport>) => {
    const ageHours = Math.floor((Date.now() - cacheTime) / 1000 / 60 / 60);
    setCacheStats({
      size: cache.size,
      lastUpdate: new Date(cacheTime).toLocaleString('pt-BR'),
      age: `${ageHours}h`
    });
  };

  const handleSearch = async () => {
    const code = icao.toUpperCase().trim();
    
    if (!code || code.length !== 4) {
      setError('Código ICAO deve ter 4 letras!');
      setAirport(null);
      return;
    }

    setSearching(true);
    setError('');
    setAirport(null);

    try {
      const startTime = performance.now();
      const airports = await loadOurAirports();
      const result = airports.get(code);
      const endTime = performance.now();
      
      setSearchTime(endTime - startTime);
      
      if (result) {
        setAirport(result);
        updateCacheStats(airports);
      } else {
        setError(`Aeroporto ${code} não encontrado na base OurAirports (76.000+ aeroportos)`);
      }
    } catch (err) {
      setError(`Erro ao buscar: ${err}`);
    } finally {
      setSearching(false);
    }
  };

  const testExample = (code: string) => {
    setIcao(code);
    setTimeout(() => handleSearch(), 100);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Plane className="w-8 h-8" />
          Buscador de Aeroportos
        </h1>
        <p className="text-muted-foreground">
          Base OurAirports: 76.000+ aeroportos | Atualização diária automática
        </p>
      </div>

      {/* Search Box */}
      <div className="flex gap-2">
        <Input
          type="text"
          value={icao}
          onChange={(e) => setIcao(e.target.value.toUpperCase())}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Digite o código ICAO (ex: SBGR, SNJR, KJFK)"
          maxLength={4}
          className="text-lg uppercase"
        />
        <Button onClick={handleSearch} disabled={searching} className="min-w-[120px]">
          {searching ? (
            <>⏳ Buscando...</>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </>
          )}
        </Button>
      </div>

      {/* Examples */}
      <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <h3 className="font-semibold mb-2 text-yellow-800 dark:text-yellow-200">💡 Exemplos para testar:</h3>
        <div className="flex flex-wrap gap-2">
          {examples.map((ex) => (
            <button
              key={ex.code}
              onClick={() => testExample(ex.code)}
              className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 hover:bg-yellow-200 dark:hover:bg-yellow-800 rounded border border-yellow-300 dark:border-yellow-700 font-mono text-sm transition-all hover:scale-105"
            >
              {ex.code} <span className="text-xs text-muted-foreground">({ex.desc})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {airport && (
        <div className="bg-green-50 dark:bg-green-950 border-l-4 border-green-500 rounded-lg p-6 space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-green-700 dark:text-green-300 flex items-center gap-2">
              ✅ Aeroporto Encontrado!
            </h2>
            <p className="text-sm text-muted-foreground">Tempo de busca: {searchTime.toFixed(2)}ms</p>
          </div>

          <div className="flex gap-2">
            <Badge variant="default">🌍 OurAirports</Badge>
            <Badge variant="secondary">{typeLabels[airport.type] || airport.type}</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-900 p-3 rounded border">
              <div className="text-xs font-semibold text-primary uppercase mb-1">Nome</div>
              <div className="text-sm">{airport.name || 'N/A'}</div>
            </div>
            <div className="bg-white dark:bg-gray-900 p-3 rounded border">
              <div className="text-xs font-semibold text-primary uppercase mb-1">ICAO / IATA</div>
              <div className="text-sm">{airport.icao} / {airport.iata || 'N/A'}</div>
            </div>
            <div className="bg-white dark:bg-gray-900 p-3 rounded border">
              <div className="text-xs font-semibold text-primary uppercase mb-1">Cidade</div>
              <div className="text-sm">{airport.city || 'N/A'}</div>
            </div>
            <div className="bg-white dark:bg-gray-900 p-3 rounded border">
              <div className="text-xs font-semibold text-primary uppercase mb-1">Estado</div>
              <div className="text-sm">{airport.region?.split('-')[1] || 'N/A'}</div>
            </div>
            <div className="bg-white dark:bg-gray-900 p-3 rounded border">
              <div className="text-xs font-semibold text-primary uppercase mb-1">País</div>
              <div className="text-sm">{airport.country || 'N/A'}</div>
            </div>
            <div className="bg-white dark:bg-gray-900 p-3 rounded border">
              <div className="text-xs font-semibold text-primary uppercase mb-1">Região ISO</div>
              <div className="text-sm">{airport.region || 'N/A'}</div>
            </div>
            <div className="bg-white dark:bg-gray-900 p-3 rounded border">
              <div className="text-xs font-semibold text-primary uppercase mb-1">Coordenadas</div>
              <div className="text-sm">{airport.lat.toFixed(4)}, {airport.lng.toFixed(4)}</div>
            </div>
            <div className="bg-white dark:bg-gray-900 p-3 rounded border">
              <div className="text-xs font-semibold text-primary uppercase mb-1">Elevação</div>
              <div className="text-sm">{airport.elevation || 0} ft</div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-950 border-l-4 border-red-500 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-700 dark:text-red-300 mb-2">❌ {error}</h2>
          <p className="text-sm text-muted-foreground">
            💡 Verifique se digitou corretamente ou tente outro código.
          </p>
        </div>
      )}

      {/* Cache Stats */}
      <div className="bg-muted rounded-lg p-4">
        <strong className="block mb-2">📊 Estatísticas do Cache:</strong>
        <div className="text-sm space-y-1">
          <div>• Total de aeroportos em cache: <strong>{cacheStats.size.toLocaleString('pt-BR')}</strong></div>
          <div>• Última atualização: <strong>{cacheStats.lastUpdate || 'Carregando...'}</strong></div>
          <div>• Idade do cache: <strong>{cacheStats.age || 'N/A'}</strong></div>
        </div>
      </div>
    </div>
  );
}
