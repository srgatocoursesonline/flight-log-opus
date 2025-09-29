import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Copy, CheckCircle2, Clock, Plane } from 'lucide-react';
import { toast } from 'sonner';
import { computeSpeedGates } from './computeTod';
import type { TodInputs, TodOutputs } from './types';

interface ChecklistProps {
  inputs: TodInputs;
  outputs: TodOutputs | null;
}

function formatNm(n: number): string { return `${n} nm`; }
function formatFpm(n: number): string { return `${n} fpm`; }
function formatKt(n: number): string { return `${n} kts`; }
function formatFt(n: number): string { return `${n} ft`; }

export function Checklist({ inputs, outputs }: ChecklistProps) {
  const gates = useMemo(() => computeSpeedGates(inputs.startKt, inputs.endKt), [inputs]);
  
  const checklistText = useMemo(() => {
    if (!outputs) {
      return "Preencha os parâmetros de entrada para gerar a checklist.";
    }
    
    const lines = [
      "CHECKLIST PERSONALIZADA — TOD (Top of Descent)",
      "",
      `1) ANTES DO TOD (~${formatNm(outputs.topNm)}):`,
      `   • Selecionar ALTITUDE ALVO: ${formatFt(inputs.endAltFt)}`,
      `   • Pré-ajustar VS para: -${formatFpm(outputs.verticalSpeedFpm)} (não ativar ainda)`,
      `   • Se usar AutoThrottle: preparar redução de velocidade`,
      "",
      `2) NO TOD (distância = ${formatNm(outputs.topNm)} do ponto alvo):`,
      `   • Ativar modo VS e confirmar -${formatFpm(outputs.verticalSpeedFpm)}`,
      `   • Manter NAV/HDG conforme plano de voo`,
      "",
      `3) VELOCIDADE (marcos sugeridos):`,
      ...gates.map((g, i) => `   • Gate ${i + 1}: ${formatKt(g)}`),
      "",
      `4) POTÊNCIA:`,
      `   • Com A/T: usar IAS target e deixar o sistema gerenciar`,
      `   • Sem A/T: reduzir potência gradualmente para sustentar a descida`,
      "",
      `5) CHEGANDO A ${formatFt(inputs.endAltFt)}:`,
      `   • Estar por volta de ${formatKt(inputs.endKt)}`,
      `   • Preparar segmento seguinte (aproximação/procedimento)`,
      "",
      `Tempo estimado de descida: ~${outputs.estimatedTimeMin} min`,
      `Velocidade média (GS): ${outputs.gsAvg} kts`
    ];
    
    return lines.join("\n");
  }, [inputs, outputs, gates]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(checklistText);
      toast.success('Checklist copiada para a área de transferência!');
    } catch (error) {
      toast.error('Erro ao copiar checklist');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span className="text-primary">✈️</span>
            Checklist Personalizada (AP + A/T)
          </CardTitle>
          {outputs && (
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copiar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {outputs ? (
          <>
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-semibold text-blue-900 dark:text-blue-100">
                    Antes do TOD (~{outputs.topNm} nm)
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Selecionar ALT {inputs.endAltFt} ft, pré-ajustar VS -{outputs.verticalSpeedFpm} fpm
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                <Plane className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900 dark:text-green-100">
                    No TOD (distância = {outputs.topNm} nm)
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Ativar VS, confirmar -{outputs.verticalSpeedFpm} fpm, manter NAV/HDG
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-semibold flex items-center gap-2">
                  <Badge variant="secondary">Velocidade</Badge>
                  Marcos sugeridos:
                </div>
                <div className="flex flex-wrap gap-2">
                  {gates.map((g, i) => (
                    <Badge key={i} variant="outline" className="text-sm">
                      Gate {i + 1}: {g} kts
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <p className="font-semibold">Potência:</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Com A/T: usar IAS target</li>
                    <li>• Sem A/T: reduzir gradualmente</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold">Em {inputs.endAltFt} ft:</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Estabilizar em {inputs.endKt} kts</li>
                    <li>• Preparar próximo segmento</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    Tempo estimado: ~{outputs.estimatedTimeMin} min
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Preencha os parâmetros de entrada para gerar a checklist</p>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <p><strong>Nota:</strong> Esta checklist é baseada em cálculos aproximados para uso educacional.</p>
          <p>Sempre consulte os procedimentos oficiais da aeronave e ATC.</p>
        </div>
      </CardContent>
    </Card>
  );
}