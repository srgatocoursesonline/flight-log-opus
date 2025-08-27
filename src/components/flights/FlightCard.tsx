import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Plane,
  Clock,
  MapPin,
  TrendingDown,
  Star,
  MoreVertical,
  Edit,
  Trash2,
  Fuel,
  Route,
  Calendar
} from 'lucide-react';
import { Flight, useFlights } from '@/hooks/useFlights';
import { useFlightStatusManager } from '@/hooks/useFlightStatusManager';
import { AddFlightModal, AddFlightModalRef } from './AddFlightModal';
import { cn } from '@/lib/utils';

interface FlightCardProps {
  flight: Flight;
}

export const FlightCard = ({ flight }: FlightCardProps) => {
  const { t } = useTranslation();
  const { deleteFlight } = useFlights();
  const statusManager = useFlightStatusManager();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const editModalRef = useRef<AddFlightModalRef>(null);

  const getStatusBadge = (status: Flight['status']) => {
    // Tentar encontrar status customizado primeiro
    const customStatus = statusManager.getStatusById(status);
    
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
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleDelete = () => {
    deleteFlight(flight.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Card className="hud-display flight-item hover:border-primary/50 transition-all duration-300">
      <CardContent className="p-6">
        {/* Header com Callsign, Aircraft e Status */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Plane className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground font-mono">
                  {flight.callsign}
                </h3>
                <p className="text-sm text-muted-foreground">{flight.aircraft}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(flight.status)}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-panel">
                  <DropdownMenuItem onClick={() => editModalRef.current?.openModal()}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Rota e Horários */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm text-foreground font-mono">
                {flight.departure} → {flight.arrival}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-foreground" />
              <span className="text-sm text-foreground">
                {flight.departureTime || 'N/A'} - {flight.arrivalTime || 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground">
                {formatDate(flight.date)}
              </span>
            </div>
          </div>

          {/* Métricas de Performance */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <div className="text-center p-3 bg-muted/20 rounded-lg">
              <Clock className="h-4 w-4 text-foreground mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Duração</p>
              <p className="text-sm font-semibold text-foreground font-mono">
                {flight.flightTime || 'N/A'}
              </p>
            </div>
            <div className="text-center p-3 bg-muted/20 rounded-lg">
              <Route className="h-4 w-4 text-accent mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Distância</p>
              <p className="text-sm font-semibold text-foreground font-mono">
                {flight.distance ? `${flight.distance} nm` : 'N/A'}
              </p>
            </div>
            <div className="text-center p-3 bg-muted/20 rounded-lg">
              <TrendingDown className={cn('h-4 w-4 mx-auto mb-1', flight.landingRate ? getLandingRateColor(flight.landingRate) : 'text-muted-foreground')} />
              <p className="text-xs text-muted-foreground">Landing</p>
              <p className={cn('text-sm font-semibold font-mono', flight.landingRate ? getLandingRateColor(flight.landingRate) : 'text-muted-foreground')}>
                {flight.landingRate ? `${flight.landingRate} fpm` : 'N/A'}
              </p>
            </div>
            <div className="text-center p-3 bg-muted/20 rounded-lg">
              <Star className={cn('h-4 w-4 mx-auto mb-1', flight.experiencePoints ? 'text-info' : 'text-muted-foreground')} />
              <p className="text-xs text-muted-foreground">XP</p>
              <p className={cn('text-sm font-semibold font-mono', flight.experiencePoints ? 'text-info' : 'text-muted-foreground')}>
                {flight.experiencePoints || 'N/A'}
              </p>
            </div>
            <div className="text-center p-3 bg-muted/20 rounded-lg">
              <Star className={cn('h-4 w-4 mx-auto mb-1', flight.careerRating ? getRatingColor(flight.careerRating) : 'text-muted-foreground')} />
              <p className="text-xs text-muted-foreground">CR</p>
              <p className={cn('text-sm font-semibold font-mono', flight.careerRating ? getRatingColor(flight.careerRating) : 'text-muted-foreground')}>
                {flight.careerRating || 'N/A'}
              </p>
            </div>
          </div>

          {/* Informações Extras */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Fuel className="h-4 w-4 text-warning" />
              <span className="text-muted-foreground">Combustível:</span>
              <span className="text-foreground font-mono">{flight.fuelUsed ? `${flight.fuelUsed} lb` : 'N/A'}</span>
            </div>
            {flight.route && (
              <div className="flex items-center gap-2">
                <Route className="h-4 w-4 text-success" />
                <span className="text-muted-foreground">Rota:</span>
                <span className="text-foreground font-mono text-xs">{flight.route}</span>
              </div>
            )}
          </div>

          {/* Observações */}
          {flight.notes && (
            <div className="mt-4 p-3 bg-muted/10 rounded-lg">
              <p className="text-sm text-muted-foreground italic">"{flight.notes}"</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Edição */}
      <AddFlightModal
        ref={editModalRef}
        flight={flight}
        trigger={null}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="glass-panel">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Voo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o voo {flight.callsign}? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/80">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};