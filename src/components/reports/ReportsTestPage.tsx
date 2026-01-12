import React, { useState } from 'react';
import { FilterSidebar } from './dashboard/FilterSidebar';
import { useReportFilters } from '@/hooks/reports/useReportFilters';
import { MultiSelectOption } from './shared/MultiSelectFilter';

// Mock data for testing
const MOCK_AIRCRAFT_OPTIONS: MultiSelectOption[] = [
  { value: 'B737', label: 'Boeing 737', description: 'Commercial airliner' },
  { value: 'A320', label: 'Airbus A320', description: 'Commercial airliner' },
  { value: 'C172', label: 'Cessna 172', description: 'Single-engine aircraft' },
  { value: 'PA28', label: 'Piper Cherokee', description: 'Single-engine aircraft' },
  { value: 'B777', label: 'Boeing 777', description: 'Wide-body airliner' }
];

const MOCK_AIRPORT_OPTIONS: MultiSelectOption[] = [
  { value: 'SBSP', label: 'SBSP - São Paulo/Congonhas', description: 'São Paulo, Brazil' },
  { value: 'SBGR', label: 'SBGR - São Paulo/Guarulhos', description: 'São Paulo, Brazil' },
  { value: 'SBRJ', label: 'SBRJ - Rio de Janeiro/Santos Dumont', description: 'Rio de Janeiro, Brazil' },
  { value: 'SBGL', label: 'SBGL - Rio de Janeiro/Galeão', description: 'Rio de Janeiro, Brazil' },
  { value: 'SBBR', label: 'SBBR - Brasília', description: 'Brasília, Brazil' },
  { value: 'SBPA', label: 'SBPA - Porto Alegre', description: 'Porto Alegre, Brazil' }
];

export function ReportsTestPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const filterHook = useReportFilters();

  return (
    <div className="flex h-screen bg-background">
      <FilterSidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        filterHook={filterHook}
        aircraftOptions={MOCK_AIRCRAFT_OPTIONS}
        airportOptions={MOCK_AIRPORT_OPTIONS}
      />
      
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Reports & Analytics Test</h1>
          
          <div className="bg-muted/50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Current Filter State</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(filterHook.filters, null, 2)}
            </pre>
            
            <div className="mt-4 flex items-center space-x-4">
              <div className="text-sm">
                <strong>Is Filtered:</strong> {filterHook.isFiltered ? 'Yes' : 'No'}
              </div>
              <button
                onClick={filterHook.resetFilters}
                className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}