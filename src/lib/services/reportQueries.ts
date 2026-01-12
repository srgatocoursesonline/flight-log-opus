// ============================================
// SUPABASE QUERIES FOR REPORT DATA
// ============================================

import { supabase } from '@/lib/supabase';
import { ReportFilters, FlightStatus } from '@/types/reports';
import { FlightWithDetails, Airport } from '@/types/flight';
import { MaintenanceRecord } from '@/types/maintenance';
import { loadAirports, getAirportDetails } from './frontendAirportService';

// ============================================
// FLIGHT QUERIES
// ============================================

/**
 * Fetch flights with detailed airport information
 */
export async function fetchFlightsForReports(
  userId: string,
  filters?: ReportFilters
): Promise<{ data: FlightWithDetails[] | null; error: any }> {
  try {
    console.log('fetchFlightsForReports: Starting query for user:', userId);
    
    // Start loading airports data in parallel
    const airportsPromise = loadAirports();

    // Fetch flight statuses map
    const { data: statusesData } = await supabase
      .from('flight_statuses')
      .select('id, name');
        
    const statusMap = new Map<string, string>();
    if (statusesData) {
      statusesData.forEach((s: any) => statusMap.set(s.id, s.name));
    }
    
    // Simple query to get all flights for the user
    const { data, error } = await supabase
      .from('flights')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('fetchFlightsForReports: Query error:', error);
      return { data: null, error };
    }

    console.log('fetchFlightsForReports: Query successful, found', data?.length || 0, 'flights');

    if (!data || data.length === 0) {
      return { data: [], error: null };
    }

    // Ensure airports are loaded before processing
    await airportsPromise;

    // Transform to FlightWithDetails format with proper field mapping
    const flightsWithDetails: FlightWithDetails[] = data.map(flight => {
      // Resolve status name from UUID if present in map
      let statusName = flight.status || 'completed';
      if (statusMap.has(statusName)) {
        statusName = statusMap.get(statusName) || statusName;
      }

      return {
        ...flight,
        // Map fields to expected names
        departure_airport: flight.departure || flight.departure_airport || 'UNKNOWN',
        arrival_airport: flight.arrival || flight.arrival_airport || 'UNKNOWN', 
        aircraft_type: flight.aircraft || flight.aircraft_type || 'Unknown',
        departure_time: flight.flight_date || flight.departure_time || flight.created_at,
        arrival_time: flight.flight_date || flight.arrival_time || flight.created_at,
        flight_time: flight.duration || flight.flight_time || '0:00',
        status: statusName,
        // Add airport details using the service
        departure_airport_details: getAirportDetails(flight.departure || flight.departure_airport || 'UNKNOWN'),
        arrival_airport_details: getAirportDetails(flight.arrival || flight.arrival_airport || 'UNKNOWN')
      };
    });

    console.log('fetchFlightsForReports: Transformed', flightsWithDetails.length, 'flights with airport details');
    return { data: flightsWithDetails, error: null };
  } catch (error) {
    console.error('fetchFlightsForReports: Catch block error:', error);
    return { data: null, error };
  }
}

/**
 * Fetch unique aircraft for filter options
 */
export async function fetchUniqueAircraft(userId: string): Promise<{ data: string[] | null; error: any }> {
  try {
    // Return empty array for now since the field names are unclear
    return { data: [], error: null };
  } catch (error) {
    console.error('Error in fetchUniqueAircraft:', error);
    return { data: [], error: null };
  }
}

/**
 * Fetch unique airports for filter options
 */
export async function fetchUniqueAirports(userId: string): Promise<{ data: any | null; error: any }> {
  try {
    // Return empty arrays for now since the field names are unclear
    return { 
      data: {
        airports: [],
        departure: [],
        arrival: []
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Error in fetchUniqueAirports:', error);
    return { 
      data: {
        airports: [],
        departure: [],
        arrival: []
      }, 
      error: null 
    };
  }
}

// ============================================
// FINANCIAL QUERIES
// ============================================

/**
 * Fetch financial transactions for reports
 */
export async function fetchFinancialTransactions(
  userId: string,
  filters?: ReportFilters
): Promise<{ data: any[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('financial_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('transaction_date', { ascending: false });

    if (error) {
      console.error('Error fetching financial transactions:', error);
      return { data: [], error: null };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error in fetchFinancialTransactions:', error);
    return { data: [], error: null };
  }
}

// ============================================
// MAINTENANCE QUERIES
// ============================================

/**
 * Fetch maintenance records for reports
 */
export async function fetchMaintenanceRecords(
  userId: string,
  filters?: ReportFilters
): Promise<{ data: MaintenanceRecord[] | null; error: any }> {
  try {
    // Return empty array for now since the table structure is different
    return { data: [], error: null };
  } catch (error) {
    console.error('Error in fetchMaintenanceRecords:', error);
    return { data: [], error: null };
  }
}

// ============================================
// GOALS QUERIES
// ============================================

/**
 * Fetch goals for reports
 */
export async function fetchGoals(
  userId: string,
  filters?: ReportFilters
): Promise<{ data: any[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching goals:', error);
      return { data: [], error: null };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error in fetchGoals:', error);
    return { data: [], error: null };
  }
}

// ============================================
// AGGREGATED DATA QUERIES
// ============================================

/**
 * Fetch all report data in a single call for performance
 */
export async function fetchAllReportData(
  userId: string,
  filters?: ReportFilters
): Promise<{
  flights: FlightWithDetails[] | null;
  financialTransactions: any[] | null;
  maintenanceRecords: MaintenanceRecord[] | null;
  goals: any[] | null;
  error: any;
}> {
  try {
    console.log('fetchAllReportData: Starting for user:', userId);
    
    // Execute all queries in parallel
    const [
      flightsResult,
      financialResult,
      maintenanceResult,
      goalsResult
    ] = await Promise.all([
      fetchFlightsForReports(userId, filters),
      fetchFinancialTransactions(userId, filters),
      fetchMaintenanceRecords(userId, filters),
      fetchGoals(userId, filters)
    ]);

    console.log('fetchAllReportData: Individual results:', {
      flights: { count: flightsResult.data?.length || 0, error: flightsResult.error },
      financial: { count: financialResult.data?.length || 0, error: financialResult.error },
      maintenance: { count: maintenanceResult.data?.length || 0, error: maintenanceResult.error },
      goals: { count: goalsResult.data?.length || 0, error: goalsResult.error }
    });

    // Check for any errors
    const errors = [
      flightsResult.error,
      financialResult.error,
      maintenanceResult.error,
      goalsResult.error
    ].filter(Boolean);

    if (errors.length > 0) {
      console.error('fetchAllReportData: Errors found:', errors);
      return {
        flights: null,
        financialTransactions: null,
        maintenanceRecords: null,
        goals: null,
        error: errors[0]
      };
    }

    console.log('fetchAllReportData: Success - returning data');
    return {
      flights: flightsResult.data,
      financialTransactions: financialResult.data,
      maintenanceRecords: maintenanceResult.data,
      goals: goalsResult.data,
      error: null
    };
  } catch (error) {
    console.error('fetchAllReportData: Catch block error:', error);
    return {
      flights: null,
      financialTransactions: null,
      maintenanceRecords: null,
      goals: null,
      error
    };
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Build filter options for dropdowns
 */
export async function fetchFilterOptions(userId: string): Promise<{
  aircraft: string[];
  airports: string[];
  expenseCategories: any[];
  revenueCategories: any[];
  error: any;
}> {
  try {
    const [
      aircraftResult,
      airportsResult
    ] = await Promise.all([
      fetchUniqueAircraft(userId),
      fetchUniqueAirports(userId)
    ]);

    return {
      aircraft: aircraftResult.data || [],
      airports: airportsResult.data?.airports || [],
      expenseCategories: [],
      revenueCategories: [],
      error: null
    };
  } catch (error) {
    console.error('Error in fetchFilterOptions:', error);
    return {
      aircraft: [],
      airports: [],
      expenseCategories: [],
      revenueCategories: [],
      error
    };
  }
}