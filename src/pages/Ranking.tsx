import { Trophy, TrendingUp, Star, Medal } from "lucide-react";
import { useTranslation } from "react-i18next";

const Ranking = () => {
  const { t } = useTranslation();
  
  return (
    <div className="mobile-container mobile-bottom-nav-padding">
      <div className="mobile-section mobile-fade-in">
        <h1 className="mobile-title gradient-title">
          {t('ranking.title')}
        </h1>
        <p className="mobile-subtitle">
          {t('ranking.subtitle')}
        </p>
      </div>

      <div className="mobile-section">
        <div className="mobile-grid-2">
          <div className="hud-display stats-card mobile-slide-up p-3 lg:p-4" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="h-6 w-6 text-accent icon-hover" />
              <h3 className="text-lg font-semibold text-foreground">Personal Best</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg flight-item">
                <div>
                  <p className="font-medium text-foreground">Best Landing Rate</p>
                  <p className="text-sm text-readable-muted">Pouso mais suave</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-success font-mono">-45 fpm</p>
                  <p className="text-xs text-readable-muted">EGLL RWY 09L</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg flight-item">
                <div>
                  <p className="font-medium text-foreground">Longest Flight</p>
                  <p className="text-sm text-readable-muted">Recorde de distância</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary font-mono">8,247 nm</p>
                  <p className="text-xs text-readable-muted">KJFK → VHHH</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg flight-item">
                <div>
                  <p className="font-medium text-foreground">Perfect Flights</p>
                  <p className="text-sm text-readable-muted">Sem penalidades</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-accent font-mono">23</p>
                  <p className="text-xs text-readable-muted">Últimos 30 dias</p>
                </div>
              </div>
            </div>
          </div>

          <div className="hud-display chart-container mobile-slide-up p-3 lg:p-4" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="h-6 w-6 text-primary icon-hover" />
              <h3 className="text-lg font-semibold text-foreground">Global Leaderboard</h3>
            </div>
            
            <div className="text-center py-8">
              <Medal className="h-12 w-12 text-readable-muted mx-auto mb-4 icon-hover pulse-glow" />
              <h4 className="text-lg font-semibold text-foreground mb-2">Leaderboard em Breve</h4>
              <p className="text-readable-muted">
                Conecte-se com outros pilotos e compare suas conquistas no leaderboard global.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ranking;