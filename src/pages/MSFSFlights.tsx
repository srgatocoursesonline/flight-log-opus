import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Plane, 
  Download,
  RefreshCw,
  Trash2,
  MapPin,
  Clock,
  Mountain,
  Gauge,
  Calendar,
  BarChart3
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSupabaseMSFSFlights, type MSFSFlight } from '@/hooks/supabase/useSupabaseMSFSFlights';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export default function MSFSFlights() {
  const { t } = useTranslation();
  const { 
    flights, 
    stats, 
    loading, 
    error, 
    deleteFlight, 
    clearAllFlights, 
    refresh 
  } = useSupabaseMSFSFlights();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'duration' | 'distance' | 'aircraft'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [aircraftFilter, setAircraftFilter] = useState<string>('all');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  // Get unique aircraft types for filter
  const uniqueAircraft = useMemo(() => {
    const aircraft = [...new Set(flights.map(f => f.aircraft_type))];
    return aircraft.sort();
  }, [flights]);

  // Filter and sort flights
  const filteredAndSortedFlights = useMemo(() => {
    const filtered = flights.filter(flight => {
      const matchesSearch = 
        flight.aircraft_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flight.departure_icao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flight.arrival_icao.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesAircraft = aircraftFilter === 'all' || flight.aircraft_type === aircraftFilter;
      
      return matchesSearch && matchesAircraft;
    });

    // Sort flights
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.departure_time);
          bValue = new Date(b.departure_time);
          break;
        case 'duration':
          aValue = a.flight_time_minutes;
          bValue = b.flight_time_minutes;
          break;
        case 'distance':
          aValue = a.distance_nm;
          bValue = b.distance_nm;
          break;
        case 'aircraft':
          aValue = a.aircraft_type;
          bValue = b.aircraft_type;
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [flights, searchTerm, sortBy, sortOrder, aircraftFilter]);

  const handleDeleteFlight = async (flightId: string) => {
    setIsDeleting(flightId);
    try {
      await deleteFlight(flightId);
      // Force page refresh to ensure UI updates
      window.location.reload();
    } catch (error) {
      console.error('Error deleting flight:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleClearAll = async () => {
    setIsClearing(true);
    try {
      await clearAllFlights();
    } finally {
      setIsClearing(false);
    }
  };

  const exportToCSV = () => {
    if (flights.length === 0) {
      toast.error('Nenhum voo para exportar');
      return;
    }

    const headers = [
      'Data/Hora Partida',
      'Data/Hora Chegada', 
      'Aeronave',
      'Partida (ICAO)',
      'Chegada (ICAO)',
      'Tempo de Voo (min)',
      'Distância (NM)',
      'Altitude Máxima (ft)',
      'Velocidade Máxima (kts)'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredAndSortedFlights.map(flight => [
        new Date(flight.departure_time).toLocaleString('pt-BR'),
        new Date(flight.arrival_time).toLocaleString('pt-BR'),
        flight.aircraft_type,
        flight.departure_icao,
        flight.arrival_icao,
        flight.flight_time_minutes,
        Math.round(flight.distance_nm),
        Math.round(flight.max_altitude_ft),
        Math.round(flight.max_speed_kts)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `msfs-flights-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Voos exportados com sucesso!');
  };

  const formatFlightTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Plane className="h-8 w-8" />
            Voos MSFS 2024
          </h1>
          <p className="text-muted-foreground mt-2">
            Histórico completo de voos capturados automaticamente do Microsoft Flight Simulator
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={refresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          {flights.length > 0 && (
            <>
              <Button
                variant="outline"
                onClick={exportToCSV}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                    disabled={isClearing}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Limpar Tudo
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Limpar Histórico</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja limpar todo o histórico de voos do MSFS? 
                      Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearAll}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Limpar Tudo
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Voos</CardTitle>
              <Plane className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFlights}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo Total</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatFlightTime(stats.totalFlightTime)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Distância Total</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(stats.totalDistance).toLocaleString()} NM</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aeronave Favorita</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.mostUsedAircraft || 'N/A'}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por aeronave, partida ou chegada..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={aircraftFilter} onValueChange={setAircraftFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por aeronave" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as aeronaves</SelectItem>
                {uniqueAircraft.map(aircraft => (
                  <SelectItem key={aircraft} value={aircraft}>
                    {aircraft}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Data</SelectItem>
                <SelectItem value="duration">Duração</SelectItem>
                <SelectItem value="distance">Distância</SelectItem>
                <SelectItem value="aircraft">Aeronave</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="w-full md:w-auto"
            >
              <Filter className="h-4 w-4 mr-2" />
              {sortOrder === 'asc' ? 'Crescente' : 'Decrescente'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Flights List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Histórico de Voos ({filteredAndSortedFlights.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <span>Carregando voos...</span>
            </div>
          ) : filteredAndSortedFlights.length === 0 ? (
            <div className="text-center py-8">
              <Plane className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                {flights.length === 0 
                  ? 'Nenhum voo do MSFS encontrado'
                  : 'Nenhum voo corresponde aos filtros aplicados'
                }
              </p>
              {flights.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Inicie o serviço companheiro para começar a registrar seus voos automaticamente.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAndSortedFlights.map((flight) => (
                <div key={flight.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="font-mono">
                          {flight.aircraft_type}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDateTime(flight.departure_time)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono font-semibold">
                            {flight.departure_icao}
                          </span>
                          <span className="text-muted-foreground">→</span>
                          <span className="font-mono font-semibold">
                            {flight.arrival_icao}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{formatFlightTime(flight.flight_time_minutes)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{Math.round(flight.distance_nm)} NM</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mountain className="h-4 w-4 text-muted-foreground" />
                          <span>{Math.round(flight.max_altitude_ft).toLocaleString()} ft</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Gauge className="h-4 w-4 text-muted-foreground" />
                          <span>{Math.round(flight.max_speed_kts)} kts</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            disabled={isDeleting === flight.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Deletar Voo</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja deletar este voo? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteFlight(flight.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Deletar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}