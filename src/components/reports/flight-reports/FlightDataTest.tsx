import React from 'react';
import { useFlightReportData } from '@/hooks/reports/useReportData';
import { useReportFilters } from '@/hooks/reports/useReportFilters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Simple test component to verify flight data loading
 */
export function FlightDataTest() {
  const { filters } = useReportFilters();
  const { flights, flightAggregation, loading, error } = useFlightReportData(filters);

  return (
    <div className="p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Flight Data Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
            <p><strong>Error:</strong> {error ? error.message : 'None'}</p>
            <p><strong>Flights Count:</strong> {flights?.length || 0}</p>
            <p><strong>Total Hours:</strong> {flightAggregation?.totalHours || 0}</p>
            <p><strong>Total Distance:</strong> {flightAggregation?.totalDistance || 0}</p>
            <p><strong>Completion Rate:</strong> {flightAggregation?.completionRate || 0}%</p>
          </div>
          
          {flights && flights.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold">Sample Flight:</h4>
              <pre className="text-xs bg-muted p-2 rounded mt-2">
                {JSON.stringify(flights[0], null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}