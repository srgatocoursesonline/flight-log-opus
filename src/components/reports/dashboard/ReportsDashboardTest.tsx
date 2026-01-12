import React from 'react';
import { ReportsDashboard } from './ReportsDashboard';

/**
 * Test component for the integrated Reports Dashboard
 * This component can be used to test the dashboard with real flight data
 */
export function ReportsDashboardTest() {
  return (
    <div className="min-h-screen bg-background">
      <ReportsDashboard defaultView="flights" />
    </div>
  );
}

export default ReportsDashboardTest;