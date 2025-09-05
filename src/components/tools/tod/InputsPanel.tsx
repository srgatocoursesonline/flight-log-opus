import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import type { TodInputs } from './types';

interface InputsPanelProps {
  value: TodInputs;
  onChange: (partialInputs: Partial<TodInputs>) => void;
  error?: string | null;
}

export function InputsPanel({ value, onChange, error }: InputsPanelProps) {
  const createField = (
    id: keyof TodInputs,
    label: string,
    min: number,
    max: number,
    step: number = 1,
    unit?: string
  ) => (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label} {unit && <span className="text-muted-foreground">({unit})</span>}
      </Label>
      <Input
        id={id}
        type="number"
        step={step}
        min={min}
        max={max}
        value={value[id] as number}
        onChange={(e) => onChange({ [id]: Number(e.target.value) })}
        className={`transition-colors ${
          error ? 'border-destructive focus-visible:ring-destructive' : ''
        }`}
        placeholder={`${min} - ${max}`}
      />
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-primary">📊</span>
          Parâmetros de Entrada
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {createField('startAltFt', 'Altitude Inicial', 0, 60000, 100, 'ft')}
          {createField('endAltFt', 'Altitude Final', 0, 60000, 100, 'ft')}
          {createField('startKt', 'Velocidade Inicial', 40, 600, 1, 'kts')}
          {createField('endKt', 'Velocidade Final', 40, 600, 1, 'kts')}
        </div>
        
        <div className="w-full">
          {createField('windKt', 'Vento (+tailwind / -headwind)', -100, 100, 1, 'kts')}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Altitude inicial deve ser maior que a final</p>
          <p>• Velocidades devem ser positivas</p>
          <p>• Vento: valores positivos = tailwind, negativos = headwind</p>
        </div>
      </CardContent>
    </Card>
  );
}