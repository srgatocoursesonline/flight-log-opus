import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ChartConfig, ChartData } from '@/types/reports';

interface ChartContainerProps {
  config: ChartConfig;
  title?: string;
  description?: string;
  className?: string;
  loading?: boolean;
  error?: string;
}

const DEFAULT_COLORS = [
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7300',
  '#00ff00',
  '#0088fe',
  '#00c49f',
  '#ffbb28',
  '#ff8042',
  '#8dd1e1',
];

export function ChartContainer({
  config,
  title,
  description,
  className,
  loading = false,
  error,
}: ChartContainerProps) {
  const {
    type,
    data,
    xAxisKey,
    yAxisKey,
    dataKeys = [],
    colors = DEFAULT_COLORS,
    showGrid = true,
    showLegend = true,
    showTooltip = true,
    height = 300,
    responsive = true,
  } = config;

  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="text-muted-foreground">Loading chart...</span>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-destructive mb-2">⚠️ Chart Error</div>
            <div className="text-sm text-muted-foreground">{error}</div>
          </div>
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground">
            <div className="mb-2">📊</div>
            <div className="text-sm">No data available</div>
          </div>
        </div>
      );
    }

    const ChartWrapper = responsive ? ResponsiveContainer : 'div';
    const chartProps = responsive ? { width: '100%', height } : { width: '100%', height };

    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    const renderXAxis = () => showGrid && xAxisKey && (
      <XAxis 
        dataKey={xAxisKey} 
        tick={{ fontSize: 12 }}
        tickLine={{ stroke: '#e2e8f0' }}
      />
    );

    const renderYAxis = () => showGrid && (
      <YAxis 
        tick={{ fontSize: 12 }}
        tickLine={{ stroke: '#e2e8f0' }}
      />
    );

    const renderGrid = () => showGrid && (
      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
    );

    const renderTooltip = () => showTooltip && (
      <Tooltip 
        contentStyle={{
          backgroundColor: 'hsl(var(--background))',
          border: '1px solid hsl(var(--border))',
          borderRadius: '6px',
          fontSize: '12px',
        }}
      />
    );

    const renderLegend = () => showLegend && dataKeys.length > 1 && (
      <Legend wrapperStyle={{ fontSize: '12px' }} />
    );

    switch (type) {
      case 'line':
        return (
          <ChartWrapper {...chartProps}>
            <LineChart {...commonProps}>
              {renderGrid()}
              {renderXAxis()}
              {renderYAxis()}
              {renderTooltip()}
              {renderLegend()}
              {dataKeys.map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ChartWrapper>
        );

      case 'bar':
        return (
          <ChartWrapper {...chartProps}>
            <BarChart {...commonProps}>
              {renderGrid()}
              {renderXAxis()}
              {renderYAxis()}
              {renderTooltip()}
              {renderLegend()}
              {dataKeys.map((key, index) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={colors[index % colors.length]}
                  radius={[2, 2, 0, 0]}
                />
              ))}
            </BarChart>
          </ChartWrapper>
        );

      case 'area':
        return (
          <ChartWrapper {...chartProps}>
            <AreaChart {...commonProps}>
              {renderGrid()}
              {renderXAxis()}
              {renderYAxis()}
              {renderTooltip()}
              {renderLegend()}
              {dataKeys.map((key, index) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stackId="1"
                  stroke={colors[index % colors.length]}
                  fill={colors[index % colors.length]}
                  fillOpacity={0.6}
                />
              ))}
            </AreaChart>
          </ChartWrapper>
        );

      case 'pie':
        return (
          <ChartWrapper {...chartProps}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey={dataKeys[0] || 'value'}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              {renderTooltip()}
              {showLegend && <Legend />}
            </PieChart>
          </ChartWrapper>
        );

      case 'scatter':
        return (
          <ChartWrapper {...chartProps}>
            <ScatterChart {...commonProps}>
              {renderGrid()}
              {renderXAxis()}
              {renderYAxis()}
              {renderTooltip()}
              {renderLegend()}
              {dataKeys.map((key, index) => (
                <Scatter
                  key={key}
                  dataKey={key}
                  fill={colors[index % colors.length]}
                />
              ))}
            </ScatterChart>
          </ChartWrapper>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <div className="mb-2">❓</div>
              <div className="text-sm">Unsupported chart type: {type}</div>
            </div>
          </div>
        );
    }
  };

  return (
    <Card className={cn('w-full', className)}>
      {(title || description) && (
        <CardHeader className="pb-2">
          {title && <CardTitle className="text-lg">{title}</CardTitle>}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </CardHeader>
      )}
      <CardContent className="pt-2">
        <div style={{ height: height }}>
          {renderChart()}
        </div>
      </CardContent>
    </Card>
  );
}

// Utility function to create chart configs
export const createChartConfig = (
  type: ChartConfig['type'],
  data: ChartData[],
  options: Partial<ChartConfig> = {}
): ChartConfig => ({
  type,
  data,
  xAxisKey: 'name',
  dataKeys: ['value'],
  colors: DEFAULT_COLORS,
  showGrid: true,
  showLegend: true,
  showTooltip: true,
  height: 300,
  responsive: true,
  ...options,
});

// Pre-configured chart types for common use cases
export const ChartPresets = {
  lineChart: (data: ChartData[], dataKeys: string[], xAxisKey = 'name') =>
    createChartConfig('line', data, { dataKeys, xAxisKey }),
  
  barChart: (data: ChartData[], dataKeys: string[], xAxisKey = 'name') =>
    createChartConfig('bar', data, { dataKeys, xAxisKey }),
  
  areaChart: (data: ChartData[], dataKeys: string[], xAxisKey = 'name') =>
    createChartConfig('area', data, { dataKeys, xAxisKey }),
  
  pieChart: (data: ChartData[], dataKey = 'value') =>
    createChartConfig('pie', data, { dataKeys: [dataKey], showGrid: false }),
  
  scatterChart: (data: ChartData[], dataKeys: string[], xAxisKey = 'x') =>
    createChartConfig('scatter', data, { dataKeys, xAxisKey }),
};