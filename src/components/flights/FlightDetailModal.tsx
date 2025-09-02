import { useState } from 'react';
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

  if (!flight) return null;

  const getStatusBadge = (status: Flight['status']) => {
    // Tentar encontrar status customizado primeiro
    const customStatus = statusManager.getStatusByName(status);
    
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
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Plane className="h-5 w-5 text-primary" />
              </div>
              <div>
                <span className="text-xl font-bold font-mono">{flight.callsign}</span>
                <p className="text-sm text-muted-foreground font-normal">{flight.aircraft}</p>
              </div>
            </DialogTitle>
            <div className="flex items-center gap-2">
              {getStatusBadge(flight.status)}
            </div>
          </div>
          <DialogDescription>
            Detalhes completos do voo e informações de rota
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Informações Básicas da Rota */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3 p-4 bg-muted/20 rounded-lg">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Rota</p>
                <p className="text-lg font-semibold font-mono">
                  {flight.departure} → {flight.arrival}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-muted/20 rounded-lg">
              <Clock className="h-5 w-5 text-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Horários</p>
                <p className="text-lg font-semibold">
                  {flight.departureTime || 'N/A'} - {flight.arrivalTime || 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-muted/20 rounded-lg">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Data</p>
                <p className="text-lg font-semibold">
                  {formatDate(flight.date)}
                </p>
              </div>
            </div>
          </div>

          {/* Métricas de Performance Detalhadas */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Métricas de Performance
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-muted/20 rounded-lg">
                <Clock className="h-6 w-6 text-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-1">Duração</p>
                <p className="text-lg font-bold text-foreground font-mono">
                  {flight.flightTime || 'N/A'}
                </p>
              </div>
              <div className="text-center p-4 bg-muted/20 rounded-lg">
                <Route className="h-6 w-6 text-accent mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-1">Distância</p>
                <p className="text-lg font-bold text-foreground font-mono">
                  {flight.distance ? `${flight.distance} nm` : 'N/A'}
                </p>
              </div>
              <div className="text-center p-4 bg-muted/20 rounded-lg">
                <TrendingDown className={cn('h-6 w-6 mx-auto mb-2', flight.landingRate ? getLandingRateColor(flight.landingRate) : 'text-muted-foreground')} />
                <p className="text-sm text-muted-foreground mb-1">Landing Rate</p>
                <p className={cn('text-lg font-bold font-mono', flight.landingRate ? getLandingRateColor(flight.landingRate) : 'text-muted-foreground')}>
                  {flight.landingRate ? `${flight.landingRate} fpm` : 'N/A'}
                </p>
              </div>
              <div className="text-center p-4 bg-muted/20 rounded-lg">
                <Star className={cn('h-6 w-6 mx-auto mb-2', flight.experiencePoints ? 'text-info' : 'text-muted-foreground')} />
                <p className="text-sm text-muted-foreground mb-1">Experience Points</p>
                <p className={cn('text-lg font-bold font-mono', flight.experiencePoints ? 'text-info' : 'text-muted-foreground')}>
                  {flight.experiencePoints || 'N/A'}
                </p>
              </div>
              <div className="text-center p-4 bg-muted/20 rounded-lg">
                <Star className={cn('h-6 w-6 mx-auto mb-2', flight.careerRating ? getRatingColor(flight.careerRating) : 'text-muted-foreground')} />
                <p className="text-sm text-muted-foreground mb-1">Career Rating</p>
                <p className={cn('text-lg font-bold font-mono', flight.careerRating ? getRatingColor(flight.careerRating) : 'text-muted-foreground')}>
                  {flight.careerRating || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Informações Adicionais */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Fuel className="h-5 w-5 text-warning" />
              Informações Adicionais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-muted/20 rounded-lg">
                <Fuel className="h-5 w-5 text-warning" />
                <div>
                  <p className="text-sm text-muted-foreground">Combustível Usado</p>
                  <p className="text-lg font-semibold font-mono">
                    {flight.fuelUsed ? `${flight.fuelUsed} ${flightSettings.fuelUnit}` : 'N/A'}
                  </p>
                </div>
              </div>
              {flight.route && (
                <div className="flex items-center gap-3 p-4 bg-muted/20 rounded-lg">
                  <Route className="h-5 w-5 text-success" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Rota Planejada</p>
                    <p className="text-sm font-mono text-foreground break-all">
                      {flight.route}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Observações */}
          {flight.notes && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Observações</h3>
              <div className="p-4 bg-muted/10 rounded-lg border-l-4 border-primary">
                <p className="text-foreground italic">"{flight.notes}"</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};