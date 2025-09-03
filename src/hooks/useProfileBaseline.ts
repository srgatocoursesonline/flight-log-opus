import { useCallback } from 'react';
import { useProfile } from './useProfile';
import { supabase } from '@/lib/supabase';
import { debugTrace } from '@/utils/debugTrace';

export const useProfileBaseline = () => {
  const { profile } = useProfile();

  // Helper function to convert flight time to minutes
  const parseFlightTime = (flightTime: string): number => {
    if (!flightTime) return 0;
    
    // Handle formats: "1h 30m", "45m", "2h"
    const hourMatch = flightTime.match(/(\d+)h/);
    const minuteMatch = flightTime.match(/(\d+)m/);
    
    const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
    const minutes = minuteMatch ? parseInt(minuteMatch[1]) : 0;
    
    return hours * 60 + minutes;
  };

  // Função para obter voos concluídos do usuário
  const getCompletedFlights = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('flights')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'Concluído');

      if (error) {
        return 0;
      }

      return data?.length || 0;
    } catch (err) {
      return 0;
    }
  }, []);

  // Função para obter minutos totais dos voos concluídos
  const getCompletedMinutes = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('flights')
        .select('flight_time')
        .eq('user_id', userId)
        .eq('status', 'Concluído');

      if (error) {
        return 0;
      }

      let totalMinutes = 0;
      data?.forEach(flight => {
        const flightTimeInMinutes = parseFlightTime(flight.flight_time);
        totalMinutes += flightTimeInMinutes;
      });

      return totalMinutes;
    } catch (err) {
      return 0;
    }
  }, []);

  // Função para calcular totais usando baseline + deltas
  const calculateProfileTotals = useCallback(async (userId: string) => {
    if (!profile) return null;

    try {
      // Obter valores do baseline
      const baselineFlights = profile.initial_flights || 0;
      const baselineMinutes = profile.initial_minutes || 0;

      // Obter deltas (voos concluídos no sistema)
      const flightsDone = await getCompletedFlights(userId);
      const minutesDone = await getCompletedMinutes(userId);

      // Calcular totais
      const totalFlights = baselineFlights + flightsDone;
      const totalMinutes = baselineMinutes + minutesDone;
      const totalHours = totalMinutes > 0 ? Number((totalMinutes / 60).toFixed(2)) : 0;

      return {
        baselineFlights,
        baselineMinutes,
        flightsDone,
        minutesDone,
        totalFlights,
        totalMinutes,
        totalHours
      };
    } catch (err) {
      return null;
    }
  }, [profile, getCompletedFlights, getCompletedMinutes]);

  // Função para obter estatísticas em tempo real (verificando banco de dados)
  const getRealTimeStats = useCallback(async () => {
    if (!profile || !profile.id) return null;

    try {
      // Buscar número real de voos concluídos diretamente do banco de dados
      const { data: completedFlights, error: flightsError } = await supabase
        .from('flights')
        .select('flight_time')
        .eq('user_id', profile.id)
        .eq('status', 'Concluído');

      if (flightsError) {
        return null;
      }

      // Calcular total de voos e minutos concluídos no sistema
      const flightsDone = completedFlights?.length || 0;
      let minutesDone = 0;
      
      completedFlights?.forEach(flight => {
        const flightTimeInMinutes = parseFlightTime(flight.flight_time);
        minutesDone += flightTimeInMinutes;
      });

      const baselineFlights = profile.initial_flights || 0;
      const baselineMinutes = profile.initial_minutes || 0;
      
      const totalFlights = baselineFlights + flightsDone;
      const totalMinutes = baselineMinutes + minutesDone;
      const totalHours = totalMinutes > 0 ? Number((totalMinutes / 60).toFixed(2)) : 0;

      // Add trace for getRealTimeStats
      debugTrace.addTrace('useProfileBaseline.getRealTimeStats', { 
        initial_flights: baselineFlights, 
        total_flights: flightsDone, 
        calculatedTotal: totalFlights
      });
      
      return {
        baselineFlights,
        baselineMinutes,
        flightsDone,
        minutesDone,
        totalFlights,
        totalMinutes,
        totalHours
      };
    } catch (err) {
      // Fallback para valores locais se a busca no banco falhar
      const baselineFlights = profile.initial_flights || 0;
      const baselineMinutes = profile.initial_minutes || 0;
      const flightsDone = profile.total_flights || 0;
      const minutesDone = profile.total_minutes || 0;
      
      const totalFlights = baselineFlights + flightsDone;
      const totalMinutes = baselineMinutes + minutesDone;
      const totalHours = totalMinutes > 0 ? Number((totalMinutes / 60).toFixed(2)) : 0;
      
      return {
        baselineFlights,
        baselineMinutes,
        flightsDone,
        minutesDone,
        totalFlights,
        totalMinutes,
        totalHours
      };
    }
  }, [profile, parseFlightTime]);

  return {
    getCompletedFlights,
    getCompletedMinutes,
    calculateProfileTotals,
    getRealTimeStats,
    parseFlightTime
  };
};
