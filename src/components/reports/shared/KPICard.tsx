import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { KPICardData } from '@/types/reports';

interface KPICardProps {
  data: KPICardData;
  className?: string;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showTrend?: boolean;
}

export function KPICard({
  data,
  className,
  loading = false,
  size = 'md',
  showTrend = true,
}: KPICardProps) {
  const { title, value, change, icon, description, trend } = data;

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      // Format large numbers with appropriate suffixes
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      }
      if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`;
      }
      return val.toLocaleString();
    }
    return val;
  };

  const getTrendIcon = () => {
    if (!change) return null;
    
    switch (change.type) {
      case 'increase':
        return <TrendingUp className="h-4 w-4 text-success" />;
      case 'decrease':
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    if (!change) return 'text-muted-foreground';
    
    switch (change.type) {
      case 'increase':
        return 'text-success';
      case 'decrease':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  const sizeClasses = {
    sm: {
      card: 'p-3',
      title: 'text-xs',
      value: 'text-lg',
      change: 'text-xs',
      icon: 'h-4 w-4',
    },
    md: {
      card: 'p-4',
      title: 'text-sm',
      value: 'text-2xl',
      change: 'text-sm',
      icon: 'h-5 w-5',
    },
    lg: {
      card: 'p-6',
      title: 'text-base',
      value: 'text-3xl',
      change: 'text-base',
      icon: 'h-6 w-6',
    },
  };

  const classes = sizeClasses[size];

  if (loading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardContent className={classes.card}>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="h-3 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('transition-all hover:shadow-md', className)}>
      <CardContent className={classes.card}>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center space-x-2">
              {icon && (
                <div className={cn('text-muted-foreground', classes.icon)}>
                  {icon}
                </div>
              )}
              <p className={cn('font-medium text-muted-foreground', classes.title)}>
                {title}
              </p>
            </div>
            
            <div className={cn('font-bold tracking-tight', classes.value)}>
              {formatValue(value)}
            </div>
            
            {change && (
              <div className={cn('flex items-center space-x-1', classes.change)}>
                {getTrendIcon()}
                <span className={getTrendColor()}>
                  {change.value > 0 ? '+' : ''}{change.value}%
                </span>
                <span className="text-muted-foreground">
                  vs {change.period}
                </span>
              </div>
            )}
            
            {description && (
              <p className={cn('text-muted-foreground', classes.change)}>
                {description}
              </p>
            )}
          </div>
          
          {showTrend && trend && trend.length > 0 && (
            <div className="ml-4">
              <MiniTrendChart data={trend} type={change?.type} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Mini trend chart component for KPI cards
interface MiniTrendChartProps {
  data: Array<{ period: string; value: number }>;
  type?: 'increase' | 'decrease' | 'neutral';
}

function MiniTrendChart({ data, type = 'neutral' }: MiniTrendChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;
  
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 60; // 60px width
    const y = 20 - ((item.value - minValue) / range) * 20; // 20px height, inverted
    return `${x},${y}`;
  }).join(' ');

  const getStrokeColor = () => {
    switch (type) {
      case 'increase':
        return '#10b981'; // green-500
      case 'decrease':
        return '#ef4444'; // red-500
      default:
        return '#6b7280'; // gray-500
    }
  };

  return (
    <svg width="60" height="20" className="opacity-75">
      <polyline
        fill="none"
        stroke={getStrokeColor()}
        strokeWidth="1.5"
        points={points}
      />
      {data.map((item, index) => {
        const x = (index / (data.length - 1)) * 60;
        const y = 20 - ((item.value - minValue) / range) * 20;
        return (
          <circle
            key={index}
            cx={x}
            cy={y}
            r="1.5"
            fill={getStrokeColor()}
          />
        );
      })}
    </svg>
  );
}

// Grid component for displaying multiple KPI cards
interface KPIGridProps {
  cards: KPICardData[];
  columns?: number;
  className?: string;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showTrend?: boolean;
}

export function KPIGrid({
  cards,
  columns = 4,
  className,
  loading = false,
  size = 'md',
  showTrend = true,
}: KPIGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
  };

  return (
    <div className={cn(
      'grid gap-4',
      gridCols[Math.min(columns, 6) as keyof typeof gridCols],
      className
    )}>
      {cards.map((card, index) => (
        <KPICard
          key={index}
          data={card}
          loading={loading}
          size={size}
          showTrend={showTrend}
        />
      ))}
    </div>
  );
}

// Utility function to create KPI card data
export const createKPICard = (
  title: string,
  value: string | number,
  options: Partial<Omit<KPICardData, 'title' | 'value'>> = {}
): KPICardData => ({
  title,
  value,
  ...options,
});