import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TrendingDown, Clock, Gauge, Target } from 'lucide-react';
import type { TodOutputs } from './types';

interface OutputsPanelProps {
  outputs: TodOutputs | null;
}

export function OutputsPanel({ outputs }: OutputsPanelProps) {
  const createOutputCard = (
    icon: React.ReactNode,
    label: string,
    value: string,
    unit: string,
    colorClass: string = 'text-primary'
  ) => (
    <div className="flex items-center space-x-3 p-3 rounded-lg border bg-card/50">
      <div className={`${colorClass} flex-shrink-0`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-muted-foreground truncate">{label}</p>
        <div className="flex items-baseline gap-1">
          <span className={`text-2xl font-bold ${colorClass}`}>{value}</span>
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>
      </div>
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-primary">📈</span>
          Resultados Calculados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {outputs ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {createOutputCard(
                <Target className="h-5 w-5" />,
                'Glideslope',
                outputs.glideslopeDeg.toString(),
                '°',
                'text-blue-600'
              )}
              {createOutputCard(
                <TrendingDown className="h-5 w-5" />,
                'Velocidade Vertical',
                outputs.verticalSpeedFpm.toString(),
                'fpm',
                'text-red-500'
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {createOutputCard(
                <Gauge className="h-5 w-5" />,
                'TOP (Distância)',
                outputs.topNm.toString(),
                'nm',
                'text-purple-600'
              )}
              {createOutputCard(
                <Clock className="h-5 w-5" />,
                'Tempo Estimado',
                outputs.estimatedTimeMin.toString(),
                'min',
                'text-green-600'
              )}
            </div>

            <Separator />
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm font-medium">Velocidade Média (GS)</span>
              <Badge variant="secondary" className="text-base font-bold">
                {outputs.gsAvg} kts
              </Badge>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Preencha os parâmetros de entrada para ver os resultados</p>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <p><strong>Fórmulas utilizadas:</strong></p>
          <p>• GS média = (Inicial + Final)/2 + Vento</p>
          <p>• D_base = Δh / (tan 3° × 6076)</p>
          <p>• D_decel = max(0, (V_inicial - V_final)/10)</p>
          <p>• TOP = round(D_base + D_decel)</p>
          <p>• VS ≈ 5,3 × GS média</p>
        </div>
      </CardContent>
    </Card>
  );
}