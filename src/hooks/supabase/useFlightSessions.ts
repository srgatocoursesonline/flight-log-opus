// ============================================
// FLIGHT SESSIONS HOOK
// Hook para integrar dados de flight_sessions do sistema de tracking
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/config/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface FlightSession {
  id: string;
  userId: string;
  deviceId: string;
  aircraftTitle: string;
  startedAt: string;
  endedAt?: string;
  status: 'active' | 'completed' | 'cancelled';
  departureLat?: number;
  departureLon?: number;
  arrivalLat?: number;
  arrivalLon?: number;
  flightTime?: number; // em segundos
  totalPoints?: number;
  maxAltitude?: number;
  maxSpeed?: number;
  totalDistance?: number;
  averageSpeed?: number;
  currentLat?: number;
  currentLon?: number;
  currentAltitude?: number;
  currentSpeed?: number;
}

export interface FlightSessionStats {
  totalSessions: number;
  totalFlightTime: number; // em horas
  totalDistance: number; // em milhas náuticas
  averageFlightTime: number; // em minutos
  completedSessions: number;
  activeSessions: number;
}

export const useFlightSessions = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<FlightSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar sessões de voo do usuário
  const fetchSessions = useCallback(async () => {
    if (!user) {
      setSessions([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Usar a view flight_session_stats que já calcula as métricas
      const { data, error } = await supabase
        .from('flight_session_stats')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar sessões de voo:', error);
        setError('Erro ao carregar sessões de voo');
        toast.error('Erro ao carregar sessões de voo');
        return;
      }

      // Transformar dados para o formato da interface
      const sessionData: FlightSession[] = (data || []).map(item => ({
        id: item.id,
        userId: item.user_id,
        deviceId: item.device_id,
        aircraftTitle: item.aircraft_title,
        startedAt: item.started_at,
        endedAt: item.ended_at,
        status: item.status,
        departureLat: item.departure_lat,
        departureLon: item.departure_lon,
        arrivalLat: item.arrival_lat,
        arrivalLon: item.arrival_lon,
        flightTime: item.flight_time,
        totalPoints: item.total_points,
        maxAltitude: item.max_altitude,
        maxSpeed: item.max_speed,
        totalDistance: item.total_distance,
        averageSpeed: item.average_speed,
        currentLat: item.current_lat,
        currentLon: item.current_lon,
        currentAltitude: item.current_altitude,
        currentSpeed: item.current_speed
      }));

      setSessions(sessionData);
    } catch (error) {
      console.error('Erro em fetchSessions:', error);
      setError('Erro ao conectar com o banco de dados');
      toast.error('Erro ao conectar com o banco de dados');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Carregar dados inicialmente
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Calcular estatísticas das sessões
  const getSessionStats = useCallback((): FlightSessionStats => {
    const completedSessions = sessions.filter(s => s.status === 'completed');
    const activeSessions = sessions.filter(s => s.status === 'active');
    
    const totalFlightTime = completedSessions.reduce((sum, session) => {
      return sum + (session.flightTime || 0);
    }, 0);
    
    const totalDistance = completedSessions.reduce((sum, session) => {
      return sum + (session.totalDistance || 0);
    }, 0);
    
    const averageFlightTime = completedSessions.length > 0 
      ? totalFlightTime / completedSessions.length / 60 // converter para minutos
      : 0;

    return {
      totalSessions: sessions.length,
      totalFlightTime: Math.round(totalFlightTime / 3600 * 10) / 10, // converter para horas com 1 decimal
      totalDistance: Math.round(totalDistance * 10) / 10,
      averageFlightTime: Math.round(averageFlightTime),
      completedSessions: completedSessions.length,
      activeSessions: activeSessions.length
    };
  }, [sessions]);

  // Buscar detalhes de uma sessão específica (incluindo pontos de telemetria)
  const getSessionDetails = useCallback(async (sessionId: string) => {
    if (!user) return null;

    try {
      // Buscar dados da sessão
      const { data: session, error: sessionError } = await supabase
        .from('flight_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single();

      if (sessionError || !session) {
        console.error('Erro ao buscar sessão:', sessionError);
        return null;
      }

      // Buscar pontos de telemetria
      const { data: points, error: pointsError } = await supabase
        .from('flight_points')
        .select('*')
        .eq('flight_session_id', sessionId)
        .order('recorded_at', { ascending: true });

      if (pointsError) {
        console.error('Erro ao buscar pontos:', pointsError);
        return { session, points: [] };
      }

      return {
        session,
        points: points || []
      };
    } catch (error) {
      console.error('Erro em getSessionDetails:', error);
      return null;
    }
  }, [user]);

  // Cancelar uma sessão ativa
  const cancelSession = useCallback(async (sessionId: string) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return false;
    }

    try {
      const { error } = await supabase
        .from('flight_sessions')
        .update({ 
          status: 'cancelled',
          ended_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao cancelar sessão:', error);
        toast.error('Erro ao cancelar sessão');
        return false;
      }

      // Atualizar lista local
      setSessions(prev => 
        prev.map(session => 
          session.id === sessionId 
            ? { ...session, status: 'cancelled' as const, endedAt: new Date().toISOString() }
            : session
        )
      );

      toast.success('Sessão cancelada com sucesso');
      return true;
    } catch (error) {
      console.error('Erro em cancelSession:', error);
      toast.error('Erro ao cancelar sessão');
      return false;
    }
  }, [user]);

  return {
    sessions,
    isLoading,
    error,
    getSessionStats,
    getSessionDetails,
    cancelSession,
    refresh: fetchSessions
  };
};