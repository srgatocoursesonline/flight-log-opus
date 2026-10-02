import { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MobileCard } from '@/components/ui/mobile-card';
import { FlightDetailModal } from './FlightDetailModal';
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
import { Flight, useSupabaseFlights } from '@/hooks/supabase/useSupabaseFlights';
import { useSupabaseFlightStatusManager } from '@/hooks/supabase/useSupabaseFlightStatusManager';
import { useFlightSettings } from '@/hooks/business/useFlightSettings';
import { AddFlightModal, AddFlightModalRef } from './AddFlightModal';
import { QuickStatusEdit } from './QuickStatusEdit';
import { cn } from '@/lib/utils';

interface FlightCardProps {
  flight: Flight;
}

export const FlightCard = ({ flight }: FlightCardProps) => {
  const { t } = useTranslation();
  const { deleteFlight } = useSupabaseFlights();
  const statusManager = useSupabaseFlightStatusManager();
  const flightSettings = useFlightSettings();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [shouldRenderModal, setShouldRenderModal] = useState(false);
  const editModalRef = useRef<AddFlightModalRef>(null);

  const handleCardClick = useCallback((e: React.MouseEvent) => {
    // Evitar abrir detalhes se clicar em botões, dropdowns ou menus
    if ((e.target as HTMLElement).closest('button, [role="menuitem"], .quick-status-edit')) {
      return;
    }
    setShowDetailModal(true);
  }, []);

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
    // Create date object from the date string (which is in YYYY-MM-DD format)
    // Using Date.UTC to avoid timezone conversion issues
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    // Format to Brazilian date format without timezone conversion
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC' // Ensure we use UTC to avoid timezone shifts
    });
  };

  const handleDelete = async () => {
    try {
      await deleteFlight(flight.id);
      setShowDeleteDialog(false);
      // Force page refresh to ensure UI updates
      window.location.reload();
    } catch (error) {
      console.error('Error deleting flight:', error);
    }
  };

  return (
    <>
      <div className="block md:hidden" onClick={handleCardClick}>
        <MobileCard
          title={flight.callsign}
          subtitle={flight.aircraft}
          value={`${flight.departure} → ${flight.arrival}`}
          badge={getStatusBadge(flight.status)}
          icon={<Plane className="h-5 w-5 text-primary" />}
          secondaryActions={[
            {
              label: 'Editar',
              icon: <Edit className="h-4 w-4" />,
              onClick: () => {
                setShouldRenderModal(true);
                setTimeout(() => editModalRef.current?.openModal(), 0);
              }
            },
            {
              label: 'Excluir',
              icon: <Trash2 className="h-4 w-4" />,
              onClick: () => setShowDeleteDialog(true),
              variant: 'destructive'
            }
          ]}
          details={[
            {
              icon: <Clock className="h-4 w-4 text-primary" />,
              label: 'Duração',
              value: flight.flightTime || 'N/A'
            },
            {
              icon: <Calendar className="h-4 w-4 text-primary" />,
              label: 'Data',
              value: formatDate(flight.date)
            },
            {
              icon: <TrendingDown className={cn('h-4 w-4', flight.landingRate ? getLandingRateColor(flight.landingRate) : 'text-muted-foreground')} />,
              label: 'Landing',
              value: flight.landingRate ? `${flight.landingRate} fpm` : 'N/A'
            }
          ]}
          notes={flight.notes}
        />
      </div>
      
      <Card className="hud-display flight-item hover:border-primary/50 transition-all duration-300 hidden md:block mobile-card cursor-pointer" onClick={handleCardClick}>
      <CardContent className="p-6">
        {/* Header com Callsign, Aircraft e Status */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20 mobile-icon-container">
                <Plane className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground font-mono mobile-card-title">
                  {flight.callsign}
                </h3>
                <p className="text-sm card-title mobile-card-subtitle">{flight.aircraft}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="quick-status-edit">
                <QuickStatusEdit flight={flight} />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-panel">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    setShouldRenderModal(true);
                    setTimeout(() => editModalRef.current?.openModal(), 0);
                  }}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteDialog(true);
                    }}
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
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm description-text font-mono">
                  {flight.departure} → {flight.arrival}
                </span>
              </div>
              {flight.originAirportInfo?.name && flight.destinationAirportInfo?.name && (
                <div className="text-xs text-muted-foreground ml-6">
                  {flight.originAirportInfo.name} → {flight.destinationAirportInfo.name}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm description-text">
                {flight.departureTime || 'N/A'} - {flight.arrivalTime || 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm description-text">
                {formatDate(flight.date)}
              </span>
            </div>
          </div>

          {/* Métricas de Performance */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <div className="text-center p-3 bg-muted/20 rounded-lg">
              <Clock className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-xs text-readable-muted">Duração</p>
              <p className="text-sm font-semibold description-text font-mono">
                {flight.flightTime || 'N/A'}
              </p>
            </div>
            <div className="text-center p-3 bg-muted/20 rounded-lg">
              <Route className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-xs text-readable-muted">Distância</p>
              <p className="text-sm font-semibold text-foreground font-mono">
                {flight.distance ? `${flight.distance} nm` : 'N/A'}
              </p>
            </div>
            <div className="text-center p-3 bg-muted/20 rounded-lg">
              <TrendingDown className="h-4 w-4 mx-auto mb-1 text-primary" />
              <p className="text-xs text-readable-muted">Landing</p>
              <p className={cn('text-sm font-semibold font-mono', flight.landingRate ? getLandingRateColor(flight.landingRate) : 'text-readable-muted')}>
                {flight.landingRate ? `${flight.landingRate} fpm` : 'N/A'}
              </p>
            </div>
            <div className="text-center p-3 bg-muted/20 rounded-lg">
              <Star className="h-4 w-4 mx-auto mb-1 text-primary" />
              <p className="text-xs text-readable-muted">XP</p>
              <p className={cn('text-sm font-semibold font-mono', flight.experiencePoints ? 'text-foreground' : 'text-readable-muted')}>
                {flight.experiencePoints || 'N/A'}
              </p>
            </div>
            <div className="text-center p-3 bg-muted/20 rounded-lg">
              <Star className="h-4 w-4 mx-auto mb-1 text-primary" />
              <p className="text-xs text-readable-muted">CR</p>
              <p className={cn('text-sm font-semibold font-mono', flight.careerRating ? 'text-foreground' : 'text-readable-muted')}>
                {flight.careerRating || 'N/A'}
              </p>
            </div>
          </div>

          {/* Informações Extras */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Fuel className="h-4 w-4 text-primary" />
              <span className="text-readable-muted">Combustível:</span>
              <span className="text-foreground font-mono">
                {flight.fuelUsed ? `${flight.fuelUsed} ${flightSettings.fuelUnit}` : 'N/A'}
              </span>
            </div>
            {flight.route && (
              <div className="flex items-center gap-2">
                <Route className="h-4 w-4 text-primary" />
                <span className="text-readable-muted">Rota:</span>
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

      {/* Modal de Detalhes */}
      <FlightDetailModal
        flight={flight}
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
      />

      {/* Modal de Edição - Renderizado apenas quando necessário */}
      {shouldRenderModal && (
        <AddFlightModal
          ref={editModalRef}
          flight={flight}
          trigger={null}
          onClose={() => {
            // Recarregar página após editar voo
            window.location.reload();
          }}
        />
      )}

      {/* Modal de Detalhes */}
      <FlightDetailModal
        flight={flight}
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
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
            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              className="bg-destructive hover:bg-destructive/80"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};