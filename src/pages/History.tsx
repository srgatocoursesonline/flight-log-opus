import { Button } from "@/components/ui/button";
import { Download, Calendar, Filter } from "lucide-react";
import { useTranslation } from "react-i18next";

const History = () => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-title">
            {t('history.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('history.subtitle')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="icon-hover">
            <Filter className="h-4 w-4 mr-2" />
            {t('common.filter')}
          </Button>
          <Button variant="outline" className="icon-hover">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="hud-display stats-card fade-in p-4" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-primary icon-hover" />
            <div>
              <p className="text-sm text-muted-foreground">Esta Semana</p>
              <p className="font-semibold text-foreground">5 voos</p>
            </div>
          </div>
        </div>
        <div className="hud-display stats-card fade-in p-4" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-accent icon-hover" />
            <div>
              <p className="text-sm text-muted-foreground">Este Mês</p>
              <p className="font-semibold text-foreground">18 voos</p>
            </div>
          </div>
        </div>
        <div className="hud-display stats-card fade-in p-4" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-success icon-hover" />
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="font-semibold text-foreground">127 voos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="hud-display chart-container fade-in p-6" style={{ animationDelay: '0.4s' }}>
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 icon-hover" />
          <h3 className="text-lg font-semibold text-foreground mb-2">{t('history.noHistory')}</h3>
          <p className="text-muted-foreground">
            {t('history.noHistoryDesc')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default History;