import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useReportFilters } from '@/hooks/reports/useReportFilters';
import { GeneralFlightReport } from './GeneralFlightReport';
import { LogbookReport } from './LogbookReport';
import { AirportsReport } from './AirportsReport';
import { RoutesReport } from './RoutesReport';

/**
 * Test component for flight reports module
 * This component demonstrates all flight report components working together
 */
export function FlightReportsTest() {
  const { filters } = useReportFilters({
    dateRange: {
      from: new Date(new Date().getFullYear(), 0, 1), // Start of current year
      to: new Date(), // Today
      preset: 'last_year'
    }
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Flight Reports Module Test</h1>
        <p className="text-muted-foreground">
          Testing all flight report components with sample data
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General Report</TabsTrigger>
          <TabsTrigger value="logbook">Logbook</TabsTrigger>
          <TabsTrigger value="airports">Airports</TabsTrigger>
          <TabsTrigger value="routes">Routes</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Flight Report Test</CardTitle>
              <CardDescription>
                Testing the GeneralFlightReport component with paginated flight table and KPI cards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GeneralFlightReport filters={filters} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logbook" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Logbook Report Test</CardTitle>
              <CardDescription>
                Testing the LogbookReport component with aviation-standard formatting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LogbookReport filters={filters} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="airports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Airports Report Test</CardTitle>
              <CardDescription>
                Testing the AirportsReport component with visited airports statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AirportsReport filters={filters} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Routes Report Test</CardTitle>
              <CardDescription>
                Testing the RoutesReport component with route frequency analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RoutesReport filters={filters} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}