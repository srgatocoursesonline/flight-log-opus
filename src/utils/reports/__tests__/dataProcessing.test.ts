// ============================================
// TESTS FOR DATA PROCESSING UTILITIES
// ============================================

// Using Jest for testing
import {
  parseFlightTime,
  formatDuration,
  formatDistance,
  formatCurrency,
  calculatePercentageChange,
  processFlightAggregation,
  applyFlightFilters
} from '../dataProcessing';
import { FlightWithDetails } from '@/types/flight';
import { ReportFilters } from '@/types/reports';

describe('Data Processing Utilities', () => {
  describe('parseFlightTime', () => {
    it('should parse HH:MM format correctly', () => {
      expect(parseFlightTime('2:30')).toBe(2.5);
      expect(parseFlightTime('1:15')).toBe(1.25);
      expect(parseFlightTime('0:45')).toBe(0.75);
    });

    it('should parse HH:MM:SS format correctly', () => {
      expect(parseFlightTime('2:30:30')).toBeCloseTo(2.508333333333333);
      expect(parseFlightTime('1:15:45')).toBeCloseTo(1.2625);
    });

    it('should handle decimal hours', () => {
      expect(parseFlightTime('2.5')).toBe(2.5);
      expect(parseFlightTime('1.25')).toBe(1.25);
    });

    it('should handle empty or invalid input', () => {
      expect(parseFlightTime('')).toBe(0);
      expect(parseFlightTime('invalid')).toBe(0);
    });
  });

  describe('formatDuration', () => {
    it('should format hours correctly', () => {
      expect(formatDuration(2.5)).toBe('2h 30m');
      expect(formatDuration(1.0)).toBe('1h');
      expect(formatDuration(0.5)).toBe('30m');
      expect(formatDuration(0.25)).toBe('15m');
    });
  });

  describe('formatDistance', () => {
    it('should format distance correctly', () => {
      expect(formatDistance(1500)).toBe('1.5k km');
      expect(formatDistance(500)).toBe('500 km');
      expect(formatDistance(2500)).toBe('2.5k km');
    });
  });

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      const result = formatCurrency(1500.50);
      expect(result).toContain('1.500,50');
    });
  });

  describe('calculatePercentageChange', () => {
    it('should calculate percentage change correctly', () => {
      expect(calculatePercentageChange(120, 100)).toBe(20);
      expect(calculatePercentageChange(80, 100)).toBe(-20);
      expect(calculatePercentageChange(100, 0)).toBe(100);
      expect(calculatePercentageChange(0, 100)).toBe(-100);
    });
  });

  describe('applyFlightFilters', () => {
    const mockFlights: FlightWithDetails[] = [
      {
        id: '1',
        user_id: 'user1',
        departure_airport: 'SBSP',
        arrival_airport: 'SBRJ',
        departure_time: '2024-01-15T10:00:00Z',
        arrival_time: '2024-01-15T11:30:00Z',
        aircraft_type: 'A320',
        flight_time: '1:30',
        distance: 350,
        status: 'arrived',
        notes: '',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        user_id: 'user1',
        departure_airport: 'SBRJ',
        arrival_airport: 'SBSP',
        departure_time: '2024-01-20T14:00:00Z',
        arrival_time: '2024-01-20T15:30:00Z',
        aircraft_type: 'B737',
        flight_time: '1:30',
        distance: 350,
        status: 'arrived',
        notes: '',
        created_at: '2024-01-20T14:00:00Z',
        updated_at: '2024-01-20T14:00:00Z'
      }
    ];

    it('should filter by date range', () => {
      const filters: ReportFilters = {
        dateRange: {
          from: new Date('2024-01-16'),
          to: new Date('2024-01-25')
        }
      };

      const result = applyFlightFilters(mockFlights, filters);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('should filter by aircraft', () => {
      const filters: ReportFilters = {
        dateRange: {
          from: new Date('2024-01-01'),
          to: new Date('2024-01-31')
        },
        aircraft: ['A320']
      };

      const result = applyFlightFilters(mockFlights, filters);
      expect(result).toHaveLength(1);
      expect(result[0].aircraft_type).toBe('A320');
    });

    it('should filter by status', () => {
      const filters: ReportFilters = {
        dateRange: {
          from: new Date('2024-01-01'),
          to: new Date('2024-01-31')
        },
        status: ['cancelled']
      };

      const result = applyFlightFilters(mockFlights, filters);
      expect(result).toHaveLength(0);
    });
  });

  describe('processFlightAggregation', () => {
    const mockFlights: FlightWithDetails[] = [
      {
        id: '1',
        user_id: 'user1',
        departure_airport: 'SBSP',
        arrival_airport: 'SBRJ',
        departure_time: '2024-01-15T10:00:00Z',
        arrival_time: '2024-01-15T11:30:00Z',
        aircraft_type: 'A320',
        flight_time: '1:30',
        distance: 350,
        status: 'arrived',
        notes: '',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        user_id: 'user1',
        departure_airport: 'SBRJ',
        arrival_airport: 'SBSP',
        departure_time: '2024-01-20T14:00:00Z',
        arrival_time: '2024-01-20T15:30:00Z',
        aircraft_type: 'A320',
        flight_time: '1:30',
        distance: 350,
        status: 'arrived',
        notes: '',
        created_at: '2024-01-20T14:00:00Z',
        updated_at: '2024-01-20T14:00:00Z'
      }
    ];

    it('should calculate basic aggregations correctly', () => {
      const result = processFlightAggregation(mockFlights);

      expect(result.totalFlights).toBe(2);
      expect(result.totalHours).toBe(3.0);
      expect(result.totalDistance).toBe(700);
      expect(result.averageDuration).toBe(1.5);
      expect(result.averageDistance).toBe(350);
      expect(result.completionRate).toBe(100);
      expect(result.uniqueAirports).toBe(2);
    });

    it('should group by aircraft correctly', () => {
      const result = processFlightAggregation(mockFlights);

      expect(result.byAircraft['A320']).toBeDefined();
      expect(result.byAircraft['A320'].flights).toBe(2);
      expect(result.byAircraft['A320'].hours).toBe(3.0);
      expect(result.byAircraft['A320'].distance).toBe(700);
    });

    it('should group by status correctly', () => {
      const result = processFlightAggregation(mockFlights);

      expect(result.byStatus['arrived']).toBe(2);
    });
  });
});