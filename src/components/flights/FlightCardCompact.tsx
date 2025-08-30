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

export const FlightCardCompact = ({ flight }: FlightCardCompactProps) => {
  const { t } = useTranslation();
  const { deleteFlight } = useSupabaseFlights();
  const statusManager = useSupabaseFlightStatusManager();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const editModalRef = useRef<AddFlightModalRef>(null);

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

  const handleDelete = () => {
    deleteFlight(flight.id);
    setShowDeleteDialog(false);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Não abrir modal se clicou em botões ou dropdowns
    if ((e.target as HTMLElement).closest('button, [role="menuitem"]')) {
      return;
    }
    setShowDetailModal(true);
  };

  return (
    <>
      <Card 
        className="hud-display flight-item hover:border-primary/50 transition-all duration-300 cursor-pointer"
        onClick={handleCardClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {/* Informações principais */}
            <div className="flex items-center gap-4 flex-1">
              <div className="p-2 rounded-lg bg-primary/20">
                <Plane className="h-4 w-4 text-primary" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-semibold text-foreground font-mono">
                    {flight.callsign}
                  </h3>
                  {getStatusBadge(flight.status)}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="font-mono font-semibold text-foreground">
                    {flight.departure} → {flight.arrival}
                  </span>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(flight.date)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetailModal(true);
                }}
                title="Ver detalhes"
              >
                <Eye className="h-4 w-4" />
              </Button>
              
              <QuickStatusEdit flight={flight} />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={(e) => e.stopPropagation()}
                  >
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
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      <FlightDetailModal
        flight={flight}
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
      />

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