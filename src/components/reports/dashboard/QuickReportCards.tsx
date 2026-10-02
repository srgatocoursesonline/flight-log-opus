import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plane, 
  Clock, 
  MapPin, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Wrench,
  Target,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFlightReportData } from '@/hooks/reports/useReportData';
import { useReportFilters } from '@/hooks/reports/useReportFilters';
import { formatDuration, formatCurrency } from '@/utils/reports/dataProcessing';

interface QuickStatCard {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: {
    value: number;
    percentage: number;
    direction: 'up' | 'down' | 'neutral';
  };
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  loading?: boolean;
}

export const QuickReportCards: React.FC = () => {
  const { t } = useTranslation();
  
  // Get current filters for data fetching
  const { filters } = useReportFilters();
  
  // Fetch real flight data
  const { flightAggregation, loading, error } = useFlightReportData(filters);

  // Calculate real statistics from flight data
  const quickStats: QuickStatCard[] = React.useMemo(() => {
    if (!flightAggregation) {
      return [
        {
          title: t('reports.totalFlights', 'Total Flights'),
          value: 0,
          subtitle: t('reports.thisMonth', 'this month'),
          icon: Plane,
          color: 'text-primary',
          loading: true
        },
        {
          title: t('reports.flightHours', 'Flight Hours'),
          value: '0h',
          subtitle: t('reports.totalTime', 'total time'),
          icon: Clock,
          color: 'text-success',
          loading: true
        },
        {
          title: t('reports.uniqueAirports', 'Unique Airports'),
          value: 0,
          subtitle: t('reports.visited', 'visited'),
          icon: MapPin,
          color: 'text-purple-600',
          loading: true
        },
        {
          title: t('reports.totalRevenue', 'Total Revenue'),
          value: '$0',
          subtitle: t('reports.thisQuarter', 'this quarter'),
          icon: DollarSign,
          color: 'text-emerald-600',
          loading: true
        },
        {
          title: t('reports.maintenanceCosts', 'Maintenance Costs'),
          value: '$0',
          subtitle: t('reports.thisMonth', 'this month'),
          icon: Wrench,
          color: 'text-orange-600',
          loading: true
        },
        {
          title: t('reports.completionRate', 'Completion Rate'),
          value: '0%',
          subtitle: t('reports.onTime', 'on-time'),
          icon: Target,
          color: 'text-indigo-600',
          loading: true
        }
      ];
    }

    // Calculate total revenue from flights
    const totalRevenue = Object.values(flightAggregation.byAircraft).reduce((sum, aircraft) => {
      // Assuming revenue is stored in aircraft data - adjust as needed
      return sum + 0; // Will need to be updated when revenue data is available
    }, 0);

    return [
      {
        title: t('reports.totalFlights', 'Total Flights'),
        value: flightAggregation.totalFlights,
        subtitle: t('reports.inPeriod', 'in selected period'),
        change: {
          value: 0, // Would need previous period data for comparison
          percentage: 0,
          direction: 'neutral' as const
        },
        icon: Plane,
        color: 'text-primary',
        loading: false
      },
      {
        title: t('reports.flightHours', 'Flight Hours'),
        value: formatDuration(flightAggregation.totalHours),
        subtitle: t('reports.totalTime', 'total time'),
        change: {
          value: 0,
          percentage: 0,
          direction: 'neutral' as const
        },
        icon: Clock,
        color: 'text-success',
        loading: false
      },
      {
        title: t('reports.uniqueAirports', 'Unique Airports'),
        value: flightAggregation.uniqueAirports,
        subtitle: t('reports.visited', 'visited'),
        change: {
          value: 0,
          percentage: 0,
          direction: 'neutral' as const
        },
        icon: MapPin,
        color: 'text-purple-600',
        loading: false
      },
      {
        title: t('reports.totalDistance', 'Total Distance'),
        value: `${(flightAggregation.totalDistance / 1000).toFixed(1)}k km`,
        subtitle: t('reports.flown', 'flown'),
        change: {
          value: 0,
          percentage: 0,
          direction: 'neutral' as const
        },
        icon: DollarSign,
        color: 'text-emerald-600',
        loading: false
      },
      {
        title: t('reports.averageDuration', 'Average Duration'),
        value: formatDuration(flightAggregation.averageDuration),
        subtitle: t('reports.perFlight', 'per flight'),
        change: {
          value: 0,
          percentage: 0,
          direction: 'neutral' as const
        },
        icon: Wrench,
        color: 'text-orange-600',
        loading: false
      },
      {
        title: t('reports.completionRate', 'Completion Rate'),
        value: `${flightAggregation.completionRate.toFixed(1)}%`,
        subtitle: t('reports.successful', 'successful'),
        change: {
          value: 0,
          percentage: 0,
          direction: flightAggregation.completionRate >= 90 ? 'up' : 'neutral' as const
        },
        icon: Target,
        color: 'text-indigo-600',
        loading: false
      }
    ];
  }, [flightAggregation, t, loading]);

  const renderChangeIndicator = (change: QuickStatCard['change']) => {
    if (!change) return null;

    const isPositive = change.direction === 'up';
    const isNegative = change.direction === 'down';
    
    return (
      <div className={cn(
        "flex items-center gap-1 text-xs font-medium",
        isPositive && "text-success",
        isNegative && "text-destructive",
        change.direction === 'neutral' && "text-muted-foreground"
      )}>
        {isPositive && <TrendingUp className="h-3 w-3" />}
        {isNegative && <TrendingDown className="h-3 w-3" />}
        {change.direction === 'neutral' && <Activity className="h-3 w-3" />}
        <span>
          {isPositive && '+'}
          {change.percentage.toFixed(1)}%
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {t('reports.quickOverview', 'Quick Overview')}
        </h2>
        <Badge variant="outline" className="text-xs">
          {loading ? t('reports.loading', 'Loading...') : t('reports.realTimeData', 'Real-time data')}
        </Badge>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-sm text-destructive">
            {t('reports.errorLoadingData', 'Error loading data')}: {error.message}
          </p>
        </div>
      )}

      {/* Desktop Grid */}
      <div className="hidden lg:grid lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {quickStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={cn("h-4 w-4", stat.color)} />
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-2xl font-bold">
                  {stat.loading ? (
                    <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                  ) : (
                    stat.value
                  )}
                </div>
                <div className="flex items-center justify-between">
                  {stat.subtitle && (
                    <p className="text-xs text-muted-foreground">
                      {stat.subtitle}
                    </p>
                  )}
                  {renderChangeIndicator(stat.change)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tablet Grid */}
      <div className="hidden md:grid lg:hidden md:grid-cols-2 gap-4">
        {quickStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={cn("h-4 w-4", stat.color)} />
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-2xl font-bold">
                  {stat.loading ? (
                    <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                  ) : (
                    stat.value
                  )}
                </div>
                <div className="flex items-center justify-between">
                  {stat.subtitle && (
                    <p className="text-xs text-muted-foreground">
                      {stat.subtitle}
                    </p>
                  )}
                  {renderChangeIndicator(stat.change)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mobile Carousel */}
      <div className="md:hidden">
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
          {quickStats.map((stat, index) => (
            <Card 
              key={index} 
              className="flex-shrink-0 w-64 hover:shadow-md transition-shadow snap-start"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="text-2xl font-bold">
                    {stat.loading ? (
                      <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                    ) : (
                      stat.value
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    {stat.subtitle && (
                      <p className="text-xs text-muted-foreground">
                        {stat.subtitle}
                      </p>
                    )}
                    {renderChangeIndicator(stat.change)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};