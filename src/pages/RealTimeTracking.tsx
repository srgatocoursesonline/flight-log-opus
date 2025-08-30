import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  Plane,
  Radio,
  Settings,
  Info,
  ExternalLink
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import RealTimeTracker from '@/components/flight/RealTimeTracker';

export default function RealTimeTracking() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Activity className="h-8 w-8" />
              Tracking em Tempo Real
            </h1>
            <p className="text-muted-foreground mt-2">
              Monitore seus voos do MSFS 2024 em tempo real
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Radio className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium">Conexão WebSocket</p>
                  <p className="text-sm text-muted-foreground">
                    Dados em tempo real via ws://localhost:3002
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Plane className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium">MSFS 2024</p>
                  <p className="text-sm text-muted-foreground">
                    Integração via SimConnect
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-medium">Auto-Save</p>
                  <p className="text-sm text-muted-foreground">
                    Voos salvos automaticamente
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Instruções de Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Como Usar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">1. Preparação</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Inicie o MSFS 2024</li>
                  <li>• Execute o companion service</li>
                  <li>• Carregue uma aeronave no simulador</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">2. Tracking</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Os dados aparecem automaticamente</li>
                  <li>• Voos são detectados e salvos automaticamente</li>
                  <li>• Histórico disponível na página de voos</li>
                </ul>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <Info className="h-4 w-4 text-blue-600" />
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Dica:</strong> Mantenha esta página aberta durante o voo para monitorar em tempo real.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Componente Principal de Tracking */}
      <RealTimeTracker />

      {/* Links Úteis */}
      <Card>
        <CardHeader>
          <CardTitle>Links Úteis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="justify-start" asChild>
              <a href="/flights/msfs" className="flex items-center gap-2">
                <Plane className="h-4 w-4" />
                Histórico de Voos MSFS
                <ExternalLink className="h-3 w-3 ml-auto" />
              </a>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <a href="http://localhost:3003/status" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Status do Companion Service
                <ExternalLink className="h-3 w-3 ml-auto" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}