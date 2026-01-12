import React, { useState } from 'react';
import {
  DataTable,
  ChartContainer,
  KPICard,
  KPIGrid,
  createChartConfig,
  createKPICard,
  ChartPresets,
  ReportErrorBoundary,
} from '../index';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, DollarSign, Activity } from 'lucide-react';
import type { ColumnDef, PaginationConfig, SortingConfig, FilteringConfig } from '@/types/reports';

// Sample data for examples
const sampleFlightData = [
  { id: 1, date: '2024-01-15', origin: 'KJFK', destination: 'KLAX', aircraft: 'N123AB', duration: '5:30', status: 'completed' },
  { id: 2, date: '2024-01-16', origin: 'KLAX', destination: 'KORD', aircraft: 'N456CD', duration: '4:15', status: 'completed' },
  { id: 3, date: '2024-01-17', origin: 'KORD', destination: 'KJFK', aircraft: 'N123AB', duration: '2:45', status: 'cancelled' },
  { id: 4, date: '2024-01-18', origin: 'KJFK', destination: 'KMIA', aircraft: 'N789EF', duration: '3:20', status: 'completed' },
  { id: 5, date: '2024-01-19', origin: 'KMIA', destination: 'KJFK', aircraft: 'N789EF', duration: '3:15', status: 'completed' },
];

const sampleChartData = [
  { month: 'Jan', flights: 45, hours: 120 },
  { month: 'Feb', flights: 52, hours: 140 },
  { month: 'Mar', flights: 48, hours: 135 },
  { month: 'Apr', flights: 61, hours: 165 },
  { month: 'May', flights: 55, hours: 150 },
  { month: 'Jun', flights: 67, hours: 180 },
];

const samplePieData = [
  { name: 'Completed', value: 85 },
  { name: 'Cancelled', value: 10 },
  { name: 'Planned', value: 5 },
];

export function ComponentExamples() {
  const [pagination, setPagination] = useState<PaginationConfig>({
    page: 1,
    pageSize: 3,
    total: sampleFlightData.length,
    showSizeChanger: true,
    pageSizeOptions: [3, 5, 10],
  });

  const [sorting, setSorting] = useState<SortingConfig>({
    field: 'date',
    direction: 'desc',
  });

  const [filtering, setFiltering] = useState<FilteringConfig>({
    searchTerm: '',
  });

  // Table columns definition
  const columns: ColumnDef<typeof sampleFlightData[0]>[] = [
    {
      key: 'date',
      title: 'Date',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'origin',
      title: 'Origin',
      sortable: true,
    },
    {
      key: 'destination',
      title: 'Destination',
      sortable: true,
    },
    {
      key: 'aircraft',
      title: 'Aircraft',
      sortable: true,
    },
    {
      key: 'duration',
      title: 'Duration',
      sortable: false,
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'completed' ? 'bg-green-100 text-green-800' :
          value === 'cancelled' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {value}
        </span>
      ),
    },
  ];

  // KPI cards data
  const kpiCards = [
    createKPICard('Total Flights', 234, {
      icon: <Activity className="h-4 w-4" />,
      change: { value: 12.5, type: 'increase', period: 'last month' },
      description: 'Total flights completed',
      trend: [
        { period: 'Jan', value: 45 },
        { period: 'Feb', value: 52 },
        { period: 'Mar', value: 48 },
        { period: 'Apr', value: 61 },
        { period: 'May', value: 55 },
        { period: 'Jun', value: 67 },
      ],
    }),
    createKPICard('Flight Hours', '1,245', {
      icon: <TrendingUp className="h-4 w-4" />,
      change: { value: 8.3, type: 'increase', period: 'last month' },
      description: 'Total flight hours logged',
    }),
    createKPICard('Active Aircraft', 12, {
      icon: <Users className="h-4 w-4" />,
      change: { value: -2.1, type: 'decrease', period: 'last month' },
      description: 'Currently active aircraft',
    }),
    createKPICard('Revenue', '$125,430', {
      icon: <DollarSign className="h-4 w-4" />,
      change: { value: 15.7, type: 'increase', period: 'last month' },
      description: 'Total revenue generated',
    }),
  ];

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Reports Components Examples</h1>
        <p className="text-muted-foreground">
          Interactive examples of the reusable data visualization components.
        </p>
      </div>

      {/* KPI Cards Example */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">KPI Cards</h2>
        <KPIGrid cards={kpiCards} columns={4} />
      </section>

      {/* Data Table Example */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Data Table</h2>
        <ReportErrorBoundary reportType="flight data table">
          <DataTable
            data={sampleFlightData}
            columns={columns}
            pagination={pagination}
            sorting={sorting}
            filtering={filtering}
            onPaginationChange={setPagination}
            onSortingChange={setSorting}
            onFilteringChange={setFiltering}
            onRowClick={(row) => console.log('Row clicked:', row)}
          />
        </ReportErrorBoundary>
      </section>

      {/* Charts Examples */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Charts</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Line Chart */}
          <ReportErrorBoundary reportType="line chart">
            <ChartContainer
              config={ChartPresets.lineChart(sampleChartData, ['flights', 'hours'], 'month')}
              title="Flight Activity Over Time"
              description="Monthly flights and flight hours"
            />
          </ReportErrorBoundary>

          {/* Bar Chart */}
          <ReportErrorBoundary reportType="bar chart">
            <ChartContainer
              config={ChartPresets.barChart(sampleChartData, ['flights'], 'month')}
              title="Monthly Flights"
              description="Number of flights per month"
            />
          </ReportErrorBoundary>

          {/* Area Chart */}
          <ReportErrorBoundary reportType="area chart">
            <ChartContainer
              config={ChartPresets.areaChart(sampleChartData, ['hours'], 'month')}
              title="Flight Hours Trend"
              description="Cumulative flight hours over time"
            />
          </ReportErrorBoundary>

          {/* Pie Chart */}
          <ReportErrorBoundary reportType="pie chart">
            <ChartContainer
              config={ChartPresets.pieChart(samplePieData, 'value')}
              title="Flight Status Distribution"
              description="Breakdown of flight statuses"
            />
          </ReportErrorBoundary>
        </div>
      </section>

      {/* Loading States Example */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Loading States</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Loading Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={createChartConfig('line', [])}
                loading={true}
                title="Loading Example"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Loading KPI Cards</CardTitle>
            </CardHeader>
            <CardContent>
              <KPIGrid cards={kpiCards.slice(0, 2)} loading={true} />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Error States Example */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Error States</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Chart Error</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={createChartConfig('line', [])}
                error="Failed to load chart data"
                title="Error Example"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Empty Data</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={[]}
                columns={columns}
                emptyMessage="No flights found for the selected criteria"
              />
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}