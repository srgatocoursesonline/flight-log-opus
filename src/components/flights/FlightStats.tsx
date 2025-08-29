import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Plane, Clock, Route, Star } from 'lucide-react';
import { useSupabaseFlights } from '@/hooks/useSupabaseFlights';

export const FlightStats = () => {
  const { t } = useTranslation();
  const { getFlightStats } = useSupabaseFlights();
  const stats = getFlightStats();

  const statCards = [
    {
      title: 'Total de Voos',
      value: stats.totalFlights,
      icon: Plane,
      color: 'text-primary',
      bgColor: 'bg-primary/20'
    },
    {
      title: 'Horas de Voo',
      value: `${stats.totalFlightTime}h`,
      icon: Clock,
      color: 'text-accent',
      bgColor: 'bg-accent/20'
    },
    {
      title: 'Distância Total',
      value: `${stats.totalDistance.toLocaleString()} nm`,
      icon: Route,
      color: 'text-success',
      bgColor: 'bg-success/20'
    },
    {
      title: 'CR Médio',
      value: stats.averageRating,
      icon: Star,
      color: 'text-warning',
      bgColor: 'bg-warning/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat, index) => (
        <Card key={stat.title} className="hud-display stats-card fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-lg font-bold text-foreground font-mono">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};