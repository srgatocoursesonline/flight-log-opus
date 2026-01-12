import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Table loading skeleton
export function TableSkeleton({ 
  rows = 5, 
  columns = 4, 
  className 
}: { 
  rows?: number; 
  columns?: number; 
  className?: string; 
}) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Search bar skeleton */}
      <div className="flex items-center space-x-2">
        <Skeleton className="h-10 w-64" />
      </div>
      
      {/* Table skeleton */}
      <div className="rounded-md border">
        <div className="p-4">
          {/* Header row */}
          <div className="flex space-x-4 mb-4">
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton key={i} className="h-4 flex-1" />
            ))}
          </div>
          
          {/* Data rows */}
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex space-x-4 mb-3">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton key={colIndex} className="h-4 flex-1" />
              ))}
            </div>
          ))}
        </div>
      </div>
      
      {/* Pagination skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-48" />
        <div className="flex space-x-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-8" />
          ))}
        </div>
      </div>
    </div>
  );
}

// Chart loading skeleton
export function ChartSkeleton({ 
  height = 300, 
  title = true, 
  className 
}: { 
  height?: number; 
  title?: boolean; 
  className?: string; 
}) {
  return (
    <Card className={cn('w-full', className)}>
      {title && (
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
      )}
      <CardContent className="pt-2">
        <div className="space-y-4">
          {/* Chart area */}
          <div 
            className="bg-muted/20 rounded-lg flex items-center justify-center"
            style={{ height }}
          >
            <div className="flex items-center space-x-2 text-muted-foreground">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="text-sm">Loading chart...</span>
            </div>
          </div>
          
          {/* Legend skeleton */}
          <div className="flex justify-center space-x-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// KPI cards loading skeleton
export function KPICardsSkeleton({ 
  count = 4, 
  className 
}: { 
  count?: number; 
  className?: string; 
}) {
  return (
    <div className={cn(
      'grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
      className
    )}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Generic loading spinner
export function LoadingSpinner({ 
  size = 'md', 
  text = 'Loading...', 
  className 
}: { 
  size?: 'sm' | 'md' | 'lg'; 
  text?: string; 
  className?: string; 
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className={cn('flex items-center justify-center space-x-2', className)}>
      <div className={cn(
        'animate-spin rounded-full border-b-2 border-primary',
        sizeClasses[size]
      )}></div>
      {text && <span className="text-muted-foreground">{text}</span>}
    </div>
  );
}

// Full page loading state
export function PageLoadingState({ 
  title = 'Loading Reports...', 
  description = 'Please wait while we fetch your data.' 
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <LoadingSpinner size="lg" />
      <div className="text-center">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

// Section loading state
export function SectionLoadingState({ 
  title = 'Loading...', 
  className 
}: { 
  title?: string; 
  className?: string; 
}) {
  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <LoadingSpinner />
          <p className="text-muted-foreground">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}