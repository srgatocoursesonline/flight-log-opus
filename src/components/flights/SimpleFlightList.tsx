import React, { memo } from 'react';
import { Flight } from '../../types/flight';
import { FlightCardCompact } from './FlightCardCompact';

interface SimpleFlightListProps {
  flights: Flight[];
  height?: number;
  layout?: 'grid' | 'list';
}

/**
 * Componente de lista simples sem virtualização
 * Usado como fallback quando react-window falha
 */
const SimpleFlightList: React.FC<SimpleFlightListProps> = memo(({
  flights,
  height = 600,
  layout = 'list'
}) => {
  // Garantir que flights é sempre um array válido
  const safeFlights = flights?.filter(flight => 
    flight != null && 
    typeof flight === 'object' && 
    flight.id
  ) || [];

  if (safeFlights.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhum voo encontrado
      </div>
    );
  }

  // Layout de grid (compacto) - como cards pequenos em grid
  if (layout === 'grid') {
    return (
      <div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 overflow-y-auto pr-2"
        style={{ 
          maxHeight: height,
          height: 'auto'
        }}
      >
        {safeFlights.map((flight, index) => (
          <div key={`flight-${flight.id || index}`} className="w-full">
            <FlightCardCompact flight={flight} />
          </div>
        ))}
      </div>
    );
  }

  // Layout de lista (detalhado) - uma única coluna
  return (
    <div 
      className="space-y-3 overflow-y-auto pr-2"
      style={{ 
        maxHeight: height,
        height: 'auto'
      }}
    >
      {safeFlights.map((flight, index) => (
        <div key={`flight-${flight.id || index}`} className="w-full">
          <FlightCardCompact flight={flight} />
        </div>
      ))}
    </div>
  );
});

SimpleFlightList.displayName = 'SimpleFlightList';

export default SimpleFlightList;
