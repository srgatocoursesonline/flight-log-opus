import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ExternalLink, AlertTriangle } from 'lucide-react';

const FlightPlannerPage: React.FC = () => {
  const { t } = useTranslation();

  const handleOpenPlanner = () => {
    window.open('https://planner.flightsimulator.com/', '_blank');
  };

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

        {/* Conteúdo do Flight Planner */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-slate-800 rounded-lg shadow-2xl p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-yellow-500/20 p-3 rounded-full">
                <AlertTriangle className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-white text-center mb-4">
              Acesso ao Flight Planner
            </h2>
            
            <p className="text-gray-300 text-center mb-6 leading-relaxed">
              O Flight Simulator Planner requer autenticação via conta Microsoft, 
              que não pode ser realizada através de um iframe por questões de segurança.
              Para acessar o planner completo, clique no botão abaixo para abrir em uma nova aba.
            </p>

            <div className="text-center">
              <Button
                onClick={handleOpenPlanner}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Abrir Flight Planner
              </Button>
            </div>

            <div className="mt-6 text-sm text-gray-400 text-center">
              <p>Você será redirecionado para planner.flightsimulator.com</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            {t('flightPlanner.poweredBy')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FlightPlannerPage;