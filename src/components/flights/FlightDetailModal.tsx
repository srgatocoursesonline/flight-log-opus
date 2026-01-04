import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Plane,
  Clock,
  MapPin,
  TrendingDown,
  Star,
  Fuel,
  Route,
  Calendar,
  X
} from 'lucide-react';
import { Flight } from '@/hooks/supabase/useSupabaseFlights';
import { useSupabaseFlightStatusManager } from '@/hooks/supabase/useSupabaseFlightStatusManager';
import { useFlightSettings } from '@/hooks/business/useFlightSettings';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FlightDetailModalProps {
  flight: Flight | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FlightDetailModal = ({ flight, open, onOpenChange }: FlightDetailModalProps) => {
  const { t } = useTranslation();
  const statusManager = useSupabaseFlightStatusManager();
  const flightSettings = useFlightSettings();
  const [localFlight, setLocalFlight] = useState(flight);

  // Atualizar estado local quando o flight prop mudar
  useEffect(() => {
    setLocalFlight(flight);
  }, [flight]);

  if (!localFlight) return null;

  const getStatusBadge = (status: Flight['status']) => {
    // Tentar encontrar status customizado primeiro
    // Usar getStatusByValue que pode buscar tanto por ID quanto por nome
    const customStatus = statusManager.getStatusByValue(status);
    
    if (customStatus) {
      return (
        <Badge 
          className="text-xs font-medium border" 
          style={{ 
            backgroundColor: `${customStatus.color}20`, 
            color: customStatus.color, 
            borderColor: `${customStatus.color}30` 
          }}
        >
          {customStatus.icon} {customStatus.name}
        </Badge>
      );
    }
    
    // Fallback para status padrão
    const variants = {
      completed: 'bg-success/20 text-success border-success/30',
      planned: 'bg-primary/20 text-primary border-primary/30',
      active: 'bg-accent/20 text-accent border-accent/30',
      cancelled: 'bg-destructive/20 text-destructive border-destructive/30'
    };

    const labels = {
      completed: t('common.completed'),
      planned: t('common.planned'),
      active: t('common.active'),
      cancelled: t('common.cancelled')
    };

    return (
      <Badge className={cn('text-xs font-medium', variants[status as keyof typeof variants])}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 95) return 'text-success';
    if (rating >= 85) return 'text-accent';
    if (rating >= 70) return 'text-warning';
    return 'text-destructive';
  };

  const getLandingRateColor = (rate: number) => {
    const absRate = Math.abs(rate);
    if (absRate <= 150) return 'text-success';
    if (absRate <= 200) return 'text-accent';
    if (absRate <= 300) return 'text-warning';
    return 'text-destructive';
  };

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass-panel">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3 modal-title">
              <div className="p-2 rounded-lg bg-blue-600/20">
                <Plane className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <span className="text-xl font-bold font-mono">{localFlight.callsign}</span>
                <p className="text-sm description-text font-normal">{localFlight.aircraft}</p>
              </div>
            </DialogTitle>
            <div className="flex items-center gap-2">
              {getStatusBadge(localFlight.status)}
            </div>
          </div>
          <DialogDescription>
            Detalhes completos do voo e informações de rota
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Layout Horizontal Unificado (Estilo Cartão de Embarque) */}
          <div className="bg-card/50 border rounded-xl overflow-hidden shadow-sm">
            {/* Topo: Rota e Tempos */}
            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center justify-between relative">
              {/* Background Decoration */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-blue-500/5 opacity-50 pointer-events-none" />
              
              {/* Origem */}
              <div className="flex flex-col items-center md:items-start text-center md:text-left z-10 min-w-[140px]">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs text-muted-foreground bg-background/50">
                    Origem
                  </Badge>
                </div>
                <span className="text-4xl md:text-5xl font-bold font-mono tracking-tight text-primary">
                  {localFlight.departure}
                </span>
                <div className="mt-1 flex flex-col">
                  <span className="text-sm font-medium text-foreground/80 truncate max-w-[180px]">
                    {localFlight.originAirportInfo?.city || 'Desconhecido'}
                  </span>
                  <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                    {localFlight.originAirportInfo?.name}
                  </span>
                </div>
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 border border-border/50">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm font-mono font-medium">{localFlight.departureTime || '--:--'}</span>
                </div>
              </div>

              {/* Centro: Visualização da Rota */}
              <div className="flex-1 w-full md:w-auto flex flex-col items-center justify-center px-4 z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-[10px] h-5 px-2 font-mono">
                    {localFlight.flightTime || 'N/A'}
                  </Badge>
                </div>
                
                <div className="w-full flex items-center gap-3 relative">
                  <div className="h-2 w-2 rounded-full bg-primary/20 ring-4 ring-primary/10" />
                  <div className="h-[2px] flex-1 bg-gradient-to-r from-primary/20 via-primary/50 to-primary/20 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-1.5 bg-background border rounded-full shadow-sm z-20">
                      <Plane className="h-4 w-4 text-primary rotate-90 md:rotate-0" />
                    </div>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-primary/20 ring-4 ring-primary/10" />
                </div>

                <div className="mt-2 text-xs font-mono text-muted-foreground flex items-center gap-1.5">
                  <Route className="h-3 w-3" />
                  {localFlight.distance ? `${localFlight.distance} nm` : '--- nm'}
                </div>
              </div>

              {/* Destino */}
              <div className="flex flex-col items-center md:items-end text-center md:text-right z-10 min-w-[140px]">
                <div className="flex items-center gap-2 mb-1 justify-end">
                  <Badge variant="outline" className="text-xs text-muted-foreground bg-background/50">
                    Destino
                  </Badge>
                </div>
                <span className="text-4xl md:text-5xl font-bold font-mono tracking-tight text-primary">
                  {localFlight.arrival}
                </span>
                <div className="mt-1 flex flex-col items-center md:items-end">
                  <span className="text-sm font-medium text-foreground/80 truncate max-w-[180px]">
                    {localFlight.destinationAirportInfo?.city || 'Desconhecido'}
                  </span>
                  <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                    {localFlight.destinationAirportInfo?.name}
                  </span>
                </div>
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 border border-border/50">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm font-mono font-medium">{localFlight.arrivalTime || '--:--'}</span>
                </div>
              </div>
            </div>

            {/* Rodapé do Ticket: Data e Status */}
            <div className="bg-muted/30 border-t px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium text-foreground">{formatDate(localFlight.date)}</span>
                </div>
                <div className="hidden md:block w-px h-4 bg-border" />
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Fuel className="h-4 w-4" />
                  <span>Combustível: <span className="font-mono text-foreground">{localFlight.fuelUsed ? `${localFlight.fuelUsed} ${flightSettings.fuelUnit}` : 'N/A'}</span></span>
                </div>
              </div>
              
              {localFlight.route && (
                <div className="flex items-center gap-2 max-w-xs truncate text-muted-foreground" title={localFlight.route}>
                  <MapPin className="h-3 w-3" />
                  <span className="font-mono text-xs truncate">{localFlight.route}</span>
                </div>
              )}
            </div>
          </div>

            {/* Métricas de Performance Detalhadas */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider pl-1">
                Performance e Resultados
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col p-4 bg-card border rounded-lg hover:bg-accent/5 transition-colors">
                  <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                    <TrendingDown className="h-4 w-4" />
                    <span className="text-xs font-medium">Landing Rate</span>
                  </div>
                  <div className="mt-auto">
                    <p className={cn('text-2xl font-bold font-mono tracking-tight', localFlight.landingRate ? getLandingRateColor(localFlight.landingRate) : 'text-muted-foreground')}>
                      {localFlight.landingRate ? localFlight.landingRate : '---'}
                      <span className="text-xs text-muted-foreground ml-1 font-sans font-normal">fpm</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col p-4 bg-card border rounded-lg hover:bg-accent/5 transition-colors">
                  <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                    <Star className="h-4 w-4" />
                    <span className="text-xs font-medium">XP Total</span>
                  </div>
                  <div className="mt-auto">
                    <p className="text-2xl font-bold font-mono tracking-tight text-foreground">
                      {localFlight.experiencePoints || '0'}
                      <span className="text-xs text-muted-foreground ml-1 font-sans font-normal">pts</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col p-4 bg-card border rounded-lg hover:bg-accent/5 transition-colors">
                  <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                    <Star className="h-4 w-4" />
                    <span className="text-xs font-medium">Career Rating</span>
                  </div>
                  <div className="mt-auto">
                    <p className="text-2xl font-bold font-mono tracking-tight text-foreground">
                      {localFlight.careerRating || '0'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

          {/* Observações */}
          {localFlight.notes && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Observações</h3>
              <div className="p-4 bg-muted/10 rounded-lg border-l-4 border-primary">
                <p className="text-readable italic">"{localFlight.notes}"</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};