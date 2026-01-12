// ============================================
// DATA PROCESSING UTILITIES FOR REPORTS
// ============================================

import { 
  FlightAggregation, 
  FinancialAggregation, 
  MaintenanceAggregation,
  AirportStats,
  RouteStats,
  FlightStats,
  MaintenanceStats,
  ComplianceStatus,
  ReportFilters,
  FlightStatus
} from '@/types/reports';
import { Flight, FlightWithDetails, Airport } from '@/types/flight';
import { MaintenanceRecord } from '@/types/maintenance';

// ============================================
// FLIGHT DATA PROCESSING
// ============================================

/**
 * Process flight data into aggregated statistics
 */
export function processFlightAggregation(
  flights: FlightWithDetails[],
  filters?: ReportFilters
): FlightAggregation {
  const filteredFlights = applyFlightFilters(flights, filters);
  
  // Calculate basic metrics
  const totalFlights = filteredFlights.length;
  const totalHours = filteredFlights.reduce((sum, flight) => {
    return sum + parseFlightTime(flight.flight_time);
  }, 0);
  const totalDistance = filteredFlights.reduce((sum, flight) => {
    return sum + (flight.distance || 0);
  }, 0);
  
  const averageDuration = totalFlights > 0 ? totalHours / totalFlights : 0;
  const averageDistance = totalFlights > 0 ? totalDistance / totalFlights : 0;
  
  // Calculate completion rate
  // Consider flights as completed if status is 'arrived', 'completed', 'concluído' or similar positive statuses
  // Exclude 'cancelled' and 'scheduled' from completion count but keep in total for rate calculation if desired?
  // Usually completion rate = completed / (completed + cancelled + others)
  const completedStatusKeywords = ['arrived', 'completed', 'concluído', 'finalizado', 'landed'];
  const completedFlights = filteredFlights.filter(f => {
    const status = (f.status || '').toLowerCase();
    return completedStatusKeywords.some(keyword => status.includes(keyword));
  }).length;
  
  const completionRate = totalFlights > 0 ? (completedFlights / totalFlights) * 100 : 0;
  
  // Get unique airports and countries
  const uniqueAirports = new Set([
    ...filteredFlights.map(f => f.departure_airport),
    ...filteredFlights.map(f => f.arrival_airport)
  ]).size;
  
  // Get unique countries - filter out null, undefined, empty strings, and "Unknown"
  const uniqueCountries = new Set([
    ...filteredFlights.map(f => f.departure_airport_details?.country),
    ...filteredFlights.map(f => f.arrival_airport_details?.country)
  ].filter(country => country && country !== 'Unknown' && country !== 'unknown')).size;
  
  // Group by status
  const byStatus = filteredFlights.reduce((acc, flight) => {
    const status = flight.status as FlightStatus;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<FlightStatus, number>);
  
  // Group by aircraft
  const byAircraft = filteredFlights.reduce((acc, flight) => {
    const aircraft = flight.aircraft_type;
    if (!acc[aircraft]) {
      acc[aircraft] = {
        flights: 0,
        hours: 0,
        distance: 0,
        averageDuration: 0,
        averageDistance: 0
      };
    }
    
    const flightHours = parseFlightTime(flight.flight_time);
    const flightDistance = flight.distance || 0;
    
    acc[aircraft].flights += 1;
    acc[aircraft].hours += flightHours;
    acc[aircraft].distance += flightDistance;
    acc[aircraft].averageDuration = acc[aircraft].hours / acc[aircraft].flights;
    acc[aircraft].averageDistance = acc[aircraft].distance / acc[aircraft].flights;
    
    return acc;
  }, {} as Record<string, FlightStats>);
  
  // Group by month
  const byMonth = filteredFlights.reduce((acc, flight) => {
    const month = new Date(flight.departure_time).toISOString().substring(0, 7); // YYYY-MM
    const existing = acc.find(item => item.month === month);
    const flightHours = parseFlightTime(flight.flight_time);
    
    if (existing) {
      existing.flights += 1;
      existing.hours += flightHours;
    } else {
      acc.push({
        month,
        flights: 1,
        hours: flightHours
      });
    }
    
    return acc;
  }, [] as Array<{ month: string; flights: number; hours: number }>);
  
  // Sort by month
  byMonth.sort((a, b) => a.month.localeCompare(b.month));
  
  return {
    totalFlights,
    totalHours,
    totalDistance,
    averageDuration,
    averageDistance,
    completionRate,
    uniqueAirports,
    uniqueCountries,
    byStatus,
    byAircraft,
    byMonth
  };
}

/**
 * Process airport statistics from flight data
 */
export function processAirportStats(flights: FlightWithDetails[]): AirportStats[] {
  const airportMap = new Map<string, AirportStats>();
  
  flights.forEach(flight => {
    const flightTime = parseFlightTime(flight.flight_time);
    
    // Process departure airport
    if (flight.departure_airport_details) {
      const airport = flight.departure_airport_details;
      const key = airport.icao;
      
      if (!airportMap.has(key)) {
        airportMap.set(key, {
          icao: airport.icao,
          name: airport.name,
          city: airport.city,
          country: airport.country,
          coordinates: [airport.longitude, airport.latitude],
          visitCount: 0,
          firstVisit: new Date(flight.departure_time),
          lastVisit: new Date(flight.departure_time),
          totalFlightTime: 0,
          averageFlightTime: 0
        });
      }
      
      const stats = airportMap.get(key)!;
      stats.visitCount += 1;
      stats.totalFlightTime += flightTime;
      stats.averageFlightTime = stats.totalFlightTime / stats.visitCount;
      
      const flightDate = new Date(flight.departure_time);
      if (flightDate < stats.firstVisit) stats.firstVisit = flightDate;
      if (flightDate > stats.lastVisit) stats.lastVisit = flightDate;
    }
    
    // Process arrival airport
    if (flight.arrival_airport_details) {
      const airport = flight.arrival_airport_details;
      const key = airport.icao;
      
      if (!airportMap.has(key)) {
        airportMap.set(key, {
          icao: airport.icao,
          name: airport.name,
          city: airport.city,
          country: airport.country,
          coordinates: [airport.longitude, airport.latitude],
          visitCount: 0,
          firstVisit: new Date(flight.arrival_time),
          lastVisit: new Date(flight.arrival_time),
          totalFlightTime: 0,
          averageFlightTime: 0
        });
      }
      
      const stats = airportMap.get(key)!;
      stats.visitCount += 1;
      stats.totalFlightTime += flightTime;
      stats.averageFlightTime = stats.totalFlightTime / stats.visitCount;
      
      const flightDate = new Date(flight.arrival_time);
      if (flightDate < stats.firstVisit) stats.firstVisit = flightDate;
      if (flightDate > stats.lastVisit) stats.lastVisit = flightDate;
    }
  });
  
  return Array.from(airportMap.values()).sort((a, b) => b.visitCount - a.visitCount);
}

/**
 * Process route statistics from flight data
 */
export function processRouteStats(flights: FlightWithDetails[]): RouteStats[] {
  const routeMap = new Map<string, RouteStats>();
  
  flights.forEach(flight => {
    const key = `${flight.departure_airport}-${flight.arrival_airport}`;
    const flightTime = parseFlightTime(flight.flight_time);
    const distance = flight.distance || 0;
    const cr = flight.revenue || 0; // Assuming revenue is CR
    
    if (!routeMap.has(key)) {
      routeMap.set(key, {
        origin: flight.departure_airport,
        destination: flight.arrival_airport,
        flightCount: 0,
        totalDistance: 0,
        totalTime: 0,
        averageTime: 0,
        totalCR: 0,
        averageCR: 0,
        coordinates: {
          origin: flight.departure_airport_details ? 
            [flight.departure_airport_details.longitude, flight.departure_airport_details.latitude] : [0, 0],
          destination: flight.arrival_airport_details ? 
            [flight.arrival_airport_details.longitude, flight.arrival_airport_details.latitude] : [0, 0]
        }
      });
    }
    
    const stats = routeMap.get(key)!;
    stats.flightCount += 1;
    stats.totalDistance += distance;
    stats.totalTime += flightTime;
    stats.totalCR += cr;
    stats.averageTime = stats.totalTime / stats.flightCount;
    stats.averageCR = stats.totalCR / stats.flightCount;
  });
  
  return Array.from(routeMap.values()).sort((a, b) => b.flightCount - a.flightCount);
}

// ============================================
// FINANCIAL DATA PROCESSING
// ============================================

/**
 * Process financial data into aggregated statistics
 */
export function processFinancialAggregation(
  transactions: any[], // Financial transaction type to be defined
  filters?: ReportFilters
): FinancialAggregation {
  // Filter transactions based on date range and categories
  const filteredTransactions = transactions.filter(transaction => {
    if (!filters) return true;
    
    const transactionDate = new Date(transaction.transaction_date);
    const { from, to } = filters.dateRange;
    
    if (transactionDate < from || transactionDate > to) return false;
    
    // Apply category filters
    if (filters.categories) {
      if (transaction.transaction_type === 'revenue' && 
          filters.categories.revenue && 
          filters.categories.revenue.length > 0) {
        return filters.categories.revenue.includes(transaction.category_id);
      }
      
      if (transaction.transaction_type === 'expense' && 
          filters.categories.expense && 
          filters.categories.expense.length > 0) {
        return filters.categories.expense.includes(transaction.category_id);
      }
    }
    
    return true;
  });
  
  // Calculate totals
  const totalRevenue = filteredTransactions
    .filter(t => t.transaction_type === 'revenue')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = filteredTransactions
    .filter(t => t.transaction_type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  const roi = totalExpenses > 0 ? (netProfit / totalExpenses) * 100 : 0;
  
  // Group by category
  const byCategory = {
    revenue: {} as Record<string, number>,
    expenses: {} as Record<string, number>
  };
  
  filteredTransactions.forEach(transaction => {
    const categoryId = transaction.category_id || 'uncategorized';
    
    if (transaction.transaction_type === 'revenue') {
      byCategory.revenue[categoryId] = (byCategory.revenue[categoryId] || 0) + transaction.amount;
    } else {
      byCategory.expenses[categoryId] = (byCategory.expenses[categoryId] || 0) + transaction.amount;
    }
  });
  
  // Group by month
  const byMonth = filteredTransactions.reduce((acc, transaction) => {
    const month = new Date(transaction.transaction_date).toISOString().substring(0, 7);
    const existing = acc.find(item => item.month === month);
    
    if (existing) {
      if (transaction.transaction_type === 'revenue') {
        existing.revenue += transaction.amount;
      } else {
        existing.expenses += transaction.amount;
      }
    } else {
      acc.push({
        month,
        revenue: transaction.transaction_type === 'revenue' ? transaction.amount : 0,
        expenses: transaction.transaction_type === 'expense' ? transaction.amount : 0
      });
    }
    
    return acc;
  }, [] as Array<{ month: string; revenue: number; expenses: number }>);
  
  // Sort by month
  byMonth.sort((a, b) => a.month.localeCompare(b.month));
  
  // Calculate cash flow
  let runningBalance = 0;
  const cashFlow = byMonth.map(monthData => {
    runningBalance += monthData.revenue - monthData.expenses;
    return {
      date: monthData.month,
      balance: runningBalance
    };
  });
  
  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    profitMargin,
    roi,
    byCategory,
    byMonth,
    cashFlow
  };
}

// ============================================
// MAINTENANCE DATA PROCESSING
// ============================================

/**
 * Process maintenance data into aggregated statistics
 */
export function processMaintenanceAggregation(
  maintenanceRecords: MaintenanceRecord[],
  filters?: ReportFilters
): MaintenanceAggregation {
  // Filter maintenance records
  const filteredRecords = maintenanceRecords.filter(record => {
    if (!filters) return true;
    
    const recordDate = new Date(record.date);
    const { from, to } = filters.dateRange;
    
    return recordDate >= from && recordDate <= to;
  });
  
  const totalMaintenances = filteredRecords.length;
  const totalCost = filteredRecords.reduce((sum, record) => sum + record.cost, 0);
  const averageCost = totalMaintenances > 0 ? totalCost / totalMaintenances : 0;
  
  // Calculate cost per hour (would need flight hours data)
  const costPerHour = 0; // TODO: Calculate based on flight hours
  
  // Group by category
  const byCategory = filteredRecords.reduce((acc, record) => {
    const category = record.category_id || 'uncategorized';
    
    if (!acc[category]) {
      acc[category] = { count: 0, cost: 0 };
    }
    
    acc[category].count += 1;
    acc[category].cost += record.cost;
    
    return acc;
  }, {} as Record<string, { count: number; cost: number }>);
  
  // Group by aircraft
  const byAircraft = filteredRecords.reduce((acc, record) => {
    const aircraft = record.aircraft;
    
    if (!acc[aircraft]) {
      acc[aircraft] = {
        count: 0,
        cost: 0,
        averageCost: 0,
        lastMaintenance: new Date(record.date),
        nextMaintenance: undefined
      };
    }
    
    acc[aircraft].count += 1;
    acc[aircraft].cost += record.cost;
    acc[aircraft].averageCost = acc[aircraft].cost / acc[aircraft].count;
    
    const recordDate = new Date(record.date);
    if (recordDate > acc[aircraft].lastMaintenance) {
      acc[aircraft].lastMaintenance = recordDate;
    }
    
    return acc;
  }, {} as Record<string, MaintenanceStats>);
  
  // Get upcoming maintenances (records with status 'scheduled')
  const upcomingMaintenances = filteredRecords.filter(record => record.status === 'scheduled');
  
  // Mock compliance status (would need actual compliance data)
  const complianceStatus: ComplianceStatus = {
    inspections: { current: 0, overdue: 0, upcoming: 0 },
    certificates: { valid: 0, expiring: 0, expired: 0 },
    airworthiness: { current: 0, expiring: 0, expired: 0 }
  };
  
  return {
    totalMaintenances,
    totalCost,
    averageCost,
    costPerHour,
    byCategory,
    byAircraft,
    upcomingMaintenances,
    complianceStatus
  };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Parse flight time string to hours (decimal)
 */
export function parseFlightTime(flightTime: string | null | undefined): number {
  if (!flightTime || typeof flightTime !== 'string') return 0;
  
  // Handle different time formats
  if (flightTime.includes(':')) {
    // Format: "HH:MM" or "HH:MM:SS"
    const parts = flightTime.split(':');
    const hours = parseInt(parts[0]) || 0;
    const minutes = parseInt(parts[1]) || 0;
    const seconds = parseInt(parts[2]) || 0;
    
    return hours + (minutes / 60) + (seconds / 3600);
  } else {
    // Assume it's already in decimal hours
    return parseFloat(flightTime) || 0;
  }
}

/**
 * Apply filters to flight data
 */
export function applyFlightFilters(
  flights: FlightWithDetails[],
  filters?: ReportFilters
): FlightWithDetails[] {
  if (!filters) return flights;
  
  return flights.filter(flight => {
    // Date range filter
    const flightDate = new Date(flight.departure_time);
    if (flightDate < filters.dateRange.from || flightDate > filters.dateRange.to) {
      return false;
    }
    
    // Aircraft filter
    if (filters.aircraft && filters.aircraft.length > 0) {
      if (!filters.aircraft.includes(flight.aircraft_type)) {
        return false;
      }
    }
    
    // Status filter
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(flight.status as FlightStatus)) {
        return false;
      }
    }
    
    // Airport filters
    if (filters.airports) {
      if (filters.airports.departure && filters.airports.departure.length > 0) {
        if (!filters.airports.departure.includes(flight.departure_airport)) {
          return false;
        }
      }
      
      if (filters.airports.arrival && filters.airports.arrival.length > 0) {
        if (!filters.airports.arrival.includes(flight.arrival_airport)) {
          return false;
        }
      }
      
      if (filters.airports.city && filters.airports.city.length > 0) {
        const departureCity = flight.departure_airport_details?.city;
        const arrivalCity = flight.arrival_airport_details?.city;
        
        if (!departureCity || !arrivalCity || 
            (!filters.airports.city.includes(departureCity) && 
             !filters.airports.city.includes(arrivalCity))) {
          return false;
        }
      }
      
      if (filters.airports.country && filters.airports.country.length > 0) {
        const departureCountry = flight.departure_airport_details?.country;
        const arrivalCountry = flight.arrival_airport_details?.country;
        
        if (!departureCountry || !arrivalCountry || 
            (!filters.airports.country.includes(departureCountry) && 
             !filters.airports.country.includes(arrivalCountry))) {
          return false;
        }
      }
    }
    
    return true;
  });
}

/**
 * Format duration in hours to human readable format
 */
export function formatDuration(hours: number): string {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  
  if (wholeHours === 0) {
    return `${minutes}m`;
  } else if (minutes === 0) {
    return `${wholeHours}h`;
  } else {
    return `${wholeHours}h ${minutes}m`;
  }
}

/**
 * Format distance with appropriate units
 */
export function formatDistance(distance: number): string {
  if (distance >= 1000) {
    return `${(distance / 1000).toFixed(1)}k km`;
  } else {
    return `${distance.toFixed(0)} km`;
  }
}

/**
 * Format currency values
 */
export function formatCurrency(amount: number, currency = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}