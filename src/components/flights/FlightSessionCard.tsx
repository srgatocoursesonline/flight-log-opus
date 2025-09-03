// ============================================
// FLIGHT SESSION CARD COMPONENT
// Componente para exibir sessões de voo rastreadas automaticamente
// ============================================

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FlightSession } from '@/hooks/supabase/useFlightSessions';
import { 
  Plane, 
  Clock, 
  MapPin, 
  Gauge, 
  Mountain, 
  Route,
  Play,
  Square,
  Eye
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FlightSessionCardProps {
  session: FlightSession;
  onViewDetails?: (sessionId: string) => void;
  onCancelSession?: (sessionId: string) => void;
  compact?: boolean;
}

export const FlightSessionCard: React.FC<FlightSessionCardProps> = ({
  session,
  onViewDetails,
  onCancelSession,
  compact = false
}) => {
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDistance = (distance?: number) => {
    if (!distance) return '--';
    return `${Math.round(distance)} NM`;
  };

  const formatAltitude = (altitude?: number) => {
    if (!altitude) return '--';
    return `${Math.round(altitude)} ft`;
  };

  const formatSpeed = (speed?: number) => {
    if (!speed) return '--';
    return `${Math.round(speed)} kts`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500 text-white';
      case 'completed':
        return 'bg-blue-500 text-white';
      case 'cancelled':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Em Voo';
      case 'completed':
        return 'Concluído';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  if (compact) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Plane className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-sm">{session.aircraftTitle}</span>
              </div>
              <Badge className={`text-xs ${getStatusColor(session.status)}`}>
                {getStatusText(session.status)}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              {session.status === 'active' && (
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3 text-blue-600" />
                  <span>{formatDistanceToNow(new Date(session.startedAt), { locale: ptBR, addSuffix: true })}</span>
                </div>
              )}
              
              {session.flightTime && (
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3 text-blue-600" />
                  <span>{formatDuration(session.flightTime)}</span>
                </div>
              )}
              
              {session.totalDistance && (
                <div className="flex items-center space-x-1">
                  <Route className="h-3 w-3 text-blue-600" />
                  <span>{formatDistance(session.totalDistance)}</span>
                </div>
              )}
              
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails?.(session.id)}
                  className="h-6 px-2"
                >
                  <Eye className="h-3 w-3 text-blue-600" />
                </Button>
                
                {session.status === 'active' && onCancelSession && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCancelSession(session.id)}
                    className="h-6 px-2 text-red-600 hover:text-red-700"
                  >
                    <Square className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Plane className="h-5 w-5 text-blue-600" />
            <span>{session.aircraftTitle}</span>
          </CardTitle>
          <Badge className={getStatusColor(session.status)}>
            {getStatusText(session.status)}
          </Badge>
        </div>
        
        <div className="text-sm text-gray-600">
          {session.status === 'active' ? (
            <span>Iniciado {formatDistanceToNow(new Date(session.startedAt), { locale: ptBR, addSuffix: true })}</span>
          ) : (
            <span>Voo realizado em {new Date(session.startedAt).toLocaleDateString('pt-BR')}</span>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Métricas principais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <div>
              <div className="text-xs text-gray-500">Duração</div>
              <div className="font-medium">{formatDuration(session.flightTime)}</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Route className="h-4 w-4 text-blue-600" />
            <div>
              <div className="text-xs text-gray-500">Distância</div>
              <div className="font-medium">{formatDistance(session.totalDistance)}</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Mountain className="h-4 w-4 text-blue-600" />
            <div>
              <div className="text-xs text-gray-500">Alt. Máx</div>
              <div className="font-medium">{formatAltitude(session.maxAltitude)}</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Gauge className="h-4 w-4 text-blue-600" />
            <div>
              <div className="text-xs text-gray-500">Vel. Máx</div>
              <div className="font-medium">{formatSpeed(session.maxSpeed)}</div>
            </div>
          </div>
        </div>
        
        {/* Localização atual (para voos ativos) */}
        {session.status === 'active' && session.currentLat && session.currentLon && (
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-green-800">Posição Atual</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Alt:</span>
                <span className="ml-1 font-medium">{formatAltitude(session.currentAltitude)}</span>
              </div>
              <div>
                <span className="text-gray-500">Vel:</span>
                <span className="ml-1 font-medium">{formatSpeed(session.currentSpeed)}</span>
              </div>
              <div>
                <span className="text-gray-500">Pontos:</span>
                <span className="ml-1 font-medium">{session.totalPoints || 0}</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Ações */}
        <div className="flex justify-between items-center pt-2">
          <div className="text-xs text-gray-500">
            Device: {session.deviceId}
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails?.(session.id)}
            >
              <Eye className="h-4 w-4 mr-1 text-blue-600" />
              Ver Detalhes
            </Button>
            
            {session.status === 'active' && onCancelSession && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onCancelSession(session.id)}
              >
                <Square className="h-4 w-4 mr-1" />
                Cancelar
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};