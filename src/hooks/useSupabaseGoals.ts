// ============================================
// SUPABASE GOALS MANAGER HOOK
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { autoRefresh } from '@/utils/autoRefresh';
import { useSupabaseFlights } from './useSupabaseFlights';

export type GoalType = 'flights' | 'hours' | 'rating' | 'distance' | 'custom';

export interface Goal {
  id: string;
  title: string;
  description?: string;
  goalType: GoalType;
  targetValue: number;
  currentValue: number;
  targetDate?: string;
  isCompleted: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const useSupabaseGoals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getFlightStats } = useSupabaseFlights();

  // Fetch goals from database
  const fetchGoals = useCallback(async () => {
    if (!user) {
      setGoals([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching goals:', error);
        setError('Erro ao carregar metas');
        toast.error('Erro ao carregar metas');
        return;
      }

      // Transform database data to match interface
      const goalData: Goal[] = data.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        goalType: item.goal_type,
        targetValue: item.target_value,
        currentValue: item.current_value || 0,
        targetDate: item.target_date,
        isCompleted: item.is_completed,
        isActive: item.is_active,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));

      setGoals(goalData);
    } catch (error) {
      console.error('Error in fetchGoals:', error);
      setError('Erro ao conectar com o banco de dados');
      toast.error('Erro ao conectar com o banco de dados');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  // Update goal progress based on flight statistics
  const updateGoalProgress = useCallback(async () => {
    if (!user || goals.length === 0) return;

    try {
      const flightStats = getFlightStats();
      
      for (const goal of goals.filter(g => g.isActive && !g.isCompleted)) {
        let newCurrentValue = goal.currentValue;
        
        // Calculate current value based on goal type
        switch (goal.goalType) {
          case 'flights':
            newCurrentValue = flightStats.totalFlights;
            break;
          case 'hours':
            newCurrentValue = flightStats.totalFlightTime;
            break;
          case 'rating':
            newCurrentValue = flightStats.averageRating;
            break;
          case 'distance':
            newCurrentValue = flightStats.totalDistance;
            break;
          case 'custom':
            // Custom goals need manual updates
            continue;
        }

        // Check if goal is completed
        const isCompleted = newCurrentValue >= goal.targetValue;
        
        // Update only if values changed
        if (newCurrentValue !== goal.currentValue || isCompleted !== goal.isCompleted) {
          await updateGoal(goal.id, {
            currentValue: newCurrentValue,
            isCompleted: isCompleted,
          });
          
          // Show completion notification
          if (isCompleted && !goal.isCompleted) {
            toast.success(`🎉 Meta concluída: ${goal.title}!`);
          }
        }
      }
    } catch (error) {
      console.error('Error updating goal progress:', error);
    }
  }, [user, goals, getFlightStats]);

  // Update goal progress when flight stats change
  useEffect(() => {
    updateGoalProgress();
  }, [updateGoalProgress]);

  // Add new goal
  const addGoal = async (goal: Omit<Goal, 'id' | 'currentValue' | 'isCompleted' | 'createdAt' | 'updatedAt'>) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('goals')
        .insert({
          user_id: user.id,
          title: goal.title,
          description: goal.description,
          goal_type: goal.goalType,
          target_value: goal.targetValue,
          current_value: 0,
          target_date: goal.targetDate,
          is_active: goal.isActive,
          is_completed: false,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding goal:', error);
        toast.error('Erro ao adicionar meta');
        return;
      }

      // Refresh data
      await fetchGoals();
      toast.success(`Meta "${goal.title}" adicionada com sucesso!`);
      
      // Auto refresh for real-time updates
      autoRefresh();
    } catch (error) {
      console.error('Error in addGoal:', error);
      toast.error('Erro ao adicionar meta');
    }
  };

  // Update goal
  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      // Transform updates to match database columns
      const dbUpdates: any = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.goalType !== undefined) dbUpdates.goal_type = updates.goalType;
      if (updates.targetValue !== undefined) dbUpdates.target_value = updates.targetValue;
      if (updates.currentValue !== undefined) dbUpdates.current_value = updates.currentValue;
      if (updates.targetDate !== undefined) dbUpdates.target_date = updates.targetDate;
      if (updates.isCompleted !== undefined) dbUpdates.is_completed = updates.isCompleted;
      if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

      const { error } = await supabase
        .from('goals')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating goal:', error);
        toast.error('Erro ao atualizar meta');
        return;
      }

      // Update local state
      setGoals(prev => 
        prev.map(goal => 
          goal.id === id 
            ? { ...goal, ...updates }
            : goal
        )
      );

      // Only show success toast for manual updates (not automatic progress updates)
      if (updates.title || updates.description || updates.targetValue) {
        toast.success('Meta atualizada com sucesso!');
      }
      
      // Auto refresh for real-time updates
      autoRefresh();
    } catch (error) {
      console.error('Error in updateGoal:', error);
      toast.error('Erro ao atualizar meta');
    }
  };

  // Delete goal
  const deleteGoal = async (id: string) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting goal:', error);
        toast.error('Erro ao deletar meta');
        return;
      }

      // Update local state
      setGoals(prev => prev.filter(goal => goal.id !== id));
      toast.success('Meta deletada com sucesso!');
      
      // Auto refresh for real-time updates
      autoRefresh();
    } catch (error) {
      console.error('Error in deleteGoal:', error);
      toast.error('Erro ao deletar meta');
    }
  };

  // Toggle goal active status
  const toggleGoalActive = async (id: string) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      const goal = goals.find(g => g.id === id);
      if (!goal) return;

      await updateGoal(id, { isActive: !goal.isActive });
      
      toast.success(`Meta ${!goal.isActive ? 'ativada' : 'desativada'} com sucesso!`);
    } catch (error) {
      console.error('Error in toggleGoalActive:', error);
      toast.error('Erro ao atualizar meta');
    }
  };

  // Mark goal as completed manually
  const completeGoal = async (id: string) => {
    await updateGoal(id, { isCompleted: true });
  };

  // Get active goals
  const getActiveGoals = () => {
    return goals.filter(goal => goal.isActive && !goal.isCompleted);
  };

  // Get completed goals
  const getCompletedGoals = () => {
    return goals.filter(goal => goal.isCompleted);
  };

  // Get goal progress percentage
  const getGoalProgress = (goal: Goal): number => {
    if (goal.targetValue === 0) return 0;
    return Math.min((goal.currentValue / goal.targetValue) * 100, 100);
  };

  // Get goals statistics
  const getGoalsStats = () => {
    const totalGoals = goals.length;
    const activeGoals = getActiveGoals().length;
    const completedGoals = getCompletedGoals().length;
    const overallProgress = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

    return {
      totalGoals,
      activeGoals,
      completedGoals,
      overallProgress: Math.round(overallProgress),
    };
  };

  return {
    goals,
    isLoading,
    error,
    addGoal,
    updateGoal,
    deleteGoal,
    toggleGoalActive,
    completeGoal,
    getActiveGoals,
    getCompletedGoals,
    getGoalProgress,
    getGoalsStats,
    updateGoalProgress,
    refresh: fetchGoals,
  };
};