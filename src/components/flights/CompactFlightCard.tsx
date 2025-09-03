import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plane,
  Clock,
  MapPin,
  TrendingDown,
  Star,
  MoreVertical,
  Edit,
  Trash2,
  Calendar
} from 'lucide-react';
import { Flight } from '@/hooks/supabase/useSupabaseFlights';
import { QuickStatusEdit } from './QuickStatusEdit';
import { cn } from '@/lib/utils';

interface CompactFlightCardProps {
  flight: Flight;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const CompactFlightCard = ({ flight, onEdit, onDelete }: CompactFlightCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'completed': { label: 'Concluído', variant: 'default' as const, className: 'bg-success/20 text-success border-success/30' },
      'in-progress': { label: 'Em Progresso', variant: 'secondary' as const, className: 'bg-warning/20 text-warning border-warning/30' },
      'planned': { label: 'Planejado', variant: 'outline' as const, className: 'bg-info/20 text-info border-info/30' },
      'cancelled': { label: 'Cancelado', variant: 'destructive' as const, className: 'bg-destructive/20 text-destructive border-destructive/30' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.planned;
    return (
      <Badge variant={config.variant} className={cn('text-xs font-medium', config.className)}>
        {config.label}
      </Badge>
    );
  };

  const getLandingRateColor = (rate: number) => {
    if (rate <= -500) return 'text-destructive';
    if (rate <= -300) return 'text-warning';
    if (rate <= -150) return 'text-success';
    return 'text-info';
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 90) return 'text-success';
    if (rating >= 70) return 'text-info';
    if (rating >= 50) return 'text-warning';
    return 'text-destructive';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  return (
    <div className="mobile-card mobile-touch-target mobile-fade-in">
      {/* Header compacto */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="mobile-icon-container bg-primary/10 p-2 rounded-lg flex-shrink-0">
            <Plane className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="mobile-card-title font-semibold text-foreground font-mono truncate">
                {flight.callsign}
              </h3>
              {getStatusBadge(flight.status)}
            </div>
            <div className="flex items-center gap-2 text-sm text-readable-muted">
              <MapPin className="h-3 w-3 flex-shrink-0 text-blue-600" />
              <span className="font-mono truncate">
                {flight.departure} → {flight.arrival}
              </span>
            </div>
          </div>
        </div>
        
        {/* Ações primárias */}
        <div className="flex items-center gap-1 ml-2">
          <QuickStatusEdit flight={flight} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 mobile-touch-target"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-panel">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Detalhes expandidos */}
      {isExpanded && (
        <div className="px-4 pb-4 mobile-slide-down">
          <div className="border-t border-border/50 pt-3">
            {/* Informações básicas */}
            <div className="mobile-grid-2 gap-3 mb-3">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-readable-muted">Duração:</span>
                <span className="font-mono text-foreground">
                  {flight.flightTime || 'N/A'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-readable-muted">Data:</span>
                <span className="font-mono text-foreground">
                  {formatDate(flight.date)}
                </span>
              </div>
            </div>

            {/* Métricas de performance */}
            <div className="mobile-grid-3 gap-2 mb-3">
              <div className="text-center p-2 bg-muted/10 rounded-lg">
                <TrendingDown className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                <p className="text-xs text-readable-muted">Landing</p>
                <p className={cn('text-xs font-semibold font-mono', 
                  flight.landingRate ? getLandingRateColor(flight.landingRate) : 'text-readable-muted'
                )}>
                  {flight.landingRate ? `${flight.landingRate} fpm` : 'N/A'}
                </p>
              </div>
              <div className="text-center p-2 bg-muted/10 rounded-lg">
                <Star className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                <p className="text-xs text-readable-muted">XP</p>
                <p className={cn('text-xs font-semibold font-mono', 
                  flight.experiencePoints ? 'text-foreground' : 'text-readable-muted'
                )}>
                  {flight.experiencePoints || 'N/A'}
                </p>
              </div>
              <div className="text-center p-2 bg-muted/10 rounded-lg">
                <Star className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                <p className="text-xs text-readable-muted">CR</p>
                <p className={cn('text-xs font-semibold font-mono', 
                  flight.careerRating ? 'text-foreground' : 'text-readable-muted'
                )}>
                  {flight.careerRating || 'N/A'}
                </p>
              </div>
            </div>

            {/* Aeronave */}
            <div className="text-sm text-readable-muted mb-2">
              <span className="font-medium">Aeronave:</span> {flight.aircraft}
            </div>

            {/* Observações */}
            {flight.notes && (
              <div className="mt-3 p-2 bg-muted/10 rounded-lg">
                <p className="text-xs text-muted-foreground italic">"{flight.notes}"</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};