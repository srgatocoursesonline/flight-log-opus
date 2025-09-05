import { TodInputs, TodOutputs } from './types';

/**
 * Calcula os parâmetros de descida TOD (Top of Descent)
 * @param inputs - Parâmetros de entrada para o cálculo
 * @returns Parâmetros calculados de descida
 * @throws Error se os parâmetros de entrada forem inválidos
 */
export function computeTod(inputs: TodInputs): TodOutputs {
  // Validações de entrada
  if (inputs.startAltFt <= inputs.endAltFt) {
    throw new Error('A altitude inicial deve ser maior que a final.');
  }
  
  if (inputs.startKt <= 0 || inputs.endKt <= 0) {
    throw new Error('As velocidades devem ser maiores que zero.');
  }

  // Constantes de cálculo
  const glideslopeDeg = 3; // Glideslope padrão de 3°
  const theta = Math.PI * glideslopeDeg / 180; // Conversão para radianos
  const tan = Math.tan(theta); // ≈0.0524078
  const dh = inputs.startAltFt - inputs.endAltFt; // Diferença de altitude em pés

  // Cálculo da velocidade média considerando vento
  const gsAvg = (inputs.startKt + inputs.endKt) / 2 + inputs.windKt;
  
  if (gsAvg <= 0) {
    throw new Error('Velocidade média inválida após considerar o vento.');
  }

  // Cálculos principais
  const dBase = dh / (tan * 6076); // Distância base em milhas náuticas
  const dDecel = Math.max(0, (inputs.startKt - inputs.endKt) / 10); // Distância extra para desaceleração
  const topNm = Math.round(dBase + dDecel); // TOP em milhas náuticas

  // Cálculo da velocidade vertical e tempo
  const vsFpm = Math.round(gsAvg * (6076 / 60) * tan); // Velocidade vertical em pés por minuto
  const tMin = Math.round((60 * topNm) / gsAvg); // Tempo estimado em minutos

  return {
    glideslopeDeg,
    verticalSpeedFpm: vsFpm,
    topNm,
    estimatedTimeMin: tMin,
    gsAvg: Math.round(gsAvg)
  };
}

/**
 * Calcula os marcos de velocidade para a descida
 * @param startKt - Velocidade inicial
 * @param endKt - Velocidade final
 * @returns Array com os marcos de velocidade
 */
export function computeSpeedGates(startKt: number, endKt: number): number[] {
  if (endKt >= startKt) return [startKt, endKt];
  
  const mid = Math.round((startKt + endKt) / 2);
  return [startKt, mid, endKt];
}