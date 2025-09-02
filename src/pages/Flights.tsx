import { useState, useMemo, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, Plane, LayoutGrid, List, Wifi } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSupabaseFlights } from '@/hooks/supabase/useSupabaseFlights';
import { useSupabaseFlightStatusManager } from '@/hooks/supabase/useSupabaseFlightStatusManager';
import { useFlightSessions } from '@/hooks/supabase/useFlightSessions';
import { AddFlightModal, AddFlightModalRef } from '@/components/flights/AddFlightModal';
import { FlightCard } from '@/components/flights/FlightCard';
import { FlightCardCompact } from '@/components/flights/FlightCardCompact';
import { FlightSessionCard } from '@/components/flights/FlightSessionCard';
import { FlightStats } from '@/components/flights/FlightStats';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Flights = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { flights, isLoading } = useSupabaseFlights();
  const { sessions, isLoading: isLoadingSessions, cancelSession } = useFlightSessions();
  const statusManager = useSupabaseFlightStatusManager();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('detailed');
  const [showSessions, setShowSessions] = useState(true);
  const addFlightModalRef = useRef<AddFlightModalRef>(null);

  // Escutar evento para abrir modal automaticamente ou verificar URL params
  useEffect(() => {
    // Verificar se deve abrir modal via URL params
    if (searchParams.get('openModal') === 'true') {
      // Limpar o parâmetro da URL
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('openModal');
      setSearchParams(newSearchParams, { replace: true });
      
      // Abrir modal após um pequeno delay para garantir que o componente foi renderizado
      setTimeout(() => {
        if (addFlightModalRef.current) {
          addFlightModalRef.current.openModal();
        }
      }, 100);
    }

    // Manter suporte ao evento customizado como fallback
    const handleOpenModal = () => {
      if (addFlightModalRef.current) {
        addFlightModalRef.current.openModal();
      }
    };

    window.addEventListener('openAddFlightModal', handleOpenModal);
    return () => {
      window.removeEventListener('openAddFlightModal', handleOpenModal);
    };
  }, [searchParams, setSearchParams]);

  // Filtrar e ordenar voos manuais
  const filteredAndSortedFlights = useMemo(() => {
    const filtered = flights.filter(flight => {
      const matchesSearch = 
        flight.callsign.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flight.aircraft.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flight.departure.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flight.arrival.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || flight.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          // Create date objects from the date strings (which are in YYYY-MM-DD format)
          // Using Date.UTC to avoid timezone conversion issues
          const [aYearDesc, aMonthDesc, aDayDesc] = a.date.split('-').map(Number);
          const [bYearDesc, bMonthDesc, bDayDesc] = b.date.split('-').map(Number);
          const dateA = new Date(Date.UTC(aYearDesc, aMonthDesc - 1, aDayDesc));
          const dateB = new Date(Date.UTC(bYearDesc, bMonthDesc - 1, bDayDesc));
          return dateB.getTime() - dateA.getTime();
        case 'date-asc':
          // Create date objects from the date strings (which are in YYYY-MM-DD format)
          // Using Date.UTC to avoid timezone conversion issues
          const [aYearAsc, aMonthAsc, aDayAsc] = a.date.split('-').map(Number);
          const [bYearAsc, bMonthAsc, bDayAsc] = b.date.split('-').map(Number);
          const dateAAsc = new Date(Date.UTC(aYearAsc, aMonthAsc - 1, aDayAsc));
          const dateBAsc = new Date(Date.UTC(bYearAsc, bMonthAsc - 1, bDayAsc));
          return dateAAsc.getTime() - dateBAsc.getTime();
        case 'rating-desc':
          return b.careerRating - a.careerRating;
        case 'rating-asc':
          return a.careerRating - b.careerRating;
        case 'callsign':
          return a.callsign.localeCompare(b.callsign);
        case 'duration-desc':
          const aDuration = parseInt(a.flightTime.replace(/\D/g, ''));
          const bDuration = parseInt(b.flightTime.replace(/\D/g, ''));
          return bDuration - aDuration;
        default:
          return 0;
      }
    });

    return filtered;
  }, [flights, searchTerm, statusFilter, sortBy]);

  // Filtrar e ordenar sessões de voo rastreadas
  const filteredAndSortedSessions = useMemo(() => {
    if (!showSessions) return [];
    
    const filtered = sessions.filter(session => {
      const matchesSearch = 
        session.aircraftTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.deviceId.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Mapear status das sessões para os filtros de voo
      const sessionStatusMap: { [key: string]: string } = {
        'active': 'active',
        'completed': 'completed',
        'cancelled': 'cancelled'
      };
      
      const mappedStatus = sessionStatusMap[session.status] || session.status;
      const matchesStatus = statusFilter === 'all' || mappedStatus === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    // Ordenar sessões
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime();
        case 'date-asc':
          return new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime();
        case 'duration-desc':
          const aDuration = a.flightTime || 0;
          const bDuration = b.flightTime || 0;
          return bDuration - aDuration;
        case 'callsign':
          return a.aircraftTitle.localeCompare(b.aircraftTitle);
        default:
          return 0;
      }
    });

    return filtered;
  }, [sessions, searchTerm, statusFilter, sortBy, showSessions]);

  if (isLoading || isLoadingSessions) {
    return (
      <div className="space-y-6 pb-20 lg:pb-6">
        <div className="text-center py-12">
          <Plane className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-title">
            {t('flights.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('flights.subtitle')}
          </p>
        </div>
        <AddFlightModal 
          ref={addFlightModalRef} 
          onClose={() => {
            // Recarregar página após adicionar/editar voo
            window.location.reload();
          }}
        />
      </div>

      {/* Estatísticas */}
      <FlightStats />

      {/* Filtros e Busca */}
      <div className="flex flex-col lg:flex-row gap-4 fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('flights.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-muted/30 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground transition-all duration-300 hover:border-primary/50"
          />
        </div>
        
        <div className="flex gap-2">
          {/* Toggle de Sessões Rastreadas */}
          <Button
            variant={showSessions ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowSessions(!showSessions)}
            className="h-8 px-3"
            title={showSessions ? 'Ocultar Voos Rastreados' : 'Mostrar Voos Rastreados'}
          >
            <Wifi className="h-4 w-4 mr-1" />
            Rastreados
          </Button>
          
          {/* Toggle de Visualização */}
          <div className="flex border border-border rounded-lg p-1 bg-muted/30">
            <Button
              variant={viewMode === 'compact' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('compact')}
              className="h-8 px-3"
              title="Visualização Resumida"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'detailed' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('detailed')}
              className="h-8 px-3"
              title="Visualização Detalhada"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {statusManager.getActiveStatuses().map((status) => (
                <SelectItem key={status.id} value={status.id}>
                  {status.icon} {status.name}
                </SelectItem>
              ))}
              {/* Fallback para status padrão se não houver customizados */}
              {statusManager.getActiveStatuses().length === 0 && (
                <>
                  <SelectItem value="completed">{t('common.completed')}</SelectItem>
                  <SelectItem value="planned">{t('common.planned')}</SelectItem>
                  <SelectItem value="active">{t('common.active')}</SelectItem>
                  <SelectItem value="cancelled">{t('common.cancelled')}</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Data (Recente)</SelectItem>
              <SelectItem value="date-asc">Data (Antigo)</SelectItem>
              <SelectItem value="rating-desc">CR (Maior)</SelectItem>
              <SelectItem value="rating-asc">CR (Menor)</SelectItem>
              <SelectItem value="callsign">Callsign</SelectItem>
              <SelectItem value="duration-desc">Duração</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lista de Voos e Sessões */}
      {filteredAndSortedFlights.length === 0 && filteredAndSortedSessions.length === 0 ? (
        <div className="hud-display stats-card p-6 fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="text-center py-12">
            <Plane className="h-12 w-12 text-muted-foreground mx-auto mb-4 icon-hover" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {flights.length === 0 && sessions.length === 0 ? t('flights.noFlights') : 'Nenhum voo encontrado'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {flights.length === 0 && sessions.length === 0
                ? t('flights.noFlightsDesc')
                : 'Tente ajustar os filtros de busca.'
              }
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Sessões de Voo Rastreadas */}
          {showSessions && filteredAndSortedSessions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                <Wifi className="h-4 w-4" />
                <span>Voos Rastreados Automaticamente</span>
                <div className="flex-1 h-px bg-border"></div>
              </div>
              {filteredAndSortedSessions.map((session, index) => (
                <div 
                  key={`session-${session.id}`} 
                  className="fade-in" 
                  style={{ animationDelay: `${0.1 + (index * 0.05)}s` }}
                >
                  <FlightSessionCard 
                    session={session} 
                    compact={viewMode === 'compact'}
                    onViewDetails={(sessionId) => {
                      // TODO: Implementar visualização de detalhes da sessão
                      console.log('Ver detalhes da sessão:', sessionId);
                    }}
                    onCancelSession={cancelSession}
                  />
                </div>
              ))}
            </div>
          )}
          
          {/* Voos Manuais */}
          {filteredAndSortedFlights.length > 0 && (
            <div className="space-y-4">
              {showSessions && filteredAndSortedSessions.length > 0 && (
                <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                  <Plane className="h-4 w-4" />
                  <span>Voos Adicionados Manualmente</span>
                  <div className="flex-1 h-px bg-border"></div>
                </div>
              )}
              {viewMode === 'compact' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {filteredAndSortedFlights.map((flight, index) => (
                    <div 
                      key={`flight-${flight.id}`} 
                      className="fade-in" 
                      style={{ animationDelay: `${0.1 + ((filteredAndSortedSessions.length + index) * 0.05)}s` }}
                    >
                      <FlightCardCompact flight={flight} />
                    </div>
                  ))}
                </div>
              ) : (
                filteredAndSortedFlights.map((flight, index) => (
                  <div 
                    key={`flight-${flight.id}`} 
                    className="fade-in" 
                    style={{ animationDelay: `${0.1 + ((filteredAndSortedSessions.length + index) * 0.05)}s` }}
                  >
                    <FlightCard flight={flight} />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Informações de Total */}
      {(filteredAndSortedFlights.length > 0 || filteredAndSortedSessions.length > 0) && (
        <div className="text-center text-sm text-muted-foreground fade-in">
          Exibindo {filteredAndSortedFlights.length + filteredAndSortedSessions.length} voos
          {showSessions && (
            <span> ({filteredAndSortedSessions.length} rastreados, {filteredAndSortedFlights.length} manuais)</span>
          )}
        </div>
      )}
    </div>
  );
};

export default Flights;