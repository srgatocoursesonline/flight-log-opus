/**
 * Data Processing Utilities for Reports
 * Handles flight, financial, and maintenance data aggregations
 */

export interface FlightData {
  id: string;
  user_id: string;
  callsign: string;
  aircraft: string;
  departure: string;
  arrival: string;
  departure_time: string | null;
  arrival_time: string | null;
  flight_time: string | null;
  distance: number;
  fuel_used: number;
  landing_rate: number;
  experience_points: number;
  career_rating: number;
  status: string;
  flight_date: string;
  route: string | null;
  notes: string | null;
  is_example: boolean;
  created_at: string;
  updated_at: string;
}

export interface FinancialTransaction {
  id: string;
  user_id: string;
  transaction_type: 'revenue' | 'expense';
  description: string;
  amount: number;
  category_id: string | null;
  transaction_date: string;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceRecord {
  id: string;
  user_id: string;
  aircraft_registration: string;
  aircraft_model?: string;
  maintenance_date: string;
  mechanic_name?: string;
  location?: string;
  total_hours?: number;
  total_cost?: number;
  status?: string;
  notes?: string;
  next_maintenance_date?: string;
  created_at: string;
}

export interface FlightAggregation {
  year: number;
  month: number;
  flight_count: number;
  total_hours: number;
  total_distance: number;
  avg_duration: number;
  avg_distance: number;
  unique_aircraft: number;
  aircraft_breakdown: Record<string, {
    flights: number;
    hours: number;
    distance: number;
  }>;
}

export interface FinancialAggregation {
  year: number;
  month: number;
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
  transaction_count: number;
  category_breakdown: Record<string, {
    amount: number;
    count: number;
    type: 'revenue' | 'expense';
  }>;
}

export interface MaintenanceAggregation {
  year: number;
  month: number;
  maintenance_count: number;
  total_cost: number;
  avg_cost: number;
  total_hours: number;
  aircraft_breakdown: Record<string, {
    count: number;
    cost: number;
    hours: number;
  }>;
}

/**
 * Convert flight time string to decimal hours
 */
export function parseFlightTime(flightTime: string | null | undefined): number {
  if (!flightTime) return 0;
  
  // Handle HH:MM format
  if (flightTime.includes(':')) {
    const [hours, minutes] = flightTime.split(':').map(Number);
    return hours + (minutes / 60);
  }
  
  // Handle decimal format
  const parsed = parseFloat(flightTime);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Get year and month from date string
 */
export function getDateParts(dateString: string): { year: number; month: number } {
  const date = new Date(dateString);
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1 // 1-based month
  };
}

/**
 * Aggregate flight data by month
 */
export function aggregateFlightsByMonth(flights: FlightData[]): FlightAggregation[] {
  const aggregations = new Map<string, FlightAggregation>();
  
  flights.forEach(flight => {
    const { year, month } = getDateParts(flight.departure_time || flight.flight_date);
    const key = `${year}-${month}`;
    
    if (!aggregations.has(key)) {
      aggregations.set(key, {
        year,
        month,
        flight_count: 0,
        total_hours: 0,
        total_distance: 0,
        avg_duration: 0,
        avg_distance: 0,
        unique_aircraft: 0,
        aircraft_breakdown: {}
      });
    }
    
    const agg = aggregations.get(key)!;
    const flightHours = parseFlightTime(flight.flight_time);
    const distance = flight.distance || 0;
    const aircraft = flight.aircraft || 'Unknown';
    
    // Update totals
    agg.flight_count++;
    agg.total_hours += flightHours;
    agg.total_distance += distance;
    
    // Update aircraft breakdown
    if (!agg.aircraft_breakdown[aircraft]) {
      agg.aircraft_breakdown[aircraft] = { flights: 0, hours: 0, distance: 0 };
    }
    agg.aircraft_breakdown[aircraft].flights++;
    agg.aircraft_breakdown[aircraft].hours += flightHours;
    agg.aircraft_breakdown[aircraft].distance += distance;
  });
  
  // Calculate averages and unique aircraft count
  aggregations.forEach(agg => {
    agg.avg_duration = agg.flight_count > 0 ? agg.total_hours / agg.flight_count : 0;
    agg.avg_distance = agg.flight_count > 0 ? agg.total_distance / agg.flight_count : 0;
    agg.unique_aircraft = Object.keys(agg.aircraft_breakdown).length;
  });
  
  return Array.from(aggregations.values()).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });
}

/**
 * Aggregate financial data by month
 */
export function aggregateFinancialByMonth(transactions: FinancialTransaction[]): FinancialAggregation[] {
  const aggregations = new Map<string, FinancialAggregation>();
  
  transactions.forEach(transaction => {
    const { year, month } = getDateParts(transaction.transaction_date);
    const key = `${year}-${month}`;
    
    if (!aggregations.has(key)) {
      aggregations.set(key, {
        year,
        month,
        total_revenue: 0,
        total_expenses: 0,
        net_profit: 0,
        transaction_count: 0,
        category_breakdown: {}
      });
    }
    
    const agg = aggregations.get(key)!;
    const category = transaction.category_id || 'Uncategorized';
    
    // Update totals
    agg.transaction_count++;
    if (transaction.transaction_type === 'revenue') {
      agg.total_revenue += transaction.amount;
    } else {
      agg.total_expenses += transaction.amount;
    }
    
    // Update category breakdown
    if (!agg.category_breakdown[category]) {
      agg.category_breakdown[category] = {
        amount: 0,
        count: 0,
        type: transaction.transaction_type
      };
    }
    agg.category_breakdown[category].amount += transaction.amount;
    agg.category_breakdown[category].count++;
  });
  
  // Calculate net profit
  aggregations.forEach(agg => {
    agg.net_profit = agg.total_revenue - agg.total_expenses;
  });
  
  return Array.from(aggregations.values()).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });
}

/**
 * Aggregate maintenance data by month
 */
export function aggregateMaintenanceByMonth(records: MaintenanceRecord[]): MaintenanceAggregation[] {
  // Return empty array if no records (maintenance table doesn't exist yet)
  if (!records || records.length === 0) {
    return [];
  }
  
  const aggregations = new Map<string, MaintenanceAggregation>();
  
  records.forEach(record => {
    const { year, month } = getDateParts(record.maintenance_date);
    const key = `${year}-${month}`;
    
    if (!aggregations.has(key)) {
      aggregations.set(key, {
        year,
        month,
        maintenance_count: 0,
        total_cost: 0,
        avg_cost: 0,
        total_hours: 0,
        aircraft_breakdown: {}
      });
    }
    
    const agg = aggregations.get(key)!;
    const cost = record.total_cost || 0;
    const hours = record.total_hours || 0;
    const aircraft = record.aircraft_registration;
    
    // Update totals
    agg.maintenance_count++;
    agg.total_cost += cost;
    agg.total_hours += hours;
    
    // Update aircraft breakdown
    if (!agg.aircraft_breakdown[aircraft]) {
      agg.aircraft_breakdown[aircraft] = { count: 0, cost: 0, hours: 0 };
    }
    agg.aircraft_breakdown[aircraft].count++;
    agg.aircraft_breakdown[aircraft].cost += cost;
    agg.aircraft_breakdown[aircraft].hours += hours;
  });
  
  // Calculate averages
  aggregations.forEach(agg => {
    agg.avg_cost = agg.maintenance_count > 0 ? agg.total_cost / agg.maintenance_count : 0;
  });
  
  return Array.from(aggregations.values()).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });
}

/**
 * Filter data by date range
 */
export function filterByDateRange<T extends { departure_time?: string | null; transaction_date?: string; flight_date?: string }>(
  data: T[],
  startDate?: string,
  endDate?: string
): T[] {
  if (!startDate && !endDate) return data;
  
  return data.filter(item => {
    const dateField = item.departure_time || item.transaction_date || item.flight_date;
    if (!dateField) return false;
    
    const itemDate = new Date(dateField);
    
    if (startDate && itemDate < new Date(startDate)) return false;
    if (endDate && itemDate > new Date(endDate)) return false;
    
    return true;
  });
}

/**
 * Calculate period comparison
 */
export function calculatePeriodComparison<T extends { year: number; month: number }>(
  currentPeriod: T[],
  previousPeriod: T[],
  valueKey: keyof T
): Array<T & { comparison: { value: number; percentage: number; trend: 'up' | 'down' | 'stable' } }> {
  return currentPeriod.map(current => {
    const previous = previousPeriod.find(p => p.year === current.year && p.month === current.month);
    
    if (!previous) {
      return {
        ...current,
        comparison: { value: 0, percentage: 0, trend: 'stable' as const }
      };
    }
    
    const currentValue = Number(current[valueKey]);
    const previousValue = Number(previous[valueKey]);
    const difference = currentValue - previousValue;
    const percentage = previousValue !== 0 ? (difference / previousValue) * 100 : 0;
    
    return {
      ...current,
      comparison: {
        value: difference,
        percentage,
        trend: difference > 0 ? 'up' : difference < 0 ? 'down' : 'stable'
      }
    };
  });
}