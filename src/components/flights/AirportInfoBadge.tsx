import { Badge } from '@/components/ui/badge';
import { Plane, Building2, MapPin, Mountain } from 'lucide-react';
import { AirportInfo } from '@/lib/airportService';

interface AirportInfoBadgeProps {
  airport: AirportInfo | null;
  source?: 'cache' | 'ourairports' | 'manual' | 'csv' | 'api';
}

const sourceLabels = {
  cache: '⚡ Cache',
  ourairports: '🌍 OurAirports',
  manual: '📝 Manual',
  csv: '📄 CSV Local',
  api: '🔌 API'
};

const typeLabels: Record<string, string> = {
  large_airport: '🏢 Grande',
  medium_airport: '🏛️ Médio',
  small_airport: '🏠 Pequeno',
  heliport: '🚁 Heliporto',
  seaplane_base: '🛥️ Hidroavião',
  balloonport: '🎈 Balão',
  closed: '🚫 Fechado'
};

export function AirportInfoBadge({ airport, source }: AirportInfoBadgeProps) {
  if (!airport) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-1 text-xs">
      {/* Source badge */}
      {source && (
        <Badge variant="outline" className="font-normal">
          {sourceLabels[source] || source}
        </Badge>
      )}
      
      {/* Type badge */}
      {airport.airport_type && (
        <Badge variant="secondary" className="font-normal">
          {typeLabels[airport.airport_type] || airport.airport_type}
        </Badge>
      )}
      
      {/* Location */}
      {(airport.city || airport.state) && (
        <Badge variant="outline" className="font-normal">
          <MapPin className="w-3 h-3 mr-1" />
          {[airport.city, airport.state].filter(Boolean).join(', ')}
        </Badge>
      )}
      
      {/* Elevation */}
      {airport.elevation_ft && airport.elevation_ft > 0 && (
        <Badge variant="outline" className="font-normal">
          <Mountain className="w-3 h-3 mr-1" />
          {airport.elevation_ft} ft
        </Badge>
      )}
      
      {/* Manual badge */}
      {airport.manually_added && (
        <Badge variant="default" className="font-normal">
          ✍️ Cadastrado por você
        </Badge>
      )}
    </div>
  );
}
