import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useGoalValidation } from "./useGoalValidation";

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  goal_type: string;
  target_value: number;
  current_value: number;
  target_date: string | null;
  is_completed: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GoalWithProgress extends Goal {
  progress_percentage: number;
  tier?: "bronze" | "silver" | "gold" | "platinum";
  points?: number;
}

export function useGoals() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { validateAllGoals, isLoadingFlights } = useGoalValidation();

  const {
    data: goals = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["goals", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data.map((goal) => ({
        ...goal,
        progress_percentage: goal.target_value > 0
          ? Math.min((goal.current_value / goal.target_value) * 100, 100)
          : 0,
      })) as GoalWithProgress[];
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000, // 30 segundos - cache curto para atualizações frequentes
  });

  const activeGoals = goals.filter((goal) => goal.is_active && !goal.is_completed);
  const completedGoals = goals.filter((goal) => goal.is_completed);

  // Validar automaticamente todas as metas quando os dados são carregados
  const autoValidateGoals = useMutation({
    mutationFn: async () => {
      if (!user?.id || goals.length === 0) {
        console.log("⚠️ Validação ignorada: sem usuário ou sem metas");
        return;
      }
      console.log(`🚀 Iniciando validação de ${goals.length} metas...`);
      await validateAllGoals.mutateAsync(goals);
    },
    onSuccess: () => {
      console.log("✅ Validação concluída com sucesso, invalidando cache");
      queryClient.invalidateQueries({ queryKey: ["goals", user?.id] });
    },
    onError: (error) => {
      console.error("❌ Erro na validação automática:", error);
    },
  });

  // Disparar validação automática quando goals são carregados
  useQuery({
    queryKey: ["auto-validate-goals", user?.id, goals.length],
    queryFn: async () => {
      if (goals.length > 0 && !isLoading && !isLoadingFlights) {
        console.log(`⏰ Disparando validação automática: ${goals.length} metas, isLoadingFlights=${isLoadingFlights}`);
        await autoValidateGoals.mutateAsync();
      } else {
        console.log(`⏸️ Validação NÃO disparada: goals=${goals.length}, isLoading=${isLoading}, isLoadingFlights=${isLoadingFlights}`);
        console.log(`⚠️ Condições para validação: goals.length > 0 (${goals.length > 0}), !isLoading (${!isLoading}), !isLoadingFlights (${!isLoadingFlights})`);
      }
      return true;
    },
    enabled: goals.length > 0 && !isLoading && !isLoadingFlights,
    staleTime: 60 * 1000, // Validar a cada minuto
  });

  const archiveGoal = useMutation({
    mutationFn: async (goalId: string) => {
      const { data, error } = await supabase
        .from("goals")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("id", goalId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals", user?.id] });
    },
  });

  const deleteGoal = useMutation({
    mutationFn: async (goalId: string) => {
      const { error } = await supabase.from("goals").delete().eq("id", goalId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals", user?.id] });
    },
  });

  return {
    goals,
    activeGoals,
    completedGoals,
    isLoading,
    error,
    isLoadingFlights,
    archiveGoal,
    deleteGoal,
    autoValidateGoals,
  };
}
