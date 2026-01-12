import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Plane, Clock, Globe, TrendingUp, Calendar } from 'lucide-react';
import { DataTable, KPICard, KPIGrid, ChartContainer } from '@/components/reports/shared';
import { useFlightReportData } from '@/hooks/reports/useReportData';
import { ReportFilters, ColumnDef, PaginationConfig, SortingConfig, FilteringConfig, ChartConfig } from '@/types/reports';
import { AirportStats } from '@/types/reports';
import { formatDuration, formatDistance } from '@/utils/reports/dataProcessing';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AirportsReportProps {
  filters: ReportFilters;
}

export function AirportsReport({ filters }: AirportsReportProps) {
  const { flights, airportStats, flightAggregation, loading, error } = useFlightReportData(filters);
  
  // Table state
  const [pagination, setPagination] = useState<PaginationConfig>({
    page: 1,
    pageSize: 25,
    total: airportStats?.length || 0,
    showSizeChanger: true,
    pageSizeOptions: [10, 25, 50, 100]
  });
  
  const [sorting, setSorting] = useState<SortingConfig>({
    field: 'visitCount',
    direction: 'desc'
  });
  
  const [filtering, setFiltering] = useState<FilteringConfig>({
    searchTerm: ''
  });

  // Update pagination total when airport stats change
  React.useEffect(() => {
    setPagination(prev => ({ ...prev, total: airportStats?.length || 0 }));
  }, [airportStats]);

  // KPI Cards data
  const kpiData = useMemo(() => {
    if (!flightAggregation || !airportStats) return [];
    
    const mostVisitedAirport = airportStats[0];
    const averageVisitsPerAirport = airportStats.length > 0 ? 
      airportStats.reduce((sum, airport) => sum + airport.visitCount, 0) / airportStats.length : 0;
    
    return [
      {
        title: 'Aeroportos Únicos',
        value: flightAggregation.uniqueAirports.toString(),
        icon: <MapPin className="h-4 w-4" />,
        description: 'Aeroportos visitados'
      },
      {
        title: 'Países Únicos',
        value: flightAggregation.uniqueCountries.toString(),
        icon: <Globe className="h-4 w-4" />,
        description: 'Países visitados'
      },
      {
        title: 'Mais Visitado',
        value: mostVisitedAirport ? `${mostVisitedAirport.icao} (${mostVisitedAirport.visitCount}x)` : '-',
        icon: <TrendingUp className="h-4 w-4" />,
        description: mostVisitedAirport?.name || 'Nenhum aeroporto'
      },
      {
        title: 'Média de Visitas',
        value: averageVisitsPerAirport.toFixed(1),
        icon: <Plane className="h-4 w-4" />,
        description: 'Visitas por aeroporto'
      }
    ];
  }, [flightAggregation, airportStats]);

  // Chart data for airport visits
  const chartData = useMemo(() => {
    if (!airportStats) return [];
    
    return airportStats.slice(0, 10).map(airport => ({
      name: airport.icao,
      fullName: airport.name,
      city: airport.city,
      country: airport.country,
      visits: airport.visitCount,
      hours: airport.totalFlightTime
    }));
  }, [airportStats]);

  const chartConfig: ChartConfig = {
    type: 'bar',
    data: chartData,
    xAxisKey: 'name',
    dataKeys: ['visits'],
    colors: ['#3b82f6'],
    showGrid: true,
    showLegend: false,
    showTooltip: true,
    height: 300
  };

  // Countries statistics
  const countryStats = useMemo(() => {
    if (!airportStats) return [];
    
    const countryMap = new Map<string, { 
      country: string; 
      airports: number; 
      visits: number; 
      totalFlightTime: number;
    }>();
    
    airportStats.forEach(airport => {
      const existing = countryMap.get(airport.country);
      if (existing) {
        existing.airports += 1;
        existing.visits += airport.visitCount;
        existing.totalFlightTime += airport.totalFlightTime;
      } else {
        countryMap.set(airport.country, {
          country: airport.country,
          airports: 1,
          visits: airport.visitCount,
          totalFlightTime: airport.totalFlightTime
        });
      }
    });
    
    return Array.from(countryMap.values()).sort((a, b) => b.visits - a.visits);
  }, [airportStats]);

  // Table columns for airports
  const airportColumns: ColumnDef<AirportStats>[] = useMemo(() => [
    {
      key: 'icao',
      title: 'ICAO',
      dataIndex: 'icao',
      sortable: true,
      className: 'font-mono font-medium',
      width: 80
    },
    {
      key: 'name',
      title: 'Aeroporto',
      render: (_, record: AirportStats) => (
        <div className="space-y-1">
          <div className="font-medium">{record.name}</div>
          <div className="text-sm text-muted-foreground">
            {record.city}, {record.country}
          </div>
        </div>
      ),
      width: 250
    },
    {
      key: 'visitCount',
      title: 'Visitas',
      dataIndex: 'visitCount',
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
      key: 'totalFlightTime',
      title: 'Tempo Total',
      dataIndex: 'totalFlightTime',
      sortable: true,
      render: (value: number) => (
        <div className="font-mono text-sm">
          {formatDuration(value)}
        </div>
      ),
      width: 120
    },
    {
      key: 'averageFlightTime',
      title: 'Tempo Médio',
      dataIndex: 'averageFlightTime',
      sortable: true,
      render: (value: number) => (
        <div className="font-mono text-sm">
          {formatDuration(value)}
        </div>
      ),
      width: 120
    },
    {
      key: 'firstVisit',
      title: 'Primeira Visita',
      dataIndex: 'firstVisit',
      sortable: true,
      render: (value: Date) => (
        <div className="text-sm">
          {format(new Date(value), 'dd/MM/yyyy', { locale: ptBR })}
        </div>
      ),
      width: 120
    },
    {
      key: 'lastVisit',
      title: 'Última Visita',
      dataIndex: 'lastVisit',
      sortable: true,
      render: (value: Date) => (
        <div className="text-sm">
          {format(new Date(value), 'dd/MM/yyyy', { locale: ptBR })}
        </div>
      ),
      width: 120
    }
  ], []);

  // Table columns for countries
  const countryColumns: ColumnDef<typeof countryStats[0]>[] = useMemo(() => [
    {
      key: 'country',
      title: 'País',
      dataIndex: 'country',
      sortable: true,
      className: 'font-medium',
      width: 200
    },
    {
      key: 'airports',
      title: 'Aeroportos',
      dataIndex: 'airports',
      sortable: true,
      render: (value: number) => (
        <Badge variant="outline" className="font-mono">
          {value}
        </Badge>
      ),
      width: 100,
      align: 'center'
    },
    {
      key: 'visits',
      title: 'Total de Visitas',
      dataIndex: 'visits',
      sortable: true,
      render: (value: number) => (
        <Badge variant="secondary" className="font-mono">
          {value}
        </Badge>
      ),
      width: 120,
      align: 'center'
    },
    {
      key: 'totalFlightTime',
      title: 'Tempo Total de Voo',
      dataIndex: 'totalFlightTime',
      sortable: true,
      render: (value: number) => (
        <div className="font-mono text-sm">
          {formatDuration(value)}
        </div>
      ),
      width: 150
    },
    {
      key: 'averagePerAirport',
      title: 'Média por Aeroporto',
      render: (_, record) => (
        <div className="font-mono text-sm">
          {formatDuration(record.totalFlightTime / record.airports)}
        </div>
      ),
      width: 150
    }
  ], []);

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Erro ao carregar dados dos aeroportos: {error.message}</p>
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
          <MapPin className="h-6 w-6" />
          Relatório de Aeroportos
        </h2>
        <p className="text-muted-foreground">
          Estatísticas detalhadas dos aeroportos visitados e países explorados
        </p>
      </div>

      {/* KPI Cards */}
      <KPIGrid cards={kpiData} loading={loading} />

      {/* Top Airports Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Aeroportos Mais Visitados</CardTitle>
          <CardDescription>
            Ranking dos aeroportos com maior número de visitas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={chartConfig}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Detailed Tables */}
      <Tabs defaultValue="airports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="airports" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Aeroportos
          </TabsTrigger>
          <TabsTrigger value="countries" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Países
          </TabsTrigger>
        </TabsList>

        <TabsContent value="airports">
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas por Aeroporto</CardTitle>
              <CardDescription>
                Detalhamento completo de todos os aeroportos visitados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={airportStats || []}
                columns={airportColumns}
                pagination={pagination}
                sorting={sorting}
                filtering={filtering}
                loading={loading}
                onPaginationChange={setPagination}
                onSortingChange={setSorting}
                onFilteringChange={setFiltering}
                emptyMessage="Nenhum aeroporto encontrado no período selecionado"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="countries">
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas por País</CardTitle>
              <CardDescription>
                Resumo das operações por país visitado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={countryStats}
                columns={countryColumns}
                loading={loading}
                emptyMessage="Nenhum país encontrado no período selecionado"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Airport Activity Timeline */}
      {airportStats && airportStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Atividade dos Aeroportos</CardTitle>
            <CardDescription>
              Linha do tempo das primeiras e últimas visitas aos aeroportos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {airportStats.slice(0, 5).map((airport, index) => (
                <div key={airport.icao} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    <Badge variant="outline" className="font-mono">
                      {airport.icao}
                    </Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{airport.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {airport.city}, {airport.country}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="text-center">
                      <div className="text-muted-foreground">Primeira</div>
                      <div className="font-mono">
                        {format(new Date(airport.firstVisit), 'dd/MM/yy', { locale: ptBR })}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-muted-foreground">Última</div>
                      <div className="font-mono">
                        {format(new Date(airport.lastVisit), 'dd/MM/yy', { locale: ptBR })}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-muted-foreground">Visitas</div>
                      <div className="font-bold">{airport.visitCount}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}