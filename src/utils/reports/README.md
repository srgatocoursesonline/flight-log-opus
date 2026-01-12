# Reports Data Access Layer

This module provides the data access layer and aggregation utilities for the Flight Log Opus reports system.

## Components

### Data Processing (`dataProcessing.ts`)
- Flight data aggregation and statistics
- Financial data processing
- Maintenance data aggregation
- Airport and route statistics
- Utility functions for data transformation

### Database Queries (`reportQueries.ts`)
- Supabase queries for all report data
- Optimized queries with proper filtering
- Parallel data fetching for performance
- Filter options for dropdowns

### Report Data Hook (`useReportData.ts`)
- React hook with caching and error handling
- Automatic data processing and aggregation
- Specialized hooks for different report types
- Cache management and performance optimization

### Database Setup (`databaseSetup.ts`)
- Database validation and setup utilities
- Materialized view management
- Performance monitoring and optimization
- Initialization functions

## Usage

```typescript
import { useReportData } from '@/hooks/reports/useReportData';
import { useReportFilters } from '@/hooks/reports/useReportFilters';

function MyReportComponent() {
  const { filters } = useReportFilters();
  const { data, loading, error } = useReportData(filters);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>Flight Count: {data.flightAggregation?.totalFlights}</div>;
}
```

## Database Setup

Run the SQL script to create materialized views and indexes:
```sql
-- Execute database/views/create_report_views_and_indexes.sql
```

## Testing

Tests are included for data processing utilities:
```bash
npm test src/utils/reports/__tests__/dataProcessing.test.ts
```