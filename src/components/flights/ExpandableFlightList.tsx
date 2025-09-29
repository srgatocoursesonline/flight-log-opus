import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Flight } from '@/types/flight';
import SafeVirtualizedList from './SafeVirtualizedList';
import ErrorBoundary from '../ErrorBoundary';
import { useSafeMemoizedObject } from '@/hooks/useSafeMemoizedObject';

interface ExpandableFlightListProps {
  flights: Flight[];
  initialExpanded?: boolean;
  title: string;
}

/**
 * Componente de lista de voos expansível que usa o ErrorBoundary e useSafeMemoizedObject
 * para evitar erros de tela branca ao expandir/colapsar a lista.
 */
const ExpandableFlightList: React.FC<ExpandableFlightListProps> = ({
  flights,
  initialExpanded = false,
  title
}) => {
  const [expanded, setExpanded] = useState(initialExpanded);
  
  // Usar o hook de memorização seguro para evitar erros com Object.values em objetos null/undefined
  const safeFlights = useSafeMemoizedObject(flights);
  
  const toggleExpanded = useCallback(() => {
    setExpanded(prev => !prev);
  }, []);

  return (
    <ErrorBoundary>
      <div className="hud-display p-4 mb-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleExpanded}
            className="flex items-center gap-1"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                <span>Colapsar</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                <span>Expandir</span>
              </>
            )}
          </Button>
        </div>
        
        {expanded && (
          <div className="transition-all duration-300">
            {safeFlights && safeFlights.length > 0 ? (
              <SafeVirtualizedList 
                flights={safeFlights} 
                height={Math.min((safeFlights.length || 0) * 120, 600)}
              />
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Nenhum voo encontrado
              </div>
            )}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default ExpandableFlightList;
