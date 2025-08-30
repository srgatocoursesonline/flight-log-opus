// ============================================
// SUPABASE MSFS FLIGHTS MANAGER HOOK
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/config/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface MSFSFlight {
  id: string;
  aircraft_type: string;
  departure_icao: string;
  arrival_icao: string;
  departure_time: string;
  arrival_time: string;
  flight_time_minutes: number;
  distance_nm: number;
  max_altitude_ft: number;
  max_speed_kts: number;
  departure_lat: number;
  departure_lon: number;
  arrival_lat: number;
  arrival_lon: number;
  raw_data: any;
  created_at: string;
  updated_at: string;
}

export interface MSFSFlightStats {
  totalFlights: number;
  totalFlightTime: number;
  totalDistance: number;
  averageFlightTime: number;
  averageDistance: number;
  mostUsedAircraft: string;
  favoriteRoute: {
    departure: string;
    arrival: string;
    count: number;
  };
}

export const useSupabaseMSFSFlights = () => {
  const [flights, setFlights] = useState<MSFSFlight[]>([]);
  const [stats, setStats] = useState<MSFSFlightStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // ============================================
  // FETCH FLIGHTS
  // ============================================
  const fetchFlights = useCallback(async () => {
    if (!user) {
      setFlights([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('msfs_flights')
        .select('*')
        .eq('user_id', user.id)
        .order('departure_time', { ascending: false });

      if (error) {
        console.error('Erro ao buscar voos MSFS:', error);
        setError(error.message);
        toast.error('Erro ao carregar voos do MSFS');
        return;
      }

      setFlights(data || []);
    } catch (err) {
      console.error('Erro não tratado ao buscar voos MSFS:', err);
      setError('Erro interno ao carregar voos');
      toast.error('Erro interno ao carregar voos');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ============================================
  // FETCH STATS
  // ============================================
  const fetchStats = useCallback(async () => {
    if (!user) {
      setStats(null);
      return;
    }

    try {
      // Buscar estatísticas usando RPC function
      const { data, error } = await supabase
        .rpc('get_msfs_flight_stats', { user_id: user.id });

      if (error) {
        console.error('Erro ao buscar estatísticas MSFS:', error);
        return;
      }

      setStats(data);
    } catch (err) {
      console.error('Erro não tratado ao buscar estatísticas MSFS:', err);
    }
  }, [user]);

  // ============================================
  // GET RECENT FLIGHTS
  // ============================================
  const getRecentFlights = useCallback(async (limit: number = 5) => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('msfs_flights')
        .select('*')
        .eq('user_id', user.id)
        .order('departure_time', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Erro ao buscar voos recentes MSFS:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Erro não tratado ao buscar voos recentes MSFS:', err);
      return [];
    }
  }, [user]);

  // ============================================
  // GET POPULAR ROUTES
  // ============================================
  const getPopularRoutes = useCallback(async (limit: number = 10) => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .rpc('get_msfs_popular_routes', { 
          user_id: user.id,
          route_limit: limit 
        });

      if (error) {
        console.error('Erro ao buscar rotas populares MSFS:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Erro não tratado ao buscar rotas populares MSFS:', err);
      return [];
    }
  }, [user]);

  // ============================================
  // DELETE FLIGHT
  // ============================================
  const deleteFlight = useCallback(async (flightId: string) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return false;
    }

    try {
      const { error } = await supabase
        .from('msfs_flights')
        .delete()
        .eq('id', flightId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao deletar voo MSFS:', error);
        toast.error('Erro ao deletar voo');
        return false;
      }

      toast.success('Voo deletado com sucesso');
      
      // Atualizar lista local
      setFlights(prev => prev.filter(flight => flight.id !== flightId));
      
      // Recarregar estatísticas
      fetchStats();
      
      return true;
    } catch (err) {
      console.error('Erro não tratado ao deletar voo MSFS:', err);
      toast.error('Erro interno ao deletar voo');
      return false;
    }
  }, [user, fetchStats]);

  // ============================================
  // CLEAR ALL FLIGHTS
  // ============================================
  const clearAllFlights = useCallback(async () => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return false;
    }

    try {
      const { error } = await supabase
        .from('msfs_flights')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao limpar voos MSFS:', error);
        toast.error('Erro ao limpar histórico de voos');
        return false;
      }

      toast.success('Histórico de voos limpo com sucesso');
      
      // Limpar estado local
      setFlights([]);
      setStats(null);
      
      return true;
    } catch (err) {
      console.error('Erro não tratado ao limpar voos MSFS:', err);
      toast.error('Erro interno ao limpar histórico');
      return false;
    }
  }, [user]);

  // ============================================
  // INITIAL LOAD
  // ============================================
  useEffect(() => {
    if (user) {
      fetchFlights();
      fetchStats();
    }
  }, [user?.id]); // Apenas depende do user.id para evitar loops

  // ============================================
  // RETURN
  // ============================================
  return {
    flights,
    stats,
    loading,
    error,
    fetchFlights,
    fetchStats,
    getRecentFlights,
    getPopularRoutes,
    deleteFlight,
    clearAllFlights,
    refresh: () => {
      fetchFlights();
      fetchStats();
    }
  };
};