import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ExternalLink, Clipboard, Save, Plane, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const FlightPlannerPage: React.FC = () => {
  const { t } = useTranslation();
  const [notes, setNotes] = useState('');
  const [routeString, setRouteString] = useState('');

  const handleOpenPlanner = () => {
    window.open('https://planner.flightsimulator.com/', '_blank');
  };

  const handleSaveNotes = () => {
    // TODO: Implementar persistência das notas
    console.log('Notas salvas:', { notes, routeString });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="hud-card p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="hud-scan w-4 h-4 rounded-full bg-blue-400"></div>
              <div>
                <h1 className="hud-title text-2xl font-bold">
                  {t('navigation.flightPlanner')}
                </h1>
                <p className="hud-sub text-blue-300">
                  Workspace de Planejamento de Voo
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Principal - Acesso ao Planner */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-slate-800 border-slate-700 text-slate-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plane className="h-5 w-5 text-blue-400" />
                  Ferramenta Oficial
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Microsoft Flight Simulator Planner
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert variant="default" className="bg-blue-900/50 border-blue-800 text-blue-100">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Integração Externa Necessária</AlertTitle>
                  <AlertDescription>
                    Devido às políticas de segurança da Microsoft (proteção de login), o planejador oficial não pode ser carregado dentro do aplicativo. Utilize o botão abaixo para abrir em uma janela segura.
                  </AlertDescription>
                </Alert>

                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-700 rounded-lg bg-slate-900/50">
                  <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mb-4">
                    <Plane className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Iniciar Planejamento</h3>
                  <p className="text-slate-400 text-center max-w-md mb-6">
                    Acesse o planejador oficial para criar rotas, calcular combustível e verificar o clima.
                  </p>
                  <Button 
                    size="lg" 
                    onClick={handleOpenPlanner}
                    className="bg-blue-600 hover:bg-blue-700 min-w-[200px]"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Abrir MSFS Planner
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Alternativa Embutida (SkyVector - Exemplo) */}
            <Card className="bg-slate-800 border-slate-700 text-slate-100 overflow-hidden">
               <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">
                  Visualização Rápida (SkyVector)
                </CardTitle>
              </CardHeader>
              <div className="aspect-video w-full bg-slate-900 relative">
                 <iframe 
                   src="https://skyvector.com/"
                   className="w-full h-full border-0 opacity-80 hover:opacity-100 transition-opacity"
                   title="SkyVector Map"
                   sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                 />
                 <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 text-xs text-center text-gray-400 pointer-events-none">
                   SkyVector.com Integration
                 </div>
              </div>
            </Card>
          </div>

          {/* Coluna Lateral - Notas e Dados */}
          <div className="space-y-6">
            <Card className="bg-slate-800 border-slate-700 text-slate-100 h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clipboard className="h-5 w-5 text-green-400" />
                  Dados do Voo
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Registre os dados gerados no planner
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="route">Rota (String)</Label>
                  <Input 
                    id="route" 
                    placeholder="Ex: SBGR UW24 SCEL" 
                    value={routeString}
                    onChange={(e) => setRouteString(e.target.value)}
                    className="bg-slate-900 border-slate-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notas Operacionais</Label>
                  <Textarea 
                    id="notes" 
                    placeholder="Metar, Combustível, Alternativas..." 
                    className="min-h-[300px] bg-slate-900 border-slate-600 font-mono text-sm"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <Button onClick={handleSaveNotes} className="w-full bg-green-600 hover:bg-green-700">
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Rascunho
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightPlannerPage;
