import { useState, useEffect } from 'react';

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
  date: string;
  route?: string;
  notes?: string;
  isExample?: boolean; // Para distinguir voos mockados dos reais
}

const STORAGE_KEY = 'msfs-flights';

export const useFlights = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar voos do localStorage na inicialização
  useEffect(() => {
    try {
      const savedFlights = localStorage.getItem(STORAGE_KEY);
      if (savedFlights) {
        const parsedFlights = JSON.parse(savedFlights);
        
        // Verificar se há voos sem a propriedade isExample e marcá-los como exemplos
        // se forem os voos mockados originais (baseado nos IDs '1', '2', '3', '4', '5')
        const updatedFlights = parsedFlights.map((flight: Flight) => {
          // Se o voo não tem isExample definido E tem ID de 1 a 5, é um voo mockado
          if (flight.isExample === undefined && ['1', '2', '3', '4', '5'].includes(flight.id)) {
            return { ...flight, isExample: true };
          }
          // Se não tem isExample definido mas não é ID de mockado, é voo real
          if (flight.isExample === undefined) {
            return { ...flight, isExample: false };
          }
          return flight;
        });
        
        setFlights(updatedFlights);
        // Salvar as atualizações no localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFlights));
      } else {
        // Adicionar alguns voos de exemplo se não houver dados
        const exampleFlights: Flight[] = [
          {
            id: '1',
            callsign: 'TAM3007',
            aircraft: 'Airbus A321LR',
            departure: 'SBGR',
            arrival: 'SBRJ',
            departureTime: '14:30',
            arrivalTime: '15:45',
            flightTime: '1h 15m',
            distance: 365,
            fuelUsed: 6283,
            landingRate: -156,
            experiencePoints: 1250,
            careerRating: 92,
            status: 'completed',
            date: '2024-08-25',
            route: 'SBGR DCT SBRJ',
            notes: 'Voo suave com o novo Airbus A321LR',
            isExample: true
          },
          {
            id: '2',
            callsign: 'GOL1234',
            aircraft: 'Boeing 737 MAX 8',
            departure: 'SBSP',
            arrival: 'SBRF',
            departureTime: '08:15',
            arrivalTime: '10:30',
            flightTime: '2h 15m',
            distance: 872,
            fuelUsed: 9259,
            landingRate: -198,
            experiencePoints: 1890,
            careerRating: 88,
            status: 'completed',
            date: '2024-08-24',
            route: 'SBSP UW2 SBRF',
            notes: 'Primeiro voo com o 737 MAX 8 - excelente performance',
            isExample: true
          },
          {
            id: '3',
            callsign: 'AZU2580',
            aircraft: 'ATR 72-600',
            departure: 'SBBR',
            arrival: 'SBPA',
            departureTime: '16:45',
            arrivalTime: '18:20',
            flightTime: '1h 35m',
            distance: 1050,
            fuelUsed: 3968,
            landingRate: -145,
            experiencePoints: 2150,
            careerRating: 95,
            status: 'completed',
            date: '2024-08-23',
            route: 'SBBR DCT SBPA',
            notes: 'Turboprop regional - economia de combustível excelente',
            isExample: true
          },
          {
            id: '4',
            callsign: 'FLN4521',
            aircraft: 'Cessna 208 B Grand Caravan EX',
            departure: 'SBFL',
            arrival: 'SBJV',
            departureTime: '09:00',
            arrivalTime: '10:15',
            flightTime: '1h 15m',
            distance: 180,
            fuelUsed: 992,
            landingRate: -125,
            experiencePoints: 980,
            careerRating: 98,
            status: 'completed',
            date: '2024-08-22',
            route: 'SBFL DCT SBJV',
            notes: 'Voo regional perfeito - Grand Caravan é confiável',
            isExample: true
          },
          {
            id: '5',
            callsign: 'PTRMG',
            aircraft: 'Beechcraft King Air 350i',
            departure: 'SBBH',
            arrival: 'SBCF',
            departureTime: '13:20',
            arrivalTime: '14:05',
            flightTime: '45m',
            distance: 95,
            fuelUsed: 397,
            landingRate: -138,
            experiencePoints: 750,
            careerRating: 94,
            status: 'completed',
            date: '2024-08-21',
            route: 'SBBH DCT SBCF',
            notes: 'Voo executivo - King Air sempre confiável',
            isExample: true
          }
        ];
        setFlights(exampleFlights);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(exampleFlights));
      }
    } catch (error) {
      console.error('Erro ao carregar voos:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Salvar voos no localStorage sempre que a lista mudar
  const saveFlights = (newFlights: Flight[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newFlights));
      setFlights(newFlights);
    } catch (error) {
      console.error('Erro ao salvar voos:', error);
    }
  };

  const addFlight = (flight: Omit<Flight, 'id'>) => {
    const newFlight: Flight = {
      ...flight,
      id: Date.now().toString(),
      isExample: false // Novos voos são sempre voos reais
    };
    const updatedFlights = [newFlight, ...flights];
    saveFlights(updatedFlights);
  };

  const updateFlight = (id: string, updates: Partial<Flight>) => {
    const updatedFlights = flights.map(flight =>
      flight.id === id ? { ...flight, ...updates } : flight
    );
    saveFlights(updatedFlights);
  };

  const deleteFlight = (id: string) => {
    const updatedFlights = flights.filter(flight => flight.id !== id);
    saveFlights(updatedFlights);
  };

  const getFlightStats = () => {
    // Usar apenas voos reais (excluindo dados mockados)
    const realFlights = flights.filter(flight => !flight.isExample);
    
    // Filtrar apenas voos completados para cálculo de CR
    const completedFlights = realFlights.filter(flight => flight.status === 'Concluído');
    
    // Estatísticas baseadas apenas em voos reais
    const totalRealFlights = realFlights.length;
    const totalRealDistance = realFlights.reduce((sum, flight) => sum + flight.distance, 0);
    const totalRealFlightTime = realFlights.reduce((sum, flight) => {
      return sum + parseFlightTime(flight.flightTime);
    }, 0);
    const averageRating = totalRealFlights > 0 
      ? realFlights.reduce((sum, flight) => sum + flight.careerRating, 0) / totalRealFlights 
      : 0;
    // Apenas voos completados contribuem para o CR total
    const totalCR = completedFlights.reduce((sum, flight) => sum + flight.careerRating, 0);

    return {
      // Apenas dados reais para todos os cálculos e exibições
      totalFlights: totalRealFlights,
      totalDistance: totalRealDistance,
      totalFlightTime: Math.round(totalRealFlightTime / 60), // em horas
      averageRating: Math.round(averageRating),
      totalCR,
    };
  };
  
  // Função auxiliar para converter tempo de voo em minutos
  const parseFlightTime = (flightTime: string): number => {
    if (!flightTime) return 0;
    
    // Tratar formatos: "1h 30m", "45m", "2h"
    const hourMatch = flightTime.match(/(\d+)h/);
    const minuteMatch = flightTime.match(/(\d+)m/);
    
    const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
    const minutes = minuteMatch ? parseInt(minuteMatch[1]) : 0;
    
    return hours * 60 + minutes;
  };

  return {
    flights: flights.filter(flight => !flight.isExample), // Retornar apenas voos reais
    isLoading,
    addFlight,
    updateFlight,
    deleteFlight,
    getFlightStats
  };
};