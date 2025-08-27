import { Trophy, TrendingUp, Star, Medal } from "lucide-react";
import { useTranslation } from "react-i18next";

const Ranking = () => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="flex flex-col gap-2 fade-in">
        <h1 className="text-3xl font-bold tracking-tight gradient-title">
          {t('ranking.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('ranking.subtitle')}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="hud-display stats-card fade-in p-6" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="h-6 w-6 text-accent icon-hover" />
            <h3 className="text-lg font-semibold text-foreground">Personal Best</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg flight-item">
              <div>
                <p className="font-medium text-foreground">Best Landing Rate</p>
                <p className="text-sm text-muted-foreground">Pouso mais suave</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-success font-mono">-45 fpm</p>
                <p className="text-xs text-muted-foreground">EGLL RWY 09L</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg flight-item">
              <div>
                <p className="font-medium text-foreground">Longest Flight</p>
                <p className="text-sm text-muted-foreground">Recorde de distância</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary font-mono">8,247 nm</p>
                <p className="text-xs text-muted-foreground">KJFK → VHHH</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg flight-item">
              <div>
                <p className="font-medium text-foreground">Perfect Flights</p>
                <p className="text-sm text-muted-foreground">Sem penalidades</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-accent font-mono">23</p>
                <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
              </div>
            </div>
          </div>
        </div>

        <div className="hud-display chart-container fade-in p-6" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="h-6 w-6 text-primary icon-hover" />
            <h3 className="text-lg font-semibold text-foreground">Global Leaderboard</h3>
          </div>
          
          <div className="text-center py-8">
            <Medal className="h-12 w-12 text-muted-foreground mx-auto mb-4 icon-hover pulse-glow" />
            <h4 className="text-lg font-semibold text-foreground mb-2">Leaderboard em Breve</h4>
            <p className="text-muted-foreground">
              Conecte-se com outros pilotos e compare suas conquistas no leaderboard global.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ranking;