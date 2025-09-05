export interface TodInputs {
  startAltFt: number;
  endAltFt: number;
  startKt: number;
  endKt: number;
  windKt: number; // + tailwind, - headwind
}

export interface TodOutputs {
  glideslopeDeg: number;
  verticalSpeedFpm: number;
  topNm: number;
  estimatedTimeMin: number;
  gsAvg: number;
}

export interface TodCalculatorProps {
  className?: string;
}