/**
 * Hook para atualizar informações de aeroportos em voos existentes
 */

import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { fetchAirportByIcao, type AirportInfo } from '@/lib/airportService';
import { toast } from 'sonner';

export const useFlightAirportUpdater = () => {
  
  /**
   * Atualiza as informações de aeroportos de um voo específico
   */
  const updateFlightAirports = useCallback(async (flightId: string, departure: string, arrival: string) => {
    try {
      // Buscar informações dos aeroportos
      const [originResult, destinationResult] = await Promise.all([
        fetchAirportByIcao(departure),
        fetchAirportByIcao(arrival)
      ]);

      const updateData: any = {};

      if (originResult.success && originResult.data) {
        updateData.origin_airport_info = {
          name: originResult.data.name,
          icao_code: originResult.data.icao_code,
          city: originResult.data.city,
          state: originResult.data.state,
          iata_code: originResult.data.iata_code
        };
      }

      if (destinationResult.success && destinationResult.data) {
        updateData.destination_airport_info = {
          name: destinationResult.data.name,
          icao_code: destinationResult.data.icao_code,
          city: destinationResult.data.city,
          state: destinationResult.data.state,
          iata_code: destinationResult.data.iata_code
        };
      }

      // Atualizar se houver dados novos
      if (Object.keys(updateData).length > 0) {
        const { error } = await supabase
          .from('flights')
          .update(updateData)
          .eq('id', flightId);

        if (error) {
          console.error('Erro ao atualizar informações de aeroportos:', error);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Erro ao atualizar informações de aeroportos:', error);
      return false;
    }
  }, []);

  /**
   * Atualiza informações de aeroportos para múltiplos voos
   */
  const updateMultipleFlightsAirports = useCallback(async (flights: Array<{ id: string; departure: string; arrival: string }>) => {
    let successCount = 0;
    let errorCount = 0;

    for (const flight of flights) {
      const success = await updateFlightAirports(flight.id, flight.departure, flight.arrival);
      if (success) {
        successCount++;
      } else {
        errorCount++;
      }
    }

    return { successCount, errorCount };
  }, [updateFlightAirports]);

  /**
   * Atualiza informações de aeroportos para todos os voos do usuário
   */
  const updateAllFlightsAirports = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Usuário não autenticado');
        return;
      }

      // Buscar voos que não têm informações de aeroportos
      const { data: flights, error } = await supabase
        .from('flights')
        .select('id, departure, arrival')
        .eq('user_id', user.id)
        .or('origin_airport_info->>name.is.null,destination_airport_info->>name.is.null');

      if (error) {
        console.error('Erro ao buscar voos:', error);
        toast.error('Erro ao buscar voos');
        return;
      }

      if (!flights || flights.length === 0) {
        toast.info('Todos os voos já têm informações de aeroportos');
        return;
      }

      toast.info(`Atualizando informações de aeroportos para ${flights.length} voos...`);

      const result = await updateMultipleFlightsAirports(flights);

      toast.success(
        `Atualização concluída: ${result.successCount} voos atualizados, ${result.errorCount} com erro`
      );

      // Recarregar página para mostrar atualizações
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Erro ao atualizar voos:', error);
      toast.error('Erro ao atualizar voos');
    }
  }, [updateMultipleFlightsAirports]);

  return {
    updateFlightAirports,
    updateMultipleFlightsAirports,
    updateAllFlightsAirports
  };
};
