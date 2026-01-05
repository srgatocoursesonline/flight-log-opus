import { useState, useMemo, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Download, Calendar, Filter, Plane, Search, CalendarIcon, Plus, Keyboard } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSupabaseFlights } from '@/hooks/supabase/useSupabaseFlights';
import { AddFlightModal, AddFlightModalRef } from '@/components/flights/AddFlightModal';
import { useSupabaseFlightStatusManager } from '@/hooks/supabase/useSupabaseFlightStatusManager';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
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
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const History = () => {
  const { t } = useTranslation();
  const { flights, isLoading } = useSupabaseFlights();
  const statusManager = useSupabaseFlightStatusManager();
  const addFlightModalRef = useRef<AddFlightModalRef>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);

  // Função para pluralização de voos
  const pluralizeFlights = (count: number) => {
    return count === 1 ? 'voo' : 'voos';
  };
  const [showFilters, setShowFilters] = useState(false);

  // Atalho de teclado Ctrl+1 para abrir modal de adicionar voo
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === '1') {
        event.preventDefault();
        if (addFlightModalRef.current) {
          addFlightModalRef.current.openModal();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Calculate stats based on real flights
  const stats = useMemo(() => {
    if (isLoading) return { week: 0, month: 0, total: 0 };
    
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    
    const weekFlights = flights.filter(flight => {
      const flightDate = new Date(flight.date);
      return flightDate >= oneWeekAgo;
    });
    
    const monthFlights = flights.filter(flight => {
      const flightDate = new Date(flight.date);
      return flightDate >= oneMonthAgo;
    });
    
    return {
      week: weekFlights.length,
      month: monthFlights.length,
      total: flights.length
    };
  }, [flights, isLoading]);

  // Filter and sort flights
  const filteredAndSortedFlights = useMemo(() => {
    if (isLoading) return [];
    
    const filtered = flights.filter(flight => {
      // Text search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = searchTerm === '' || 
        flight.callsign.toLowerCase().includes(searchLower) ||
        flight.aircraft.toLowerCase().includes(searchLower) ||
        flight.departure.toLowerCase().includes(searchLower) ||
        flight.arrival.toLowerCase().includes(searchLower);
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || flight.status === statusFilter;
      
      // Date range filter
      let matchesDateRange = true;
      const flightDate = new Date(flight.date);
      
      if (dateFrom) {
        const from = new Date(dateFrom);
        from.setHours(0, 0, 0, 0);
        matchesDateRange = matchesDateRange && flightDate >= from;
      }
      
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        matchesDateRange = matchesDateRange && flightDate <= to;
      }
      
      return matchesSearch && matchesStatus && matchesDateRange;
    });

    // Sort flights
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
        case 'duration-desc':
          // Convert flight time to minutes for comparison
          const aMinutes = parseFlightTime(a.flightTime);
          const bMinutes = parseFlightTime(b.flightTime);
          return bMinutes - aMinutes;
        case 'duration-asc':
          const aMin = parseFlightTime(a.flightTime);
          const bMin = parseFlightTime(b.flightTime);
          return aMin - bMin;
        case 'callsign':
          return a.callsign.localeCompare(b.callsign);
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

    return filtered;
  }, [flights, isLoading, searchTerm, sortBy, statusFilter, dateFrom, dateTo]);

  // Helper function to parse flight time into minutes
  const parseFlightTime = (flightTime: string): number => {
    if (!flightTime) return 0;
    
    // Handle formats like "1h 30m", "45m", "2h"
    const hourMatch = flightTime.match(/(\d+)h/);
    const minuteMatch = flightTime.match(/(\d+)m/);
    
    const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
    const minutes = minuteMatch ? parseInt(minuteMatch[1]) : 0;
    
    return hours * 60 + minutes;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC'
    });
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFrom(undefined);
    setDateTo(undefined);
    setShowFilters(false);
  };

  // Export to Excel (CSV)
  const exportToExcel = () => {
    // Generate CSV content
    const headers = [
      'Callsign',
      'Aircraft',
      'Departure',
      'Arrival',
      'Date',
      'Departure Time',
      'Arrival Time',
      'Flight Time',
      'Distance (nm)',
      'Fuel Used (lb)',
      'Landing Rate (fpm)',
      'Career Rating',
      'Status',
      'Notes'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredAndSortedFlights.map(flight => {
        return [
          `"${flight.callsign}"`,
          `"${flight.aircraft}"`,
          `"${flight.departure}"`,
          `"${flight.arrival}"`,
          `"${flight.date}"`,
          `"${flight.departureTime}"`,
          `"${flight.arrivalTime}"`,
          `"${flight.flightTime}"`,
          `"${flight.distance}"`,
          `"${flight.fuelUsed}"`,
          `"${flight.landingRate}"`,
          `"${flight.careerRating}"`,
          `"${flight.status}"`,
          `"${flight.notes?.replace(/"/g, '""') || ''}"`
        ].join(',');
      })
    ].join('\n');

    // Create a blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `flight_history_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Arquivo exportado com sucesso!');
  };

  if (isLoading) {
    return (
      <div className="space-y-6 pb-20 lg:pb-6">
        <div className="text-center py-12">
          <Plane className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-readable-muted">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 fade-in">
        <div>
          <h1 className="mobile-title gradient-title">
            {t('history.title')}
          </h1>
          <p className="text-readable-muted">
            {t('history.subtitle')}
          </p>
        </div>
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="icon-hover">
                <Filter className="h-4 w-4 mr-2 text-blue-600" />
                {t('common.filter')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="sm:max-w-[425px] glass-panel">
              <AlertDialogHeader>
                <AlertDialogTitle>{t('common.filter')}</AlertDialogTitle>
                <AlertDialogDescription>
                  Filtre o histórico de voos por data, status ou outros critérios.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Status</p>
                  {/* Status filter using same value mapping used when saving flights */}
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full">
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
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Período</p>
                  <div className="flex gap-2">
                    <div className="grid gap-2 flex-1">
                      <p className="text-xs text-readable-muted">De</p>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateFrom ? (
                              format(dateFrom, 'dd/MM/yyyy')
                            ) : (
                              <span>Selecionar data</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 glass-panel">
                          <CalendarComponent
                            mode="single"
                            selected={dateFrom}
                            onSelect={setDateFrom}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="grid gap-2 flex-1">
                      <p className="text-xs text-readable-muted">Até</p>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateTo ? (
                              format(dateTo, 'dd/MM/yyyy')
                            ) : (
                              <span>Selecionar data</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 glass-panel">
                          <CalendarComponent
                            mode="single"
                            selected={dateTo}
                            onSelect={setDateTo}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={resetFilters}>Limpar Filtros</AlertDialogCancel>
                <AlertDialogAction>Aplicar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button variant="outline" className="icon-hover" onClick={exportToExcel}>
            <Download className="h-4 w-4 mr-2 text-blue-600" />
            Export
          </Button>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => addFlightModalRef.current?.openModal()}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Voo
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <div className="flex items-center gap-2">
                  <Keyboard className="h-4 w-4" />
                  <span>Atalho: Ctrl + 1</span>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="hud-display stats-card fade-in p-4" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-blue-600 icon-hover" />
            <div>
              <p className="text-sm text-readable-muted">{t('history.thisWeek')}</p>
              <p className="font-semibold text-green-500">{stats.week} {pluralizeFlights(stats.week)}</p>
            </div>
          </div>
        </div>
        <div className="hud-display stats-card fade-in p-4" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-blue-600 icon-hover" />
            <div>
              <p className="text-sm text-readable-muted">{t('history.thisMonth')}</p>
              <p className="font-semibold text-green-500">{stats.month} {pluralizeFlights(stats.month)}</p>
            </div>
          </div>
        </div>
        <div className="hud-display stats-card fade-in p-4" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-blue-600 icon-hover" />
            <div>
              <p className="text-sm text-readable-muted">{t('history.totalFlights')}</p>
              <p className="font-semibold text-green-500">{stats.total} {pluralizeFlights(stats.total)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Sort Controls */}
      <div className="flex flex-col lg:flex-row gap-4 fade-in" style={{ animationDelay: '0.4s' }}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-readable-muted" />
          <input
            type="text"
            placeholder={t('history.searchFlights')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-muted/30 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground transition-all duration-300 hover:border-primary/50"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder={t('history.sortBy')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">{t('history.date')} (Recente)</SelectItem>
              <SelectItem value="date-asc">{t('history.date')} (Antigo)</SelectItem>
              <SelectItem value="rating-desc">{t('history.rating')} (Maior)</SelectItem>
              <SelectItem value="rating-asc">{t('history.rating')} (Menor)</SelectItem>
              <SelectItem value="duration-desc">{t('history.duration')} (Maior)</SelectItem>
              <SelectItem value="duration-asc">{t('history.duration')} (Menor)</SelectItem>
              <SelectItem value="callsign">Callsign</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters Display */}
      {(statusFilter !== 'all' || dateFrom || dateTo) && (
        <div className="flex flex-wrap gap-2 fade-in" style={{ animationDelay: '0.45s' }}>
          {statusFilter !== 'all' && (
            <div className="bg-muted/30 text-xs rounded-full px-3 py-1 flex items-center gap-1">
              <span>Status: {statusFilter}</span>
              <button 
                onClick={() => setStatusFilter('all')} 
                className="ml-1 text-readable-muted hover:text-foreground"
              >
                ×
              </button>
            </div>
          )}
          {dateFrom && (
            <div className="bg-muted/30 text-xs rounded-full px-3 py-1 flex items-center gap-1">
              <span>De: {format(dateFrom, 'dd/MM/yyyy')}</span>
              <button 
                onClick={() => setDateFrom(undefined)} 
                className="ml-1 text-readable-muted hover:text-foreground"
              >
                ×
              </button>
            </div>
          )}
          {dateTo && (
            <div className="bg-muted/30 text-xs rounded-full px-3 py-1 flex items-center gap-1">
              <span>Até: {format(dateTo, 'dd/MM/yyyy')}</span>
              <button 
                onClick={() => setDateTo(undefined)} 
                className="ml-1 text-readable-muted hover:text-foreground"
              >
                ×
              </button>
            </div>
          )}
          {(statusFilter !== 'all' || dateFrom || dateTo) && (
            <button 
              onClick={resetFilters}
              className="text-xs text-primary hover:text-primary/80 underline"
            >
              Limpar todos os filtros
            </button>
          )}
        </div>
      )}

      {/* Flight History Table */}
      {filteredAndSortedFlights.length === 0 ? (
        <div className="hud-display stats-card p-6 fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4 icon-hover" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {flights.length === 0 ? t('history.noHistory') : 'Nenhum voo encontrado'}
            </h3>
            <p className="text-readable-muted">
              {flights.length === 0 
                ? t('history.noHistoryDesc')
                : 'Tente ajustar os filtros de busca.'
              }
            </p>
          </div>
        </div>
      ) : (
        <div className="hud-display fade-in" style={{ animationDelay: '0.5s' }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('common.callsign')}</TableHead>
                <TableHead>{t('common.aircraft')}</TableHead>
                <TableHead>{t('common.route')}</TableHead>
                <TableHead>{t('common.date')}</TableHead>
                <TableHead>{t('common.duration')}</TableHead>
                <TableHead>{t('common.rating')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedFlights.map((flight, index) => (
                <TableRow key={flight.id} className={index % 2 === 0 ? 'bg-muted/10' : ''}>
                  <TableCell className="font-medium">{flight.callsign}</TableCell>
                  <TableCell>{flight.aircraft}</TableCell>
                  <TableCell>{flight.departure} → {flight.arrival}</TableCell>
                  <TableCell>{formatDate(flight.date)}</TableCell>
                  <TableCell>{flight.flightTime}</TableCell>
                  <TableCell>
                    <span className={`font-medium ${
                      flight.careerRating >= 95 ? 'text-success' :
                      flight.careerRating >= 85 ? 'text-accent' :
                      flight.careerRating >= 70 ? 'text-warning' : 'text-destructive'
                    }`}>
                      {flight.careerRating}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {/* Display total count */}
          <div className="text-center text-sm text-readable-muted p-4 border-t">
            {t('common.showing')} {filteredAndSortedFlights.length} {t('common.of')} {flights.length} {pluralizeFlights(flights.length)}
          </div>
        </div>
      )}
      
      <AddFlightModal ref={addFlightModalRef} />
    </div>
  );
};

export default History;