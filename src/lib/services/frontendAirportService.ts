
import Papa from 'papaparse';
import { Airport } from '@/types/flight';

// Simple cache for airports
let airportsCache: Record<string, Partial<Airport>> = {};
let isLoaded = false;
let isLoading = false;
let loadingPromise: Promise<void> | null = null;

// Track missing airports for debugging
const missingAirports = new Set<string>();

export async function loadAirports(): Promise<void> {
  if (isLoaded) return;
  if (isLoading && loadingPromise) return loadingPromise;

  isLoading = true;
  loadingPromise = new Promise((resolve, reject) => {
    Papa.parse('/airports.csv', {
      download: true,
      header: true,
      complete: (results) => {
        results.data.forEach((row: any) => {
          // Use the correct column names from the CSV file
          const icao = row.ICAO || row.IATA || '';
          if (icao) {
            airportsCache[icao.toUpperCase()] = {
              icao: icao.toUpperCase(),
              iata: row.IATA || '',
              name: row['Airport name'] || `Airport ${icao}`,
              city: row.City || 'Unknown',
              country: row.Country || null,
              latitude: 0, // Not available in this CSV format
              longitude: 0, // Not available in this CSV format
              elevation: 0, // Not available in this CSV format
            };
          }
        });
        isLoaded = true;
        isLoading = false;
        console.log(`FrontendAirportService: Loaded ${Object.keys(airportsCache).length} airports`);
        resolve();
      },
      error: (error) => {
        console.error('FrontendAirportService: Error loading airports CSV', error);
        isLoading = false;
        reject(error);
      }
    });
  });

  return loadingPromise;
}

export function getAirportDetails(icao: string): Partial<Airport> {
  // Normalize ICAO code (uppercase, trim whitespace)
  const normalizedIcao = icao?.toUpperCase()?.trim() || '';
  
  if (!normalizedIcao) {
    return {
      icao: 'UNKNOWN',
      name: 'Unknown Airport',
      city: 'Unknown',
      country: null
    };
  }

  // If not loaded yet, return basic info or mock if available
  if (!isLoaded && Object.keys(airportsCache).length === 0) {
    // Fallback to basic mock if cache is empty
    const mockAirports: Record<string, Partial<Airport>> = {
        'SBSP': { name: 'Congonhas Airport', city: 'São Paulo', country: 'Brazil' },
        'SBGR': { name: 'Guarulhos International Airport', city: 'São Paulo', country: 'Brazil' },
        'SBRJ': { name: 'Santos Dumont Airport', city: 'Rio de Janeiro', country: 'Brazil' },
        'SBGL': { name: 'Galeão International Airport', city: 'Rio de Janeiro', country: 'Brazil' },
        'SBKP': { name: 'Viracopos International Airport', city: 'Campinas', country: 'Brazil' },
        'SBBR': { name: 'Brasília International Airport', city: 'Brasília', country: 'Brazil' },
        'KJFK': { name: 'John F. Kennedy International Airport', city: 'New York', country: 'United States' },
        'KLAX': { name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'United States' },
        'KORD': { name: 'Chicago O\'Hare International Airport', city: 'Chicago', country: 'United States' },
        'KDEN': { name: 'Denver International Airport', city: 'Denver', country: 'United States' },
        'KIAH': { name: 'George Bush Intercontinental Airport', city: 'Houston', country: 'United States' },
        'KMIA': { name: 'Miami International Airport', city: 'Miami', country: 'United States' },
        'KSEA': { name: 'Seattle-Tacoma International Airport', city: 'Seattle', country: 'United States' },
        'EGLL': { name: 'Heathrow Airport', city: 'London', country: 'United Kingdom' },
        'EGKK': { name: 'Gatwick Airport', city: 'London', country: 'United Kingdom' },
        'LFPG': { name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France' },
        'EDDF': { name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany' },
        'EHAM': { name: 'Amsterdam Schiphol Airport', city: 'Amsterdam', country: 'Netherlands' },
      };
      
    const mockData = mockAirports[normalizedIcao];
    if (mockData) {
        return {
            icao: normalizedIcao,
            iata: normalizedIcao.substring(2),
            ...mockData,
            latitude: -23.5505, // Mock generic coords
            longitude: -46.6333,
            elevation: 800,
            timezone: 'America/Sao_Paulo'
        };
    }

    return {
      icao: normalizedIcao,
      name: `Airport ${normalizedIcao}`,
      city: 'Unknown',
      country: null
    };
  }

  // Check cache for the airport
  const airport = airportsCache[normalizedIcao];
  if (airport) {
    return airport;
  }

  // Track missing airports for debugging (log only once per airport)
  if (!missingAirports.has(normalizedIcao)) {
    missingAirports.add(normalizedIcao);
    console.warn(`FrontendAirportService: Airport not found in cache: ${normalizedIcao}`);
    if (missingAirports.size <= 10) {
      console.warn(`FrontendAirportService: Missing airports so far:`, Array.from(missingAirports).join(', '));
    }
  }

  // Return fallback with unknown country instead of "Unknown" to avoid counting it
  // This allows the Set to properly count only countries with actual data
  return {
    icao: normalizedIcao,
    name: `Airport ${normalizedIcao}`,
    city: 'Unknown',
    country: null // Return null instead of 'Unknown' to avoid counting it in uniqueCountries
  };
}

/**
 * Get all missing airports that were requested but not found in the cache
 */
export function getMissingAirports(): string[] {
  return Array.from(missingAirports);
}

/**
 * Clear the missing airports tracker (useful for testing or re-logging)
 */
export function clearMissingAirports(): void {
  missingAirports.clear();
}
