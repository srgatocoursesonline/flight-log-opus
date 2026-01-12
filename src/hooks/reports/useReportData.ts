// ============================================
// REPORT DATA HOOK WITH CACHING AND ERROR HANDLING
// ============================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ReportFilters, 
  ReportData, 
  ReportType, 
  ReportErrorInfo,
  FlightAggregation,
  FinancialAggregation,
  MaintenanceAggregation,
  AirportStats,
  RouteStats
} from '@/types/reports';
import { FlightWithDetails } from '@/types/flight';
import { MaintenanceRecord } from '@/types/maintenance';
import {
  fetchAllReportData,
  fetchFilterOptions
} from '@/lib/services/reportQueries';
import {
  processFlightAggregation,
  processFinancialAggregation,
  processMaintenanceAggregation,
  processAirportStats,
  processRouteStats
} from '@/utils/reports/dataProcessing';

// ============================================
// TYPES
// ============================================

interface ReportDataState {
  flights: FlightWithDetails[] | null;
  financialTransactions: any[] | null;
  maintenanceRecords: MaintenanceRecord[] | null;
  goals: any[] | null;
  flightAggregation: FlightAggregation | null;
  financialAggregation: FinancialAggregation | null;
  maintenanceAggregation: MaintenanceAggregation | null;
  airportStats: AirportStats[] | null;
  routeStats: RouteStats[] | null;
}

interface FilterOptions {
  aircraft: string[];
  airports: string[];
  expenseCategories: any[];
  revenueCategories: any[];
}

interface UseReportDataReturn {
  // Data
  data: ReportDataState;
  filterOptions: FilterOptions;
  
  // Loading states
  loading: boolean;
  loadingFilters: boolean;
  
  // Error handling
  error: ReportErrorInfo | null;
  
  // Actions
  refetch: () => Promise<void>;
  clearError: () => void;
  
  // Utilities
  isDataStale: boolean;
  lastFetch: Date | null;
}

// ============================================
// CACHE CONFIGURATION
// ============================================

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const STALE_TIME = 2 * 60 * 1000; // 2 minutes

interface CacheEntry {
  data: ReportDataState;
  timestamp: Date;
  filters: ReportFilters;
}

// Simple in-memory cache
const reportDataCache = new Map<string, CacheEntry>();

// ============================================
// HOOK IMPLEMENTATION
// ============================================

export function useReportData(
  filters: ReportFilters,
  reportType?: ReportType
): UseReportDataReturn {
  const { user } = useAuth();
  
  // State management
  const [data, setData] = useState<ReportDataState>({
    flights: null,
    financialTransactions: null,
    maintenanceRecords: null,
    goals: null,
    flightAggregation: null,
    financialAggregation: null,
    maintenanceAggregation: null,
    airportStats: null,
    routeStats: null
  });
  
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    aircraft: [],
    airports: [],
    expenseCategories: [],
    revenueCategories: []
  });
  
  const [loading, setLoading] = useState(false);
  const [loadingFilters, setLoadingFilters] = useState(false);
  const [error, setError] = useState<ReportErrorInfo | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  
  // Generate cache key based on user and filters
  const cacheKey = useMemo(() => {
    if (!user?.id) return '';
    return `${user.id}-${JSON.stringify(filters)}`;
  }, [user?.id, filters]);
  
  // Check if data is stale
  const isDataStale = useMemo(() => {
    if (!lastFetch) return true;
    return Date.now() - lastFetch.getTime() > STALE_TIME;
  }, [lastFetch]);
  
  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  // Process raw data into aggregations
  const processData = useCallback((rawData: {
    flights: FlightWithDetails[] | null;
    financialTransactions: any[] | null;
    maintenanceRecords: MaintenanceRecord[] | null;
    goals: any[] | null;
  }): ReportDataState => {
    const startTime = Date.now();
    
    try {
      // Process flight data
      const flightAggregation = rawData.flights ? 
        processFlightAggregation(rawData.flights, filters) : null;
      
      const airportStats = rawData.flights ? 
        processAirportStats(rawData.flights) : null;
      
      const routeStats = rawData.flights ? 
        processRouteStats(rawData.flights) : null;
      
      // Process financial data
      const financialAggregation = rawData.financialTransactions ? 
        processFinancialAggregation(rawData.financialTransactions, filters) : null;
      
      // Process maintenance data
      const maintenanceAggregation = rawData.maintenanceRecords ? 
        processMaintenanceAggregation(rawData.maintenanceRecords, filters) : null;
      
      const executionTime = Date.now() - startTime;
      console.log(`Data processing completed in ${executionTime}ms`);
      
      return {
        flights: rawData.flights,
        financialTransactions: rawData.financialTransactions,
        maintenanceRecords: rawData.maintenanceRecords,
        goals: rawData.goals,
        flightAggregation,
        financialAggregation,
        maintenanceAggregation,
        airportStats,
        routeStats
      };
    } catch (processingError) {
      console.error('Error processing report data:', processingError);
      
      setError({
        type: 'CALCULATION_ERROR',
        message: 'Erro ao processar dados do relatório',
        details: processingError,
        timestamp: new Date(),
        reportType,
        filters
      });
      
      // Return raw data without aggregations
      return {
        flights: rawData.flights,
        financialTransactions: rawData.financialTransactions,
        maintenanceRecords: rawData.maintenanceRecords,
        goals: rawData.goals,
        flightAggregation: null,
        financialAggregation: null,
        maintenanceAggregation: null,
        airportStats: null,
        routeStats: null
      };
    }
  }, [filters, reportType]);
  
  // Fetch report data
  const fetchData = useCallback(async (useCache = true): Promise<void> => {
    if (!user?.id) {
      console.log('useReportData: No user ID available');
      return;
    }
    
    console.log('useReportData: Starting data fetch for user:', user.id);
    console.log('useReportData: Filters:', filters);
    
    // Check cache first
    if (useCache && cacheKey) {
      const cached = reportDataCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp.getTime() < CACHE_DURATION) {
        console.log('useReportData: Using cached data');
        setData(cached.data);
        setLastFetch(cached.timestamp);
        return;
      }
    }
    
    setLoading(true);
    setError(null);
    
    const startTime = Date.now();
    
    try {
      console.log('useReportData: Calling fetchAllReportData...');
      const result = await fetchAllReportData(user.id, filters);
      
      console.log('useReportData: fetchAllReportData result:', {
        flights: result.flights?.length || 0,
        financialTransactions: result.financialTransactions?.length || 0,
        error: result.error
      });
      
      if (result.error) {
        throw new Error(result.error.message || 'Erro ao buscar dados do relatório');
      }
      
      const processedData = processData({
        flights: result.flights,
        financialTransactions: result.financialTransactions,
        maintenanceRecords: result.maintenanceRecords,
        goals: result.goals
      });
      
      console.log('useReportData: Processed data:', {
        flights: processedData.flights?.length || 0,
        flightAggregation: processedData.flightAggregation
      });
      
      setData(processedData);
      setLastFetch(new Date());
      
      // Cache the processed data
      if (cacheKey) {
        reportDataCache.set(cacheKey, {
          data: processedData,
          timestamp: new Date(),
          filters: { ...filters }
        });
      }
      
      const executionTime = Date.now() - startTime;
      console.log(`useReportData: Data fetched and processed in ${executionTime}ms`);
      
    } catch (fetchError: any) {
      console.error('useReportData: Error fetching data:', fetchError);
      
      setError({
        type: 'DATA_FETCH_ERROR',
        message: fetchError.message || 'Erro ao buscar dados do relatório',
        details: fetchError,
        timestamp: new Date(),
        reportType,
        filters
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, filters, cacheKey, processData, reportType]);
  
  // Fetch filter options
  const fetchFilters = useCallback(async (): Promise<void> => {
    if (!user?.id) return;
    
    setLoadingFilters(true);
    
    try {
      const result = await fetchFilterOptions(user.id);
      
      if (result.error) {
        console.error('Error fetching filter options:', result.error);
        return;
      }
      
      setFilterOptions({
        aircraft: result.aircraft,
        airports: result.airports,
        expenseCategories: result.expenseCategories,
        revenueCategories: result.revenueCategories
      });
      
    } catch (filterError) {
      console.error('Error fetching filter options:', filterError);
    } finally {
      setLoadingFilters(false);
    }
  }, [user?.id]);
  
  // Refetch function (bypasses cache)
  const refetch = useCallback(async (): Promise<void> => {
    await fetchData(false);
  }, [fetchData]);
  
  // Effect to fetch data when filters change
  useEffect(() => {
    if (user?.id) {
      // Clear cache to force fresh data
      if (cacheKey) {
        reportDataCache.delete(cacheKey);
      }
      fetchData(false); // Force bypass cache
    }
  }, [fetchData, user?.id, cacheKey]);
  
  // Effect to fetch filter options on mount
  useEffect(() => {
    if (user?.id) {
      fetchFilters();
    }
  }, [fetchFilters, user?.id]);
  
  // Cleanup cache on unmount
  useEffect(() => {
    return () => {
      // Clean up old cache entries
      const now = Date.now();
      for (const [key, entry] of reportDataCache.entries()) {
        if (now - entry.timestamp.getTime() > CACHE_DURATION) {
          reportDataCache.delete(key);
        }
      }
    };
  }, []);
  
  return {
    data,
    filterOptions,
    loading,
    loadingFilters,
    error,
    refetch,
    clearError,
    isDataStale,
    lastFetch
  };
}

// ============================================
// SPECIALIZED HOOKS
// ============================================

/**
 * Hook specifically for flight reports
 */
export function useFlightReportData(filters: ReportFilters) {
  const reportData = useReportData(filters, 'flight_general');
  
  return {
    ...reportData,
    flights: reportData.data.flights,
    flightAggregation: reportData.data.flightAggregation,
    airportStats: reportData.data.airportStats,
    routeStats: reportData.data.routeStats
  };
}

/**
 * Hook specifically for financial reports
 */
export function useFinancialReportData(filters: ReportFilters) {
  const reportData = useReportData(filters, 'financial_consolidated');
  
  return {
    ...reportData,
    transactions: reportData.data.financialTransactions,
    financialAggregation: reportData.data.financialAggregation
  };
}

/**
 * Hook specifically for maintenance reports
 */
export function useMaintenanceReportData(filters: ReportFilters) {
  const reportData = useReportData(filters, 'maintenance_overview');
  
  return {
    ...reportData,
    maintenanceRecords: reportData.data.maintenanceRecords,
    maintenanceAggregation: reportData.data.maintenanceAggregation
  };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Clear all cached report data
 */
export function clearReportDataCache(): void {
  reportDataCache.clear();
  console.log('Report data cache cleared');
}

/**
 * Get cache statistics
 */
export function getReportDataCacheStats(): {
  size: number;
  entries: Array<{ key: string; timestamp: Date; age: number }>;
} {
  const entries = Array.from(reportDataCache.entries()).map(([key, entry]) => ({
    key,
    timestamp: entry.timestamp,
    age: Date.now() - entry.timestamp.getTime()
  }));
  
  return {
    size: reportDataCache.size,
    entries
  };
}