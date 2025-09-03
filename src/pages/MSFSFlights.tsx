import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plane, 
  Calendar, 
  Clock, 
  MapPin, 
  Filter,
  Search,
  ArrowUpDown,
  Trash2
} from 'lucide-react';
import { useSupabaseMSFSFlights } from '@/hooks/supabase/useSupabaseMSFSFlights';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const MSFSFlights = () => {
  const { t } = useTranslation();
  const { flights, deleteFlight, clearAllFlights, isLoading } = useSupabaseMSFSFlights();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [aircraftFilter, setAircraftFilter] = useState('all');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Get unique aircraft types for filter
  const aircraftTypes = useMemo(() => {
    const types = new Set(flights.map(flight => flight.aircraft_type));
    return Array.from(types).sort();
  }, [flights]);

  // Filter and sort flights
  const filteredFlights = useMemo(() => {
    let filtered = flights.filter(flight => {
      const matchesSearch = 
        flight.callsign.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flight.departure_icao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flight.arrival_icao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flight.aircraft_type.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesAircraft = 
        aircraftFilter === 'all' || flight.aircraft_type === aircraftFilter;
      
      return matchesSearch && matchesAircraft;
    });

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
      // Error handling without console output
    } finally {
      setIsDeleting(null);
    }
  };

  const handleClearAll = async () => {
    if (confirm(t('msfs.clearAllConfirm'))) {
      try {
        await clearAllFlights();
        // Force page refresh to ensure UI updates
        window.location.reload();
      } catch (error) {
        // Error handling without console output
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-center">
          <Plane className="h-12 w-12 text-primary mx-auto mb-4" />
          <p>{t('msfs.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 fade-in">
        <div>
          <h1 className="mobile-title gradient-title">
            {t('msfs.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('msfs.subtitle')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="destructive" 
            onClick={handleClearAll}
            disabled={flights.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {t('msfs.clearAll')}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t('msfs.filters')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('msfs.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Combobox
              options={[
                { value: 'all', label: t('msfs.allAircraft') },
                ...aircraftTypes.map(type => ({ value: type, label: type }))
              ]}
              value={aircraftFilter}
              onValueChange={setAircraftFilter}
              placeholder={t('msfs.aircraftType')}
              searchPlaceholder="Pesquisar tipo de aeronave..."
              emptyMessage="Nenhum tipo encontrado."
            />
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder={t('msfs.sortBy')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">{t('msfs.sortDate')}</SelectItem>
                <SelectItem value="duration">{t('msfs.sortDuration')}</SelectItem>
                <SelectItem value="distance">{t('msfs.sortDistance')}</SelectItem>
                <SelectItem value="aircraft">{t('msfs.sortAircraft')}</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="flex items-center gap-2"
            >
              <ArrowUpDown className="h-4 w-4" />
              {sortOrder === 'asc' ? t('msfs.ascending') : t('msfs.descending')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{flights.length}</p>
            <p className="text-sm text-muted-foreground">{t('msfs.totalFlights')}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">
              {flights.reduce((sum, flight) => sum + (flight.flight_time_minutes || 0), 0)}min
            </p>
            <p className="text-sm text-muted-foreground">{t('msfs.totalTime')}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">
              {flights.reduce((sum, flight) => sum + (flight.distance_nm || 0), 0)}NM
            </p>
            <p className="text-sm text-muted-foreground">{t('msfs.totalDistance')}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">
              {aircraftTypes.length}
            </p>
            <p className="text-sm text-muted-foreground">{t('msfs.aircraftTypes')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Flights List */}
      <div className="space-y-4">
        {filteredFlights.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Plane className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('msfs.noFlights')}</h3>
              <p className="text-muted-foreground">{t('msfs.noFlightsDesc')}</p>
            </CardContent>
          </Card>
        ) : (
          filteredFlights.map(flight => (
            <Card key={flight.id} className="fade-in">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Plane className="h-4 w-4 text-primary" />
                      <span className="font-semibold">{flight.callsign}</span>
                      <Badge variant="secondary">{flight.aircraft_type}</Badge>
                    </div>
                    
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {flight.departure_icao} → {flight.arrival_icao}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {format(new Date(flight.departure_time), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {flight.flight_time_minutes}min ({Math.round(flight.distance_nm)}NM)
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          LR: {flight.landing_rate} | EP: {flight.experience_points}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteFlight(flight.id)}
                    disabled={isDeleting === flight.id}
                  >
                    {isDeleting === flight.id ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default MSFSFlights;