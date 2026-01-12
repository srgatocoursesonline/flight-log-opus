export interface ReportFilters {
  dateRange: {
    from: Date;
    to: Date;
    preset?: DatePreset;
  };
  aircraft?: string[];
  airports?: {
    departure?: string[];
    arrival?: string[];
    city?: string[];
    country?: string[];
  };
  status?: FlightStatus[];
  categories?: {
    expense?: string[];
    revenue?: string[];
    maintenance?: string[];
  };
  comparison?: {
    enabled: boolean;
    period: 'previous' | 'year_ago' | 'custom';
    customRange?: { from: Date; to: Date };
  };
}

export type DatePreset = 
  | 'last_7_days'
  | 'last_30_days'
  | 'last_3_months'
  | 'last_6_months'
  | 'last_year'
  | 'all_time'
  | 'custom';

export type FlightStatus = 'completed' | 'cancelled' | 'planned' | 'in_progress';

export type ReportType = 
  | 'flight_general'
  | 'flight_logbook'
  | 'flight_airports'
  | 'flight_routes'
  | 'financial_consolidated'
  | 'financial_revenue'
  | 'financial_expense'
  | 'financial_cashflow'
  | 'maintenance_overview'
  | 'maintenance_costs'
  | 'maintenance_compliance'
  | 'goals_progress'
  | 'custom';

export interface ReportData {
  id: string;
  type: ReportType;
  title: string;
  description?: string;
  data: any;
  metadata: {
    generatedAt: Date;
    filters: ReportFilters;
    recordCount: number;
    executionTime: number;
  };
  visualizations: VisualizationConfig[];
}

export interface VisualizationConfig {
  type: 'table' | 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  title: string;
  data: any[];
  config?: Record<string, any>;
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
  showSizeChanger?: boolean;
  pageSizeOptions?: number[];
}

export interface SortingConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilteringConfig {
  searchTerm: string;
  columnFilters?: Record<string, any>;
}

export interface ColumnDef<T> {
  key: keyof T | string;
  title: string;
  dataIndex?: keyof T;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export interface KPICardData {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
    period: string;
  };
  icon?: React.ReactNode;
  description?: string;
  trend?: Array<{ period: string; value: number }>;
}

// Flight aggregation types
export interface FlightAggregation {
  totalFlights: number;
  totalHours: number;
  totalDistance: number;
  averageDuration: number;
  averageDistance: number;
  completionRate: number;
  uniqueAirports: number;
  uniqueCountries: number;
  byStatus: Record<FlightStatus, number>;
  byAircraft: Record<string, FlightStats>;
  byMonth: Array<{ month: string; flights: number; hours: number }>;
}

export interface FlightStats {
  flights: number;
  hours: number;
  distance: number;
  averageDuration: number;
  averageDistance: number;
}

// Financial aggregation types
export interface FinancialAggregation {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  roi: number;
  byCategory: {
    revenue: Record<string, number>;
    expenses: Record<string, number>;
  };
  byMonth: Array<{ month: string; revenue: number; expenses: number }>;
  cashFlow: Array<{ date: string; balance: number }>;
}

// Maintenance aggregation types
export interface MaintenanceAggregation {
  totalMaintenances: number;
  totalCost: number;
  averageCost: number;
  costPerHour: number;
  byCategory: Record<string, { count: number; cost: number }>;
  byAircraft: Record<string, MaintenanceStats>;
  upcomingMaintenances: any[]; // MaintenanceRecord type to be imported
  complianceStatus: ComplianceStatus;
}

export interface MaintenanceStats {
  count: number;
  cost: number;
  averageCost: number;
  lastMaintenance: Date;
  nextMaintenance?: Date;
}

export interface ComplianceStatus {
  inspections: { current: number; overdue: number; upcoming: number };
  certificates: { valid: number; expiring: number; expired: number };
  airworthiness: { current: number; expiring: number; expired: number };
}

// Geographic data types
export interface AirportStats {
  icao: string;
  name: string;
  city: string;
  country: string;
  coordinates: [number, number];
  visitCount: number;
  firstVisit: Date;
  lastVisit: Date;
  totalFlightTime: number;
  averageFlightTime: number;
}

export interface RouteStats {
  origin: string;
  destination: string;
  flightCount: number;
  totalDistance: number;
  totalTime: number;
  averageTime: number;
  totalCR: number;
  averageCR: number;
  coordinates: {
    origin: [number, number];
    destination: [number, number];
  };
}

export interface ChartData {
  [key: string]: any;
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'area' | 'pie' | 'scatter';
  data: ChartData[];
  xAxisKey?: string;
  yAxisKey?: string;
  dataKeys?: string[];
  colors?: string[];
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  height?: number;
  responsive?: boolean;
}

// Error handling types
export type ReportError = 
  | 'DATA_FETCH_ERROR'
  | 'EXPORT_ERROR'
  | 'CALCULATION_ERROR'
  | 'PERMISSION_ERROR'
  | 'TIMEOUT_ERROR';

export interface ReportErrorInfo {
  type: ReportError;
  message: string;
  details?: any;
  timestamp: Date;
  reportType?: ReportType;
  filters?: ReportFilters;
}