import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Clock,
  Search,
  Filter,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FlightRoute } from './FlightMap';

// ============================================
// TIPOS E INTERFACES
// ============================================

interface RouteListProps {
  routes: FlightRoute[];
  selectedRoute?: string;
  onRouteSelect: (routeId: string) => void;
  onRouteHover?: (routeId: string | null) => void;
}

type SortOption = 'date' | 'departure' | 'arrival' | 'aircraft' | 'status';
type FilterStatus = 'all' | 'completed' | 'active' | 'planned';

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const RouteList: React.FC<RouteListProps> = ({
  routes,
  selectedRoute,
  onRouteSelect,
  onRouteHover
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  // Filtrar e ordenar rotas
  const filteredAndSortedRoutes = React.useMemo(() => {
    let filtered = routes;

    // Filtro por texto
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(route => 
        route.departure.icao.toLowerCase().includes(term) ||
        route.departure.name.toLowerCase().includes(term) ||
        route.arrival.icao.toLowerCase().includes(term) ||
        route.arrival.name.toLowerCase().includes(term) ||
        route.aircraft.toLowerCase().includes(term) ||
        route.callsign.toLowerCase().includes(term)
      );
    }

    // Filtro por status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(route => route.status === filterStatus);
    }

    // Ordenação
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'departure':
          return a.departure.icao.localeCompare(b.departure.icao);
        case 'arrival':
          return a.arrival.icao.localeCompare(b.arrival.icao);
        case 'aircraft':
          return a.aircraft.localeCompare(b.aircraft);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    return filtered;
  }, [routes, searchTerm, sortBy, filterStatus]);

  // Obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'active': return 'bg-red-100 text-red-800 border-red-200';
      case 'planned': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Obter texto do status
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'active': return 'Ativo';
      case 'planned': return 'Planejado';
      default: return status;
    }
  };

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Filter className="h-5 w-5 mr-2 text-primary" />
            {t('maps.routeList', 'Lista de Rotas')}
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {filteredAndSortedRoutes.length} de {routes.length}
          </Badge>
        </div>

        {/* Controles de Filtro e Busca */}
        <div className="space-y-3">
          {/* Barra de Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por aeroporto, aeronave ou callsign..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtros */}
          <div className="flex space-x-2">
            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Data</SelectItem>
                <SelectItem value="departure">Partida</SelectItem>
                <SelectItem value="arrival">Chegada</SelectItem>
                <SelectItem value="aircraft">Aeronave</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={(value: FilterStatus) => setFilterStatus(value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="planned">Planejado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="max-h-[500px] overflow-y-auto">
          {filteredAndSortedRoutes.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <Plane className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Nenhuma rota encontrada com os filtros aplicados.'
                  : 'Nenhuma rota disponível.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredAndSortedRoutes.map((route) => (
                <div
                  key={route.id}
                  className={`
                    p-3 rounded-lg border cursor-pointer transition-all duration-200
                    hover:bg-accent/50 hover:border-primary/30
                    ${selectedRoute === route.id 
                      ? 'bg-primary/10 border-primary shadow-sm' 
                      : 'bg-background border-border'
                    }
                  `}
                  onClick={() => onRouteSelect(route.id)}
                  onMouseEnter={() => onRouteHover?.(route.id)}
                  onMouseLeave={() => onRouteHover?.(null)}
                >
                  {/* Cabeçalho da Rota */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(route.status)}>
                        {getStatusText(route.status)}
                      </Badge>
                      {route.status === 'active' && (
                        <div className="flex items-center text-red-600 text-xs">
                          <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse mr-1" />
                          AO VIVO
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(route.date)}
                    </div>
                  </div>

                  {/* Rota Principal */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      {/* Aeroporto de Partida */}
                      <div className="text-center">
                        <div className="font-mono font-bold text-lg">{route.departure.icao}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[80px]">
                          {route.departure.name}
                        </div>
                      </div>

                      {/* Seta */}
                      <div className="flex-1 flex items-center justify-center">
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>

                      {/* Aeroporto de Chegada */}
                      <div className="text-center">
                        <div className="font-mono font-bold text-lg">{route.arrival.icao}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[80px]">
                          {route.arrival.name}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Informações da Aeronave */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-muted-foreground">
                        <Plane className="h-3 w-3 mr-1" />
                        <span className="font-medium">{route.aircraft}</span>
                      </div>
                      {route.callsign && (
                        <div className="flex items-center text-muted-foreground">
                          <span className="text-xs">Callsign:</span>
                          <span className="font-mono ml-1">{route.callsign}</span>
                        </div>
                      )}
                    </div>
                    
                    {route.waypoints && route.waypoints.length > 0 && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 mr-1" />
                        {route.waypoints.length} waypoint{route.waypoints.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RouteList;