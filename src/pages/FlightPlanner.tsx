import React from 'react';
import { useTranslation } from 'react-i18next';
import FlightPlanner from '../components/tools/FlightPlanner';

const FlightPlannerPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header da página */}
        <div className="mb-6">
          <div className="hud-card p-6">
            <div className="flex items-center space-x-4">
              <div className="hud-scan w-4 h-4 rounded-full bg-blue-400"></div>
              <div>
                <h1 className="hud-title text-2xl font-bold mb-2">
                  {t('navigation.flightPlanner')}
                </h1>
                <p className="hud-sub text-blue-300">
                  {t('flightPlanner.description')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Componente FlightPlanner */}
        <FlightPlanner />
      </div>
    </div>
  );
};

export default FlightPlannerPage;