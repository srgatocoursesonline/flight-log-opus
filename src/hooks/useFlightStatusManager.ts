import { useState, useEffect } from 'react';

export interface FlightStatus {
  id: string;
  name: string;
  color: string;
  icon: string;
  description: string;
  isDefault: boolean;
  isActive: boolean;
  hourlyMultiplier?: number; // Multiplicador para CR por hora (ex: 1.5 para voos especiais)
}

const DEFAULT_FLIGHT_STATUS: FlightStatus[] = [
  {
    id: 'planned',
    name: 'Planejado',
    color: '#6B7280',
    icon: '📅',
    description: 'Voo agendado para execução',
    isDefault: true,
    isActive: true,
    hourlyMultiplier: 1.0
  },
  {
    id: 'active',
    name: 'Em Voo',
    color: '#F59E0B',
    icon: '✈️',
    description: 'Voo atualmente em execução',
    isDefault: true,
    isActive: true,
    hourlyMultiplier: 1.0
  },
  {
    id: 'completed',
    name: 'Completado',
    color: '#10B981',
    icon: '✅',
    description: 'Voo concluído com sucesso',
    isDefault: true,
    isActive: true,
    hourlyMultiplier: 1.0
  },
  {
    id: 'cancelled',
    name: 'Cancelado',
    color: '#EF4444',
    icon: '❌',
    description: 'Voo cancelado',
    isDefault: true,
    isActive: true,
    hourlyMultiplier: 0
  },
  {
    id: 'delayed',
    name: 'Atrasado',
    color: '#F97316',
    icon: '⏰',
    description: 'Voo com atraso operacional',
    isDefault: false,
    isActive: true,
    hourlyMultiplier: 1.0
  },
  {
    id: 'emergency',
    name: 'Emergência',
    color: '#DC2626',
    icon: '🚨',
    description: 'Voo com situação de emergência',
    isDefault: false,
    isActive: true,
    hourlyMultiplier: 1.5
  }
];

const STORAGE_KEY = 'msfs-flight-status';

export const useFlightStatusManager = () => {
  const [flightStatuses, setFlightStatuses] = useState<FlightStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar status do localStorage
  useEffect(() => {
    try {
      const savedStatuses = localStorage.getItem(STORAGE_KEY);
      if (savedStatuses) {
        const parsedStatuses = JSON.parse(savedStatuses);
        setFlightStatuses(parsedStatuses);
      } else {
        // Primeira inicialização
        setFlightStatuses(DEFAULT_FLIGHT_STATUS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_FLIGHT_STATUS));
      }
    } catch (error) {
      console.error('Erro ao carregar status de voo:', error);
      setFlightStatuses(DEFAULT_FLIGHT_STATUS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Salvar status no localStorage
  const saveStatuses = (newStatuses: FlightStatus[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newStatuses));
      setFlightStatuses(newStatuses);
    } catch (error) {
      console.error('Erro ao salvar status de voo:', error);
    }
  };

  const addStatus = (status: Omit<FlightStatus, 'id' | 'isDefault'>) => {
    const newStatus: FlightStatus = {
      ...status,
      id: Date.now().toString(),
      isDefault: false
    };
    const updatedStatuses = [...flightStatuses, newStatus];
    saveStatuses(updatedStatuses);
  };

  const updateStatus = (id: string, updates: Partial<FlightStatus>) => {
    const updatedStatuses = flightStatuses.map(status =>
      status.id === id ? { ...status, ...updates } : status
    );
    saveStatuses(updatedStatuses);
  };

  const deleteStatus = (id: string) => {
    const status = flightStatuses.find(s => s.id === id);
    if (status?.isDefault) {
      throw new Error('Não é possível excluir status padrão');
    }
    
    const updatedStatuses = flightStatuses.filter(status => status.id !== id);
    saveStatuses(updatedStatuses);
  };

  const toggleStatusActive = (id: string) => {
    const updatedStatuses = flightStatuses.map(status =>
      status.id === id ? { ...status, isActive: !status.isActive } : status
    );
    saveStatuses(updatedStatuses);
  };

  const getActiveStatuses = () => {
    return flightStatuses.filter(status => status.isActive);
  };

  const getStatusById = (id: string) => {
    return flightStatuses.find(status => status.id === id);
  };

  const resetToDefaults = () => {
    setFlightStatuses(DEFAULT_FLIGHT_STATUS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_FLIGHT_STATUS));
  };

  return {
    flightStatuses,
    isLoading,
    addStatus,
    updateStatus,
    deleteStatus,
    toggleStatusActive,
    getActiveStatuses,
    getStatusById,
    resetToDefaults
  };
};