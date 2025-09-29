import { useState, useMemo, useEffect, useRef, useCallback, memo } from 'react';
import { List as FixedSizeList } from 'react-window';
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
import SafeVirtualizedList from '@/components/flights/SafeVirtualizedList';
import ErrorBoundary from '@/components/ErrorBoundary';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { ChartCRFlights } from '@/components/flights/ChartCRFlights';

import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';

// Componente memoizado para lista de voos compactos
const CompactFlightList = memo(({ flights }: { flights: any[] }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {flights.map((flight) => (
        <FlightCardCompact key={flight.id} flight={flight} />
      ))}
    </div>
  );
});

CompactFlightList.displayName = 'CompactFlightList';

// Componente memoizado para lista de voos detalhados
const DetailedFlightList = memo(({ flights }: { flights: any[] }) => {
  return (
    <>
      {flights.map((flight) => (
        <FlightCard key={flight.id} flight={flight} />
      ))}
    </>
  );
});

DetailedFlightList.displayName = 'DetailedFlightList';

// Componente memoizado para lista de sessões
const SessionList = memo(({ 
  sessions, 
  compact, 
  onViewDetails, 
  onCancelSession 
}: { 
  sessions: any[]; 
  compact: boolean; 
  onViewDetails: (id: string) => void; 
  onCancelSession: (id: string) => void; 
}) => {
  return (
    <>
      {sessions.map((session) => (
        <FlightSessionCard 
          key={session.id} 
          session={session} 
          compact={compact}
          onViewDetails={onViewDetails}
          onCancelSession={onCancelSession}
        />
      ))}
    </>
  );
});

SessionList.displayName = 'SessionList';

const FlightsContent = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
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
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 20;
  const addFlightModalRef = useRef<AddFlightModalRef>(null);

  // Escutar evento para abrir modal automaticamente ou verificar URL params
  useEffect(() => {
    // Verificar se deve abrir modal via URL params
    if (searchParams.get('openModal') === 'true') {
      // Limpar o parâmetro da URL
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('openModal');
      setSearchParams(newSearchParams, { replace: true });
      
      // Abrir modal com tentativas múltiplas para garantir que funcione
      const tryOpenModal = (attempts = 0) => {
        if (addFlightModalRef.current) {
          addFlightModalRef.current.openModal();
        } else if (attempts < 10) {
          // Tentar novamente após um delay se a ref ainda não estiver disponível
          setTimeout(() => tryOpenModal(attempts + 1), 100);
        }
      };
      
      // Iniciar tentativas após um delay inicial
      setTimeout(() => tryOpenModal(), 200);
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

  // Memoizar filtros para evitar re-renderizações desnecessárias
  const filterCriteria = useMemo(() => ({
    searchTerm: searchTerm.toLowerCase(),
    statusFilter,
    sortBy
  }), [searchTerm, statusFilter, sortBy]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filterCriteria]);

  // Memoizar voos filtrados e ordenados
  const filteredAndSortedFlights = useMemo(() => {
    let filtered = [...flights];

    // Filtro de busca
    if (filterCriteria.searchTerm) {
      filtered = filtered.filter(flight =>
        flight.callsign.toLowerCase().includes(filterCriteria.searchTerm) ||
        flight.departure.toLowerCase().includes(filterCriteria.searchTerm) ||
        flight.arrival.toLowerCase().includes(filterCriteria.searchTerm) ||
        flight.aircraft.toLowerCase().includes(filterCriteria.searchTerm)
      );
    }

    // Filtro de status
    if (filterCriteria.statusFilter !== 'all') {
      filtered = filtered.filter(flight => flight.status === filterCriteria.statusFilter);
    }

    // Ordenação otimizada
    const sorted = [...filtered].sort((a, b) => {
      switch (filterCriteria.sortBy) {
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'rating-desc':
          return b.careerRating - a.careerRating;
        case 'rating-asc':
          return a.careerRating - b.careerRating;
        case 'callsign':
          return a.callsign.localeCompare(b.callsign);
        case 'duration-desc':
          const aDuration = parseInt(a.flightTime.replace(/\D/g, '')) || 0;
          const bDuration = parseInt(b.flightTime.replace(/\D/g, '')) || 0;
          return bDuration - aDuration;
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

    return sorted;
  }, [flights, filterCriteria]);

  // Paginar os voos
  const paginatedFlights = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredAndSortedFlights.slice(0, endIndex);
  }, [filteredAndSortedFlights, page, ITEMS_PER_PAGE]);

  const totalPages = Math.ceil(filteredAndSortedFlights.length / ITEMS_PER_PAGE);
  const hasMore = page < totalPages;

  // Memoizar sessões filtradas
  const filteredAndSortedSessions = useMemo(() => {
    if (!showSessions) return [];
    
    let filtered = [...sessions];

    if (filterCriteria.searchTerm) {
      filtered = filtered.filter(session =>
        session.callsign.toLowerCase().includes(filterCriteria.searchTerm) ||
        session.departure.toLowerCase().includes(filterCriteria.searchTerm) ||
        session.arrival.toLowerCase().includes(filterCriteria.searchTerm)
      );
    }

    return filtered.sort((a, b) => {
      const dateA = new Date(a.startTime || a.date).getTime();
      const dateB = new Date(b.startTime || b.date).getTime();
      return dateB - dateA;
    });
  }, [sessions, showSessions, filterCriteria.searchTerm]);

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
    <div className="mobile-page-layout mobile-section pb-20 lg:pb-6 pr-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 fade-in">
        <div>
          <h1 className="mobile-title gradient-title">
            {t('flights.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('flights.subtitle')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => addFlightModalRef.current?.openModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('flights.addNewFlight')}
          </Button>
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

      {/* Gráfico de Evolução CR x Quantidade de Voos */}
      <div className="hud-display stats-card overflow-x-hidden min-w-0 -mr-1">
        <div className="p-3 sm:p-4">
          <h2 className="text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
            <Plane className="h-4 w-4" />
            Evolução do Career Rating
          </h2>
          <div className="flex-1 min-w-0 w-full overflow-x-hidden" style={{ contain: 'layout paint' }}>
            <ChartCRFlights userId={user?.id || profile?.id} />
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col lg:flex-row gap-2 fade-in" style={{ animationDelay: '0.1s' }}>
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
        
        <div className="flex gap-1 lg:gap-2">
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

          {/* Status filter using same value mapping used when saving flights */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {statusManager.getActiveStatuses().map((status) => {
                let statusValue = status.id;
                if (status.name === 'Planejado') statusValue = 'planned';
                if (status.name === 'Em Voo') statusValue = 'active';
                if (status.name === 'Concluído') statusValue = 'Concluído';
                if (status.name === 'Cancelado') statusValue = 'cancelled';
                return (
                  <SelectItem key={status.id} value={statusValue}>
                    {status.icon} {status.name}
                  </SelectItem>
                );
              })}
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
            <Plane className="h-12 w-12 text-blue-600 mx-auto mb-4 icon-hover" />
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
                paginatedFlights.length > 50 ? (
                  <SafeVirtualizedList
                    flights={paginatedFlights}
                    height={600}
                    itemSize={120}
                    width="100%"
                    layout="grid"
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {paginatedFlights.map((flight, index) => (
                      <div 
                        key={`flight-${flight.id}`} 
                        className="fade-in" 
                        style={{ animationDelay: `${0.1 + ((filteredAndSortedSessions.length + index) * 0.05)}s` }}
                      >
                        <FlightCardCompact flight={flight} />
                      </div>
                    ))}
                  </div>
                )
              ) : (
                paginatedFlights.map((flight, index) => (
                  <div 
                    key={`flight-${flight.id}`} 
                    className="fade-in" 
                    style={{ animationDelay: `${0.1 + ((filteredAndSortedSessions.length + index) * 0.05)}s` }}
                  >
                    <FlightCard flight={flight} />
                  </div>
                ))
              )}
              
              {/* Botão de carregar mais */}
              {hasMore && (
                <div className="text-center pt-4">
                  <button
                    onClick={() => setPage(prev => prev + 1)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Carregar mais voos ({page * ITEMS_PER_PAGE} de {filteredAndSortedFlights.length})
                  </button>
                </div>
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

// Componente principal com ErrorBoundary
const Flights = () => {
  return (
    <ErrorBoundary>
      <FlightsContent />
    </ErrorBoundary>
  );
};

export default Flights;