import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Plane,
  Clock,
  MapPin,
  Gauge,
  Mountain,
  Trash2,
  RefreshCw,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSupabaseMSFSFlights, type MSFSFlight } from '@/hooks/supabase/useSupabaseMSFSFlights';
import { formatDuration, formatDistance } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface MSFSFlightsProps {
  limit?: number;
  showHeader?: boolean;
  showActions?: boolean;
}

export const MSFSFlights = ({
  limit = 5,
  showHeader = true,
  showActions = true
}: MSFSFlightsProps) => {
  const { t } = useTranslation();
  const {
    flights,
    stats,
    loading,
    error,
    deleteFlight,
    clearAllFlights,
    refresh
  } = useSupabaseMSFSFlights();

  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  const displayFlights = flights.slice(0, limit);

  const handleDeleteFlight = async (flightId: string) => {
    setIsDeleting(flightId);
    try {
      await deleteFlight(flightId);
      // Force page refresh to ensure UI updates
      window.location.reload();
    } catch (error) {
      console.error('Error deleting flight:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleClearAll = async () => {
    setIsClearing(true);
    try {
      await clearAllFlights();
    } finally {
      setIsClearing(false);
    }
  };

  const formatFlightTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const utcDate = new Date(Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes()
    ));
    const { i18n } = useTranslation();
    return utcDate.toLocaleString(i18n.language === 'pt-BR' ? 'pt-BR' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC'
    });
  };

  if (loading) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plane className="h-5 w-5" />
              {t('navigation.flights')} MSFS 2024
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">{t('common.loading')}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plane className="h-5 w-5" />
              Voos MSFS 2024
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="flex items-center justify-center py-8 text-destructive">
            <AlertCircle className="h-6 w-6" />
            <span className="ml-2">{t('common.error')}: {error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Plane className="h-4 w-4" />
              {t('navigation.flights')} MSFS 2024
              {stats && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {stats.totalFlights} {t('common.flights')}
                </Badge>
              )}
            </CardTitle>
            {showActions && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refresh}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
                {flights.length > 0 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        disabled={isClearing}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('common.clearHistory')}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t('common.confirmClear')}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleClearAll}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {t('common.clearAll')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            )}
          </div>
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="text-center">
                <div className="text-lg font-bold text-primary">
                  {stats.totalFlights ?? 0}
                </div>
                <div className="text-xs text-readable-muted">{t('common.flights')}</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-primary">
                  {formatFlightTime(stats.totalFlightTime ?? 0)}
                </div>
                <div className="text-xs text-readable-muted">{t('common.totalHours')}</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-primary">
                  {Math.round(stats.totalDistance ?? 0)} NM
                </div>
                <div className="text-xs text-readable-muted">{t('common.distance')}</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-primary">
                  {stats.mostUsedAircraft || 'N/A'}
                </div>
                <div className="text-xs text-readable-muted">{t('msfsFlights.favoriteAircraft')}</div>
              </div>
            </div>
          )}
        </CardHeader>
      )}
      <CardContent>
        {displayFlights.length === 0 ? (
          <div className="text-center py-8">
            <Plane className="h-8 w-8 mx-auto text-blue-600 mb-3" />
            <p className="text-sm text-readable-muted mb-3">
              {t('msfsFlights.noFlights')}
            </p>
            <p className="text-xs text-readable-muted">
              {t('msfsFlights.startServiceDesc')}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayFlights.map((flight) => (
              <div key={flight.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        {flight.aircraft_type}
                      </Badge>
                      <span className="text-xs text-readable-muted">
                        {formatDateTime(flight.departure_time)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <span className="font-mono font-semibold text-sm">
                          {flight.departure_icao}
                        </span>
                        <span className="text-readable-muted text-sm">→</span>
                        <span className="font-mono font-semibold text-sm">
                          {flight.arrival_icao}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span>{formatFlightTime(flight.flight_time_minutes)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <span>{Math.round(flight.distance_nm)} NM</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mountain className="h-4 w-4 text-blue-600" />
                        <span>{Math.round(flight.max_altitude_ft).toLocaleString()} ft</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Gauge className="h-4 w-4 text-blue-600" />
                        <span>{Math.round(flight.max_speed_kts)} kts</span>
                      </div>
                    </div>
                  </div>

                  {showActions && (
                    <div className="flex items-center gap-2 ml-4">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            disabled={isDeleting === flight.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t('common.deleteFlight')}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('common.confirmDelete')}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteFlight(flight.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {t('common.delete')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {flights.length > limit && (
              <div className="text-center pt-4">
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {t('msfsFlights.viewAll', { count: flights.length })}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};