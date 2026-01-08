import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface CreateGoalData {
  title: string;
  description: string;
  goal_type: string;
  target_value: number;
  target_date?: Date;
  notificationsEnabled?: boolean;
}

const GOAL_TEMPLATES: Record<string, { title: string; description: string; goal_type: string; tier: string; points: number }> = {
  CR_100: {
    title: "CR 100 Perfeito",
    description: "Alcançar um career rating perfeito de 100 pontos",
    goal_type: "rating",
    tier: "gold",
    points: 500,
  },
  CR_50: {
    title: "Estrela em Ascensão",
    description: "Atingir 50 pontos de career rating",
    goal_type: "rating",
    tier: "bronze",
    points: 100,
  },
  CR_75: {
    title: "Piloto Experiente",
    description: "Atingir 75 pontos de career rating",
    goal_type: "rating",
    tier: "silver",
    points: 250,
  },
  HOURS_100: {
    title: "100 Horas de Voo",
    description: "Registrar 100 horas totais de voo",
    goal_type: "hours",
    tier: "silver",
    points: 250,
  },
  HOURS_500: {
    title: "Maratonista dos Céus",
    description: "Acumular 500 horas totais de voo na carreira",
    goal_type: "hours",
    tier: "platinum",
    points: 1000,
  },
  HOURS_1000: {
    title: "Mestre dos Céus",
    description: "Atingir 1000 horas de voo",
    goal_type: "hours",
    tier: "platinum",
    points: 2000,
  },
  NIGHT_FLIGHT_10: {
    title: "Voo Noturno Completo",
    description: "Completar 10 voos noturnos",
    goal_type: "flights",
    tier: "bronze",
    points: 150,
  },
  FIRST_SOLO: {
    title: "Primeiro Voo Solo",
    description: "Complete seu primeiro voo sem penalidades",
    goal_type: "flights",
    tier: "bronze",
    points: 50,
  },
  TRANSATLANTIC: {
    title: "Travessia do Atlântico",
    description: "Complete um voo transatlântico",
    goal_type: "custom",
    tier: "gold",
    points: 400,
  },
  AIRPORTS_50: {
    title: "Explorador de Aeroportos",
    description: "Pousar em 50 aeroportos diferentes",
    goal_type: "custom",
    tier: "silver",
    points: 300,
  },
  WEEKLY_STREAK_4: {
    title: "Voador Consistente",
    description: "Registrar pelo menos 1 voo por semana durante 4 semanas consecutivas",
    goal_type: "custom",
    tier: "silver",
    points: 200,
  },
  FUEL_EFFICIENCY: {
    title: "Mestre da Eficiência",
    description: "Manter consumo médio de combustível abaixo de 90% do planejado em 10 voos",
    goal_type: "custom",
    tier: "gold",
    points: 350,
  },
  NAV_MASTER: {
    title: "Mestre da Navegação",
    description: "Completar 20 voos de navegação",
    goal_type: "custom",
    tier: "silver",
    points: 250,
  },
  IFR_CERTIFIED: {
    title: "Certificado IFR",
    description: "Completar 50 voos em IFR",
    goal_type: "custom",
    tier: "gold",
    points: 500,
  },
  DISTANCE_1000: {
    title: "1000km Voados",
    description: "Voar uma distância total de 1000 km",
    goal_type: "distance",
    tier: "platinum",
    points: 2000,
  },
};

export function useCreateGoal() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateGoalData) => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase.from("goals").insert({
        user_id: user.id,
        title: data.title,
        description: data.description,
        goal_type: data.goal_type,
        target_value: data.target_value,
        current_value: 0,
        target_date: data.target_date ? data.target_date.toISOString() : null,
        is_completed: false,
        is_active: true,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals", user?.id] });
      toast.success("Meta criada com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao criar meta: " + error.message);
    },
  });
}

export { GOAL_TEMPLATES };
