import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Map,
  List,
  Plane,
  Globe,
  Activity,
  RefreshCw,
  Settings,
  Info
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import FlightMap, { FlightRoute, Airport } from '@/components/maps/FlightMap';
import RouteList from '@/components/maps/RouteList';

// ============================================
// DADOS DE EXEMPLO
// ============================================

// Aeroportos de exemplo
const sampleAirports: Airport[] = [
  { icao: 'KJFK', name: 'John F. Kennedy International Airport', lat: 40.6413, lng: -73.7781, country: 'USA' },
  { icao: 'KLAX', name: 'Los Angeles International Airport', lat: 33.9425, lng: -118.4081, country: 'USA' },
  { icao: 'KORD', name: 'Chicago O\'Hare International Airport', lat: 41.9742, lng: -87.9073, country: 'USA' },
  { icao: 'KDEN', name: 'Denver International Airport', lat: 39.8561, lng: -104.6737, country: 'USA' },
  { icao: 'KIAH', name: 'George Bush Intercontinental Airport', lat: 29.9902, lng: -95.3368, country: 'USA' },
  { icao: 'KMIA', name: 'Miami International Airport', lat: 25.7959, lng: -80.2870, country: 'USA' },
  { icao: 'KSEA', name: 'Seattle-Tacoma International Airport', lat: 47.4502, lng: -122.3088, country: 'USA' },
  { icao: 'SBGR', name: 'São Paulo/Guarulhos International Airport', lat: -23.4356, lng: -46.4731, country: 'Brazil' },
  { icao: 'SBSP', name: 'São Paulo/Congonhas Airport', lat: -23.6266, lng: -46.6556, country: 'Brazil' },
  { icao: 'SBRJ', name: 'Rio de Janeiro/Santos Dumont Airport', lat: -22.9099, lng: -43.1635, country: 'Brazil' }
];

// Rotas de exemplo
const generateSampleRoutes = (): FlightRoute[] => {
  const routes: FlightRoute[] = [
    {
      id: 'route-1',
      departure: sampleAirports[0], // KJFK
      arrival: sampleAirports[1],   // KLAX
      aircraft: 'Boeing 737-800',
      callsign: 'AAL123',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 dias atrás
      status: 'completed',
      waypoints: [
        { lat: 40.0, lng: -85.0, name: 'WAYPOINT1' },
        { lat: 39.0, lng: -95.0, name: 'WAYPOINT2' },
        { lat: 36.0, lng: -110.0, name: 'WAYPOINT3' }
      ]
    },
    {
      id: 'route-2',
      departure: sampleAirports[7], // SBGR
      arrival: sampleAirports[0],   // KJFK
      aircraft: 'Airbus A350-900',
      callsign: 'TAM8065',
      date: new Date().toISOString(), // Agora
      status: 'active'
    },
    {
      id: 'route-3',
      departure: sampleAirports[2], // KORD
      arrival: sampleAirports[4],   // KIAH
      aircraft: 'Boeing 777-300ER',
      callsign: 'UAL456',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 dia atrás
      status: 'completed',
      waypoints: [
        { lat: 40.0, lng: -90.0, name: 'CHI_DEP' },
        { lat: 35.0, lng: -92.0, name: 'MID_ROUTE' }
      ]
    },
    {
      id: 'route-4',
      departure: sampleAirports[6], // KSEA
      arrival: sampleAirports[3],   // KDEN
      aircraft: 'Boeing 787-9',
      callsign: 'DAL789',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Amanhã
      status: 'planned'
    },
    {
      id: 'route-5',
      departure: sampleAirports[8], // SBSP
      arrival: sampleAirports[9],   // SBRJ
      aircraft: 'Embraer E190',
      callsign: 'GLO1234',
      date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 horas atrás
      status: 'completed'
    }
  ];

  return routes;
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const FlightMaps: React.FC = () => {
  const { t } = useTranslation();
  const [routes, setRoutes] = useState<FlightRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string | undefined>();
  const [hoveredRoute, setHoveredRoute] = useState<string | null>(null);
  const [showAllRoutes, setShowAllRoutes] = useState(true);
  const [activeTab, setActiveTab] = useState('map');
  const [isLoading, setIsLoading] = useState(false);

  // Dados de tempo real simulados (para demonstração)
  const [realTimeData, setRealTimeData] = useState<{
    lat: number;
    lng: number;
    heading: number;
    altitude: number;
    speed: number;
  } | undefined>();

  // Carregar dados iniciais
  useEffect(() => {
    setIsLoading(true);
    // Simular carregamento de dados
    setTimeout(() => {
      const sampleRoutes = generateSampleRoutes();
      setRoutes(sampleRoutes);

      // Encontrar rota ativa para dados em tempo real
      const activeRoute = sampleRoutes.find(r => r.status === 'active');
      if (activeRoute) {
        setSelectedRoute(activeRoute.id);
        // Simular posição atual da aeronave (meio da rota)
        const midLat = (activeRoute.departure.lat + activeRoute.arrival.lat) / 2;
        const midLng = (activeRoute.departure.lng + activeRoute.arrival.lng) / 2;
        setRealTimeData({
          lat: midLat,
          lng: midLng,
          heading: 270, // Oeste
          altitude: 37000,
          speed: 450
        });
      }

      setIsLoading(false);
    }, 1000);
  }, []);

  // Simular atualização de dados em tempo real
  useEffect(() => {
    if (!realTimeData) return;

    const interval = setInterval(() => {
      setRealTimeData(prev => {
        if (!prev) return prev;

        // Simular movimento da aeronave
        return {
          ...prev,
          lat: prev.lat + (Math.random() - 0.5) * 0.01,
          lng: prev.lng + (Math.random() - 0.5) * 0.01,
          heading: prev.heading + (Math.random() - 0.5) * 10,
          altitude: prev.altitude + (Math.random() - 0.5) * 1000,
          speed: prev.speed + (Math.random() - 0.5) * 20
        };
      });
    }, 5000); // Atualizar a cada 5 segundos

    return () => clearInterval(interval);
  }, [realTimeData]);

  // Handlers
  const handleRouteSelect = (routeId: string) => {
    setSelectedRoute(routeId);
    setShowAllRoutes(false);
  };

  const handleShowAllRoutes = () => {
    setShowAllRoutes(true);
    setSelectedRoute(undefined);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    // Simular refresh dos dados
    setTimeout(() => {
      setRoutes(generateSampleRoutes());
      setIsLoading(false);
    }, 1000);
  };

  // Estatísticas
  const stats = {
    total: routes.length,
    completed: routes.filter(r => r.status === 'Concluído').length,
    active: routes.filter(r => r.status === 'active').length,
    planned: routes.filter(r => r.status === 'planned').length
  };

  return (
    <div className="container mx-auto px-6 pt-8 pb-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mobile-title gradient-title flex items-center">
            <Map className="h-8 w-8 mr-3 text-primary" />
            {t('maps.title', 'Mapas de Voo')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('maps.subtitle', 'Visualize e acompanhe rotas de voo em tempo real')}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {t('financialReports.refresh')}
          </Button>

          <Button
            variant={showAllRoutes ? 'default' : 'outline'}
            size="sm"
            onClick={handleShowAllRoutes}
          >
            <Globe className="h-4 w-4 mr-2" />
            {t('maps.allRoutes')}
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Map className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('maps.completed')}</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('maps.active')}</p>
                <p className="text-2xl font-bold text-red-600">{stats.active}</p>
              </div>
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('maps.planned')}</p>
                <p className="text-2xl font-bold text-blue-600">{stats.planned}</p>
              </div>
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mapa */}
        <div className="lg:col-span-2">
          <FlightMap
            routes={routes}
            selectedRoute={selectedRoute}
            onRouteSelect={handleRouteSelect}
            showAllRoutes={showAllRoutes}
            realTimeData={realTimeData}
          />
        </div>

        {/* Lista de Rotas */}
        <div className="lg:col-span-1">
          <RouteList
            routes={routes}
            selectedRoute={selectedRoute}
            onRouteSelect={handleRouteSelect}
            onRouteHover={setHoveredRoute}
          />
        </div>
      </div>

      {/* Informações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Info className="h-5 w-5 mr-2 text-primary" />
            {t('settings.about')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">{t('maps.mapLegend')}:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li className="flex items-center">
                  <div className="w-3 h-1 bg-green-500 mr-2" />
                  {t('maps.completed')}
                </li>
                <li className="flex items-center">
                  <div className="w-3 h-1 bg-red-500 mr-2" />
                  {t('maps.active')}
                </li>
                <li className="flex items-center">
                  <div className="w-3 h-1 bg-blue-500 mr-2" />
                  {t('maps.planned')}
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">{t('maps.features')}:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• {t('maps.realtimeTracking')}</li>
                <li>• {t('maps.multipleLayers')}</li>
                <li>• {t('maps.detailedWaypoints')}</li>
                <li>• {t('maps.advancedFilters')}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FlightMaps;