import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plane,
  MapPin,
  Route,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

// ============================================
// TIPOS E INTERFACES
// ============================================

interface Airport {
  icao: string;
  name: string;
  lat: number;
  lng: number;
  country: string;
}

interface FlightRoute {
  id: string;
  departure: Airport;
  arrival: Airport;
  aircraft: string;
  callsign: string;
  date: string;
  status: 'completed' | 'active' | 'planned';
  waypoints?: Array<{ lat: number; lng: number; name?: string }>;
}

interface FlightMapProps {
  routes: FlightRoute[];
  selectedRoute?: string;
  onRouteSelect?: (routeId: string) => void;
  showAllRoutes?: boolean;
  realTimeData?: {
    lat: number;
    lng: number;
    heading: number;
    altitude: number;
    speed: number;
  };
}

// ============================================
// ÍCONES CUSTOMIZADOS
// ============================================

// Corrigir ícones padrão do Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Ícone de aeroporto
const airportIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 4s-2 2-3.5 3.5L11 16l-8.2 1.8c-.5.1-.8.6-.8 1.1s.3 1 .8 1.1L11 21l5-5z"/>
      <path d="m6 16 2 2"/>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

// Ícone de aeronave em tempo real
const aircraftIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 4s-2 2-3.5 3.5L11 16l-8.2 1.8c-.5.1-.8.6-.8 1.1s.3 1 .8 1.1L11 21l5-5z"/>
      <path d="m6 16 2 2"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

// ============================================
// COMPONENTE DE CONTROLES DO MAPA
// ============================================

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  selectedLayer: string;
  onLayerChange: (layer: string) => void;
}

const MapControls: React.FC<MapControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onReset,
  selectedLayer,
  onLayerChange
}) => {
  const { t } = useTranslation();

  return (
    <div className="absolute top-4 right-4 z-[1000] space-y-2">
      {/* Controles de Zoom */}
      <div className="bg-background/90 backdrop-blur-sm border rounded-lg p-2 space-y-1">
        <Button
          variant="outline"
          size="sm"
          onClick={onZoomIn}
          className="w-full"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onZoomOut}
          className="w-full"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="w-full"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Seletor de Camadas */}
      <div className="bg-background/90 backdrop-blur-sm border rounded-lg p-2">
        <Select value={selectedLayer} onValueChange={onLayerChange}>
          <SelectTrigger className="w-32">
            <Layers className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="satellite">Satélite</SelectItem>
            <SelectItem value="street">Ruas</SelectItem>
            <SelectItem value="terrain">Terreno</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL DO MAPA
// ============================================

const FlightMap: React.FC<FlightMapProps> = ({
  routes,
  selectedRoute,
  onRouteSelect,
  showAllRoutes = true,
  realTimeData
}) => {
  const { t } = useTranslation();
  const mapRef = useRef<L.Map | null>(null);
  const [selectedLayer, setSelectedLayer] = useState('satellite');

  // URLs das camadas de mapa
  const mapLayers = {
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    },
    street: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    },
    terrain: {
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    }
  };

  // Filtrar rotas para exibição
  const displayRoutes = showAllRoutes 
    ? routes 
    : routes.filter(route => route.id === selectedRoute);

  // Cores das rotas por status
  const getRouteColor = (status: string) => {
    switch (status) {
      case 'completed': return '#22c55e'; // Verde
      case 'active': return '#ef4444';    // Vermelho
      case 'planned': return '#3b82f6';   // Azul
      default: return '#6b7280';          // Cinza
    }
  };

  // Controles do mapa
  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

  const handleReset = () => {
    if (mapRef.current && displayRoutes.length > 0) {
      const bounds = L.latLngBounds(
        displayRoutes.flatMap(route => [
          [route.departure.lat, route.departure.lng],
          [route.arrival.lat, route.arrival.lng]
        ])
      );
      mapRef.current.fitBounds(bounds, { padding: [20, 20] });
    }
  };

  // Componente para acessar a instância do mapa
  const MapInstance = () => {
    const map = useMap();
    
    useEffect(() => {
      mapRef.current = map;
    }, [map]);

    return null;
  };

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Route className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">
              {t('maps.flightRoutes', 'Rotas de Voo')}
            </CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {displayRoutes.length} {displayRoutes.length === 1 ? 'rota' : 'rotas'}
            </Badge>
            {realTimeData && (
              <Badge variant="destructive" className="text-xs animate-pulse">
                <Plane className="h-3 w-3 mr-1" />
                AO VIVO
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="relative h-[500px] w-full">
          <MapContainer
            center={[39.8283, -98.5795]} // Centro dos EUA
            zoom={4}
            className="h-full w-full rounded-b-lg"
            zoomControl={false}
          >
            <MapInstance />
            
            {/* Camada de Mapa */}
            <TileLayer
              url={mapLayers[selectedLayer as keyof typeof mapLayers].url}
              attribution={mapLayers[selectedLayer as keyof typeof mapLayers].attribution}
            />

            {/* Rotas de Voo */}
            {displayRoutes.map((route) => {
              const routePoints = [
                [route.departure.lat, route.departure.lng],
                ...(route.waypoints?.map(wp => [wp.lat, wp.lng]) || []),
                [route.arrival.lat, route.arrival.lng]
              ] as [number, number][];

              return (
                <React.Fragment key={route.id}>
                  {/* Linha da Rota */}
                  <Polyline
                    positions={routePoints}
                    color={getRouteColor(route.status)}
                    weight={route.id === selectedRoute ? 4 : 2}
                    opacity={route.id === selectedRoute ? 1 : 0.7}
                    eventHandlers={{
                      click: () => onRouteSelect?.(route.id)
                    }}
                  />

                  {/* Marcador do Aeroporto de Partida */}
                  <Marker
                    position={[route.departure.lat, route.departure.lng]}
                    icon={airportIcon}
                  >
                    <Popup>
                      <div className="text-sm">
                        <div className="font-semibold">{route.departure.icao}</div>
                        <div className="text-muted-foreground">{route.departure.name}</div>
                        <div className="text-xs mt-1">
                          <Badge variant="outline" size="sm">Partida</Badge>
                        </div>
                      </div>
                    </Popup>
                  </Marker>

                  {/* Marcador do Aeroporto de Chegada */}
                  <Marker
                    position={[route.arrival.lat, route.arrival.lng]}
                    icon={airportIcon}
                  >
                    <Popup>
                      <div className="text-sm">
                        <div className="font-semibold">{route.arrival.icao}</div>
                        <div className="text-muted-foreground">{route.arrival.name}</div>
                        <div className="text-xs mt-1">
                          <Badge variant="outline" size="sm">Chegada</Badge>
                        </div>
                      </div>
                    </Popup>
                  </Marker>

                  {/* Waypoints */}
                  {route.waypoints?.map((waypoint, index) => (
                    <Marker
                      key={`${route.id}-wp-${index}`}
                      position={[waypoint.lat, waypoint.lng]}
                    >
                      <Popup>
                        <div className="text-sm">
                          <div className="font-semibold">
                            {waypoint.name || `Waypoint ${index + 1}`}
                          </div>
                          <div className="text-xs mt-1">
                            <Badge variant="secondary" size="sm">Waypoint</Badge>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </React.Fragment>
              );
            })}

            {/* Aeronave em Tempo Real */}
            {realTimeData && (
              <Marker
                position={[realTimeData.lat, realTimeData.lng]}
                icon={aircraftIcon}
              >
                <Popup>
                  <div className="text-sm">
                    <div className="font-semibold flex items-center">
                      <Plane className="h-4 w-4 mr-1 text-red-500" />
                      Aeronave Ativa
                    </div>
                    <div className="space-y-1 mt-2 text-xs">
                      <div>Altitude: {realTimeData.altitude.toLocaleString()} ft</div>
                      <div>Velocidade: {Math.round(realTimeData.speed)} kts</div>
                      <div>Proa: {Math.round(realTimeData.heading)}°</div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>

          {/* Controles do Mapa */}
          <MapControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onReset={handleReset}
            selectedLayer={selectedLayer}
            onLayerChange={setSelectedLayer}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default FlightMap;
export type { FlightRoute, Airport };