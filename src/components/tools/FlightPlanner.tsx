import React, { useState } from 'react';
import { ExternalLink, Maximize2, Minimize2, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface FlightPlannerProps {
  className?: string;
}

const FlightPlanner: React.FC<FlightPlannerProps> = ({ className = '' }) => {
  const { t } = useTranslation();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [key, setKey] = useState(0);

  const handleRefresh = () => {
    setIsLoading(true);
    setKey(prev => prev + 1);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const openExternal = () => {
    window.open('https://planner.flightsimulator.com/', '_blank');
  };

  return (
    <div className={`flight-planner-container ${isFullscreen ? 'fullscreen' : ''} ${className}`}>
      {/* Header com controles */}
      <div className="hud-card mb-4">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="hud-scan w-3 h-3 rounded-full bg-success"></div>
            <h2 className="hud-title text-xl font-bold">
              {t('navigation.flightPlanner')}
            </h2>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              className="hud-button p-2 rounded-lg transition-all duration-200 hover:bg-primary/20"
              title={t('common.refresh')}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            
            <button
              onClick={toggleFullscreen}
              className="hud-button p-2 rounded-lg transition-all duration-200 hover:bg-primary/20"
              title={isFullscreen ? t('common.minimize') : t('common.maximize')}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            
            <button
              onClick={openExternal}
              className="hud-button p-2 rounded-lg transition-all duration-200 hover:bg-primary/20"
              title={t('common.openExternal')}
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Container do iframe */}
      <div className="hud-card relative overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 z-10">
            <div className="text-center">
              <div className="hud-scan w-8 h-8 rounded-full bg-blue-400 mx-auto mb-4 animate-pulse"></div>
              <p className="hud-sub text-muted-foreground">{t('common.loading')}...</p>
            </div>
          </div>
        )}
        
        <iframe
          key={key}
          src="https://planner.flightsimulator.com/"
          className="w-full h-[calc(100vh-200px)] border-0 rounded-lg"
          onLoad={handleLoad}
          title="Microsoft Flight Simulator - Flight Planner"
          allow="geolocation; microphone; camera; storage-access; cross-origin-isolated"
        />
      </div>
    </div>
  );
};

export default FlightPlanner;