// ============================================
// SUPABASE FLIGHTS MANAGER HOOK
// ============================================

import { useState, useEffect, useCallback, useMemo } from 'react';
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
  // Novos campos
  serviceType?: 'employee' | 'freelance';
  originCountry?: string;
  destinationCountry?: string;
  originAirportInfo?: {
    name?: string;
    iata_code?: string;
    city?: string;
    state?: string;
  };
  destinationAirportInfo?: {
    name?: string;
    iata_code?: string;
    city?: string;
    state?: string;
  };
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
        serviceType: item.service_type || 'employee',
        originCountry: item.origin_country || '',
        destinationCountry: item.destination_country || '',
        originAirportInfo: item.origin_airport_info || undefined,
        destinationAirportInfo: item.destination_airport_info || undefined
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
    if (user) {
      fetchFlights();
    }
  }, [user?.id]); // Apenas depende do user.id para evitar loops

  // Add new flight
  const addFlight = async (flight: Omit<Flight, 'id'>) => {

    
    if (!user) {
      console.error('Usuário não autenticado');
      toast.error('Usuário não autenticado');
      throw new Error('Usuário não autenticado');
    }

    try {

      
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
        service_type: flight.serviceType || 'employee',
        origin_country: flight.originCountry || null,
        destination_country: flight.destinationCountry || null,
        origin_airport_info: flight.originAirportInfo ? JSON.stringify(flight.originAirportInfo) : null,
        destination_airport_info: flight.destinationAirportInfo ? JSON.stringify(flight.destinationAirportInfo) : null
      };
      

      
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
      


      // Refresh data
      await fetchFlights();

      
      toast.success(`Voo "${flight.callsign}" adicionado com sucesso!`);
      
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      if (updates.serviceType !== undefined) dbUpdates.service_type = updates.serviceType;
      if (updates.originCountry !== undefined) dbUpdates.origin_country = updates.originCountry;
      if (updates.destinationCountry !== undefined) dbUpdates.destination_country = updates.destinationCountry;
      if (updates.originAirportInfo !== undefined) dbUpdates.origin_airport_info = updates.originAirportInfo ? JSON.stringify(updates.originAirportInfo) : null;
      if (updates.destinationAirportInfo !== undefined) dbUpdates.destination_airport_info = updates.destinationAirportInfo ? JSON.stringify(updates.destinationAirportInfo) : null;

      const { data: flightData, error } = await supabase
        .from('flights')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching flight data:', error);
        toast.error('Erro ao buscar dados do voo');
        return;
      }

      const previousStatus = flightData.status;
      // Verificar se o status está mudando para "completed"
      const isStatusChangingToCompleted = updates.status === 'completed' && previousStatus !== 'completed';

      const { error: updateError } = await supabase
        .from('flights')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating flight:', updateError);
        toast.error('Erro ao atualizar voo');
        return;
      }

      // Refresh data to ensure consistency
      await fetchFlights();

      // Emitir evento customizado quando o status muda para "Concluído"
      if (isStatusChangingToCompleted) {
        try {
          window.dispatchEvent(new CustomEvent('flightCompleted', {
            detail: {
              flightId: id,
              flightTime: updates.flightTime || flightData.flight_time,
              userId: user.id
            }
          }));
        } catch (eventError) {
          console.error('Erro ao emitir evento flightCompleted:', eventError);
          // Fallback: Forçar atualização do perfil
          window.dispatchEvent(new CustomEvent('refreshProfile'));
        }
      }

      toast.success('Voo atualizado com sucesso!');
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
    } catch (error) {
      console.error('Error in deleteFlight:', error);
      toast.error('Erro ao deletar voo');
    }
  };

  // Memoize real flights to avoid infinite loops in consumers
  const realFlights = useMemo(() => flights.filter(flight => !flight.isExample), [flights]);

  // Get flight statistics
  const getFlightStats = useCallback(() => {
    // Use only real flights (excluding mock data)
    // const realFlights = flights.filter(flight => !flight.isExample); // Using memoized version instead
    
    // Filter only completed flights for CR calculation
    const completedFlights = realFlights.filter(flight => flight.status === 'completed');
    
    // Statistics based only on real flights
    const totalRealFlights = realFlights.length;
    const totalRealDistance = realFlights.reduce((sum, flight) => sum + flight.distance, 0);
    const totalRealFlightTime = realFlights.reduce((sum, flight) => {
      return sum + parseFlightTime(flight.flightTime);
    }, 0);
    const averageRating = totalRealFlights > 0 
      ? realFlights.reduce((sum, flight) => sum + flight.careerRating, 0) / totalRealFlights 
      : 0;
    // Only count CR from completed flights
    const totalCR = completedFlights.reduce((sum, flight) => sum + flight.careerRating, 0);

    // Calculate CR also considering "Concluído" string which might come from older records or UI
    const legacyCompletedFlights = realFlights.filter(flight => 
      flight.status === 'completed' || (flight.status as any) === 'Concluído'
    );
    const totalLegacyCR = legacyCompletedFlights.reduce((sum, flight) => sum + flight.careerRating, 0);
    
    return {
      // Only real data for all calculations and displays
      totalFlights: totalRealFlights,
      totalDistance: totalRealDistance,
      totalFlightTime: Math.round(totalRealFlightTime / 60), // in hours
      averageRating: Math.round(averageRating),
      totalCR: totalLegacyCR, // Use the more inclusive calculation
    };
  }, [realFlights]);
  
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
    flights: realFlights, // Return memoized real flights
    isLoading,
    error,
    addFlight,
    updateFlight,
    deleteFlight,
    getFlightStats,
    refresh: fetchFlights,
  };
};