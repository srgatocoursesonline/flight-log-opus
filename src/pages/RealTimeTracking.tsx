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
import LiveTrackingMap from '@/components/maps/LiveTrackingMap';

export default function RealTimeTracking() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-6 pt-8 pb-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mobile-title gradient-title flex items-center gap-2">
              <Activity className="h-8 w-8" />
              {t('realtime.title')}
            </h1>
            <p className="text-muted-foreground mt-2">
              {t('realtime.subtitle')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              {t('settings.title')}
            </Button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="stats-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Radio className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium">{t('realtime.connection')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('realtime.connectionDesc')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stats-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Plane className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium">{t('realtime.integration')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('realtime.integrationDesc')}
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
                  <p className="font-medium">{t('realtime.autoSave')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('realtime.autoSaveDesc')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Instruções de Setup */}
      <Card className="chart-container">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            {t('realtime.howToUse')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">{t('realtime.preparation')}</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {(t('realtime.preparationSteps', { returnObjects: true }) as string[]).map((step, i) => (
                    <li key={i}>• {step}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">{t('realtime.tracking')}</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {(t('realtime.trackingSteps', { returnObjects: true }) as string[]).map((step, i) => (
                    <li key={i}>• {step}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <Info className="h-4 w-4 text-blue-600" />
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Dica:</strong> {t('realtime.tip')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Componente Principal de Tracking */}
      <LiveTrackingMap autoConnect={true} />

      {/* Links Úteis */}
      <Card className="chart-container">
        <CardHeader>
          <CardTitle>{t('realtime.usefulLinks')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="justify-start" asChild>
              <a href="/flights/msfs" className="flex items-center gap-2">
                <Plane className="h-4 w-4" />
                {t('realtime.msfsHistory')}
                <ExternalLink className="h-3 w-3 ml-auto" />
              </a>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <a href="http://localhost:3001/health" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                {t('realtime.serviceStatus')}
                <ExternalLink className="h-3 w-3 ml-auto" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}