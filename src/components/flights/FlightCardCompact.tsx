import { memo, useState, useCallback, useMemo } from 'react';
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
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { Flight, useSupabaseFlights } from '@/hooks/supabase/useSupabaseFlights';
import { useSupabaseFlightStatusManager } from '@/hooks/supabase/useSupabaseFlightStatusManager';
import { AddFlightModal, AddFlightModalRef } from './AddFlightModal';
import { FlightDetailModal } from './FlightDetailModal';
import { QuickStatusEdit } from './QuickStatusEdit';
import { cn } from '@/lib/utils';

interface FlightCardCompactProps {
  flight: Flight;
}

const FlightCardCompact = memo(({ flight }: FlightCardCompactProps) => {
  const { t } = useTranslation();
  const { deleteFlight } = useSupabaseFlights();
  const { getStatusByValue } = useSupabaseFlightStatusManager();
  
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [shouldRenderEditModal, setShouldRenderEditModal] = useState(false);

  // Memoize status lookup
  const status = useMemo(() => getStatusByValue(flight.status), [flight.status, getStatusByValue]);

  // Memoize formatted date
  const formattedDate = useMemo(() => {
    // Create date object from the date string (which is in YYYY-MM-DD format)
    // Using Date.UTC to avoid timezone conversion issues
    const [year, month, day] = flight.date.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    
    // Format to Brazilian date format without timezone conversion
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC' // Ensure we use UTC to avoid timezone shifts
    });
  }, [flight.date]);

  // Memoize formatted duration
  const formattedDuration = useMemo(() => {
    const [hours, minutes] = flight.flightTime.split(':').map(Number);
    return `${hours}h ${minutes}m`;
  }, [flight.flightTime]);





  const handleDelete = useCallback(async () => {
    try {
      await deleteFlight(flight.id);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting flight:', error);
    }
  }, [deleteFlight, flight.id]);

  const handleCardClick = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, [role="menuitem"]')) {
      return;
    }
    setShowDetailModal(true);
  }, []);

  const handleEdit = useCallback(() => {
    setShouldRenderEditModal(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setShouldRenderEditModal(false);
    window.location.reload();
  }, []);





  return (
    <>
      <Card 
        className="hud-display flight-item hover:border-primary/50 transition-all duration-300 cursor-pointer h-full"
        onClick={handleCardClick}
        tabIndex={0}
      >
        <CardContent className="p-2">
          <div className="flex items-center justify-between h-full">
            {/* Informações principais */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="p-1 rounded-lg bg-blue-600/20 flex-shrink-0">
                <Plane className="h-3 w-3 text-blue-600" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-0.5">
                  <h3 className="text-xs font-semibold text-foreground font-mono truncate">
                    {flight.callsign}
                  </h3>
                </div>
                
                <div className="flex flex-col text-xs text-readable-muted gap-0.5">
                  <span className="font-mono font-semibold text-foreground truncate">
                    {flight.departure} → {flight.arrival}
                  </span>
                  {flight.originAirportInfo?.name && flight.destinationAirportInfo?.name && (
                    <span 
                      className="text-muted-foreground truncate transition-all duration-300"
                      style={{ 
                        fontSize: 'clamp(8px, 0.9vw + 4px, 11px)',
                        lineHeight: '1.2'
                      }}
                      title={`${flight.originAirportInfo.name} → ${flight.destinationAirportInfo.name}`}
                    >
                      {flight.originAirportInfo.name} → {flight.destinationAirportInfo.name}
                    </span>
                  )}
                  <span className="text-readable-muted truncate">
                    {flight.aircraft}
                  </span>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-2.5 w-2.5 text-blue-600" />
                    <span>{formattedDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status e ações */}
             <div className="flex items-center gap-1 flex-shrink-0 ml-2">
               <QuickStatusEdit flight={flight} />
               
               <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <Button
                     variant="ghost"
                     size="sm"
                     className="h-6 w-6 p-0 hover:bg-muted/50"
                     onClick={(e: React.MouseEvent) => e.stopPropagation()}
                   >
                     <MoreVertical className="h-3 w-3" />
                   </Button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent align="end" className="w-32">
                   <DropdownMenuItem onClick={handleEdit}>
                     <Edit className="h-3 w-3 mr-2" />
                     {t('common.edit')}
                   </DropdownMenuItem>
                   <DropdownMenuItem 
                     onClick={() => setShowDeleteDialog(true)}
                     className="text-destructive"
                   >
                     <Trash2 className="h-3 w-3 mr-2" />
                     {t('common.delete')}
                   </DropdownMenuItem>
                 </DropdownMenuContent>
               </DropdownMenu>
             </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Edição - Renderizado apenas quando necessário */}
      {shouldRenderEditModal && (
        <AddFlightModal 
          flight={flight}
          onClose={handleCloseEditModal}
          trigger={null}
        />
      )}
      
      <FlightDetailModal 
        flight={flight} 
        open={showDetailModal} 
        onOpenChange={setShowDetailModal} 
      />

      {/* Dialog de exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o voo {flight.callsign}? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});

FlightCardCompact.displayName = 'FlightCardCompact';

export { FlightCardCompact };