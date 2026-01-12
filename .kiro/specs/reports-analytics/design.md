# Design Document

## Overview

The Reports and Analytics system is a comprehensive data visualization and export platform that consolidates information from all Flight Log Opus modules (flights, financial, maintenance, goals) into interactive reports with geographic visualization capabilities. The system will be built as a new module within the existing React/TypeScript application, leveraging the current tech stack including Supabase, Recharts, Leaflet, and shadcn/ui components.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Reports & Analytics UI                   │
├─────────────────────────────────────────────────────────────┤
│  Dashboard │ Report Builder │ Map Viewer │ Export Manager   │
├─────────────────────────────────────────────────────────────┤
│                    Data Processing Layer                    │
├─────────────────────────────────────────────────────────────┤
│  Aggregation │ Filtering │ Calculations │ Insights Engine  │
├─────────────────────────────────────────────────────────────┤
│                    Data Access Layer                        │
├─────────────────────────────────────────────────────────────┤
│    Supabase Client │ Query Builder │ Cache Manager         │
├─────────────────────────────────────────────────────────────┤
│                      Database Layer                         │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL │ Views │ Functions │ Materialized Views       │
└─────────────────────────────────────────────────────────────┘
```

### Module Structure

```
src/
├── pages/
│   └── Reports.tsx                    # Main reports page
├── components/
│   └── reports/
│       ├── dashboard/
│       │   ├── ReportsDashboard.tsx   # Main dashboard
│       │   ├── QuickReportCards.tsx   # KPI cards
│       │   └── FilterSidebar.tsx      # Global filters
│       ├── flight-reports/
│       │   ├── GeneralFlightReport.tsx
│       │   ├── LogbookReport.tsx
│       │   ├── AirportsReport.tsx
│       │   └── RoutesReport.tsx
│       ├── financial-reports/
│       │   ├── ConsolidatedFinancial.tsx
│       │   ├── RevenueReport.tsx
│       │   ├── ExpenseReport.tsx
│       │   └── CashFlowReport.tsx
│       ├── maintenance-reports/
│       │   ├── MaintenanceOverview.tsx
│       │   ├── CostAnalysis.tsx
│       │   └── ComplianceReport.tsx
│       ├── geographic/
│       │   ├── InteractiveMap.tsx
│       │   ├── AirportMarkers.tsx
│       │   ├── RouteLines.tsx
│       │   └── Heatmap.tsx
│       ├── custom/
│       │   ├── ReportBuilder.tsx
│       │   ├── FieldSelector.tsx
│       │   └── VisualizationPicker.tsx
│       ├── export/
│       │   ├── ExportModal.tsx
│       │   ├── FormatSelector.tsx
│       │   └── ExportProgress.tsx
│       └── shared/
│           ├── DataTable.tsx
│           ├── ChartContainer.tsx
│           ├── InsightsPanel.tsx
│           └── PeriodComparison.tsx
├── hooks/
│   └── reports/
│       ├── useReportData.ts
│       ├── useReportFilters.ts
│       ├── useExport.ts
│       └── useInsights.ts
├── types/
│   └── reports.ts
└── utils/
    └── reports/
        ├── dataProcessing.ts
        ├── exportUtils.ts
        ├── insightsEngine.ts
        └── chartHelpers.ts
```

## Components and Interfaces

### Core Components

#### 1. ReportsDashboard Component
**Purpose:** Main container for the reports interface
**Props:**
```typescript
interface ReportsDashboardProps {
  initialFilters?: ReportFilters;
  defaultView?: 'dashboard' | 'flights' | 'financial' | 'maintenance' | 'map';
}
```

#### 2. FilterSidebar Component
**Purpose:** Global filtering interface for all reports
**Props:**
```typescript
interface FilterSidebarProps {
  filters: ReportFilters;
  onFiltersChange: (filters: ReportFilters) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}
```

#### 3. DataTable Component
**Purpose:** Reusable table with sorting, pagination, and search
**Props:**
```typescript
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  pagination?: PaginationConfig;
  sorting?: SortingConfig;
  filtering?: FilteringConfig;
  loading?: boolean;
  onRowClick?: (row: T) => void;
}
```

#### 4. InteractiveMap Component
**Purpose:** Geographic visualization of flight operations
**Props:**
```typescript
interface InteractiveMapProps {
  flights: FlightWithDetails[];
  airports: Airport[];
  filters: MapFilters;
  showHeatmap?: boolean;
  showRoutes?: boolean;
  showClusters?: boolean;
  onAirportClick?: (airport: Airport) => void;
  onRouteClick?: (route: Route) => void;
}
```

#### 5. ExportModal Component
**Purpose:** Handle report exports in multiple formats
**Props:**
```typescript
interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: any;
  reportType: ReportType;
  availableFormats: ExportFormat[];
}
```

### Shared Interfaces

#### ReportFilters Interface
```typescript
interface ReportFilters {
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
```

#### ReportData Interface
```typescript
interface ReportData {
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
```

#### ExportConfig Interface
```typescript
interface ExportConfig {
  format: 'excel' | 'csv' | 'pdf' | 'json';
  filename: string;
  options: {
    includeCharts?: boolean;
    includeTables?: boolean;
    includeHeader?: boolean;
    orientation?: 'portrait' | 'landscape';
    pageSize?: 'A4' | 'Letter' | 'Legal';
  };
}
```

## Data Models

### Report Types
```typescript
type ReportType = 
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
```

### Aggregated Data Models
```typescript
interface FlightAggregation {
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

interface FinancialAggregation {
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

interface MaintenanceAggregation {
  totalMaintenances: number;
  totalCost: number;
  averageCost: number;
  costPerHour: number;
  byCategory: Record<string, { count: number; cost: number }>;
  byAircraft: Record<string, MaintenanceStats>;
  upcomingMaintenances: MaintenanceRecord[];
  complianceStatus: ComplianceStatus;
}
```

### Geographic Data Models
```typescript
interface AirportStats {
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

interface RouteStats {
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
```

## Error Handling

### Error Types
```typescript
type ReportError = 
  | 'DATA_FETCH_ERROR'
  | 'EXPORT_ERROR'
  | 'CALCULATION_ERROR'
  | 'PERMISSION_ERROR'
  | 'TIMEOUT_ERROR';

interface ReportErrorInfo {
  type: ReportError;
  message: string;
  details?: any;
  timestamp: Date;
  reportType?: ReportType;
  filters?: ReportFilters;
}
```

### Error Handling Strategy
1. **Data Fetch Errors:** Show error state with retry option
2. **Export Errors:** Display error message with alternative format suggestions
3. **Calculation Errors:** Fall back to basic calculations, log detailed errors
4. **Permission Errors:** Redirect to appropriate access level
5. **Timeout Errors:** Show loading state with cancel option

### Error Boundaries
- Wrap each report section in error boundaries
- Provide fallback UI for each report type
- Log errors to monitoring service
- Allow partial report rendering when possible

## Testing Strategy

### Unit Testing
**Target Coverage:** 90%+

**Test Categories:**
1. **Data Processing Functions**
   - Aggregation calculations
   - Filter applications
   - Data transformations
   - Export utilities

2. **React Components**
   - Rendering with different props
   - User interactions
   - State management
   - Error states

3. **Custom Hooks**
   - Data fetching logic
   - Filter state management
   - Export functionality
   - Insights generation

### Integration Testing
1. **Database Queries**
   - Test complex aggregation queries
   - Verify filter applications
   - Check performance with large datasets

2. **Export Functionality**
   - Test all export formats
   - Verify file generation
   - Check data integrity

3. **Map Integration**
   - Test marker rendering
   - Verify route drawing
   - Check heatmap generation

### End-to-End Testing
1. **Report Generation Flow**
   - Filter application → Data fetch → Visualization
   - Export process from start to finish
   - Map interaction workflows

2. **Responsive Design**
   - Test on different screen sizes
   - Verify mobile interactions
   - Check touch gestures on maps

### Performance Testing
1. **Load Testing**
   - Large datasets (10k+ flights)
   - Complex filter combinations
   - Multiple concurrent users

2. **Memory Testing**
   - Chart rendering with large datasets
   - Map with many markers
   - Export of large files

### Test Data Setup
```typescript
// Mock data generators for testing
const generateMockFlights = (count: number): Flight[] => { /* ... */ };
const generateMockFinancialData = (count: number): FinancialTransaction[] => { /* ... */ };
const generateMockMaintenanceData = (count: number): MaintenanceRecord[] => { /* ... */ };
```

## Database Design

### New Views for Reports
```sql
-- Flight aggregation view
CREATE MATERIALIZED VIEW flight_report_data AS
SELECT 
  user_id,
  DATE_TRUNC('month', departure_time) as month,
  COUNT(*) as flight_count,
  SUM(EXTRACT(EPOCH FROM flight_time)/3600) as total_hours,
  SUM(distance) as total_distance,
  AVG(EXTRACT(EPOCH FROM flight_time)/3600) as avg_duration,
  AVG(distance) as avg_distance,
  COUNT(DISTINCT departure_airport) + COUNT(DISTINCT arrival_airport) as unique_airports,
  aircraft_type,
  status
FROM flights 
GROUP BY user_id, month, aircraft_type, status;

-- Financial aggregation view  
CREATE MATERIALIZED VIEW financial_report_data AS
SELECT 
  user_id,
  DATE_TRUNC('month', transaction_date) as month,
  transaction_type,
  category_id,
  SUM(amount) as total_amount,
  COUNT(*) as transaction_count,
  AVG(amount) as avg_amount
FROM financial_transactions
GROUP BY user_id, month, transaction_type, category_id;

-- Airport statistics view
CREATE MATERIALIZED VIEW airport_stats AS
SELECT 
  user_id,
  airport_code,
  airport_name,
  city,
  country,
  latitude,
  longitude,
  COUNT(*) as visit_count,
  MIN(flight_date) as first_visit,
  MAX(flight_date) as last_visit,
  SUM(flight_duration) as total_flight_time
FROM (
  SELECT user_id, departure_airport as airport_code, departure_time as flight_date, 
         flight_time as flight_duration, /* airport details */ FROM flights
  UNION ALL
  SELECT user_id, arrival_airport as airport_code, arrival_time as flight_date,
         flight_time as flight_duration, /* airport details */ FROM flights
) airport_visits
GROUP BY user_id, airport_code, airport_name, city, country, latitude, longitude;
```

### Indexes for Performance
```sql
-- Indexes for report queries
CREATE INDEX idx_flights_user_date ON flights(user_id, departure_time);
CREATE INDEX idx_flights_airports ON flights(user_id, departure_airport, arrival_airport);
CREATE INDEX idx_financial_user_date ON financial_transactions(user_id, transaction_date);
CREATE INDEX idx_maintenance_user_date ON maintenance_records(user_id, date);

-- Composite indexes for complex filters
CREATE INDEX idx_flights_complex ON flights(user_id, status, aircraft_type, departure_time);
CREATE INDEX idx_financial_complex ON financial_transactions(user_id, transaction_type, category_id, transaction_date);
```

### Stored Functions
```sql
-- Function to calculate flight statistics
CREATE OR REPLACE FUNCTION get_flight_stats(
  p_user_id UUID,
  p_date_from DATE,
  p_date_to DATE,
  p_filters JSONB DEFAULT '{}'
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Complex aggregation logic here
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to generate insights
CREATE OR REPLACE FUNCTION generate_insights(
  p_user_id UUID,
  p_report_type TEXT,
  p_filters JSONB
) RETURNS JSONB AS $$
DECLARE
  insights JSONB;
BEGIN
  -- Insights generation logic
  RETURN insights;
END;
$$ LANGUAGE plpgsql;
```

## Performance Considerations

### Data Loading Strategy
1. **Lazy Loading:** Load report data only when requested
2. **Pagination:** Implement server-side pagination for large datasets
3. **Caching:** Cache aggregated data at multiple levels
4. **Materialized Views:** Pre-calculate common aggregations

### Chart Performance
1. **Data Sampling:** Sample large datasets for chart rendering
2. **Virtual Scrolling:** Use virtual scrolling for large tables
3. **Chart Optimization:** Optimize chart libraries for performance
4. **Progressive Loading:** Load charts progressively

### Map Performance
1. **Marker Clustering:** Cluster markers at high zoom levels
2. **Viewport Culling:** Only render markers in viewport
3. **Level of Detail:** Reduce detail at lower zoom levels
4. **Tile Caching:** Cache map tiles for offline use

### Export Performance
1. **Background Processing:** Process large exports in background
2. **Streaming:** Stream large files instead of loading in memory
3. **Compression:** Compress exported files
4. **Progress Tracking:** Show progress for long-running exports

## Security Considerations

### Data Access Control
1. **Row Level Security:** Ensure users only access their own data
2. **Query Validation:** Validate all query parameters
3. **Rate Limiting:** Limit report generation frequency
4. **Export Limits:** Limit export file sizes and frequency

### Data Privacy
1. **Data Anonymization:** Remove PII from exported data when required
2. **Audit Logging:** Log all report generation and export activities
3. **Secure Storage:** Secure temporary files during export process
4. **Data Retention:** Implement data retention policies for cached reports

### API Security
1. **Authentication:** Verify user authentication for all requests
2. **Authorization:** Check user permissions for specific reports
3. **Input Sanitization:** Sanitize all user inputs
4. **SQL Injection Prevention:** Use parameterized queries

## Accessibility

### WCAG 2.1 AA Compliance
1. **Keyboard Navigation:** Full keyboard accessibility
2. **Screen Reader Support:** Proper ARIA labels and descriptions
3. **Color Contrast:** Ensure sufficient color contrast ratios
4. **Focus Management:** Proper focus management in modals and complex UI

### Chart Accessibility
1. **Alternative Text:** Provide alt text for charts
2. **Data Tables:** Provide tabular alternatives to charts
3. **Color Independence:** Don't rely solely on color for information
4. **High Contrast Mode:** Support high contrast themes

### Map Accessibility
1. **Keyboard Controls:** Keyboard navigation for map
2. **Screen Reader Descriptions:** Describe map content
3. **Alternative Views:** Provide list view alternatives
4. **Zoom Controls:** Accessible zoom controls

## Internationalization

### Multi-language Support
1. **Text Localization:** All UI text in translation files
2. **Date/Number Formats:** Locale-appropriate formatting
3. **Currency Display:** Support multiple currencies
4. **RTL Support:** Right-to-left language support

### Export Localization
1. **Localized Headers:** Translate export headers
2. **Number Formats:** Use locale-appropriate number formats
3. **Date Formats:** Use locale-appropriate date formats
4. **Currency Symbols:** Use appropriate currency symbols

## Migration Strategy

### Phase 1: Core Infrastructure (Weeks 1-2)
- Set up basic routing and navigation
- Create main dashboard layout
- Implement global filter system
- Set up data access layer

### Phase 2: Basic Reports (Weeks 3-4)
- Implement flight reports
- Add basic financial reports
- Create simple export functionality
- Add basic charts and tables

### Phase 3: Advanced Features (Weeks 5-6)
- Add interactive map
- Implement maintenance reports
- Add advanced export formats
- Create insights engine

### Phase 4: Polish and Optimization (Weeks 7-8)
- Performance optimization
- Accessibility improvements
- Mobile responsiveness
- Testing and bug fixes

## Monitoring and Analytics

### Performance Monitoring
1. **Query Performance:** Monitor database query execution times
2. **Render Performance:** Track component render times
3. **Export Performance:** Monitor export generation times
4. **User Experience:** Track user interaction patterns

### Error Monitoring
1. **Error Tracking:** Comprehensive error logging
2. **Performance Issues:** Track performance bottlenecks
3. **User Feedback:** Collect user feedback on reports
4. **Usage Analytics:** Track feature usage patterns

### Success Metrics
1. **Adoption Rate:** Percentage of users using reports
2. **Report Generation:** Number of reports generated
3. **Export Usage:** Export format preferences
4. **User Satisfaction:** User satisfaction scores