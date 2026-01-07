// ============================================
// RANKING STATS HOOK
// ============================================

import { useMemo } from 'react';
import { useSupabaseFlights } from './useSupabaseFlights';
import { useSupabaseFinancial } from './useSupabaseFinancial';
import { RankingStats, RankingItem } from '@/types/ranking';
import { formatDateBR } from '@/utils/dateFormatter';

export const useRankingStats = () => {
  const { flights, isLoading: flightsLoading } = useSupabaseFlights();
  const { revenues, expenses, isLoading: financialLoading } = useSupabaseFinancial();

  const isLoading = flightsLoading || financialLoading;

  const rankingStats = useMemo((): RankingStats => {
    // Filter only real flights (excluding example flights)
    const realFlights = flights.filter(flight => !flight.isExample);

    // 1. Best Landing (menor valor absoluto de landing_rate)
    const bestLanding: RankingItem | null = (() => {
      const flightsWithLanding = realFlights.filter(
        flight => flight.landingRate !== undefined && flight.landingRate !== 0
      );

      if (flightsWithLanding.length === 0) return null;

      const bestFlight = flightsWithLanding.sort((a, b) => {
        const absA = Math.abs(a.landingRate);
        const absB = Math.abs(b.landingRate);
        return absA - absB;
      })[0];

      return {
        title: 'Best Landing Rate',
        subtitle: 'Pouso mais suave',
        value: `${bestFlight.landingRate} fpm`,
        details: `${bestFlight.departure} → ${bestFlight.arrival}`,
        date: formatDateBR(bestFlight.date),
        route: `${bestFlight.departure} → ${bestFlight.arrival}`,
        aircraft: bestFlight.aircraft,
        flightData: bestFlight
      };
    })();

    // 2. Longest Flight (maior distância)
    const longestFlight: RankingItem | null = (() => {
      if (realFlights.length === 0) return null;

      const longest = realFlights.sort((a, b) => b.distance - a.distance)[0];

      return {
        title: 'Longest Flight',
        subtitle: 'Recorde de distância',
        value: `${longest.distance.toLocaleString()} nm`,
        details: `${longest.departure} → ${longest.arrival}`,
        date: formatDateBR(longest.date),
        route: `${longest.departure} → ${longest.arrival}`,
        aircraft: longest.aircraft,
        flightData: longest
      };
    })();

    // 3. Flights Without Penalties (preparado para implementação futura)
    const flightsWithoutPenalties: RankingItem | null = (() => {
      // Por enquanto, retorna 0 pois o campo has_penalties não está implementado
      // Quando implementado, usar: realFlights.filter(f => !f.hasPenalties).length
      return {
        title: 'Perfect Flights',
        subtitle: 'Sem penalidades',
        value: '0',
        details: 'Funcionalidade em breve'
      };
    })();

    // 4. Highest CR (Career Rating)
    const highestCR: RankingItem | null = (() => {
      if (realFlights.length === 0) return null;

      const highest = realFlights.sort((a, b) => b.careerRating - a.careerRating)[0];

      return {
        title: 'Highest CR',
        subtitle: 'Maior Career Rating',
        value: `${highest.careerRating.toLocaleString()} CR`,
        details: `${highest.departure} → ${highest.arrival}`,
        date: formatDateBR(highest.date),
        route: `${highest.departure} → ${highest.arrival}`,
        aircraft: highest.aircraft,
        flightData: highest
      };
    })();

    // 5. Highest XP (Experience Points)
    const highestXP: RankingItem | null = (() => {
      if (realFlights.length === 0) return null;

      const highest = realFlights.sort((a, b) => b.experiencePoints - a.experiencePoints)[0];

      return {
        title: 'Highest XP',
        subtitle: 'Maior Experience Points',
        value: `${highest.experiencePoints.toLocaleString()} XP`,
        details: `${highest.departure} → ${highest.arrival}`,
        date: formatDateBR(highest.date),
        route: `${highest.departure} → ${highest.arrival}`,
        aircraft: highest.aircraft,
        flightData: highest
      };
    })();

    // 6. Highest Passive Income (maior receita)
    const highestPassiveIncome: RankingItem | null = (() => {
      if (revenues.length === 0) return null;

      const highest = revenues.sort((a, b) => b.amount - a.amount)[0];

      return {
        title: 'Highest Passive Income',
        subtitle: 'Maior renda passiva',
        value: `R$ ${highest.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        details: highest.description,
        date: formatDateBR(highest.date),
        category: highest.category,
        transactionData: highest
      };
    })();

    // 7. Highest Expense (maior despesa)
    const highestExpense: RankingItem | null = (() => {
      if (expenses.length === 0) return null;

      const highest = expenses.sort((a, b) => b.amount - a.amount)[0];

      return {
        title: 'Highest Expense',
        subtitle: 'Despesa mais cara',
        value: `R$ ${highest.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        details: highest.description,
        date: formatDateBR(highest.date),
        category: highest.category,
        transactionData: highest
      };
    })();

    return {
      bestLanding,
      longestFlight,
      flightsWithoutPenalties,
      highestCR,
      highestXP,
      highestPassiveIncome,
      highestExpense
    };
  }, [flights, revenues, expenses]);

  return {
    rankingStats,
    isLoading
  };
};
