import { useState } from "react";
import { Plane, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useNavigate } from 'react-router-dom';
import { useSupabaseFlights, Flight } from '@/hooks/supabase/useSupabaseFlights';
import { useFlightNavigation } from '@/hooks/business/useFlightNavigation';
import { FlightDetailModal } from '@/components/flights/FlightDetailModal';

export const RecentFlights = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { flights, isLoading } = useSupabaseFlights();
  const { navigateToAddFlight } = useFlightNavigation();
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewAll = () => {
    navigate('/flights');
  };

  const handleFlightClick = (flight: Flight) => {
    setSelectedFlight(flight);
    setIsModalOpen(true);
  };

  // Pegar os 3 voos mais recentes
  const recentFlights = flights
    .filter(flight => flight.status === 'Concluído')
    .sort((a, b) => {
      // Create date objects from the date strings (which are in YYYY-MM-DD format)
      // Using Date.UTC to avoid timezone conversion issues
      const [aYear, aMonth, aDay] = a.date.split('-').map(Number);
      const [bYear, bMonth, bDay] = b.date.split('-').map(Number);
      const dateA = new Date(Date.UTC(aYear, aMonth - 1, aDay));
      const dateB = new Date(Date.UTC(bYear, bMonth - 1, bDay));
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 3);




  return (
    <div className="hud-display recent-flights-container fade-in p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">{t('recentFlights.title')}</h3>
          <p className="text-sm text-readable-muted">{t('recentFlights.subtitle')}</p>
        </div>
        <Button variant="outline" size="sm" className="icon-hover" onClick={handleViewAll}>
          {t('recentFlights.viewAll')}
        </Button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-4">
            <Plane className="h-8 w-8 text-blue-600 mx-auto mb-2 animate-pulse" />
            <p className="text-sm text-readable-muted">{t('common.loading')}</p>
          </div>
        ) : recentFlights.length === 0 ? (
          <div className="text-center py-8">
            <Plane className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <p className="text-sm text-readable-muted mb-3">{t('recentFlights.noFlights')}</p>
            <Button size="sm" variant="hud" onClick={navigateToAddFlight}>
              {t('recentFlights.logFirstFlight')}
            </Button>
          </div>
        ) : (
          recentFlights.map((flight, index) => (
            <div
              key={flight.id}
              className="flight-item flex items-center gap-4 p-4 rounded-lg bg-muted/30 border border-border/50 cursor-pointer hover:border-primary/50 transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => handleFlightClick(flight)}
            >
              <div className="rounded-lg bg-primary/10 p-3 icon-hover">
                <Plane className="h-5 w-5 text-blue-600" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-foreground font-mono">{flight.departure}</span>
                  <div className="h-px flex-1 bg-border" />
                  <Plane className="h-3 w-3 text-blue-600" />
                  <div className="h-px flex-1 bg-border" />
                  <span className="font-semibold text-foreground font-mono">{flight.arrival}</span>
                </div>

                <div className="flex items-center gap-4 text-sm text-readable-muted">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-blue-600" />
                    {flight.aircraft}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-blue-600" />
                    {flight.flightTime}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-bold text-green-500 font-mono">
                  {flight.careerRating}
                </div>
                <div className="text-xs text-readable-muted uppercase">
                  CR
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Detalhes do Voo */}
      <FlightDetailModal
        flight={selectedFlight}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
};