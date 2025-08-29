// ============================================
// SUPABASE FLIGHT STATUS MANAGER HOOK
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface FlightStatus {
  id: string;
  name: string;
  color: string;
  icon: string;
  description: string;
  isDefault: boolean;
  isActive: boolean;
  hourlyMultiplier: number;
}

const defaultStatuses: Omit<FlightStatus, 'id'>[] = [
  {
    name: 'Planejado',
    color: '#6B7280',
    icon: '📅',
    description: 'Voo agendado para execução',
    isDefault: true,
    isActive: true,
    hourlyMultiplier: 1.0,
  },
  {
    name: 'Em Voo',
    color: '#F59E0B',
    icon: '✈️',
    description: 'Voo atualmente em execução',
    isDefault: true,
    isActive: true,
    hourlyMultiplier: 1.0,
  },
  {
    name: 'Completado',
    color: '#10B981',
    icon: '✅',
    description: 'Voo concluído com sucesso',
    isDefault: true,
    isActive: true,
    hourlyMultiplier: 1.0,
  },
  {
    name: 'Cancelado',
    color: '#EF4444',
    icon: '❌',
    description: 'Voo cancelado',
    isDefault: true,
    isActive: true,
    hourlyMultiplier: 0.0,
  },
  {
    name: 'Atrasado',
    color: '#F97316',
    icon: '⏰',
    description: 'Voo com atraso operacional',
    isDefault: true,
    isActive: true,
    hourlyMultiplier: 1.0,
  },
  {
    name: 'Emergência',
    color: '#DC2626',
    icon: '🚨',
    description: 'Voo com situação de emergência',
    isDefault: true,
    isActive: true,
    hourlyMultiplier: 1.5,
  },
];

export const useSupabaseFlightStatusManager = () => {
  const { user } = useAuth();
  const [flightStatuses, setFlightStatuses] = useState<FlightStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch statuses from database
  const fetchStatuses = useCallback(async () => {
    if (!user) {
      setFlightStatuses(defaultStatuses.map(status => ({ ...status, id: status.name })));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('flight_statuses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching flight statuses:', error);
        setError('Erro ao carregar status de voo');
        toast.error('Erro ao carregar status de voo');
        return;
      }

      // Transform database data to match interface
      const statuses: FlightStatus[] = data.map(item => ({
        id: item.id,
        name: item.name,
        color: item.color,
        icon: item.icon,
        description: item.description || '',
        isDefault: item.is_default,
        isActive: item.is_active,
        hourlyMultiplier: item.hourly_multiplier || 1.0,
      }));

      // If no status data exists, create default statuses
      if (statuses.length === 0) {
        console.log('No flight statuses found, creating default statuses...');
        await createDefaultStatuses();
        // Fetch again after creating defaults
        setTimeout(() => fetchStatuses(), 1000);
        return;
      }

      setFlightStatuses(statuses);
    } catch (error) {
      console.error('Error in fetchStatuses:', error);
      setError('Erro ao conectar com o banco de dados');
      toast.error('Erro ao conectar com o banco de dados');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  // Create default statuses
  const createDefaultStatuses = async () => {
    if (!user) return;

    try {
      console.log('Creating default flight statuses for user:', user.id);
      
      const defaultStatusData = defaultStatuses.map(status => ({
        user_id: user.id,
        name: status.name,
        color: status.color,
        icon: status.icon,
        description: status.description,
        hourly_multiplier: status.hourlyMultiplier,
        is_active: status.isActive,
        is_default: status.isDefault,
      }));

      const { error } = await supabase
        .from('flight_statuses')
        .insert(defaultStatusData);

      if (error) {
        console.error('Error creating default statuses:', error);
        return;
      }

      console.log('Default flight statuses created successfully');
      toast.success('Status de voo padrão criados com sucesso!');
    } catch (error) {
      console.error('Error in createDefaultStatuses:', error);
    }
  };

  // Add new status
  const addStatus = async (statusData: Omit<FlightStatus, 'id' | 'isDefault'>) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('flight_statuses')
        .insert({
          user_id: user.id,
          name: statusData.name,
          color: statusData.color,
          icon: statusData.icon,
          description: statusData.description,
          hourly_multiplier: statusData.hourlyMultiplier,
          is_active: statusData.isActive,
          is_default: false,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding status:', error);
        toast.error('Erro ao adicionar status');
        return;
      }

      // Refresh data
      await fetchStatuses();
      toast.success(`Status "${statusData.name}" adicionado com sucesso!`);
    } catch (error) {
      console.error('Error in addStatus:', error);
      toast.error('Erro ao adicionar status');
    }
  };

  // Delete status
  const deleteStatus = async (statusId: string) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      const status = flightStatuses.find(s => s.id === statusId);
      if (status?.isDefault) {
        toast.error('Não é possível deletar status padrão');
        return;
      }

      const { error } = await supabase
        .from('flight_statuses')
        .delete()
        .eq('id', statusId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting status:', error);
        toast.error('Erro ao deletar status');
        return;
      }

      // Update local state
      setFlightStatuses(prev => prev.filter(status => status.id !== statusId));
      toast.success('Status deletado com sucesso!');
    } catch (error) {
      console.error('Error in deleteStatus:', error);
      toast.error('Erro ao deletar status');
    }
  };

  // Toggle status active
  const toggleStatusActive = async (statusId: string) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      const status = flightStatuses.find(s => s.id === statusId);
      if (!status) return;

      const { error } = await supabase
        .from('flight_statuses')
        .update({ is_active: !status.isActive })
        .eq('id', statusId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error toggling status:', error);
        toast.error('Erro ao atualizar status');
        return;
      }

      // Update local state
      setFlightStatuses(prev => 
        prev.map(s => 
          s.id === statusId 
            ? { ...s, isActive: !s.isActive }
            : s
        )
      );

      toast.success(`Status ${!status.isActive ? 'ativado' : 'desativado'} com sucesso!`);
    } catch (error) {
      console.error('Error in toggleStatusActive:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  // Reset to defaults
  const resetToDefaults = async () => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      // Delete all user statuses
      const { error: deleteError } = await supabase
        .from('flight_statuses')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('Error resetting statuses:', deleteError);
        toast.error('Erro ao restaurar status padrão');
        return;
      }

      // Refresh data (default statuses will be created by trigger)
      await fetchStatuses();
      toast.success('Status restaurados para padrão!');
    } catch (error) {
      console.error('Error in resetToDefaults:', error);
      toast.error('Erro ao restaurar status padrão');
    }
  };

  // Get active statuses
  const getActiveStatuses = () => {
    return flightStatuses.filter(status => status.isActive);
  };

  // Get status by name
  const getStatusByName = (name: string) => {
    return flightStatuses.find(status => status.name === name);
  };

  return {
    flightStatuses,
    loading,
    error,
    addStatus,
    deleteStatus,
    toggleStatusActive,
    resetToDefaults,
    getActiveStatuses,
    getStatusByName,
    refresh: fetchStatuses,
  };
};