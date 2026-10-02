// ============================================
// FONTE CANÔNICA DE STATUS DE VOO
// ============================================
// Single source dos status padrão — consumida por useFlightStatusManager
// (localStorage), useSupabaseFlightStatusManager (DB) e QuickStatusEdit.
// As cores são hex pois trafegam como DADOS do usuário (DB/localStorage);
// a UI usa style={{ color }} inline a partir destes valores.

export interface FlightStatusDefinition {
  id: string;
  name: string;
  color: string;
  icon: string;
  description: string;
  isDefault: boolean;
  isActive: boolean;
  hourlyMultiplier: number;
}

export const DEFAULT_FLIGHT_STATUSES: FlightStatusDefinition[] = [
  {
    id: 'planned',
    name: 'Planejado',
    color: '#6B7280',
    icon: '📅',
    description: 'Voo agendado para execução',
    isDefault: true,
    isActive: true,
    hourlyMultiplier: 1.0,
  },
  {
    id: 'active',
    name: 'Em Voo',
    color: '#F59E0B',
    icon: '✈️',
    description: 'Voo atualmente em execução',
    isDefault: true,
    isActive: true,
    hourlyMultiplier: 1.0,
  },
  {
    id: 'completed',
    name: 'Concluído',
    color: '#10B981',
    icon: '✅',
    description: 'Voo concluído com sucesso',
    isDefault: true,
    isActive: true,
    hourlyMultiplier: 1.0,
  },
  {
    id: 'cancelled',
    name: 'Cancelado',
    color: '#EF4444',
    icon: '❌',
    description: 'Voo cancelado',
    isDefault: true,
    isActive: true,
    hourlyMultiplier: 0,
  },
  {
    id: 'delayed',
    name: 'Atrasado',
    color: '#F97316',
    icon: '⏰',
    description: 'Voo com atraso operacional',
    isDefault: true,
    isActive: true,
    hourlyMultiplier: 1.0,
  },
  {
    id: 'emergency',
    name: 'Emergência',
    color: '#DC2626',
    icon: '🚨',
    description: 'Voo com situação de emergência',
    isDefault: true,
    isActive: true,
    hourlyMultiplier: 1.5,
  },
];

/** Cor de um status por id (com fallback para os padrões). */
export const getStatusColor = (
  statuses: Array<{ id?: string; color: string }>,
  statusId: string | null | undefined
): string => {
  const found = statuses.find(s => s.id === statusId);
  if (found) return found.color;
  return (
    DEFAULT_FLIGHT_STATUSES.find(s => s.id === statusId)?.color ?? '#6B7280'
  );
};
