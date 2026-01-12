import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Plane, 
  DollarSign, 
  Wrench, 
  Map,
  Filter,
  Download,
  RefreshCw,
  Calendar
} from 'lucide-react';
import { FilterSidebar } from './FilterSidebar';
import { QuickReportCards } from './QuickReportCards';
import { useReportFilters } from '@/hooks/reports/useReportFilters';
import { MultiSelectOption } from '../shared/MultiSelectFilter';
import { 
  GeneralFlightReport, 
  LogbookReport, 
  AirportsReport, 
  RoutesReport 
} from '../flight-reports';

export interface ReportsDashboardProps {
  initialFilters?: any;
  defaultView?: 'dashboard' | 'flights' | 'financial' | 'maintenance' | 'map';
}

export const ReportsDashboard: React.FC<ReportsDashboardProps> = ({
  defaultView = 'dashboard'
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'flights' | 'financial' | 'maintenance' | 'map'>(defaultView);
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize the report filters hook
  const filterHook = useReportFilters();

  // Dados mock para aeronaves e aeroportos - na implementação real, viriam da API
  const aircraftOptions: MultiSelectOption[] = [
    { value: 'B737-800', label: 'Boeing 737-800', description: 'Comercial narrow-body' },
    { value: 'A320', label: 'Airbus A320', description: 'Comercial narrow-body' },
    { value: 'C172', label: 'Cessna 172', description: 'Monomotor de treinamento' },
    { value: 'PA28', label: 'Piper Cherokee', description: 'Aeronave monomotor' }
  ];

  const airportOptions: MultiSelectOption[] = [
    { value: 'SBSP', label: 'SBSP - Congonhas', description: 'São Paulo, Brasil' },
    { value: 'SBGR', label: 'SBGR - Guarulhos', description: 'São Paulo, Brasil' },
    { value: 'SBRJ', label: 'SBRJ - Santos Dumont', description: 'Rio de Janeiro, Brasil' },
    { value: 'SBGL', label: 'SBGL - Galeão', description: 'Rio de Janeiro, Brasil' }
  ];

  // Mock data for now - will be replaced with actual data hooks
  const lastUpdated = new Date();

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const handleExport = () => {
    // Export functionality will be implemented in later tasks
    console.log('Export functionality coming soon');
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Title and Description */}
            <div className="flex-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                {t('reports.title', 'Reports & Analytics')}
              </h1>
              <p className="text-muted-foreground mt-1 text-sm lg:text-base">
                {t('reports.subtitle', 'Comprehensive analysis of your flight operations, finances, and maintenance')}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 lg:gap-3">
              {/* Mobile Filter Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFilterSidebarOpen(!isFilterSidebarOpen)}
                className="lg:hidden"
              >
                <Filter className="h-4 w-4 mr-2" />
                {t('reports.filters', 'Filters')}
              </Button>

              {/* Refresh Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {t('reports.refresh', 'Refresh')}
              </Button>

              {/* Export Button */}
              <Button
                variant="default"
                size="sm"
                onClick={handleExport}
              >
                <Download className="h-4 w-4 mr-2" />
                {t('reports.export', 'Export')}
              </Button>
            </div>
          </div>

          {/* Status Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-4 pt-3 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {t('reports.lastUpdated', 'Last updated')}: {lastUpdated.toLocaleString()}
              </span>
            </div>
            <Badge variant="secondary" className="text-xs w-fit">
              {isLoading ? t('reports.syncing', 'Syncing...') : t('reports.synced', 'Synced')}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex relative">
        {/* Desktop Filter Sidebar - posicionamento relativo */}
        <div className="hidden lg:block lg:w-80 lg:flex-shrink-0">
          <div className="sticky top-0 h-screen overflow-y-auto">
            <FilterSidebar 
              isCollapsed={false}
              onToggleCollapse={() => {}}
              filterHook={filterHook}
              aircraftOptions={aircraftOptions}
              airportOptions={airportOptions}
            />
          </div>
        </div>

        {/* Mobile Filter Sidebar */}
        {isFilterSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
            <div className="fixed left-0 top-0 h-full w-80 max-w-[80vw] bg-card border-r shadow-lg">
              <FilterSidebar 
                isCollapsed={false}
                onToggleCollapse={() => setIsFilterSidebarOpen(false)}
                filterHook={filterHook}
                aircraftOptions={aircraftOptions}
                airportOptions={airportOptions}
              />
            </div>
            <div 
              className="absolute inset-0" 
              onClick={() => setIsFilterSidebarOpen(false)}
            />
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <div className="container mx-auto px-4 py-6">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="space-y-6">
              {/* Navigation Tabs */}
              <div className="overflow-x-auto">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 min-w-fit">
                  <TabsTrigger 
                    value="dashboard" 
                    className="flex items-center gap-2 text-xs lg:text-sm"
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span className="hidden sm:inline">{t('reports.dashboard', 'Dashboard')}</span>
                    <span className="sm:hidden">{t('reports.dashboardShort', 'Home')}</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="flights" 
                    className="flex items-center gap-2 text-xs lg:text-sm"
                  >
                    <Plane className="h-4 w-4" />
                    <span className="hidden sm:inline">{t('reports.flights', 'Flights')}</span>
                    <span className="sm:hidden">{t('reports.flightsShort', 'Flights')}</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="financial" 
                    className="flex items-center gap-2 text-xs lg:text-sm"
                  >
                    <DollarSign className="h-4 w-4" />
                    <span className="hidden sm:inline">{t('reports.financial', 'Financial')}</span>
                    <span className="sm:hidden">{t('reports.financialShort', 'Money')}</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="maintenance" 
                    className="flex items-center gap-2 text-xs lg:text-sm"
                  >
                    <Wrench className="h-4 w-4" />
                    <span className="hidden sm:inline">{t('reports.maintenance', 'Maintenance')}</span>
                    <span className="sm:hidden">{t('reports.maintenanceShort', 'Maint')}</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="map" 
                    className="flex items-center gap-2 text-xs lg:text-sm"
                  >
                    <Map className="h-4 w-4" />
                    <span className="hidden sm:inline">{t('reports.geographic', 'Geographic')}</span>
                    <span className="sm:hidden">{t('reports.geographicShort', 'Map')}</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Tab Content */}
              <TabsContent value="dashboard" className="space-y-6">
                <QuickReportCards />
                
                {/* Dashboard Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        {t('reports.overview', 'Overview')}
                      </CardTitle>
                      <CardDescription>
                        {t('reports.overviewDescription', 'Key metrics and performance indicators')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-muted-foreground">
                        {t('reports.comingSoon', 'Coming soon - detailed overview charts and metrics')}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        {t('reports.recentActivity', 'Recent Activity')}
                      </CardTitle>
                      <CardDescription>
                        {t('reports.recentActivityDescription', 'Latest flights, transactions, and maintenance')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-muted-foreground">
                        {t('reports.comingSoon', 'Coming soon - recent activity timeline')}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="flights" className="space-y-6">
                <Tabs defaultValue="general" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="logbook">Logbook</TabsTrigger>
                    <TabsTrigger value="airports">Airports</TabsTrigger>
                    <TabsTrigger value="routes">Routes</TabsTrigger>
                  </TabsList>

                  <TabsContent value="general">
                    <GeneralFlightReport filters={filterHook.filters} />
                  </TabsContent>

                  <TabsContent value="logbook">
                    <LogbookReport filters={filterHook.filters} />
                  </TabsContent>

                  <TabsContent value="airports">
                    <AirportsReport filters={filterHook.filters} />
                  </TabsContent>

                  <TabsContent value="routes">
                    <RoutesReport filters={filterHook.filters} />
                  </TabsContent>
                </Tabs>
              </TabsContent>

              <TabsContent value="financial" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      {t('reports.financialReports', 'Financial Reports')}
                    </CardTitle>
                    <CardDescription>
                      {t('reports.financialReportsDescription', 'Revenue, expenses, and profitability analysis')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      {t('reports.comingSoon', 'Coming soon - financial reports and analytics')}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="maintenance" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wrench className="h-5 w-5" />
                      {t('reports.maintenanceReports', 'Maintenance Reports')}
                    </CardTitle>
                    <CardDescription>
                      {t('reports.maintenanceReportsDescription', 'Maintenance costs, schedules, and compliance tracking')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      {t('reports.comingSoon', 'Coming soon - maintenance reports and analytics')}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="map" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Map className="h-5 w-5" />
                      {t('reports.geographicVisualization', 'Geographic Visualization')}
                    </CardTitle>
                    <CardDescription>
                      {t('reports.geographicVisualizationDescription', 'Interactive maps showing flight routes and airport statistics')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      {t('reports.comingSoon', 'Coming soon - interactive flight maps')}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};