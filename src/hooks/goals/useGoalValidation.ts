import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { GoalWithProgress } from "./useGoals";
import { toast } from "sonner";

interface FlightData {
  id: string;
  distance: number;
  flight_time: string;
  career_rating: number;
  flight_date: string;
  departure: string;
  arrival: string;
  landing_rate: number;
  status: string;
}

interface ValidationResult {
  goalId: string;
  currentProgress: number;
  isCompleted: boolean;
}

export function useGoalValidation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Buscar todos os voos do usuário para cálculo de progresso
  const { data: flights = [], isLoading: isLoadingFlights } = useQuery({
    queryKey: ["user-flights", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("flights")
        .select("*")
        .eq("user_id", user.id)
        .order("flight_date", { ascending: false });

      if (error) throw error;
      console.log("✈️ Voos carregados:", data?.length, "voos");
      
      // Log detalhado dos valores de distância para debugar
      if (data && data.length > 0) {
        const distances = data.map(f => f.distance || 0);
        const totalDistance = distances.reduce((sum, d) => sum + d, 0);
        const maxDistance = Math.max(...distances, 0);
        const minDistance = Math.min(...distances.filter(d => d > 0), Infinity);
        const avgDistance = totalDistance / distances.filter(d => d > 0).length;
        
        console.log("📏 Distâncias dos voos:", {
          total: `${totalDistance.toFixed(2)} nm`,
          max: `${maxDistance.toFixed(2)} nm`,
          min: `${minDistance.toFixed(2)} nm`,
          avg: `${avgDistance.toFixed(2)} nm`,
          emKm: `${(totalDistance * 1.852).toFixed(2)} km`
        });
      }
      
      return data as FlightData[];
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

  // Calcular progresso de uma meta específica
  const calculateGoalProgress = (
    goal: GoalWithProgress,
    userFlights: FlightData[]
  ): ValidationResult => {
    let currentProgress = 0;

    switch (goal.goal_type) {
      case "rating":
        // Career Rating: pegar o maior CR dos voos ou do perfil
        const crValues = userFlights.map(f => f.career_rating || 0);
        const maxCR = Math.max(...crValues, 0);
        currentProgress = maxCR;
        console.log(`📊 CR Meta: ${goal.title} - CRs encontrados: [${crValues.slice(0, 5).join(', ')}...] - Máximo: ${maxCR}/${goal.target_value}`);
        break;

      case "hours":
        // Horas de voo: somar todos os flight_time
        const totalHours = userFlights.reduce((sum, flight) => {
          const timeParts = flight.flight_time?.split(":") || ["0", "0"];
          const hours = parseFloat(timeParts[0]) || 0;
          const minutes = parseFloat(timeParts[1]) || 0;
          return sum + hours + (minutes / 60);
        }, 0);
        currentProgress = totalHours;
        console.log(`⏰ Horas Meta: ${goal.title} - Atual: ${currentProgress.toFixed(2)}/${goal.target_value}`);
        break;

      case "flights":
        // Total de voos (todos, não apenas completados)
        const allFlights = userFlights.length;
        currentProgress = allFlights;
        console.log(`✈️ Voos Meta: ${goal.title} - Atual: ${currentProgress}/${goal.target_value} (total: ${allFlights})`);
        break;

      case "distance":
        // Distância total em km (converter de nm para km)
        const totalDistanceKm = userFlights.reduce((sum, flight) => {
          // distance está em nm (nautical miles), converter para km (1 nm ≈ 1.852 km)
          return sum + (flight.distance || 0) * 1.852;
        }, 0);
        currentProgress = totalDistanceKm;
        console.log(`🌐 Distância Meta: ${goal.title} - Atual: ${currentProgress.toFixed(2)} km/${goal.target_value} km`);
        break;

      case "custom":
        // Metas customizadas baseadas em título/descrição
        const goalTitle = goal.title.toLowerCase();
        
        // 1000km Voados - calcular distância total
        if (goalTitle.includes("1000km") || goalTitle.includes("1000 km") || goalTitle.includes("1000 km voados")) {
          const totalDistance = userFlights.reduce((sum, flight) => {
            // distance está em nm (nautical miles), converter para km (1 nm ≈ 1.852 km)
            return sum + (flight.distance || 0) * 1.852;
          }, 0);
          currentProgress = totalDistance;
          console.log(`🌐 Distância Meta: ${goal.title} - Atual: ${currentProgress.toFixed(2)} km/${goal.target_value} km`);
        }
        // 100 Horas de Voo
        else if (goalTitle.includes("100 horas") || goalTitle.includes("100 hours")) {
          const totalHours = userFlights.reduce((sum, flight) => {
            const timeParts = flight.flight_time?.split(":") || ["0", "0"];
            const hours = parseFloat(timeParts[0]) || 0;
            const minutes = parseFloat(timeParts[1]) || 0;
            return sum + hours + (minutes / 60);
          }, 0);
          currentProgress = totalHours;
          console.log(`⏰ 100 Horas: ${currentProgress.toFixed(2)}/${goal.target_value}`);
        }
        // 500 Horas de Voo
        else if (goalTitle.includes("500 horas") || goalTitle.includes("500 hours")) {
          const totalHours = userFlights.reduce((sum, flight) => {
            const timeParts = flight.flight_time?.split(":") || ["0", "0"];
            const hours = parseFloat(timeParts[0]) || 0;
            const minutes = parseFloat(timeParts[1]) || 0;
            return sum + hours + (minutes / 60);
          }, 0);
          currentProgress = totalHours;
          console.log(`⏰ 500 Horas: ${currentProgress.toFixed(2)}/${goal.target_value}`);
        }
        // 1000 Horas de Voo
        else if (goalTitle.includes("1000 horas") || goalTitle.includes("1000 hours")) {
          const totalHours = userFlights.reduce((sum, flight) => {
            const timeParts = flight.flight_time?.split(":") || ["0", "0"];
            const hours = parseFloat(timeParts[0]) || 0;
            const minutes = parseFloat(timeParts[1]) || 0;
            return sum + hours + (minutes / 60);
          }, 0);
          currentProgress = totalHours;
          console.log(`⏰ 1000 Horas: ${currentProgress.toFixed(2)}/${goal.target_value}`);
        }
        // Primeiro Voo Solo
        else if (goalTitle.includes("primeiro voo solo") || goalTitle.includes("first solo")) {
          const perfectFlights = userFlights.filter(f => f.landing_rate >= -100 && f.status === "completed");
          currentProgress = perfectFlights.length > 0 ? 1 : 0;
          console.log(`🎯 Primeiro Solo: ${currentProgress}/${goal.target_value} (${perfectFlights.length} voos perfeitos)`);
        }
        // Travessia do Atlântico
        else if (goalTitle.includes("atlântico") || goalTitle.includes("atlantic")) {
          const transatlanticFlights = userFlights.filter(f => f.distance >= 3000 && f.status === "completed");
          currentProgress = transatlanticFlights.length > 0 ? 1 : 0;
          console.log(`🌊 Atlântico: ${currentProgress}/${goal.target_value} (${transatlanticFlights.length} voos)`);
        }
        // Explorador de Aeroportos
        else if (goalTitle.includes("aeroportos") || goalTitle.includes("airports")) {
          const uniqueAirports = new Set([
            ...userFlights.map(f => f.arrival),
            ...userFlights.map(f => f.departure)
          ]);
          currentProgress = uniqueAirports.size;
          console.log(`✈️ Aeroportos: ${currentProgress}/${goal.target_value} (${uniqueAirports.size} únicos)`);
        }
        // Voo Noturno
        else if (goalTitle.includes("noturno") || goalTitle.includes("night")) {
          // Assumindo voos noturnos baseados em horário (ex: após 18h)
          const nightFlights = userFlights.filter(f => {
            const flightDate = new Date(f.flight_date);
            const hour = flightDate.getHours();
            return (hour >= 18 || hour < 6) && f.status === "completed";
          });
          currentProgress = nightFlights.length;
          console.log(`🌙 Noturno: ${currentProgress}/${goal.target_value} (${nightFlights.length} voos)`);
        }
        // Voador Consistente (streak de semanas)
        else if (goalTitle.includes("consistente") || goalTitle.includes("consistent")) {
          const weeksWithFlights = new Set<string>();
          userFlights.forEach(f => {
            if (f.status === "completed") {
              const date = new Date(f.flight_date);
              const year = date.getFullYear();
              const week = getWeekNumber(date);
              weeksWithFlights.add(`${year}-${week}`);
            }
          });
          currentProgress = weeksWithFlights.size;
          console.log(`📅 Consistente: ${currentProgress}/${goal.target_value} (${weeksWithFlights.size} semanas)`);
        }
        // Mestre da Eficiência
        else if (goalTitle.includes("eficiência") || goalTitle.includes("efficiency")) {
          // Voos com pouso suave (landing_rate >= -100)
          const efficientFlights = userFlights.filter(f => 
            f.landing_rate >= -100 && f.status === "completed"
          );
          currentProgress = efficientFlights.length;
          console.log(`⚡ Eficiência: ${currentProgress}/${goal.target_value} (${efficientFlights.length} voos eficientes)`);
        }
        // Mestre da Navegação
        else if (goalTitle.includes("navegação") || goalTitle.includes("navigation")) {
          const navigationFlights = userFlights.filter(f => f.status === "completed");
          currentProgress = navigationFlights.length;
          console.log(`🧭 Navegação: ${currentProgress}/${goal.target_value} (${navigationFlights.length} voos)`);
        }
        // Certificado IFR
        else if (goalTitle.includes("ifr")) {
          const ifrFlights = userFlights.filter(f => f.status === "completed");
          currentProgress = ifrFlights.length;
          console.log(`📡 IFR: ${currentProgress}/${goal.target_value} (${ifrFlights.length} voos)`);
        }
        // 1000km Voados
        else if (goalTitle.includes("1000km") || goalTitle.includes("1000 km voados")) {
          const totalDistance = userFlights.reduce((sum, flight) => {
            // distance está em nm (nautical miles), converter para km (1 nm ≈ 1.852 km)
            return sum + (flight.distance || 0) * 1.852;
          }, 0);
          currentProgress = totalDistance;
          console.log(`🌐 1000km Voados: ${currentProgress.toFixed(2)} km/${goal.target_value} km`);
        }
        else {
          console.log(`❓ Meta não reconhecida: ${goal.title} (tipo: ${goal.goal_type}, título: "${goalTitle}")`);
        }
        break;

      default:
        currentProgress = 0;
    }

    const isCompleted = currentProgress >= goal.target_value;

    return {
      goalId: goal.id,
      currentProgress,
      isCompleted,
    };
  };

  // Função auxiliar para obter número da semana ISO
  const getWeekNumber = (date: Date): number => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  // Mutação para validar e atualizar todas as metas
  const validateAllGoals = useMutation({
    mutationFn: async (goals: GoalWithProgress[]) => {
      if (!user?.id) throw new Error("User not authenticated");

      console.log("🔍 Validando metas para usuário:", user.id);
      console.log("📊 Total de voos encontrados:", flights.length);
      console.log("📋 Lista de metas a validar:", goals.map(g => ({ id: g.id, title: g.title, type: g.goal_type, target: g.target_value })));

      const validationResults = goals.map(goal => {
        const result = calculateGoalProgress(goal, flights);
        console.log(`📈 Meta "${goal.title}":`, {
          id: goal.id,
          tipo: goal.goal_type,
          alvo: goal.target_value,
          atual: result.currentProgress,
          completada: result.isCompleted,
          progresso: `${((result.currentProgress / goal.target_value) * 100).toFixed(1)}%`
        });
        return result;
      });

      // Atualizar cada meta no banco
      const updatePromises = validationResults.map(async (result) => {
        const { data, error } = await supabase
          .from("goals")
          .update({
            current_value: result.currentProgress,
            is_completed: result.isCompleted,
            updated_at: new Date().toISOString(),
          })
          .eq("id", result.goalId)
          .eq("user_id", user.id)
          .select()
          .single();

        if (error) {
          console.error(`❌ Erro ao atualizar meta ${result.goalId}:`, error);
          throw error;
        }
        
        console.log(`✅ Meta ${result.goalId} atualizada no banco:`, data);
        
        // Se foi completada agora, mostrar notificação
        if (result.isCompleted) {
          const goal = goals.find(g => g.id === result.goalId);
          if (goal && !goal.is_completed) {
            console.log(`🎉 NOVA META COMPLETADA: ${goal.title}!`);
            toast.success(`🎉 Meta completada: ${goal.title}!`);
          }
        }

        return data;
      });

      await Promise.all(updatePromises);
      console.log("✨ Validação de todas as metas concluída");
      return validationResults;
    },
    onSuccess: (data) => {
      console.log("🔄 Invalidando cache de metas");
      queryClient.invalidateQueries({ queryKey: ["goals", user?.id] });
    },
  });

  // Mutação para validar uma meta específica
  const validateGoal = useMutation({
    mutationFn: async (goal: GoalWithProgress) => {
      const result = calculateGoalProgress(goal, flights);

      const { data, error } = await supabase
        .from("goals")
        .update({
          current_value: result.currentProgress,
          is_completed: result.isCompleted,
          updated_at: new Date().toISOString(),
        })
        .eq("id", goal.id)
        .eq("user_id", user?.id)
        .select()
        .single();

      if (error) throw error;

      // Se foi completada agora, mostrar notificação
      if (result.isCompleted && !goal.is_completed) {
        console.log(`🎉 Meta completada: ${goal.title}!`);
        toast.success(`🎉 Meta completada: ${goal.title}!`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals", user?.id] });
    },
  });

  return {
    flights,
    isLoadingFlights,
    calculateGoalProgress,
    validateAllGoals,
    validateGoal,
  };
}
