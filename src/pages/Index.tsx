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
  const { greeting, isLoading: greetingLoading } = useGreeting();
  const stats = getFlightStats();
  
  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="flex flex-col gap-2 fade-in">
        <h1 className="text-3xl font-bold tracking-tight gradient-title">
          {t('dashboard.title')}
        </h1>
        <p className="text-muted-foreground">
          {greetingLoading ? 'Carregando...' : t('dashboard.subtitle', { greeting })}
        </p>
      </div>



      {/* Key Performance Indicators */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <CareerRatingCard />
        <StatsCard
          title={t('dashboard.totalFlights')}
          value={stats.totalFlights.toString()}
          subtitle={t('dashboard.thisMonth', { count: Math.floor(stats.totalFlights * 0.15) })}
          icon={<Plane className="h-6 w-6" />}
          trend={{ value: 12.3, isPositive: true }}
        />
        <StatsCard
          title={t('dashboard.flightHours')}
          value={stats.totalFlightTime.toString()}
          subtitle={t('dashboard.last30Days')}
          icon={<Clock className="h-6 w-6 text-foreground" />}
          trend={{ value: 8.1, isPositive: true }}
        />
        <StatsCard
          title={t('dashboard.totalCR')}
          value={stats.totalCR.toString()}
          subtitle={t('dashboard.accumulatedPoints')}
          icon={<Trophy className="h-6 w-6" />}
          trend={{ value: 15.4, isPositive: true }}
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <FlightChart />
        </div>
        <div>
          <RecentFlights />
        </div>
      </div>

      {/* MSFS Integration */}
      <div className="grid gap-6">
        <MSFSFlights limit={3} showHeader={true} showActions={false} />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="hud-display quick-action-card p-6 cursor-pointer" onClick={navigateToAddFlight}>
          <div className="flex items-center gap-3 relative z-10">
            <div className="rounded-lg bg-primary/10 p-3">
              <Plane className="h-6 w-6 text-primary quick-action-icon" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{t('quickActions.logNewFlight')}</h3>
              <p className="text-sm text-muted-foreground">{t('quickActions.logNewFlightDesc')}</p>
            </div>
          </div>
        </div>
        
        <div className="hud-display quick-action-card p-6 cursor-pointer">
          <div className="flex items-center gap-3 relative z-10">
            <div className="rounded-lg bg-accent/10 p-3">
              <TrendingUp className="h-6 w-6 text-accent quick-action-icon" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{t('quickActions.viewAnalytics')}</h3>
              <p className="text-sm text-muted-foreground">{t('quickActions.viewAnalyticsDesc')}</p>
            </div>
          </div>
        </div>
        
        <div className="hud-display quick-action-card p-6 cursor-pointer">
          <div className="flex items-center gap-3 relative z-10">
            <div className="rounded-lg bg-success/10 p-3">
              <Users className="h-6 w-6 text-success quick-action-icon" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{t('quickActions.leaderboard')}</h3>
              <p className="text-sm text-muted-foreground">{t('quickActions.leaderboardDesc')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
