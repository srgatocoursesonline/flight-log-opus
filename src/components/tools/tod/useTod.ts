import { useMemo, useState } from 'react';
import { computeTod } from './computeTod';
import type { TodInputs, TodOutputs } from './types';

/**
 * Hook customizado para gerenciar o estado e cálculos do TOD Calculator
 * @param initial - Valores iniciais opcionais para os inputs
 * @returns Objeto com inputs, setInputs, outputs e error
 */
export function useTod(initial?: Partial<TodInputs>) {
  const [inputs, setInputs] = useState<TodInputs>({
    startAltFt: 10000,
    endAltFt: 2500,
    startKt: 165,
    endKt: 100,
    windKt: 0,
    ...initial
  });
  
  const [error, setError] = useState<string | null>(null);

  const outputs: TodOutputs | null = useMemo(() => {
    try {
      setError(null);
      return computeTod(inputs);
    } catch (e: any) {
      setError(e.message);
      return null;
    }
  }, [inputs]);

  /**
   * Atualiza os inputs parcialmente
   * @param partialInputs - Inputs parciais para atualizar
   */
  const updateInputs = (partialInputs: Partial<TodInputs>) => {
    setInputs(prev => ({ ...prev, ...partialInputs }));
  };

  /**
   * Reseta os inputs para os valores padrão
   */
  const resetInputs = () => {
    setInputs({
      startAltFt: 10000,
      endAltFt: 2500,
      startKt: 165,
      endKt: 100,
      windKt: 0,
      ...initial
    });
  };

  return {
    inputs,
    setInputs,
    updateInputs,
    resetInputs,
    outputs,
    error
  };
}