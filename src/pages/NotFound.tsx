import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Home, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    // Error tracking without console output
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center fade-in">
        <div className="hud-display stats-card p-8 max-w-md mx-auto">
          <AlertTriangle className="h-16 w-16 text-warning mx-auto mb-6 icon-hover pulse-glow" />
          <h1 className="text-4xl font-bold mb-4 gradient-title">404</h1>
          <h2 className="text-xl text-foreground mb-2">{t('notFound.title')}</h2>
          <p className="text-muted-foreground mb-6">{t('notFound.subtitle')}</p>
          <Button 
            variant="hud" 
            className="quick-action-card"
            onClick={() => window.location.href = '/'}
          >
            <Home className="h-4 w-4 mr-2 quick-action-icon" />
            {t('notFound.backHome')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;