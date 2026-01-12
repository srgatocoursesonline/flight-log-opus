import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Bug } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  className?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    this.props.onError?.(error, errorInfo);
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className={cn('w-full border-destructive/50', this.props.className)}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <span>Something went wrong</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              An error occurred while rendering this component. Please try refreshing or contact support if the problem persists.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                  <Bug className="inline h-4 w-4 mr-1" />
                  Error Details (Development)
                </summary>
                <div className="mt-2 p-3 bg-muted rounded-md">
                  <pre className="text-xs overflow-auto">
                    <strong>Error:</strong> {this.state.error.message}
                    {'\n\n'}
                    <strong>Stack:</strong> {this.state.error.stack}
                    {this.state.errorInfo && (
                      <>
                        {'\n\n'}
                        <strong>Component Stack:</strong> {this.state.errorInfo.componentStack}
                      </>
                    )}
                  </pre>
                </div>
              </details>
            )}
            
            <div className="flex space-x-2">
              <Button onClick={this.handleRetry} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline" 
                size="sm"
              >
                Refresh Page
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Hook-based error boundary for functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Error caught by error handler:', error, errorInfo);
    // You can integrate with error reporting services here
  };
}

// Specific error boundary for reports
interface ReportErrorBoundaryProps {
  children: ReactNode;
  reportType?: string;
  className?: string;
}

export function ReportErrorBoundary({ 
  children, 
  reportType, 
  className 
}: ReportErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    // Log specific report errors
    console.error(`Error in ${reportType || 'report'} component:`, error, errorInfo);
    
    // You can send to error reporting service here
    // Example: errorReportingService.captureException(error, { 
    //   tags: { component: 'report', reportType },
    //   extra: errorInfo 
    // });
  };

  const fallback = (
    <Card className={cn('w-full border-destructive/50', className)}>
      <CardContent className="p-8">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-destructive">
              Report Error
            </h3>
            <p className="text-muted-foreground mt-2">
              Unable to load {reportType || 'this report'}. Please try refreshing the page.
            </p>
          </div>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ErrorBoundary 
      fallback={fallback} 
      onError={handleError}
      className={className}
    >
      {children}
    </ErrorBoundary>
  );
}

// Chart-specific error boundary
export function ChartErrorBoundary({ 
  children, 
  chartType, 
  className 
}: { 
  children: ReactNode; 
  chartType?: string; 
  className?: string; 
}) {
  const fallback = (
    <Card className={cn('w-full', className)}>
      <CardContent className="p-8">
        <div className="text-center space-y-4">
          <div className="text-4xl">📊</div>
          <div>
            <h3 className="text-lg font-semibold text-destructive">
              Chart Error
            </h3>
            <p className="text-muted-foreground mt-2">
              Unable to render {chartType || 'this chart'}. The data might be invalid or missing.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ErrorBoundary fallback={fallback} className={className}>
      {children}
    </ErrorBoundary>
  );
}

// Table-specific error boundary
export function TableErrorBoundary({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string; 
}) {
  const fallback = (
    <Card className={cn('w-full', className)}>
      <CardContent className="p-8">
        <div className="text-center space-y-4">
          <div className="text-4xl">📋</div>
          <div>
            <h3 className="text-lg font-semibold text-destructive">
              Table Error
            </h3>
            <p className="text-muted-foreground mt-2">
              Unable to display table data. Please check your data source and try again.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ErrorBoundary fallback={fallback} className={className}>
      {children}
    </ErrorBoundary>
  );
}