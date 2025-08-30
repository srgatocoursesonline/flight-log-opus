import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Flight, useSupabaseFlights } from '@/hooks/supabase/useSupabaseFlights';
import { useSupabaseFlightStatusManager } from '@/hooks/supabase/useSupabaseFlightStatusManager';
import { cn } from '@/lib/utils';

interface QuickStatusEditProps {
  flight: Flight;
}

export const QuickStatusEdit = ({ flight }: QuickStatusEditProps) => {
  const { t } = useTranslation();
  const { updateFlight } = useSupabaseFlights();
  const statusManager = useSupabaseFlightStatusManager();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Fecha o popover quando clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target as Node) && open) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  // Renderiza o badge do status atual
  const getStatusBadge = (status: Flight['status']) => {
    // Tentar encontrar status customizado primeiro
    const customStatus = statusManager.getStatusByName(status);
    
    if (customStatus) {
      return (
        <Badge 
          className="text-xs font-medium border cursor-pointer hover:brightness-110 transition-all"
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
      <Badge className={cn('text-xs font-medium cursor-pointer hover:brightness-110 transition-all', variants[status as keyof typeof variants])}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  // Atualiza o status do voo
  const handleStatusChange = async (newStatus: string) => {
    await updateFlight(flight.id, { status: newStatus as Flight['status'] });
    setOpen(false);
  };

  // Prepara as opções de status disponíveis
  const statusOptions = statusManager.getActiveStatuses().map(status => {
    // Determinar o valor real baseado no nome do status para compatibilidade
    let statusValue = status.id;
    
    // Se o status tiver um nome correspondente aos tipos padrão, use o tipo em vez do ID
    if (status.name === 'Planejado') statusValue = 'planned';
    if (status.name === 'Em Voo') statusValue = 'active';
    if (status.name === 'Completado') statusValue = 'completed';
    if (status.name === 'Cancelado') statusValue = 'cancelled';
    
    return {
      value: statusValue,
      label: status.name,
      icon: status.icon,
      color: status.color
    };
  });
  
  // Fallback para status padrão se não houver customizados
  if (statusOptions.length === 0) {
    statusOptions.push(
      { value: 'planned', label: t('common.planned'), icon: '📅', color: '#6B7280' },
      { value: 'active', label: t('common.active'), icon: '✈️', color: '#F59E0B' },
      { value: 'completed', label: t('common.completed'), icon: '✅', color: '#10B981' },
      { value: 'cancelled', label: t('common.cancelled'), icon: '❌', color: '#EF4444' }
    );
  }

  return (
    <div ref={triggerRef}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="inline-block" onClick={() => setOpen(true)}>
            {getStatusBadge(flight.status)}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2 glass-panel">
          <div className="flex flex-col gap-2">
            <p className="text-xs text-muted-foreground px-2 py-1">
              Selecione o status:
            </p>
            {statusOptions.map((option) => (
              <Badge
                key={option.value}
                className="cursor-pointer hover:brightness-110 transition-all text-xs font-medium py-1 px-3"
                style={{
                  backgroundColor: `${option.color}20`,
                  color: option.color,
                  borderColor: `${option.color}30`
                }}
                onClick={() => handleStatusChange(option.value)}
              >
                {option.icon} {option.label}
              </Badge>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};