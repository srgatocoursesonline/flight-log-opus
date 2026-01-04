import { Flight } from '@/hooks/supabase/useSupabaseFlights';
import { FlightCardCompact } from '@/components/flights/FlightCardCompact';

const mockFlight: Flight = {
  id: 'test-1',
  callsign: 'TEST001',
  aircraft: 'Boeing 747-8',
  departure: 'SBGR',
  arrival: 'KJFK',
  departureTime: '10:00',
  arrivalTime: '20:00',
  flightTime: '10:00',
  distance: 5000,
  fuelUsed: 10000,
  landingRate: -150,
  experiencePoints: 500,
  careerRating: 100,
  status: 'completed',
  date: '2025-01-01',
  originAirportInfo: { name: 'Governador André Franco Montoro International Airport' },
  destinationAirportInfo: { name: 'John F. Kennedy International Airport' },
  isExample: true
};

const ResponsiveTest = () => {
  return (
    <div className="p-8 space-y-8 bg-background min-h-screen text-foreground">
      <h1 className="text-2xl font-bold mb-4">Teste de Responsividade do Card Compacto</h1>
      <p className="text-muted-foreground mb-8">
        Verifique se o nome dos aeroportos se ajusta e trunca corretamente em diferentes larguras.
        O tamanho da fonte deve diminuir suavemente antes de truncar.
      </p>
      
      <div className="space-y-4">
        <h2 className="text-xl">Largura: 200px (Grid Estreito / Desktop Zoom In)</h2>
        <div style={{ width: '200px', height: '100px' }} className="border p-2">
          <FlightCardCompact flight={mockFlight} />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl">Largura: 300px (Tablet / Laptop)</h2>
        <div style={{ width: '300px', height: '100px' }} className="border p-2">
          <FlightCardCompact flight={mockFlight} />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl">Largura: 400px (Mobile Wide)</h2>
        <div style={{ width: '400px', height: '100px' }} className="border p-2">
          <FlightCardCompact flight={mockFlight} />
        </div>
      </div>
    </div>
  );
};

export default ResponsiveTest;
