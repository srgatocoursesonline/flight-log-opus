import { renderHook, act } from '@testing-library/react';
import { useReportFilters } from '@/hooks/reports/useReportFilters';
import { DatePreset, FlightStatus } from '@/types/reports';

describe('useReportFilters', () => {
  it('should initialize with default filters', () => {
    const { result } = renderHook(() => useReportFilters());
    
    expect(result.current.filters.dateRange.preset).toBe('last_30_days');
    expect(result.current.filters.aircraft).toEqual([]);
    expect(result.current.filters.status).toEqual([]);
    expect(result.current.isFiltered).toBe(false);
  });

  it('should update date preset correctly', () => {
    const { result } = renderHook(() => useReportFilters());
    
    act(() => {
      result.current.updateDatePreset('last_7_days');
    });
    
    expect(result.current.filters.dateRange.preset).toBe('last_7_days');
    expect(result.current.isFiltered).toBe(true);
  });

  it('should update aircraft filter correctly', () => {
    const { result } = renderHook(() => useReportFilters());
    
    act(() => {
      result.current.updateAircraftFilter(['B737', 'A320']);
    });
    
    expect(result.current.filters.aircraft).toEqual(['B737', 'A320']);
    expect(result.current.isFiltered).toBe(true);
  });

  it('should update status filter correctly', () => {
    const { result } = renderHook(() => useReportFilters());
    
    act(() => {
      result.current.updateStatusFilter(['arrived', 'departed'] as FlightStatus[]);
    });
    
    expect(result.current.filters.status).toEqual(['arrived', 'departed']);
    expect(result.current.isFiltered).toBe(true);
  });

  it('should update airport filter correctly', () => {
    const { result } = renderHook(() => useReportFilters());
    
    act(() => {
      result.current.updateAirportFilter('departure', ['SBSP', 'SBGR']);
    });
    
    expect(result.current.filters.airports?.departure).toEqual(['SBSP', 'SBGR']);
    expect(result.current.isFiltered).toBe(true);
  });

  it('should toggle comparison mode correctly', () => {
    const { result } = renderHook(() => useReportFilters());
    
    act(() => {
      result.current.toggleComparison(true);
    });
    
    expect(result.current.filters.comparison?.enabled).toBe(true);
    expect(result.current.isFiltered).toBe(true);
  });

  it('should reset filters correctly', () => {
    const { result } = renderHook(() => useReportFilters());
    
    // Apply some filters first
    act(() => {
      result.current.updateAircraftFilter(['B737']);
      result.current.updateStatusFilter(['arrived'] as FlightStatus[]);
      result.current.toggleComparison(true);
    });
    
    expect(result.current.isFiltered).toBe(true);
    
    // Reset filters
    act(() => {
      result.current.resetFilters();
    });
    
    expect(result.current.filters.aircraft).toEqual([]);
    expect(result.current.filters.status).toEqual([]);
    expect(result.current.filters.comparison?.enabled).toBe(false);
    expect(result.current.isFiltered).toBe(false);
  });

  it('should handle custom date range correctly', () => {
    const { result } = renderHook(() => useReportFilters());
    
    const fromDate = new Date('2024-01-01');
    const toDate = new Date('2024-01-31');
    
    act(() => {
      result.current.updateDateRange(fromDate, toDate, 'custom');
    });
    
    expect(result.current.filters.dateRange.from).toEqual(fromDate);
    expect(result.current.filters.dateRange.to).toEqual(toDate);
    expect(result.current.filters.dateRange.preset).toBe('custom');
    expect(result.current.isFiltered).toBe(true);
  });

  it('should provide correct date presets', () => {
    const { result } = renderHook(() => useReportFilters());
    
    expect(result.current.datePresets).toHaveProperty('last_7_days');
    expect(result.current.datePresets).toHaveProperty('last_30_days');
    expect(result.current.datePresets).toHaveProperty('last_3_months');
    expect(result.current.datePresets).toHaveProperty('last_6_months');
    expect(result.current.datePresets).toHaveProperty('last_year');
    expect(result.current.datePresets).toHaveProperty('all_time');
    expect(result.current.datePresets).toHaveProperty('custom');
    
    expect(result.current.datePresets.last_7_days.label).toBe('Últimos 7 dias');
    expect(result.current.datePresets.last_30_days.label).toBe('Últimos 30 dias');
  });
});