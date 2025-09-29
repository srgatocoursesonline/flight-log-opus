import React, { memo, useCallback } from 'react';
import { List as FixedSizeList, ListChildComponentProps } from 'react-window';
import { Flight } from '../../types/flight';
import { FlightCardCompact } from './FlightCardCompact';
import ErrorBoundary from '../ErrorBoundary';
import { useSafeMemoizedObject } from '../../hooks/useSafeMemoizedObject';

interface VirtualizedFlightListProps {
  flights: Flight[];
  height?: number;
  itemSize?: number;
  width?: string | number;
}

const VirtualizedFlightList: React.FC<VirtualizedFlightListProps> = memo(({
  flights,
  height = 600,
  itemSize = 120,
  width = '100%'
}) => {
  const renderFlightRow = useCallback((props: ListChildComponentProps) => {
    const { index, style } = props;
    const flight = flights[index];
    if (!flight) return null;

    return (
      <div style={style}>
        <FlightCardCompact flight={flight} />
      </div>
    );
  }, [flights]);

  if (!flights.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhum voo encontrado
      </div>
    );
  }

  // Usar o hook de memorização seguro para evitar erros com Object.values em objetos null/undefined
  const safeFlights = useSafeMemoizedObject(flights);
  
  // Criar uma versão segura da função renderFlightRow que usa safeFlights
  const safeRenderFlightRow = useCallback((props: ListChildComponentProps) => {
    const { index, style } = props;
    const flight = safeFlights[index];
    if (!flight) return null;

    return (
      <div style={style}>
        <FlightCardCompact flight={flight} />
      </div>
    );
  }, [safeFlights]);
  
  return (
    <ErrorBoundary>
      <FixedSizeList
        height={height}
        itemCount={safeFlights.length || 0}
        itemSize={itemSize}
        width={width}
        className="w-full"
        // Importante: usar itemData para forçar react-window a usar nossas props seguras
        itemData={safeFlights}
      >
        {safeRenderFlightRow}
      </FixedSizeList>
    </ErrorBoundary>
  );
});

VirtualizedFlightList.displayName = 'VirtualizedFlightList';

export default VirtualizedFlightList;