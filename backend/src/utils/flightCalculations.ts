/**
 * Utilitários para cálculos relacionados a voos
 * Funções para calcular distância, duração, consumo, etc.
 */

// ============================================
// INTERFACES
// ============================================

interface FlightMetrics {
  distance: number; // km
  duration: number; // minutos
  averageSpeed: number; // km/h
  fuelConsumption?: number; // litros (estimativa)
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

// ============================================
// CONSTANTES
// ============================================

const EARTH_RADIUS_KM = 6371;
const NAUTICAL_MILE_TO_KM = 1.852;
const KNOTS_TO_KMH = 1.852;

// Estimativas de consumo por tipo de aeronave (litros/hora)
const FUEL_CONSUMPTION_ESTIMATES: Record<string, number> = {
  // Aviação geral
  'Cessna 152': 25,
  'Cessna 172': 35,
  'Cessna 182': 50,
  'Piper Cherokee': 40,
  'Beechcraft Bonanza': 65,
  
  // Turbo-hélices
  'King Air 350': 200,
  'TBM 940': 120,
  'PC-12': 150,
  
  // Jatos executivos
  'Citation CJ4': 400,
  'Gulfstream G650': 1200,
  'Falcon 7X': 800,
  
  // Comerciais
  'Boeing 737': 2500,
  'Airbus A320': 2400,
  'Boeing 777': 8000,
  'Airbus A380': 12000,
  
  // Padrão para desconhecidos
  'default': 100,
};

// ============================================
// FUNÇÕES DE CÁLCULO DE DISTÂNCIA
// ============================================

/**
 * Converte graus para radianos
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Converte radianos para graus
 */
function toDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Calcula a distância entre duas coordenadas usando a fórmula de Haversine
 * Retorna a distância em quilômetros
 */
export function calculateFlightDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_KM * c;
  
  return Math.round(distance * 100) / 100; // Arredondar para 2 casas decimais
}

/**
 * Calcula a distância ortodrômica (great circle) mais precisa
 */
export function calculateGreatCircleDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);
  const deltaLonRad = toRadians(lon2 - lon1);
  
  const distance = Math.acos(
    Math.sin(lat1Rad) * Math.sin(lat2Rad) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.cos(deltaLonRad)
  ) * EARTH_RADIUS_KM;
  
  return Math.round(distance * 100) / 100;
}

/**
 * Calcula o bearing (direção) entre duas coordenadas
 * Retorna o ângulo em graus (0-360)
 */
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);
  const deltaLonRad = toRadians(lon2 - lon1);
  
  const y = Math.sin(deltaLonRad) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
            Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(deltaLonRad);
  
  let bearing = toDegrees(Math.atan2(y, x));
  
  // Normalizar para 0-360
  bearing = (bearing + 360) % 360;
  
  return Math.round(bearing);
}

// ============================================
// FUNÇÕES DE CÁLCULO DE TEMPO
// ============================================

/**
 * Calcula a duração do voo em minutos
 */
export function calculateFlightDuration(
  startTime: Date,
  endTime: Date
): number {
  const durationMs = endTime.getTime() - startTime.getTime();
  const durationMinutes = Math.round(durationMs / (1000 * 60));
  
  return Math.max(0, durationMinutes); // Garantir que não seja negativo
}

/**
 * Calcula a duração em formato horas:minutos
 */
export function formatFlightDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}min`;
  }
  
  return `${hours}h ${mins}min`;
}

/**
 * Converte minutos para horas decimais
 */
export function minutesToDecimalHours(minutes: number): number {
  return Math.round((minutes / 60) * 100) / 100;
}

// ============================================
// FUNÇÕES DE CÁLCULO DE VELOCIDADE
// ============================================

/**
 * Calcula a velocidade média do voo
 */
export function calculateAverageSpeed(
  distanceKm: number,
  durationMinutes: number
): number {
  if (durationMinutes === 0) return 0;
  
  const durationHours = durationMinutes / 60;
  const speedKmh = distanceKm / durationHours;
  
  return Math.round(speedKmh);
}

/**
 * Converte velocidade de nós para km/h
 */
export function knotsToKmh(knots: number): number {
  return Math.round(knots * KNOTS_TO_KMH);
}

/**
 * Converte velocidade de km/h para nós
 */
export function kmhToKnots(kmh: number): number {
  return Math.round(kmh / KNOTS_TO_KMH);
}

// ============================================
// FUNÇÕES DE ESTIMATIVA DE COMBUSTÍVEL
// ============================================

/**
 * Estima o consumo de combustível baseado na aeronave e duração
 */
export function estimateFuelConsumption(
  aircraft: string,
  durationMinutes: number
): number {
  const durationHours = durationMinutes / 60;
  
  // Buscar consumo específico da aeronave
  let consumptionPerHour = FUEL_CONSUMPTION_ESTIMATES[aircraft];
  
  // Se não encontrar, tentar buscar por palavras-chave
  if (!consumptionPerHour) {
    const aircraftLower = aircraft.toLowerCase();
    
    for (const [key, value] of Object.entries(FUEL_CONSUMPTION_ESTIMATES)) {
      if (aircraftLower.includes(key.toLowerCase())) {
        consumptionPerHour = value;
        break;
      }
    }
  }
  
  // Usar padrão se não encontrar
  if (!consumptionPerHour) {
    consumptionPerHour = FUEL_CONSUMPTION_ESTIMATES.default;
  }
  
  const totalConsumption = consumptionPerHour * durationHours;
  return Math.round(totalConsumption);
}

// ============================================
// FUNÇÕES COMBINADAS
// ============================================

/**
 * Calcula todas as métricas de voo de uma vez
 */
export function calculateFlightMetrics(
  startCoords: Coordinates,
  endCoords: Coordinates,
  startTime: Date,
  endTime: Date,
  aircraft?: string
): FlightMetrics {
  const distance = calculateFlightDistance(
    startCoords.latitude,
    startCoords.longitude,
    endCoords.latitude,
    endCoords.longitude
  );
  
  const duration = calculateFlightDuration(startTime, endTime);
  const averageSpeed = calculateAverageSpeed(distance, duration);
  
  const metrics: FlightMetrics = {
    distance,
    duration,
    averageSpeed,
  };
  
  // Adicionar estimativa de combustível se aeronave fornecida
  if (aircraft) {
    metrics.fuelConsumption = estimateFuelConsumption(aircraft, duration);
  }
  
  return metrics;
}

/**
 * Valida se as coordenadas são válidas
 */
export function validateCoordinates(lat: number, lon: number): boolean {
  return (
    lat >= -90 && lat <= 90 &&
    lon >= -180 && lon <= 180 &&
    !isNaN(lat) && !isNaN(lon)
  );
}

/**
 * Valida se as datas são válidas e em ordem correta
 */
export function validateFlightTimes(startTime: Date, endTime: Date): boolean {
  return (
    startTime instanceof Date &&
    endTime instanceof Date &&
    !isNaN(startTime.getTime()) &&
    !isNaN(endTime.getTime()) &&
    endTime.getTime() > startTime.getTime()
  );
}

// ============================================
// FUNÇÕES DE FORMATAÇÃO
// ============================================

/**
 * Formata distância com unidade apropriada
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }
  
  if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)}km`;
  }
  
  return `${Math.round(distanceKm)}km`;
}

/**
 * Formata velocidade com unidade
 */
export function formatSpeed(speedKmh: number): string {
  return `${speedKmh}km/h`;
}

/**
 * Formata coordenadas em formato legível
 */
export function formatCoordinates(lat: number, lon: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lon).toFixed(4)}°${lonDir}`;
}