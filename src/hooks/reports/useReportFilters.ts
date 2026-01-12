import { useState, useCallback, useMemo } from 'react';
import { ReportFilters, DatePreset, FlightStatus } from '@/types/reports';

// Default filter values
const DEFAULT_FILTERS: ReportFilters = {
  dateRange: {
    from: new Date(2020, 0, 1), // Start from 2020 to catch all flights
    to: new Date(2030, 11, 31), // End in 2030 to catch future flights
    preset: 'all_time'
  },
  aircraft: [],
  airports: {
    departure: [],
    arrival: [],
    city: [],
    country: []
  },
  status: [],
  categories: {
    expense: [],
    revenue: [],
    maintenance: []
  },
  comparison: {
    enabled: false,
    period: 'previous'
  }
};

// Configurações de presets de data
const DATE_PRESETS: Record<DatePreset, { label: string; getDates: () => { from: Date; to: Date } }> = {
  last_7_days: {
    label: 'Últimos 7 dias',
    getDates: () => ({
      from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      to: new Date()
    })
  },
  last_30_days: {
    label: 'Últimos 30 dias',
    getDates: () => ({
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      to: new Date()
    })
  },
  last_3_months: {
    label: 'Últimos 3 meses',
    getDates: () => ({
      from: new Date(new Date().getFullYear(), new Date().getMonth() - 3, 1),
      to: new Date()
    })
  },
  last_6_months: {
    label: 'Últimos 6 meses',
    getDates: () => ({
      from: new Date(new Date().getFullYear(), new Date().getMonth() - 6, 1),
      to: new Date()
    })
  },
  last_year: {
    label: 'Último ano',
    getDates: () => ({
      from: new Date(new Date().getFullYear() - 1, 0, 1),
      to: new Date()
    })
  },
  all_time: {
    label: 'Todo o período',
    getDates: () => ({
      from: new Date(2020, 0, 1), // Data inicial razoável
      to: new Date()
    })
  },
  custom: {
    label: 'Período personalizado',
    getDates: () => ({
      from: new Date(),
      to: new Date()
    })
  }
};

export interface UseReportFiltersReturn {
  filters: ReportFilters;
  updateFilters: (updates: Partial<ReportFilters>) => void;
  updateDateRange: (from: Date, to: Date, preset?: DatePreset) => void;
  updateDatePreset: (preset: DatePreset) => void;
  updateAircraftFilter: (aircraft: string[]) => void;
  updateAirportFilter: (type: keyof ReportFilters['airports'], airports: string[]) => void;
  updateStatusFilter: (status: FlightStatus[]) => void;
  updateCategoryFilter: (type: keyof ReportFilters['categories'], categories: string[]) => void;
  toggleComparison: (enabled: boolean) => void;
  resetFilters: () => void;
  isFiltered: boolean;
  datePresets: typeof DATE_PRESETS;
}

export function useReportFilters(initialFilters?: Partial<ReportFilters>): UseReportFiltersReturn {
  const [filters, setFilters] = useState<ReportFilters>(() => ({
    ...DEFAULT_FILTERS,
    ...initialFilters
  }));

  // Update filters with partial updates
  const updateFilters = useCallback((updates: Partial<ReportFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  // Update date range
  const updateDateRange = useCallback((from: Date, to: Date, preset?: DatePreset) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        from,
        to,
        preset
      }
    }));
  }, []);

  // Update date preset
  const updateDatePreset = useCallback((preset: DatePreset) => {
    const dates = DATE_PRESETS[preset].getDates();
    updateDateRange(dates.from, dates.to, preset);
  }, [updateDateRange]);

  // Update aircraft filter
  const updateAircraftFilter = useCallback((aircraft: string[]) => {
    setFilters(prev => ({
      ...prev,
      aircraft
    }));
  }, []);

  // Update airport filter
  const updateAirportFilter = useCallback((type: keyof ReportFilters['airports'], airports: string[]) => {
    setFilters(prev => ({
      ...prev,
      airports: {
        ...prev.airports,
        [type]: airports
      }
    }));
  }, []);

  // Update status filter
  const updateStatusFilter = useCallback((status: FlightStatus[]) => {
    setFilters(prev => ({
      ...prev,
      status
    }));
  }, []);

  // Update category filter
  const updateCategoryFilter = useCallback((type: keyof ReportFilters['categories'], categories: string[]) => {
    setFilters(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [type]: categories
      }
    }));
  }, []);

  // Toggle comparison mode
  const toggleComparison = useCallback((enabled: boolean) => {
    setFilters(prev => ({
      ...prev,
      comparison: {
        ...prev.comparison,
        enabled
      }
    }));
  }, []);

  // Reset filters to default
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  // Check if any filters are applied (different from default)
  const isFiltered = useMemo(() => {
    return (
      filters.aircraft?.length > 0 ||
      filters.airports?.departure?.length > 0 ||
      filters.airports?.arrival?.length > 0 ||
      filters.airports?.city?.length > 0 ||
      filters.airports?.country?.length > 0 ||
      filters.status?.length > 0 ||
      filters.categories?.expense?.length > 0 ||
      filters.categories?.revenue?.length > 0 ||
      filters.categories?.maintenance?.length > 0 ||
      filters.comparison?.enabled ||
      filters.dateRange.preset !== 'last_30_days'
    );
  }, [filters]);

  return {
    filters,
    updateFilters,
    updateDateRange,
    updateDatePreset,
    updateAircraftFilter,
    updateAirportFilter,
    updateStatusFilter,
    updateCategoryFilter,
    toggleComparison,
    resetFilters,
    isFiltered,
    datePresets: DATE_PRESETS
  };
}