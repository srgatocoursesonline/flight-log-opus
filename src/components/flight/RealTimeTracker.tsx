import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Plane,
  Wifi,
  WifiOff,
  MapPin,
  Gauge,
  Mountain,
  Navigation,
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

// ============================================
// TIPOS E INTERFACES
// ============================================

interface FlightData {
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  onGround: boolean;
  aircraft: string;
  heading: number;
  verticalSpeed: number;
  timestamp: number;
}

interface FlightLog {
  aircraft: string;
  startTime: number;
  endTime?: number;
  departureLatLon: [number, number];
  arrivalLatLon?: [number, number];
  maxAltitude: number;
  maxSpeed: number;
  distance: number;
  duration?: number;
}

interface ConnectionStatus {
  connected: boolean;
  flying: boolean;
  currentFlight: FlightLog | null;
}

interface WSMessage {
  type: 'status' | 'telemetry' | 'event';
  event?: string;
  data: any;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function RealTimeTracker() {
  const { t } = useTranslation();
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState<ConnectionStatus>({
    connected: false,
    flying: false,
    currentFlight: null
  });
  const [currentData, setCurrentData] = useState<FlightData | null>(null);
  const [flightHistory, setFlightHistory] = useState<FlightData[]>([]);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================
  // WEBSOCKET CONNECTION
  // ============================================

  const connectWebSocket = () => {
    try {
      const ws = new WebSocket('ws://localhost:3002');
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('🔗 Conectado ao MSFS Companion');
        setIsConnected(true);
        setConnectionAttempts(0);
        toast.success('Conectado ao MSFS Companion');
      };

      ws.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (error) {
          console.error('Erro ao processar mensagem WebSocket:', error);
        }
      };

      ws.onclose = () => {
        console.log('❌ Desconectado do MSFS Companion');
        setIsConnected(false);
        setStatus(prev => ({ ...prev, connected: false, flying: false }));
        
        // Tentar reconectar após 3 segundos
        if (connectionAttempts < 10) {
          reconnectTimeoutRef.current = setTimeout(() => {
            setConnectionAttempts(prev => prev + 1);
            connectWebSocket();
          }, 3000);
        }
      };

      ws.onerror = (error) => {
        console.error('Erro WebSocket:', error);
        toast.error('Erro de conexão com MSFS Companion');
      };

    } catch (error) {
      console.error('Erro ao conectar WebSocket:', error);
      toast.error('Falha ao conectar com MSFS Companion');
    }
  };

  const disconnectWebSocket = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  };

  // ============================================
  // MESSAGE HANDLING
  // ============================================

  const handleWebSocketMessage = (message: WSMessage) => {
    switch (message.type) {
      case 'status':
        setStatus(message.data);
        break;
        
      case 'telemetry':
        setCurrentData(message.data);
        // Manter histórico dos últimos 100 pontos
        setFlightHistory(prev => {
          const newHistory = [...prev, message.data];
          return newHistory.slice(-100);
        });
        break;
        
      case 'event':
        handleFlightEvent(message.event!, message.data);
        break;
    }
  };

  const handleFlightEvent = (event: string, data: any) => {
    switch (event) {
      case 'flightStart':
        toast.success('🛫 Voo iniciado!');
        setFlightHistory([]); // Limpar histórico anterior
        break;
        
      case 'flightEnd':
        toast.success('🛬 Voo finalizado!');
        break;
        
      case 'flightSaved':
        toast.success('💾 Voo salvo no logbook!');
        break;
        
      case 'flightSaveError':
        toast.error('❌ Erro ao salvar voo: ' + data.error);
        break;
    }
  };

  // ============================================
  // LIFECYCLE
  // ============================================

  useEffect(() => {
    connectWebSocket();
    
    return () => {
      disconnectWebSocket();
    };
  }, []);

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m ${seconds % 60}s`;
  };

  const formatCoordinate = (coord: number, isLat: boolean) => {
    const abs = Math.abs(coord);
    const deg = Math.floor(abs);
    const min = ((abs - deg) * 60).toFixed(3);
    const dir = isLat ? (coord >= 0 ? 'N' : 'S') : (coord >= 0 ? 'E' : 'W');
    return `${deg}°${min}'${dir}`;
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="space-y-6">
      {/* Status de Conexão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" />
            )}
            Status da Conexão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={isConnected ? 'default' : 'destructive'}>
                  {isConnected ? 'Conectado' : 'Desconectado'}
                </Badge>
                {status.connected && (
                  <Badge variant={status.flying ? 'default' : 'secondary'}>
                    {status.flying ? '✈️ Voando' : '🏠 No Solo'}
                  </Badge>
                )}
              </div>
              {!isConnected && connectionAttempts > 0 && (
                <p className="text-sm text-muted-foreground">
                  Tentativa de reconexão: {connectionAttempts}/10
                </p>
              )}
            </div>
            <Button
              onClick={isConnected ? disconnectWebSocket : connectWebSocket}
              variant={isConnected ? 'destructive' : 'default'}
              size="sm"
            >
              {isConnected ? 'Desconectar' : 'Conectar'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dados em Tempo Real */}
      {currentData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Informações da Aeronave */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="h-5 w-5" />
                Aeronave
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">{currentData.aircraft}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant={currentData.onGround ? 'secondary' : 'default'}>
                    {currentData.onGround ? 'No Solo' : 'Em Voo'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Posição */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Posição
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <p>Lat: {formatCoordinate(currentData.latitude, true)}</p>
                <p>Lon: {formatCoordinate(currentData.longitude, false)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Altitude */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mountain className="h-5 w-5" />
                Altitude
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-2xl font-bold">
                  {Math.round(currentData.altitude).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">pés</p>
                <div className="flex items-center gap-1 text-sm">
                  {currentData.verticalSpeed > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : currentData.verticalSpeed < 0 ? (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  ) : (
                    <Activity className="h-4 w-4 text-gray-500" />
                  )}
                  {Math.abs(Math.round(currentData.verticalSpeed))} fpm
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Velocidade */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5" />
                Velocidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-2xl font-bold">
                  {Math.round(currentData.speed)}
                </p>
                <p className="text-sm text-muted-foreground">knots</p>
              </div>
            </CardContent>
          </Card>

          {/* Proa */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                Proa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-2xl font-bold">
                  {Math.round(currentData.heading)}°
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentData.heading >= 337.5 || currentData.heading < 22.5 ? 'N' :
                   currentData.heading >= 22.5 && currentData.heading < 67.5 ? 'NE' :
                   currentData.heading >= 67.5 && currentData.heading < 112.5 ? 'E' :
                   currentData.heading >= 112.5 && currentData.heading < 157.5 ? 'SE' :
                   currentData.heading >= 157.5 && currentData.heading < 202.5 ? 'S' :
                   currentData.heading >= 202.5 && currentData.heading < 247.5 ? 'SW' :
                   currentData.heading >= 247.5 && currentData.heading < 292.5 ? 'W' : 'NW'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Voo Atual */}
          {status.currentFlight && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Voo Atual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Duração:</span>
                    <span>{formatDuration(Date.now() - status.currentFlight.startTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Alt. Máx:</span>
                    <span>{Math.round(status.currentFlight.maxAltitude)} ft</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vel. Máx:</span>
                    <span>{Math.round(status.currentFlight.maxSpeed)} kts</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Distância:</span>
                    <span>{status.currentFlight.distance.toFixed(1)} km</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Mensagem quando não há dados */}
      {!currentData && isConnected && status.connected && (
        <Card>
          <CardContent className="text-center py-8">
            <Plane className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Aguardando dados de telemetria do MSFS...
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Certifique-se de que o MSFS 2024 está rodando e uma aeronave está carregada.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Mensagem quando não conectado */}
      {!isConnected && (
        <Card>
          <CardContent className="text-center py-8">
            <WifiOff className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Não conectado ao MSFS Companion Service
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Certifique-se de que o companion service está rodando na porta 3002.
            </p>
            <Button 
              onClick={connectWebSocket} 
              className="mt-4"
              variant="outline"
            >
              Tentar Conectar
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}