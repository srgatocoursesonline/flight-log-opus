import { 
  Clock, 
  Plane, 
  TrendingUp, 
  Trophy,
  Timer,
  Users,
  Star
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { FlightChart } from "@/components/dashboard/FlightChart";
import { RecentFlights } from "@/components/dashboard/RecentFlights";

const Index = () => {
  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
          Flight Operations Center
        </h1>
        <p className="text-muted-foreground">
          Welcome back, Captain. Your career progression overview.
        </p>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Career Rating"
          value="94"
          subtitle="Excellent performance"
          icon={<Star className="h-6 w-6" />}
          trend={{ value: 5.2, isPositive: true }}
        />
        <StatsCard
          title="Total Flights"
          value="127"
          subtitle="This month: 18"
          icon={<Plane className="h-6 w-6" />}
          trend={{ value: 12.3, isPositive: true }}
        />
        <StatsCard
          title="Flight Hours"
          value="348"
          subtitle="Last 30 days"
          icon={<Clock className="h-6 w-6" />}
          trend={{ value: 8.1, isPositive: true }}
        />
        <StatsCard
          title="World Ranking"
          value="#1,247"
          subtitle="Top 15%"
          icon={<Trophy className="h-6 w-6" />}
          trend={{ value: 2.8, isPositive: false }}
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

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="hud-display p-6 cursor-pointer hover:bg-muted/20 transition-colors">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-3">
              <Plane className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Log New Flight</h3>
              <p className="text-sm text-muted-foreground">Record your latest mission</p>
            </div>
          </div>
        </div>
        
        <div className="hud-display p-6 cursor-pointer hover:bg-muted/20 transition-colors">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-accent/10 p-3">
              <TrendingUp className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">View Analytics</h3>
              <p className="text-sm text-muted-foreground">Detailed performance metrics</p>
            </div>
          </div>
        </div>
        
        <div className="hud-display p-6 cursor-pointer hover:bg-muted/20 transition-colors">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-success/10 p-3">
              <Users className="h-6 w-6 text-success" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Leaderboard</h3>
              <p className="text-sm text-muted-foreground">Compare with other pilots</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
