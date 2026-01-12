import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Route, Plane, Clock, TrendingUp, ArrowRight, BarChart3 } from 'lucide-react';
import { DataTable, KPICard, KPIGrid, ChartContainer } from '@/components/reports/shared';
import { useFlightReportData } from '@/hooks/reports/useReportData';
import { ReportFilters, ColumnDef, PaginationConfig, SortingConfig, FilteringConfig, ChartConfig } from '@/types/reports';
import { RouteStats } from '@/types/reports';
import { formatDuration, formatDistance, formatCurrency } from '@/utils/reports/dataProcessing';

interface RoutesReportProps {
  filters: ReportFilters;
}

export function RoutesReport({ filters }: RoutesReportProps) {
  const { flights, routeStats, flightAggregation, loading, error } = useFlightReportData(filters);
  
  // Table state
  const [pagination, setPagination] = useState<PaginationConfig>({
    page: 1,
    pageSize: 25,
    total: routeStats?.length || 0,
    showSizeChanger: true,
    pageSizeOptions: [10, 25, 50, 100]
  });
  
  const [sorting, setSorting] = useState<SortingConfig>({
    field: 'flightCount',
    direction: 'desc'
  });
  
  const [filtering, setFiltering] = useState<FilteringConfig>({
    searchTerm: ''
  });

  // Update pagination total when route stats change
  React.useEffect(() => {
    setPagination(prev => ({ ...prev, total: routeStats?.length || 0 }));
  }, [routeStats]);

  // KPI Cards data
  const kpiData = useMemo(() => {
    if (!routeStats || !flightAggregation) return [];
    
    const mostFrequentRoute = routeStats[0];
    const totalUniqueRoutes = routeStats.length;
    const averageFlightsPerRoute = totalUniqueRoutes > 0 ? 
      flightAggregation.totalFlights / totalUniqueRoutes : 0;
    const totalRouteDistance = routeStats.reduce((sum, route) => sum + route.totalDistance, 0);
    
    return [
      {
        title: 'Rotas Únicas',
        value: totalUniqueRoutes.toString(),
        icon: <Route className="h-4 w-4" />,
        description: 'Rotas diferentes voadas'
      },
      {
        title: 'Rota Mais Frequente',
        value: mostFrequentRoute ? `${mostFrequentRoute.origin}-${mostFrequentRoute.destination}` : '-',
        icon: <TrendingUp className="h-4 w-4" />,
        description: mostFrequentRoute ? `${mostFrequentRoute.flightCount} voos` : 'Nenhuma rota'
      },
      {
        title: 'Média por Rota',
        value: averageFlightsPerRoute.toFixed(1),
        icon: <Plane className="h-4 w-4" />,
        description: 'Voos por rota'
      },
      {
        title: 'Distância Total',
        value: formatDistance(totalRouteDistance),
        icon: <BarChart3 className="h-4 w-4" />,
        description: 'Todas as rotas'
      }
    ];
  }, [routeStats, flightAggregation]);

  // Chart data for route frequency
  const frequencyChartData = useMemo(() => {
    if (!routeStats) return [];
    
    return routeStats.slice(0, 10).map(route => ({
      name: `${route.origin}-${route.destination}`,
      route: `${route.origin} → ${route.destination}`,
      flights: route.flightCount,
      hours: route.totalTime,
      distance: route.totalDistance
    }));
  }, [routeStats]);

  const frequencyChartConfig: ChartConfig = {
    type: 'bar',
    data: frequencyChartData,
    xAxisKey: 'name',
    dataKeys: ['flights'],
    colors: ['#10b981'],
    showGrid: true,
    showLegend: false,
    showTooltip: true,
    height: 300
  };

  // Chart data for route distance
  const distanceChartData = useMemo(() => {
    if (!routeStats) return [];
    
    return routeStats
      .sort((a, b) => b.totalDistance - a.totalDistance)
      .slice(0, 10)
      .map(route => ({
        name: `${route.origin}-${route.destination}`,
        route: `${route.origin} → ${route.destination}`,
        distance: route.totalDistance,
        flights: route.flightCount
      }));
  }, [routeStats]);

  const distanceChartConfig: ChartConfig = {
    type: 'bar',
    data: distanceChartData,
    xAxisKey: 'name',
    dataKeys: ['distance'],
    colors: ['#f59e0b'],
    showGrid: true,
    showLegend: false,
    showTooltip: true,
    height: 300
  };

  // Route analysis data
  const routeAnalysis = useMemo(() => {
    if (!routeStats) return null;
    
    const roundTripRoutes = new Map<string, { 
      route: string; 
      outbound: RouteStats | null; 
      return: RouteStats | null; 
    }>();
    
    routeStats.forEach(route => {
      const routeKey = [route.origin, route.destination].sort().join('-');
      const existing = roundTripRoutes.get(routeKey);
      
      if (existing) {
        if (route.origin < route.destination) {
          existing.outbound = route;
        } else {
          existing.return = route;
        }
      } else {
        roundTripRoutes.set(routeKey, {
          route: routeKey,
          outbound: route.origin < route.destination ? route : null,
          return: route.origin > route.destination ? route : null
        });
      }
    });
    
    const roundTrips = Array.from(roundTripRoutes.values())
      .filter(rt => rt.outbound && rt.return)
      .map(rt => ({
        route: rt.route,
        outboundFlights: rt.outbound!.flightCount,
        returnFlights: rt.return!.flightCount,
        totalFlights: rt.outbound!.flightCount + rt.return!.flightCount,
        balance: rt.outbound!.flightCount - rt.return!.flightCount
      }))
      .sort((a, b) => b.totalFlights - a.totalFlights);
    
    return {
      totalRoutes: routeStats.length,
      roundTripPairs: roundTrips.length,
      oneWayRoutes: routeStats.length - (roundTrips.length * 2),
      roundTrips
    };
  }, [routeStats]);

  // Table columns for routes
  const routeColumns: ColumnDef<RouteStats>[] = useMemo(() => [
    {
      key: 'route',
      title: 'Rota',
      render: (_, record: RouteStats) => (
        <div className="flex items-center space-x-2">
          <span className="font-mono font-medium">{record.origin}</span>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono font-medium">{record.destination}</span>
        </div>
      ),
      width: 200
    },
    {
      key: 'flightCount',
      title: 'Voos',
      dataIndex: 'flightCount',
      sortable: true,
      render: (value: number) => (
        <Badge variant="secondary" className="font-mono">
          {value}
        </Badge>
      ),
      width: 80,
      align: 'center'
    },
    {
      key: 'totalDistance',
      title: 'Distância Total',
      dataIndex: 'totalDistance',
      sortable: true,
      render: (value: number) => (
        <div className="font-mono text-sm">
          {formatDistance(value)}
        </div>
      ),
      width: 120
    },
    {
      key: 'averageDistance',
      title: 'Distância Média',
      render: (_, record: RouteStats) => (
        <div className="font-mono text-sm">
          {formatDistance(record.totalDistance / record.flightCount)}
        </div>
      ),
      width: 120
    },
    {
      key: 'totalTime',
      title: 'Tempo Total',
      dataIndex: 'totalTime',
      sortable: true,
      render: (value: number) => (
        <div className="font-mono text-sm">
          {formatDuration(value)}
        </div>
      ),
      width: 120
    },
    {
      key: 'averageTime',
      title: 'Tempo Médio',
      dataIndex: 'averageTime',
      sortable: true,
      render: (value: number) => (
        <div className="font-mono text-sm">
          {formatDuration(value)}
        </div>
      ),
      width: 120
    },
    {
      key: 'totalCR',
      title: 'CR Total',
      dataIndex: 'totalCR',
      sortable: true,
      render: (value: number) => (
        <div className="font-mono text-sm">
          {value > 0 ? formatCurrency(value) : '-'}
        </div>
      ),
      width: 120,
      align: 'right'
    },
    {
      key: 'averageCR',
      title: 'CR Médio',
      dataIndex: 'averageCR',
      sortable: true,
      render: (value: number) => (
        <div className="font-mono text-sm">
          {value > 0 ? formatCurrency(value) : '-'}
        </div>
      ),
      width: 120,
      align: 'right'
    }
  ], []);

  // Table columns for round trip analysis
  const roundTripColumns: ColumnDef<typeof routeAnalysis.roundTrips[0]>[] = useMemo(() => [
    {
      key: 'route',
      title: 'Rota',
      dataIndex: 'route',
      className: 'font-mono font-medium',
      width: 150
    },
    {
      key: 'outboundFlights',
      title: 'Ida',
      dataIndex: 'outboundFlights',
      sortable: true,
      render: (value: number) => (
        <Badge variant="outline" className="font-mono">
          {value}
        </Badge>
      ),
      width: 80,
      align: 'center'
    },
    {
      key: 'returnFlights',
      title: 'Volta',
      dataIndex: 'returnFlights',
      sortable: true,
      render: (value: number) => (
        <Badge variant="outline" className="font-mono">
          {value}
        </Badge>
      ),
      width: 80,
      align: 'center'
    },
    {
      key: 'totalFlights',
      title: 'Total',
      dataIndex: 'totalFlights',
      sortable: true,
      render: (value: number) => (
        <Badge variant="secondary" className="font-mono">
          {value}
        </Badge>
      ),
      width: 80,
      align: 'center'
    },
    {
      key: 'balance',
      title: 'Balanço',
      dataIndex: 'balance',
      sortable: true,
      render: (value: number) => (
        <div className={`font-mono text-sm ${
          value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-muted-foreground'
        }`}>
          {value > 0 ? '+' : ''}{value}
        </div>
      ),
      width: 100,
      align: 'center'
    }
  ], []);

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Erro ao carregar dados das rotas: {error.message}</p>
            <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Route className="h-6 w-6" />
          Análise de Rotas
        </h2>
        <p className="text-muted-foreground">
          Estatísticas detalhadas das rotas voadas e análise de frequência
        </p>
      </div>

      {/* KPI Cards */}
      <KPIGrid cards={kpiData} loading={loading} />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Rotas por Frequência</CardTitle>
            <CardDescription>
              Rotas com maior número de voos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={frequencyChartConfig}
              loading={loading}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 10 Rotas por Distância</CardTitle>
            <CardDescription>
              Rotas com maior distância total percorrida
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={distanceChartConfig}
              loading={loading}
            />
          </CardContent>
        </Card>
      </div>

      {/* Route Analysis Summary */}
      {routeAnalysis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Rotas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{routeAnalysis.totalRoutes}</div>
              <p className="text-xs text-muted-foreground">rotas únicas</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pares Ida/Volta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{routeAnalysis.roundTripPairs}</div>
              <p className="text-xs text-muted-foreground">rotas com ida e volta</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Rotas Únicas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{routeAnalysis.oneWayRoutes}</div>
              <p className="text-xs text-muted-foreground">apenas uma direção</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Tables */}
      <Tabs defaultValue="all-routes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all-routes" className="flex items-center gap-2">
            <Route className="h-4 w-4" />
            Todas as Rotas
          </TabsTrigger>
          <TabsTrigger value="round-trips" className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4" />
            Ida e Volta
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all-routes">
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas Detalhadas por Rota</CardTitle>
              <CardDescription>
                Análise completa de todas as rotas voadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={routeStats || []}
                columns={routeColumns}
                pagination={pagination}
                sorting={sorting}
                filtering={filtering}
                loading={loading}
                onPaginationChange={setPagination}
                onSortingChange={setSorting}
                onFilteringChange={setFiltering}
                emptyMessage="Nenhuma rota encontrada no período selecionado"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="round-trips">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Rotas Ida e Volta</CardTitle>
              <CardDescription>
                Comparação entre voos de ida e volta nas mesmas rotas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {routeAnalysis && routeAnalysis.roundTrips.length > 0 ? (
                <DataTable
                  data={routeAnalysis.roundTrips}
                  columns={roundTripColumns}
                  loading={loading}
                  emptyMessage="Nenhuma rota ida/volta encontrada"
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma rota com ida e volta encontrada no período selecionado
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}