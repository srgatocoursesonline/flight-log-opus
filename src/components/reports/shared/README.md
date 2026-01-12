# Reports Shared Components

This directory contains reusable data visualization components for the Reports and Analytics system. These components are designed to be flexible, accessible, and performant.

## Components Overview

### DataTable
A powerful table component with sorting, pagination, and search functionality.

**Features:**
- Sortable columns
- Client-side and server-side pagination
- Search/filtering
- Row click handling
- Loading states
- Empty states
- Responsive design

**Usage:**
```tsx
import { DataTable } from '@/components/reports/shared';

const columns = [
  { key: 'name', title: 'Name', sortable: true },
  { key: 'age', title: 'Age', sortable: true },
  { key: 'city', title: 'City', render: (value) => <strong>{value}</strong> },
];

<DataTable
  data={data}
  columns={columns}
  pagination={pagination}
  sorting={sorting}
  filtering={filtering}
  onPaginationChange={setPagination}
  onSortingChange={setSorting}
  onFilteringChange={setFiltering}
  onRowClick={(row) => console.log(row)}
/>
```

### ChartContainer
A flexible chart component supporting multiple chart types using Recharts.

**Supported Chart Types:**
- Line charts
- Bar charts
- Area charts
- Pie charts
- Scatter plots

**Features:**
- Responsive design
- Loading states
- Error handling
- Customizable colors and styling
- Grid and axis configuration
- Tooltips and legends

**Usage:**
```tsx
import { ChartContainer, ChartPresets } from '@/components/reports/shared';

// Using presets
<ChartContainer
  config={ChartPresets.lineChart(data, ['value1', 'value2'], 'date')}
  title="My Chart"
  description="Chart description"
/>

// Custom configuration
<ChartContainer
  config={{
    type: 'bar',
    data: chartData,
    xAxisKey: 'month',
    dataKeys: ['revenue', 'expenses'],
    colors: ['#8884d8', '#82ca9d'],
    showGrid: true,
    showLegend: true,
    height: 400,
  }}
/>
```

### KPICard & KPIGrid
Components for displaying key performance indicators with trend information.

**Features:**
- Multiple sizes (sm, md, lg)
- Trend indicators
- Mini trend charts
- Change percentages
- Icons and descriptions
- Loading states

**Usage:**
```tsx
import { KPICard, KPIGrid, createKPICard } from '@/components/reports/shared';

const kpiData = createKPICard('Total Flights', 234, {
  icon: <Activity className="h-4 w-4" />,
  change: { value: 12.5, type: 'increase', period: 'last month' },
  description: 'Total flights completed',
  trend: [
    { period: 'Jan', value: 45 },
    { period: 'Feb', value: 52 },
    // ...
  ],
});

<KPICard data={kpiData} size="md" />

// Or use grid for multiple cards
<KPIGrid cards={[kpiData1, kpiData2, kpiData3]} columns={3} />
```

### Loading States
Various loading skeleton components for different UI elements.

**Available Components:**
- `TableSkeleton` - For data tables
- `ChartSkeleton` - For charts
- `KPICardsSkeleton` - For KPI cards
- `LoadingSpinner` - Generic spinner
- `PageLoadingState` - Full page loading
- `SectionLoadingState` - Section loading

**Usage:**
```tsx
import { TableSkeleton, ChartSkeleton } from '@/components/reports/shared';

{loading ? <TableSkeleton rows={5} columns={4} /> : <DataTable {...props} />}
{loading ? <ChartSkeleton height={300} /> : <ChartContainer {...props} />}
```

### Error Boundaries
Error boundary components for graceful error handling.

**Available Components:**
- `ErrorBoundary` - Generic error boundary
- `ReportErrorBoundary` - Report-specific error boundary
- `ChartErrorBoundary` - Chart-specific error boundary
- `TableErrorBoundary` - Table-specific error boundary

**Usage:**
```tsx
import { ReportErrorBoundary } from '@/components/reports/shared';

<ReportErrorBoundary reportType="flight data">
  <DataTable {...props} />
</ReportErrorBoundary>
```

## Type Definitions

### ColumnDef
```tsx
interface ColumnDef<T> {
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
```

### ChartConfig
```tsx
interface ChartConfig {
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
```

### KPICardData
```tsx
interface KPICardData {
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
```

## Styling and Theming

All components use Tailwind CSS classes and are compatible with the shadcn/ui design system. They automatically adapt to light/dark themes and follow the application's color scheme.

### Customization
Components accept `className` props for additional styling:

```tsx
<DataTable className="my-custom-table" />
<ChartContainer className="border-2 border-primary" />
<KPICard className="hover:shadow-lg" />
```

## Accessibility

All components are built with accessibility in mind:

- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management

## Performance Considerations

- **Data Virtualization**: Large tables automatically implement virtual scrolling
- **Chart Optimization**: Charts sample large datasets for better performance
- **Lazy Loading**: Components support lazy loading patterns
- **Memoization**: Components use React.memo and useMemo for optimization

## Testing

Components include comprehensive test suites:

```bash
# Run tests for shared components
npm test -- --testPathPatterns="reports/shared"

# Run with coverage
npm test -- --testPathPatterns="reports/shared" --coverage
```

## Examples

See `examples/ComponentExamples.tsx` for interactive examples of all components in action.

## Best Practices

1. **Error Boundaries**: Always wrap components in appropriate error boundaries
2. **Loading States**: Provide loading states for better UX
3. **Responsive Design**: Test components on different screen sizes
4. **Accessibility**: Ensure proper ARIA labels and keyboard navigation
5. **Performance**: Use pagination for large datasets
6. **Type Safety**: Use TypeScript interfaces for better development experience

## Migration Guide

When upgrading components, check the CHANGELOG.md for breaking changes and migration instructions.