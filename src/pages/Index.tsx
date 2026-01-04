import {
  Clock,
  Plane,
  TrendingUp,
  Trophy,
  Timer,
  Users,
  Star,
  AlertTriangle
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { FlightChart } from "@/components/dashboard/FlightChart";
import { RecentFlights } from "@/components/dashboard/RecentFlights";
import { CareerRatingCard } from "@/components/dashboard/CareerRatingCard";
import { MSFSFlights } from "@/components/dashboard/MSFSFlights";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useFlightNavigation } from "@/hooks/business/useFlightNavigation";
import { useSupabaseFlights } from "@/hooks/supabase/useSupabaseFlights";
import { useGreeting } from "@/hooks/useGreeting";

const Index = () => {
  const { t } = useTranslation();
  const { navigateToAddFlight } = useFlightNavigation();
  const { getFlightStats } = useSupabaseFlights();
  const { displayName, isLoading: greetingLoading, greeting } = useGreeting();
  const stats = getFlightStats();

  return (
    <div className="mobile-section">
      <div className="mobile-fade-in">
        <h1 className="mobile-title gradient-title">
          {t('dashboard.title')}
        </h1>
        <p className="mobile-subtitle">
          {greetingLoading ? t('common.loading') : `${greeting}, ${displayName}!`}
        </p>
      </div>

      {/* Key Performance Indicators */}
      <div className="mobile-section">
        <div className="mobile-grid-4">
          <div className="mobile-slide-up">
            <CareerRatingCard />
          </div>
          <div className="mobile-slide-up" style={{ animationDelay: '100ms' }}>
            <StatsCard
              title={t('dashboard.totalFlights')}
              value={stats.totalFlights}
              subtitle={t('dashboard.thisMonth', { count: Math.floor(stats.totalFlights * 0.15) })}
              icon={<Plane className="h-6 w-6" />}
              trend={{ value: 12.3, isPositive: true }}
              valueColor="text-gray-900 dark:text-white"
            />
          </div>
          <div className="mobile-slide-up" style={{ animationDelay: '200ms' }}>
            <StatsCard
              title={t('dashboard.flightHours')}
              value={stats.totalFlightTime}
              subtitle={t('dashboard.last30Days')}
              icon={<Clock className="h-6 w-6 text-blue-600" />}
              trend={{ value: 8.1, isPositive: true }}
              valueColor="text-gray-900 dark:text-white"
            />
          </div>
          <div className="mobile-slide-up" style={{ animationDelay: '300ms' }}>
            <StatsCard
              title={t('dashboard.totalCR')}
              value={stats.totalCR}
              subtitle={t('dashboard.accumulatedPoints')}
              icon={<Trophy className="h-6 w-6 text-blue-600" />}
              trend={{ value: 15.4, isPositive: true }}
              valueColor="text-green-500"
            />
          </div>
        </div>
      </div>

      {/* Charts and Activity */}
      <div className="mobile-section">
        <div className="mobile-grid-1 lg:grid-cols-3 lg:gap-6">
          <div className="lg:col-span-2 mobile-slide-up" style={{ animationDelay: '400ms' }}>
            <FlightChart />
          </div>
          <div className="mobile-slide-up" style={{ animationDelay: '500ms' }}>
            <RecentFlights />
          </div>
        </div>
      </div>

      {/* MSFS Integration */}
      <div className="mobile-section">
        <div className="mobile-slide-up" style={{ animationDelay: '600ms' }}>
          <MSFSFlights limit={3} showHeader={true} showActions={false} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mobile-section">
        <div className="mobile-grid-3">
          <div className="mobile-card mobile-slide-up cursor-pointer hover:shadow-lg transition-all duration-200" style={{ animationDelay: '700ms' }} onClick={navigateToAddFlight}>
            <div className="flex items-center gap-3 relative z-10">
              <div className="rounded-lg bg-primary/10 p-2">
                <Plane className="h-5 w-5 text-primary quick-action-icon" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">{t('quickActions.logNewFlight')}</h3>
                <p className="text-xs text-muted-foreground">{t('quickActions.logNewFlightDesc')}</p>
              </div>
            </div>
          </div>

          <div className="mobile-card mobile-slide-up cursor-pointer hover:shadow-lg transition-all duration-200" style={{ animationDelay: '800ms' }}>
            <div className="flex items-center gap-3 relative z-10">
              <div className="rounded-lg bg-accent/10 p-2">
                <TrendingUp className="h-5 w-5 text-accent quick-action-icon" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">{t('quickActions.viewAnalytics')}</h3>
                <p className="text-xs text-muted-foreground">{t('quickActions.viewAnalyticsDesc')}</p>
              </div>
            </div>
          </div>

          <div className="mobile-card mobile-slide-up cursor-pointer hover:shadow-lg transition-all duration-200" style={{ animationDelay: '900ms' }}>
            <div className="flex items-center gap-3 relative z-10">
              <div className="rounded-lg bg-success/10 p-2">
                <Users className="h-5 w-5 text-success quick-action-icon" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">{t('quickActions.leaderboard')}</h3>
                <p className="text-xs text-muted-foreground">{t('quickActions.leaderboardDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
