import React, { memo, useCallback } from 'react';
import { FixedSizeList } from 'react-window';
import { Flight } from '../types/flight';
import CompactFlightCard from './CompactFlightCard';

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
  const renderFlightRow = useCallback(({ index, style }: {
    index: number;
    style: React.CSSProperties;
  }) => {
    const flight = flights[index];
    if (!flight) return null;

    return (
      <div style={style}>
        <CompactFlightCard flight={flight} />
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

  return (
    <FixedSizeList
      height={height}
      itemCount={flights.length}
      itemSize={itemSize}
      width={width}
      className="w-full"
    >
      {renderFlightRow}
    </FixedSizeList>
  );
});

VirtualizedFlightList.displayName = 'VirtualizedFlightList';

export default VirtualizedFlightList;