import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
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
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Wifi,
  WifiOff
} from 'lucide-react';
import { toast } from 'sonner';

// ============================================
// TIPOS E INTERFACES
// ============================================

interface FlightPoint {
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  heading: number;
  verticalSpeed: number;
  timestamp: number;
  onGround: boolean;
}

interface FlightSession {
  id: string;
  deviceId: string;
  aircraft: string;
  startTime: string;
  endTime?: string;
  status: 'active' | 'completed';
}

interface WebSocketMessage {
  type: 'auth_success' | 'auth_error' | 'flight_started' | 'flight_ended' | 'flight_data' | 'error' | 'pong';
  data?: any;
  message?: string;
  sessionId?: string;
}

interface LiveTrackingMapProps {
  className?: string;
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

// Ícone de aeronave em tempo real com rotação
const createAircraftIcon = (heading: number) => {
  return new L.DivIcon({
    html: `
      <div style="transform: rotate(${heading}deg); width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 4s-2 2-3.5 3.5L11 16l-8.2 1.8c-.5.1-.8.6-.8 1.1s.3 1 .8 1.1L11 21l5-5z"/>
          <path d="m6 16 2 2"/>
        </svg>
      </div>
    `,
    className: 'aircraft-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({ className }) => {
  const mapRef = useRef<L.Map | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<FlightPoint | null>(null);
  const [flightPath, setFlightPath] = useState<[number, number][]>([]);
  const [currentSession, setCurrentSession] = useState<FlightSession | null>(null);
  const [selectedLayer, setSelectedLayer] = useState('satellite');
  const [followAircraft, setFollowAircraft] = useState(true);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

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

  // ============================================
  // WEBSOCKET CONNECTION
  // ============================================

  const connectWebSocket = useCallback(() => {
    try {
      const ws = new WebSocket('ws://localhost:3001/flight-tracking');
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('🔗 Conectado ao Flight Tracking Service');
        setIsConnected(true);
        setConnectionAttempts(0);
        
        // Autenticar com token de dispositivo válido
        const authMessage = {
          type: 'auth',
          deviceToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXZpY2VJZCI6IjFjNDdiMzVmLWVjZjEtNGRjYy05M2U3LTkxZWQ1MGE2NWJiNCIsInVzZXJJZCI6ImRlbW8tdXNlci0xMjMiLCJpYXQiOjE3NTY1ODM3ODI2NDF9.ufVTZaWq3lHawa2T7ipe3QE9kfK_Cd9vTGrRt6ewMDo'
        };
        ws.send(JSON.stringify(authMessage));
        
        toast.success('Conectado ao Flight Tracking Service');
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (error) {
          console.error('Erro ao processar mensagem WebSocket:', error);
        }
      };

      ws.onclose = () => {
        console.log('❌ Desconectado do Flight Tracking Service');
        setIsConnected(false);
        setCurrentPosition(null);
        setCurrentSession(null);
        
        // Tentar reconectar após 3 segundos apenas se não foi desconectado intencionalmente
        if (connectionAttempts < 5 && wsRef.current) {
          setTimeout(() => {
            setConnectionAttempts(prev => prev + 1);
            connectWebSocket();
          }, 3000);
        }
      };

      ws.onerror = (error) => {
        console.error('Erro WebSocket:', error);
        // Remover toast de erro para evitar spam
      };

    } catch (error) {
      console.error('Erro ao conectar WebSocket:', error);
      // Remover toast de erro para evitar spam
    }
  }, [connectionAttempts, handleWebSocketMessage]);

  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  };

  // ============================================
  // MESSAGE HANDLING
  // ============================================

  const handleWebSocketMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'auth_success':
        console.log('✅ Autenticação bem-sucedida');
        toast.success('Dispositivo autenticado');
        break;
        
      case 'auth_error':
        console.error('❌ Erro de autenticação:', message.message);
        toast.error('Erro de autenticação: ' + message.message);
        break;
        
      case 'flight_started':
        console.log('🛫 Voo iniciado:', message.data);
        setCurrentSession(message.data);
        setFlightPath([]);
        toast.success('Voo iniciado: ' + message.data.aircraft);
        break;
        
      case 'flight_ended':
        console.log('🛬 Voo finalizado:', message.data);
        setCurrentSession(null);
        toast.info('Voo finalizado');
        break;
        
      case 'flight_data': {
        const flightData = message.data as FlightPoint;
        setCurrentPosition(flightData);
        
        // Adicionar ponto ao caminho do voo
        setFlightPath(prev => {
          const newPath = [...prev, [flightData.latitude, flightData.longitude] as [number, number]];
          // Manter apenas os últimos 500 pontos para performance
          return newPath.slice(-500);
        });
        
        // Seguir aeronave no mapa se habilitado
        if (followAircraft && mapRef.current) {
          mapRef.current.setView([flightData.latitude, flightData.longitude], mapRef.current.getZoom());
        }
        break;
      }
        
      case 'error':
        console.error('❌ Erro do servidor:', message.message);
        toast.error('Erro: ' + message.message);
        break;
        
      case 'pong':
        // Resposta ao ping - manter conexão viva
        break;
    }
  };

  // ============================================
  // MAP CONTROLS
  // ============================================

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

  const handleResetView = () => {
    if (mapRef.current && currentPosition) {
      mapRef.current.setView([currentPosition.latitude, currentPosition.longitude], 10);
    }
  };

  const toggleFollowAircraft = () => {
    setFollowAircraft(!followAircraft);
    if (!followAircraft && currentPosition && mapRef.current) {
      mapRef.current.setView([currentPosition.latitude, currentPosition.longitude], mapRef.current.getZoom());
    }
  };

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  const formatCoordinate = (coord: number, isLatitude: boolean): string => {
    const abs = Math.abs(coord);
    const degrees = Math.floor(abs);
    const minutes = Math.floor((abs - degrees) * 60);
    const seconds = Math.round(((abs - degrees) * 60 - minutes) * 60);
    const direction = isLatitude ? (coord >= 0 ? 'N' : 'S') : (coord >= 0 ? 'E' : 'W');
    return `${degrees}°${minutes}'${seconds}"${direction}`;
  };

  const formatAltitude = (altitude: number): string => {
    return `${Math.round(altitude).toLocaleString()} ft`;
  };

  const formatSpeed = (speed: number): string => {
    return `${Math.round(speed)} kts`;
  };

  // ============================================
  // LIFECYCLE
  // ============================================

  useEffect(() => {
    connectWebSocket();
    
    return () => {
      disconnectWebSocket();
    };
  }, []); // Remover dependência para evitar reconexões infinitas

  // Componente para acessar a instância do mapa
  const MapInstance = () => {
    const map = useMap();
    
    useEffect(() => {
      mapRef.current = map;
    }, [map]);

    return null;
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <Card className={`w-full h-full ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Plane className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">
              Live Flight Tracking
            </CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            {/* Status de Conexão */}
            <Badge variant={isConnected ? 'default' : 'destructive'} className="text-xs">
              {isConnected ? (
                <><Wifi className="h-3 w-3 mr-1" />Conectado</>
              ) : (
                <><WifiOff className="h-3 w-3 mr-1" />Desconectado</>
              )}
            </Badge>
            
            {/* Status do Voo */}
            {currentSession && (
              <Badge variant="outline" className="text-xs animate-pulse">
                <Plane className="h-3 w-3 mr-1" />
                {currentSession.aircraft}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="relative h-[600px] w-full">
          {/* Controles do Mapa */}
          <div className="absolute top-4 left-4 z-[1000] space-y-2">
            {/* Seletor de Camada */}
            <Select value={selectedLayer} onValueChange={setSelectedLayer}>
              <SelectTrigger className="w-32 h-8 text-xs">
                <Layers className="h-3 w-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="satellite">Satélite</SelectItem>
                <SelectItem value="street">Ruas</SelectItem>
                <SelectItem value="terrain">Terreno</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Controles de Zoom */}
            <div className="flex flex-col space-y-1">
              <Button size="sm" variant="outline" onClick={handleZoomIn} className="h-8 w-8 p-0">
                <ZoomIn className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="outline" onClick={handleZoomOut} className="h-8 w-8 p-0">
                <ZoomOut className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="outline" onClick={handleResetView} className="h-8 w-8 p-0">
                <RotateCcw className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Controles de Tracking */}
          <div className="absolute top-4 right-4 z-[1000] space-y-2">
            <Button
              size="sm"
              variant={followAircraft ? 'default' : 'outline'}
              onClick={toggleFollowAircraft}
              className="text-xs"
            >
              <MapPin className="h-3 w-3 mr-1" />
              {followAircraft ? 'Seguindo' : 'Seguir'}
            </Button>
            
            <Button
              size="sm"
              variant={isConnected ? 'destructive' : 'default'}
              onClick={isConnected ? disconnectWebSocket : connectWebSocket}
              className="text-xs"
            >
              {isConnected ? 'Desconectar' : 'Conectar'}
            </Button>
          </div>

          {/* Informações de Voo */}
          {currentPosition && (
            <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Posição:</p>
                  <p>{formatCoordinate(currentPosition.latitude, true)}</p>
                  <p>{formatCoordinate(currentPosition.longitude, false)}</p>
                </div>
                <div>
                  <p className="font-medium">Altitude:</p>
                  <p>{formatAltitude(currentPosition.altitude)}</p>
                  <p className="font-medium mt-1">Velocidade:</p>
                  <p>{formatSpeed(currentPosition.speed)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Mapa */}
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

            {/* Caminho do Voo */}
            {flightPath.length > 1 && (
              <Polyline
                positions={flightPath}
                color="#ef4444"
                weight={3}
                opacity={0.8}
              />
            )}

            {/* Posição Atual da Aeronave */}
            {currentPosition && (
              <Marker
                position={[currentPosition.latitude, currentPosition.longitude]}
                icon={createAircraftIcon(currentPosition.heading)}
              >
                <Popup>
                  <div className="text-sm space-y-1">
                    <div className="font-semibold">
                      {currentSession?.aircraft || 'Aeronave Desconhecida'}
                    </div>
                    <div className="text-xs space-y-1">
                      <p>Alt: {formatAltitude(currentPosition.altitude)}</p>
                      <p>Vel: {formatSpeed(currentPosition.speed)}</p>
                      <p>Proa: {Math.round(currentPosition.heading)}°</p>
                      <p>VS: {currentPosition.verticalSpeed > 0 ? '+' : ''}{Math.round(currentPosition.verticalSpeed)} ft/min</p>
                      <Badge variant={currentPosition.onGround ? 'secondary' : 'default'} className="text-xs">
                        {currentPosition.onGround ? 'No Solo' : 'Em Voo'}
                      </Badge>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>

          {/* Mensagem quando não conectado */}
          {!isConnected && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-[1001]">
              <Card className="p-6 text-center">
                <CardContent>
                  <WifiOff className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Não Conectado</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Conecte-se ao Flight Tracking Service para ver dados em tempo real.
                  </p>
                  {connectionAttempts > 0 && (
                    <p className="text-xs text-muted-foreground mb-4">
                      Tentativa de reconexão: {connectionAttempts}/10
                    </p>
                  )}
                  <Button onClick={connectWebSocket} variant="outline">
                    Tentar Conectar
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveTrackingMap;