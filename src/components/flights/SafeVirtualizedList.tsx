import React, { memo, useMemo, useState } from 'react';
import { Flight } from '../../types/flight';
import SimpleFlightList from './SimpleFlightList';
import ErrorBoundary from '../ErrorBoundary';

interface SafeVirtualizedListProps {
  flights: Flight[];
  height?: number;
  itemSize?: number;
  width?: string | number;
  layout?: 'grid' | 'list';
}

/**
 * Componente que usa uma lista simples como fallback seguro
 * Evita problemas com react-window completamente
 */
const SafeVirtualizedList: React.FC<SafeVirtualizedListProps> = memo(({
  flights,
  height = 600,
  itemSize = 120,
  width = '100%',
  layout = 'list'
}) => {
  // Garantir que flights é sempre um array válido
  const safeFlights = useMemo(() => {
    if (!flights || !Array.isArray(flights)) {
      return [];
    }
    return flights.filter(flight => 
      flight != null && 
      typeof flight === 'object' && 
      flight.id
    );
  }, [flights]);

  return (
    <ErrorBoundary 
      fallback={
        <div className="text-center py-8 text-red-500">
          <p>Erro ao carregar a lista de voos.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Recarregar
          </button>
        </div>
      }
    >
      <div style={{ width }}>
        <SimpleFlightList 
          flights={safeFlights} 
          height={typeof height === 'number' ? height : 600}
          layout={layout}
        />
      </div>
    </ErrorBoundary>
  );
});

SafeVirtualizedList.displayName = 'SafeVirtualizedList';

export default SafeVirtualizedList;
