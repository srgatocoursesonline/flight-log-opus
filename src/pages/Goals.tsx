import { Target, Plus, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { autoRefresh } from "@/utils/autoRefresh";

const Goals = () => {
  const { t } = useTranslation();
  
  const handleSetNewGoal = () => {
    // TODO: Implementar nova meta
    console.log('Set new goal - TODO');
  };
  
  return (
    <div className="mobile-container mobile-bottom-nav-padding mobile-page-layout">
      <div className="mobile-section mobile-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="mobile-title gradient-title">
              {t('goals.title')}
            </h1>
            <p className="mobile-subtitle">
              {t('goals.subtitle')}
            </p>
          </div>
          <Button variant="hud" className="icon-hover" onClick={handleSetNewGoal}>
            <Plus className="h-4 w-4 mr-2" />
            {t('goals.setNewGoal')}
          </Button>
        </div>
      </div>

      <div className="mobile-section">
        <div className="mobile-grid-2 gap-2 lg:gap-3">
          <div className="hud-display stats-card mobile-slide-up p-3 lg:p-4" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-3 mb-4">
              <Target className="h-6 w-6 text-primary icon-hover" />
              <h3 className="text-lg font-semibold text-foreground">{t('goals.activeGoals')}</h3>
            </div>
            
            <div className="space-y-4">
              <div className="p-3 bg-muted/20 rounded-lg border-l-4 border-primary quick-action-card">
                <div className="flex items-center justify-between mb-2 relative z-10">
                  <h4 className="font-medium text-foreground">{t('goals.reachCR100')}</h4>
                  <span className="text-sm text-primary font-medium">{t('goals.inProgress')}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3 relative z-10">
                  {t('goals.reachCR100Desc')}
                </p>
                <div className="flex items-center gap-2 relative z-10">
                  <div className="flex-1 bg-muted/50 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full transition-all duration-1000 pulse-glow" style={{ width: '94%' }}></div>
                  </div>
                  <span className="text-sm font-mono text-foreground">94/100</span>
                </div>
              </div>
              
              <div className="p-3 bg-muted/20 rounded-lg border-l-4 border-accent quick-action-card">
                <div className="flex items-center justify-between mb-2 relative z-10">
                  <h4 className="font-medium text-foreground">{t('goals.flightHours100')}</h4>
                  <span className="text-sm text-accent font-medium">{t('goals.inProgress')}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3 relative z-10">
                  {t('goals.flightHours100Desc')}
                </p>
                <div className="flex items-center gap-2 relative z-10">
                  <div className="flex-1 bg-muted/50 rounded-full h-2">
                    <div className="bg-accent h-2 rounded-full transition-all duration-1000" style={{ width: '72%' }}></div>
                  </div>
                  <span className="text-sm font-mono text-foreground">72/100</span>
                </div>
              </div>
            </div>
          </div>

          <div className="hud-display stats-card mobile-slide-up p-3 lg:p-4" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="h-6 w-6 text-success icon-hover" />
              <h3 className="text-lg font-semibold text-foreground">{t('goals.completedGoals')}</h3>
            </div>
            
            <div className="space-y-4">
              <div className="p-3 bg-success/10 rounded-lg border-l-4 border-success flight-item">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-foreground">{t('goals.firstSolo')}</h4>
                  <CheckCircle className="h-5 w-5 text-success icon-hover" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('goals.firstSoloDesc')}
                </p>
                <p className="text-xs text-success mt-2">{t('goals.completedAgo', { time: t('goals.monthsAgo', { count: 2 }) })}</p>
              </div>
              
              <div className="p-3 bg-success/10 rounded-lg border-l-4 border-success flight-item">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-foreground">{t('goals.atlanticCrossing')}</h4>
                  <CheckCircle className="h-5 w-5 text-success icon-hover" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('goals.atlanticCrossingDesc')}
                </p>
                <p className="text-xs text-success mt-2">{t('goals.completedAgo', { time: t('goals.weeksAgo', { count: 3 }) })}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Goals;