import { useState, useMemo, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, Plane } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useFlights } from '@/hooks/useFlights';
import { useFlightStatusManager } from '@/hooks/useFlightStatusManager';
import { AddFlightModal, AddFlightModalRef } from '@/components/flights/AddFlightModal';
import { FlightCard } from '@/components/flights/FlightCard';
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
  const { flights, isLoading } = useFlights();
  const statusManager = useFlightStatusManager();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const addFlightModalRef = useRef<AddFlightModalRef>(null);

  // Escutar evento para abrir modal automaticamente
  useEffect(() => {
    const handleOpenModal = () => {
      if (addFlightModalRef.current) {
        addFlightModalRef.current.openModal();
      }
    };

    window.addEventListener('openAddFlightModal', handleOpenModal);
    return () => {
      window.removeEventListener('openAddFlightModal', handleOpenModal);
    };
  }, []);

  // Filtrar e ordenar voos
  const filteredAndSortedFlights = useMemo(() => {
    let filtered = flights.filter(flight => {
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
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
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

  if (isLoading) {
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
        <AddFlightModal ref={addFlightModalRef} />
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

      {/* Lista de Voos */}
      {filteredAndSortedFlights.length === 0 ? (
        <div className="hud-display stats-card p-6 fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="text-center py-12">
            <Plane className="h-12 w-12 text-muted-foreground mx-auto mb-4 icon-hover" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {flights.length === 0 ? t('flights.noFlights') : 'Nenhum voo encontrado'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {flights.length === 0 
                ? t('flights.noFlightsDesc')
                : 'Tente ajustar os filtros de busca.'
              }
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedFlights.map((flight, index) => (
            <div 
              key={flight.id} 
              className="fade-in" 
              style={{ animationDelay: `${0.1 + (index * 0.05)}s` }}
            >
              <FlightCard flight={flight} />
            </div>
          ))}
        </div>
      )}

      {/* Informações de Total */}
      {filteredAndSortedFlights.length > 0 && (
        <div className="text-center text-sm text-muted-foreground fade-in">
          Exibindo {filteredAndSortedFlights.length} de {flights.length} voos
        </div>
      )}
    </div>
  );
};

export default Flights;