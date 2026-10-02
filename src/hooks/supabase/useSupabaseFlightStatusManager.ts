// ============================================
// SUPABASE FLIGHT STATUS MANAGER HOOK
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { DEFAULT_FLIGHT_STATUSES } from '@/lib/flight-status';

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

const defaultStatuses: Omit<FlightStatus, 'id'>[] = DEFAULT_FLIGHT_STATUSES;

export const useSupabaseFlightStatusManager = () => {
  const { user } = useAuth();
  const [flightStatuses, setFlightStatuses] = useState<FlightStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create default statuses
  const createDefaultStatuses = useCallback(async () => {
    if (!user) return;

    try {
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

      toast.success('Status de voo padrão criados com sucesso!');
    } catch (error) {
      console.error('Error in createDefaultStatuses:', error);
    }
  }, [user]);

  // Fetch statuses from database
  const fetchStatuses = useCallback(async () => {
    if (!user) {
      // Use proper IDs for default statuses when not authenticated
      const statusesWithIds = defaultStatuses.map((status, index) => ({ 
        ...status, 
        id: `default-${index}` 
      }));
      setFlightStatuses(statusesWithIds);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('flight_statuses')
        .select('*')
        .or(`user_id.eq.${user.id},user_id.is.null`)
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
  }, [user, createDefaultStatuses]);

  // Initial load
  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

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
        toast.error('Não é possível deletar status padrão do sistema');
        return;
      }

      // Verificar se o status pertence ao usuário (não é padrão do sistema)
      const { data: statusData } = await supabase
        .from('flight_statuses')
        .select('user_id')
        .eq('id', statusId)
        .single();

      if (!statusData || statusData.user_id === null) {
        toast.error('Não é possível deletar status padrão do sistema');
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

      // Verificar se o status pertence ao usuário (não é padrão do sistema)
      const { data: statusData } = await supabase
        .from('flight_statuses')
        .select('user_id')
        .eq('id', statusId)
        .single();

      if (!statusData || statusData.user_id === null) {
        toast.error('Não é possível modificar status padrão do sistema');
        return;
      }

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

  // Get status by value (for compatibility with Flight status values)
  const getStatusByValue = (value: string) => {
    // First, try to find by ID (UUID)
    let foundStatus = flightStatuses.find(status => status.id === value);
    
    if (foundStatus) {
      return foundStatus;
    }
    
    // Map standard status values to status names
    const statusMapping: Record<string, string> = {
      'planned': 'Planejado',
      'active': 'Em Voo', 
      'completed': 'Concluído',
      'cancelled': 'Cancelado'
    };
    
    const statusName = statusMapping[value] || value;
     
     // Try exact match by name
     foundStatus = flightStatuses.find(status => status.name === statusName);
     
     // If not found, try case-insensitive match
     if (!foundStatus) {
       foundStatus = flightStatuses.find(status => 
         status.name.toLowerCase() === statusName.toLowerCase()
       );
     }
     
     return foundStatus;
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
    getStatusByValue,
    refresh: fetchStatuses,
  };
};