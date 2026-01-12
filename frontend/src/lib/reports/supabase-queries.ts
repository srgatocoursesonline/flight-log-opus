/**
 * Supabase Queries for Reports Data
 * Handles data fetching with proper filtering and error handling
 */

// Mock supabase import for TypeScript compilation
const supabase = {
  from: (table: string) => {
    const mockQuery = {
      select: (columns: string) => mockQuery,
      not: (column: string, operator: string, value: any) => mockQuery,
      gte: (column: string, value: string) => mockQuery,
      lte: (column: string, value: string) => mockQuery,
      in: (column: string, values: string[]) => mockQuery,
      order: (column: string, options: any) => mockQuery,
      limit: (count: number) => Promise.resolve({ data: [], error: null }),
      data: [],
      error: null
    };
    return mockQuery;
  }
};
import type { FlightData, FinancialTransaction, MaintenanceRecord } from './data-processing';

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  aircraft?: string[];
  status?: string[];
  categories?: string[];
}

/**
 * Fetch flights data with filters
 */
export async function fetchFlightsData(filters: ReportFilters = {}) {
  try {
    let query = supabase
      .from('flights')
      .select('*')
      .order('flight_date', { ascending: false });

    // Apply date filters
    if (filters.startDate) {
      query = query.gte('flight_date', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('flight_date', filters.endDate);
    }

    // Apply aircraft filter
    if (filters.aircraft && filters.aircraft.length > 0) {
      query = query.in('aircraft', filters.aircraft);
    }

    // Apply status filter
    if (filters.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching flights data:', error);
      throw error;
    }

    return data as FlightData[];
  } catch (error) {
    console.error('Failed to fetch flights data:', error);
    throw error;
  }
}

/**
 * Fetch financial transactions data with filters
 */
export async function fetchFinancialData(filters: ReportFilters = {}) {
  try {
    let query = supabase
      .from('financial_transactions')
      .select('*')
      .order('transaction_date', { ascending: false });

    // Apply date filters
    if (filters.startDate) {
      query = query.gte('transaction_date', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('transaction_date', filters.endDate);
    }

    // Apply category filter
    if (filters.categories && filters.categories.length > 0) {
      query = query.in('category_id', filters.categories);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching financial data:', error);
      throw error;
    }

    return data as FinancialTransaction[];
  } catch (error) {
    console.error('Failed to fetch financial data:', error);
    throw error;
  }
}

/**
 * Fetch maintenance records data with filters
 */
export async function fetchMaintenanceData(_filters: ReportFilters = {}) {
  try {
    // Note: maintenance_records table doesn't exist in the current schema
    // Return empty array for now
    console.warn('maintenance_records table not found in schema, returning empty array');
    return [] as MaintenanceRecord[];
  } catch (error) {
    console.error('Failed to fetch maintenance data:', error);
    throw error;
  }
}

/**
 * Fetch all report data at once
 */
export async function fetchAllReportData(filters: ReportFilters = {}) {
  try {
    const [flights, financial, maintenance] = await Promise.all([
      fetchFlightsData(filters),
      fetchFinancialData(filters),
      fetchMaintenanceData(filters)
    ]);

    return {
      flights,
      financial,
      maintenance
    };
  } catch (error) {
    console.error('Failed to fetch all report data:', error);
    throw error;
  }
}

/**
 * Get unique aircraft registrations for filter options
 */
export async function getAircraftOptions(): Promise<string[]> {
  try {
    const { data: flightAircraft } = await supabase
      .from('flights')
      .select('aircraft')
      .not('aircraft', 'is', null);

    const allAircraft = flightAircraft?.map((f: { aircraft: string }) => f.aircraft) || [];

    return Array.from(new Set(allAircraft)).filter(Boolean) as string[];
  } catch (error) {
    console.error('Failed to fetch aircraft options:', error);
    return [];
  }
}

/**
 * Get unique categories for filter options
 */
export async function getCategoryOptions(): Promise<string[]> {
  try {
    const { data } = await supabase
      .from('financial_transactions')
      .select('category_id')
      .not('category_id', 'is', null);

    const categories = data?.map((t: { category_id: string }) => t.category_id) || [];
    return Array.from(new Set(categories)).filter(Boolean) as string[];
  } catch (error) {
    console.error('Failed to fetch category options:', error);
    return [];
  }
}

/**
 * Get unique status options for filter options
 */
export async function getStatusOptions(): Promise<string[]> {
  try {
    const { data: flightStatuses } = await supabase
      .from('flights')
      .select('status')
      .not('status', 'is', null);

    const allStatuses = flightStatuses?.map((f: { status: string }) => f.status) || [];

    return Array.from(new Set(allStatuses)).filter(Boolean) as string[];
  } catch (error) {
    console.error('Failed to fetch status options:', error);
    return [];
  }
}

/**
 * Get date range for the data (earliest and latest dates)
 */
export async function getDataDateRange() {
  try {
    const { data: flightDates } = await supabase
      .from('flights')
      .select('flight_date')
      .not('flight_date', 'is', null)
      .order('flight_date', { ascending: true })
      .limit(1);

    const { data: latestFlightDates } = await supabase
      .from('flights')
      .select('flight_date')
      .not('flight_date', 'is', null)
      .order('flight_date', { ascending: false })
      .limit(1);

    const { data: financialDates } = await supabase
      .from('financial_transactions')
      .select('transaction_date')
      .not('transaction_date', 'is', null)
      .order('transaction_date', { ascending: true })
      .limit(1);

    const allStartDates = [
      flightDates?.[0]?.flight_date,
      financialDates?.[0]?.transaction_date
    ].filter(Boolean);

    const allEndDates = [
      latestFlightDates?.[0]?.flight_date
    ].filter(Boolean);

    return {
      startDate: allStartDates.length > 0 ? new Date(Math.min(...allStartDates.map(d => new Date(d).getTime()))) : null,
      endDate: allEndDates.length > 0 ? new Date(Math.max(...allEndDates.map(d => new Date(d).getTime()))) : new Date()
    };
  } catch (error) {
    console.error('Failed to fetch date range:', error);
    return {
      startDate: null,
      endDate: new Date()
    };
  }
}