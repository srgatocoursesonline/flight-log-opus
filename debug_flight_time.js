// Debug da função parseFlightTime
const parseFlightTime = (flightTime) => {
  if (!flightTime) return 0;
  
  console.log('Input:', flightTime);
  
  // Handle formats: "1h 30m", "45m", "2h"
  const hourMatch = flightTime.match(/(\d+)h/);
  const minuteMatch = flightTime.match(/(\d+)m/);
  
  console.log('Hour match:', hourMatch);
  console.log('Minute match:', minuteMatch);
  
  const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
  const minutes = minuteMatch ? parseInt(minuteMatch[1]) : 0;
  
  console.log('Parsed hours:', hours);
  console.log('Parsed minutes:', minutes);
  
  const totalMinutes = hours * 60 + minutes;
  console.log('Total minutes:', totalMinutes);
  console.log('Total hours:', totalMinutes / 60);
  console.log('---');
  
  return totalMinutes;
};

// Testes com diferentes formatos
console.log('=== TESTES parseFlightTime ===');
parseFlightTime('39h');
parseFlightTime('39h 0m');
parseFlightTime('39');
parseFlightTime('39.0');
parseFlightTime('0h 40m');
parseFlightTime('40m');
parseFlightTime('1h 30m');

// Teste específico do problema relatado
console.log('\n=== TESTE ESPECÍFICO: 39 horas ===');
const result39h = parseFlightTime('39h');
console.log('Resultado para 39h:', result39h, 'minutos =', result39h / 60, 'horas');

const result067 = 0.67 * 60; // Converter 0.67 horas para minutos
console.log('0.67 horas em minutos:', result067);
console.log('Diferença:', result39h - result067);