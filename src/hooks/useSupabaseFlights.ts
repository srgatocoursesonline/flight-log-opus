// ============================================
// SUPABASE FLIGHTS MANAGER HOOK
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { autoRefresh } from '@/utils/autoRefresh';

export interface Flight {
  id: string;
  callsign: string;
  aircraft: string;
  departure: string;
  arrival: string;
  departureTime: string;
  arrivalTime: string;
  flightTime: string;
  distance: number;
  fuelUsed: number;
  landingRate: number;
  experiencePoints: number;
  careerRating: number;
  status: 'completed' | 'planned' | 'active' | 'cancelled';
  // Date is stored as a string in YYYY-MM-DD format to avoid timezone issues
  date: string;
  route?: string;
  notes?: string;
  isExample?: boolean; // For distinguishing mock vs real flights
}

export const useSupabaseFlights = () => {
  const { user } = useAuth();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch flights from database
  const fetchFlights = useCallback(async () => {
    if (!user) {
      setFlights([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('flights')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching flights:', error);
        setError('Erro ao carregar voos');
        toast.error('Erro ao carregar voos');
        return;
      }

      // Transform database data to match interface
      const flightData: Flight[] = data.map(item => ({
        id: item.id,
        callsign: item.callsign,
        aircraft: item.aircraft,
        departure: item.departure,
        arrival: item.arrival,
        departureTime: item.departure_time,
        arrivalTime: item.arrival_time,
        flightTime: item.flight_time,
        distance: item.distance || 0,
        fuelUsed: item.fuel_used || 0,
        landingRate: item.landing_rate || 0,
        experiencePoints: item.experience_points || 0,
        careerRating: item.career_rating || 0,
        status: item.status || 'completed',
        date: item.flight_date,
        route: item.route,
        notes: item.notes,
        isExample: item.is_example || false,
      }));

      setFlights(flightData);
    } catch (error) {
      console.error('Error in fetchFlights:', error);
      setError('Erro ao conectar com o banco de dados');
      toast.error('Erro ao conectar com o banco de dados');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    fetchFlights();
  }, [fetchFlights]);

  // Add new flight
  const addFlight = async (flight: Omit<Flight, 'id'>) => {
    console.log('useSupabaseFlights.addFlight chamado com:', flight);
    
    if (!user) {
      console.error('Usuário não autenticado');
      toast.error('Usuário não autenticado');
      throw new Error('Usuário não autenticado');
    }

    try {
      console.log('Usuário autenticado:', user.id);
      
      const insertData = {
        user_id: user.id,
        callsign: flight.callsign,
        aircraft: flight.aircraft,
        departure: flight.departure,
        arrival: flight.arrival,
        departure_time: flight.departureTime,
        arrival_time: flight.arrivalTime,
        flight_time: flight.flightTime,
        distance: flight.distance,
        fuel_used: flight.fuelUsed,
        landing_rate: flight.landingRate,
        experience_points: flight.experiencePoints,
        career_rating: flight.careerRating,
        status: flight.status,
        flight_date: flight.date,
        route: flight.route,
        notes: flight.notes,
        is_example: flight.isExample || false,
      };
      
      console.log('Dados para inserção no Supabase:', insertData);
      
      const { data, error } = await supabase
        .from('flights')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Erro do Supabase ao adicionar voo:', error);
        toast.error('Erro ao adicionar voo: ' + error.message);
        throw error;
      }
      
      console.log('Voo inserido com sucesso no Supabase:', data);

      // Refresh data
      await fetchFlights();
      console.log('Lista de voos atualizada');
      
      toast.success(`Voo "${flight.callsign}" adicionado com sucesso!`);
      
      // Auto refresh for real-time updates
      autoRefresh();
      
      return data;
    } catch (error) {
      console.error('Erro geral em addFlight:', error);
      toast.error('Erro ao adicionar voo');
      throw error;
    }
  };

  // Update flight
  const updateFlight = async (id: string, updates: Partial<Flight>) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      // Transform updates to match database columns
      const dbUpdates: any = {};
      if (updates.callsign !== undefined) dbUpdates.callsign = updates.callsign;
      if (updates.aircraft !== undefined) dbUpdates.aircraft = updates.aircraft;
      if (updates.departure !== undefined) dbUpdates.departure = updates.departure;
      if (updates.arrival !== undefined) dbUpdates.arrival = updates.arrival;
      if (updates.departureTime !== undefined) dbUpdates.departure_time = updates.departureTime;
      if (updates.arrivalTime !== undefined) dbUpdates.arrival_time = updates.arrivalTime;
      if (updates.flightTime !== undefined) dbUpdates.flight_time = updates.flightTime;
      if (updates.distance !== undefined) dbUpdates.distance = updates.distance;
      if (updates.fuelUsed !== undefined) dbUpdates.fuel_used = updates.fuelUsed;
      if (updates.landingRate !== undefined) dbUpdates.landing_rate = updates.landingRate;
      if (updates.experiencePoints !== undefined) dbUpdates.experience_points = updates.experiencePoints;
      if (updates.careerRating !== undefined) dbUpdates.career_rating = updates.careerRating;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.date !== undefined) dbUpdates.flight_date = updates.date;
      if (updates.route !== undefined) dbUpdates.route = updates.route;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.isExample !== undefined) dbUpdates.is_example = updates.isExample;

      const { error } = await supabase
        .from('flights')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating flight:', error);
        toast.error('Erro ao atualizar voo');
        return;
      }

      // Update local state
      setFlights(prev => 
        prev.map(flight => 
          flight.id === id 
            ? { ...flight, ...updates }
            : flight
        )
      );

      toast.success('Voo atualizado com sucesso!');
      
      // Auto refresh for real-time updates
      autoRefresh();
    } catch (error) {
      console.error('Error in updateFlight:', error);
      toast.error('Erro ao atualizar voo');
    }
  };

  // Delete flight
  const deleteFlight = async (id: string) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      const { error } = await supabase
        .from('flights')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting flight:', error);
        toast.error('Erro ao deletar voo');
        return;
      }

      // Update local state
      setFlights(prev => prev.filter(flight => flight.id !== id));
      toast.success('Voo deletado com sucesso!');
      
      // Auto refresh for real-time updates
      autoRefresh();
    } catch (error) {
      console.error('Error in deleteFlight:', error);
      toast.error('Erro ao deletar voo');
    }
  };

  // Get flight statistics
  const getFlightStats = () => {
    // Use only real flights (excluding mock data)
    const realFlights = flights.filter(flight => !flight.isExample);
    
    // Statistics based only on real flights
    const totalRealFlights = realFlights.length;
    const totalRealDistance = realFlights.reduce((sum, flight) => sum + flight.distance, 0);
    const totalRealFlightTime = realFlights.reduce((sum, flight) => {
      return sum + parseFlightTime(flight.flightTime);
    }, 0);
    const averageRating = totalRealFlights > 0 
      ? realFlights.reduce((sum, flight) => sum + flight.careerRating, 0) / totalRealFlights 
      : 0;
    const totalCR = realFlights.reduce((sum, flight) => sum + flight.careerRating, 0);

    return {
      // Only real data for all calculations and displays
      totalFlights: totalRealFlights,
      totalDistance: totalRealDistance,
      totalFlightTime: Math.round(totalRealFlightTime / 60), // in hours
      averageRating: Math.round(averageRating),
      totalCR,
    };
  };
  
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

  return {
    flights: flights.filter(flight => !flight.isExample), // Return only real flights
    isLoading,
    error,
    addFlight,
    updateFlight,
    deleteFlight,
    getFlightStats,
    refresh: fetchFlights,
  };
};