import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChartContainer, createChartConfig } from '../ChartContainer';

// Mock Recharts components
jest.mock('recharts', () => ({
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  ScatterChart: ({ children }: any) => <div data-testid="scatter-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  Bar: () => <div data-testid="bar" />,
  Area: () => <div data-testid="area" />,
  Pie: () => <div data-testid="pie" />,
  Scatter: () => <div data-testid="scatter" />,
  Cell: () => <div data-testid="cell" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
}));

const mockData = [
  { name: 'Jan', value: 100 },
  { name: 'Feb', value: 200 },
  { name: 'Mar', value: 150 },
];

describe('ChartContainer', () => {
  it('renders line chart', () => {
    const config = createChartConfig('line', mockData, {
      xAxisKey: 'name',
      dataKeys: ['value']
    });
    
    render(<ChartContainer config={config} title="Test Chart" />);
    
    expect(screen.getByText('Test Chart')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('renders bar chart', () => {
    const config = createChartConfig('bar', mockData, {
      xAxisKey: 'name',
      dataKeys: ['value']
    });
    
    render(<ChartContainer config={config} />);
    
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('renders area chart', () => {
    const config = createChartConfig('area', mockData, {
      xAxisKey: 'name',
      dataKeys: ['value']
    });
    
    render(<ChartContainer config={config} />);
    
    expect(screen.getByTestId('area-chart')).toBeInTheDocument();
  });

  it('renders pie chart', () => {
    const config = createChartConfig('pie', mockData, {
      dataKeys: ['value']
    });
    
    render(<ChartContainer config={config} />);
    
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    const config = createChartConfig('line', mockData);
    
    render(<ChartContainer config={config} loading={true} />);
    
    expect(screen.getByText('Loading chart...')).toBeInTheDocument();
  });

  it('shows error state', () => {
    const config = createChartConfig('line', mockData);
    
    render(<ChartContainer config={config} error="Failed to load data" />);
    
    expect(screen.getByText('⚠️ Chart Error')).toBeInTheDocument();
    expect(screen.getByText('Failed to load data')).toBeInTheDocument();
  });

  it('shows empty state when no data', () => {
    const config = createChartConfig('line', []);
    
    render(<ChartContainer config={config} />);
    
    expect(screen.getByText('📊')).toBeInTheDocument();
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('shows unsupported chart type message', () => {
    const config = { ...createChartConfig('line', mockData), type: 'unsupported' as any };
    
    render(<ChartContainer config={config} />);
    
    expect(screen.getByText('❓')).toBeInTheDocument();
    expect(screen.getByText('Unsupported chart type: unsupported')).toBeInTheDocument();
  });
});