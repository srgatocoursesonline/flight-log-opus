import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { RotateCcw, Calculator } from 'lucide-react';
import { InputsPanel } from './InputsPanel';
import { OutputsPanel } from './OutputsPanel';
import { Checklist } from './Checklist';
import { useTod } from './useTod';
import type { TodCalculatorProps } from './types';

/**
 * Componente principal do TOD Calculator
 * Calcula parâmetros de descida (Top of Descent) para aviação
 */
export function TodCalculator({ className }: TodCalculatorProps) {
  const { inputs, updateInputs, resetInputs, outputs, error } = useTod();

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calculator className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">
                  TOD Calculator
                </CardTitle>
                <p className="text-muted-foreground">
                  Calculadora de Top of Descent para planejamento de voo
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={resetInputs}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• <strong>Glideslope padrão:</strong> 3° (padrão ICAO)</p>
            <p>• <strong>Cálculos:</strong> Baseados em fórmulas de navegação aérea</p>
            <p>• <strong>Uso:</strong> Educacional e planejamento aproximado</p>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <InputsPanel
          value={inputs}
          onChange={updateInputs}
          error={error}
        />
        
        {/* Outputs */}
        <OutputsPanel outputs={outputs} />
      </div>

      <Separator />

      {/* Checklist */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <Checklist inputs={inputs} outputs={outputs} />
        </div>
        
        {/* Info Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Como Funciona</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-semibold mb-1">Fórmulas Principais:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• GS média = (Start + End)/2 + Wind</li>
                  <li>• D_base = Δh / (tan 3° × 6076)</li>
                  <li>• D_decel = 1nm/10kts reduzidos</li>
                  <li>• TOP = round(D_base + D_decel)</li>
                  <li>• VS ≈ 5,3 × GS média</li>
                  <li>• Tempo = 60 × TOP / GS</li>
                </ul>
              </div>
              
              <Separator />
              
              <div>
                <p className="font-semibold mb-1">Considerações:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Glideslope fixo em 3°</li>
                  <li>• Não considera turbulência</li>
                  <li>• Valores aproximados</li>
                  <li>• Para uso educacional</li>
                </ul>
              </div>
              
              <Separator />
              
              <div>
                <p className="font-semibold mb-1">Dicas de Uso:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Sempre confirme com ATC</li>
                  <li>• Considere performance da aeronave</li>
                  <li>• Monitore condições meteorológicas</li>
                  <li>• Use como referência inicial</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              <strong>Aviso:</strong> Cálculos aproximados para uso educacional.
              Sempre consulte procedimentos oficiais da aeronave e instruções do ATC.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default TodCalculator;