/**
 * Custom hook for report data management
 * Provides caching, error handling, and loading states
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  fetchAllReportData, 
  getAircraftOptions, 
  getCategoryOptions, 
  getStatusOptions,
  type ReportFilters 
} from '../lib/reports/supabase-queries';
import { 
  aggregateFlightsByMonth, 
  aggregateFinancialByMonth, 
  aggregateMaintenanceByMonth,
  type FlightData,
  type FinancialTransaction,
  type MaintenanceRecord,
  type FlightAggregation,
  type FinancialAggregation,
  type MaintenanceAggregation
} from '../lib/reports/data-processing';

export interface ReportData {
  flights: FlightData[];
  financial: FinancialTransaction[];
  maintenance: MaintenanceRecord[];
}

export interface AggregatedReportData {
  flights: FlightAggregation[];
  financial: FinancialAggregation[];
  maintenance: MaintenanceAggregation[];
}

export interface FilterOptions {
  aircraft: string[];
  categories: string[];
  statuses: string[];
}

export interface UseReportDataReturn {
  // Data
  rawData: ReportData | null;
  aggregatedData: AggregatedReportData | null;
  filterOptions: FilterOptions;
  
  // State
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchData: (filters?: ReportFilters) => Promise<void>;
  refreshData: () => Promise<void>;
  clearError: () => void;
}

export function useReportData(initialFilters?: ReportFilters): UseReportDataReturn {
  const [rawData, setRawData] = useState<ReportData | null>(null);
  const [aggregatedData, setAggregatedData] = useState<AggregatedReportData | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    aircraft: [],
    categories: [],
    statuses: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<ReportFilters>(initialFilters || {});

  /**
   * Fetch filter options
   */
  const fetchFilterOptions = useCallback(async () => {
    try {
      const [aircraft, categories, statuses] = await Promise.all([
        getAircraftOptions(),
        getCategoryOptions(),
        getStatusOptions()
      ]);

      setFilterOptions({
        aircraft: aircraft as string[],
        categories: categories as string[],
        statuses: statuses as string[]
      });
    } catch (err) {
      console.error('Failed to fetch filter options:', err);
      // Don't set error state for filter options failure
    }
  }, []);

  /**
   * Fetch and process report data
   */
  const fetchData = useCallback(async (filters: ReportFilters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch raw data
      const data = await fetchAllReportData(filters);
      setRawData(data);
      setCurrentFilters(filters);

      // Process aggregated data
      const aggregated: AggregatedReportData = {
        flights: aggregateFlightsByMonth(data.flights),
        financial: aggregateFinancialByMonth(data.financial),
        maintenance: aggregateMaintenanceByMonth(data.maintenance)
      };
      setAggregatedData(aggregated);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch report data';
      setError(errorMessage);
      console.error('Error fetching report data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refresh data with current filters
   */
  const refreshData = useCallback(async () => {
    await fetchData(currentFilters);
  }, [fetchData, currentFilters]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Initial data fetch and filter options fetch
   */
  useEffect(() => {
    fetchFilterOptions();
    fetchData(initialFilters);
  }, [fetchFilterOptions, fetchData, initialFilters]);

  return {
    rawData,
    aggregatedData,
    filterOptions,
    loading,
    error,
    fetchData,
    refreshData,
    clearError
  };
}

/**
 * Hook for cached report data (prevents unnecessary refetches)
 */
export function useCachedReportData(_filters: ReportFilters, cacheTime = 5 * 60 * 1000) {
  const [cache, setCache] = useState<Map<string, { data: ReportData; timestamp: number }>>(new Map());
  
  const getCacheKey = (filters: ReportFilters) => {
    return JSON.stringify(filters);
  };

  const getCachedData = useCallback((filters: ReportFilters): ReportData | null => {
    const key = getCacheKey(filters);
    const cached = cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < cacheTime) {
      return cached.data;
    }
    
    return null;
  }, [cache, cacheTime]);

  const setCachedData = useCallback((filters: ReportFilters, data: ReportData) => {
    const key = getCacheKey(filters);
    setCache(prev => new Map(prev).set(key, { data, timestamp: Date.now() }));
  }, []);

  return {
    getCachedData,
    setCachedData
  };
}