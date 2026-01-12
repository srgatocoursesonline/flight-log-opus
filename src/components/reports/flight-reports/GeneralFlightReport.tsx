import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plane, Clock, MapPin, Calendar, TrendingUp } from 'lucide-react';
import { DataTable, KPICard, KPIGrid } from '@/components/reports/shared';
import { useFlightReportData } from '@/hooks/reports/useReportData';
import { ReportFilters, ColumnDef, PaginationConfig, SortingConfig, FilteringConfig } from '@/types/reports';
import { FlightWithDetails } from '@/types/flight';
import { formatDuration, formatDistance, formatCurrency, parseFlightTime } from '@/utils/reports/dataProcessing';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface GeneralFlightReportProps {
  filters: ReportFilters;
}

export function GeneralFlightReport({ filters }: GeneralFlightReportProps) {
  const { flights, flightAggregation, loading, error } = useFlightReportData(filters);
  
  // Table state
  const [pagination, setPagination] = useState<PaginationConfig>({
    page: 1,
    pageSize: 25,
    total: flights?.length || 0,
    showSizeChanger: true,
    pageSizeOptions: [10, 25, 50, 100]
  });
  
  const [sorting, setSorting] = useState<SortingConfig>({
    field: 'departure_time',
    direction: 'desc'
  });
  
  const [filtering, setFiltering] = useState<FilteringConfig>({
    searchTerm: ''
  });

  // Update pagination total when flights change
  React.useEffect(() => {
    setPagination(prev => ({ ...prev, total: flights?.length || 0 }));
  }, [flights]);

  // KPI Cards data
  const kpiData = useMemo(() => {
    if (!flightAggregation) return [];
    
    return [
      {
        title: 'Total de Voos',
        value: flightAggregation.totalFlights.toLocaleString(),
        icon: <Plane className="h-4 w-4" />,
        description: 'Voos registrados no período'
      },
      {
        title: 'Horas de Voo',
        value: formatDuration(flightAggregation.totalHours),
        icon: <Clock className="h-4 w-4" />,
        description: 'Tempo total de voo'
      },
      {
        title: 'Distância Total',
        value: formatDistance(flightAggregation.totalDistance),
        icon: <MapPin className="h-4 w-4" />,
        description: 'Distância percorrida'
      },
      {
        title: 'Taxa de Conclusão',
        value: `${flightAggregation.completionRate.toFixed(1)}%`,
        icon: <TrendingUp className="h-4 w-4" />,
        description: 'Voos concluídos com sucesso'
      }
    ];
  }, [flightAggregation]);

  // Table columns
  const columns: ColumnDef<FlightWithDetails>[] = useMemo(() => [
    {
      key: 'departure_time',
      title: 'Data',
      dataIndex: 'departure_time',
      sortable: true,
      render: (value: string) => (
        <div className="text-sm">
          {format(new Date(value), 'dd/MM/yyyy', { locale: ptBR })}
        </div>
      ),
      width: 100
    },
    {
      key: 'route',
      title: 'Rota',
      render: (_, record: FlightWithDetails) => (
        <div className="space-y-1">
          <div className="text-sm font-medium">
            {record.departure_airport_details?.name || record.departure_airport} → {record.arrival_airport_details?.name || record.arrival_airport}
          </div>
          <div className="text-xs text-muted-foreground">
            {record.departure_airport_details?.city || 'Unknown'} → {record.arrival_airport_details?.city || 'Unknown'}
          </div>
        </div>
      ),
      width: 200
    },
    {
      key: 'aircraft_type',
      title: 'Aeronave',
      dataIndex: 'aircraft_type',
      sortable: true,
      render: (value: string, record: FlightWithDetails) => (
        <div className="space-y-1">
          <div className="text-sm font-medium">{value}</div>
          {record.aircraft_registration && (
            <div className="text-xs text-muted-foreground">
              {record.aircraft_registration}
            </div>
          )}
        </div>
      ),
      width: 150
    },
    {
      key: 'flight_time',
      title: 'Duração',
      dataIndex: 'flight_time',
      sortable: true,
      render: (value: string) => (
        <div className="text-sm font-mono">
          {formatDuration(parseFlightTime(value))}
        </div>
      ),
      width: 100
    },
    {
      key: 'distance',
      title: 'Distância',
      dataIndex: 'distance',
      sortable: true,
      render: (value: number) => (
        <div className="text-sm">
          {value ? formatDistance(value) : '-'}
        </div>
      ),
      width: 100
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
      sortable: true,
      render: (value: string) => {
        const normalizedStatus = (value || '').toLowerCase();
        
        const statusConfig: Record<string, { label: string, variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
          'arrived': { label: 'Concluído', variant: 'default' },
          'completed': { label: 'Concluído', variant: 'default' },
          'concluído': { label: 'Concluído', variant: 'default' },
          'departed': { label: 'Em Voo', variant: 'secondary' },
          'em voo': { label: 'Em Voo', variant: 'secondary' },
          'scheduled': { label: 'Agendado', variant: 'outline' },
          'agendado': { label: 'Agendado', variant: 'outline' },
          'cancelled': { label: 'Cancelado', variant: 'destructive' },
          'cancelado': { label: 'Cancelado', variant: 'destructive' },
          'delayed': { label: 'Atrasado', variant: 'secondary' },
          'atrasado': { label: 'Atrasado', variant: 'secondary' }
        };
        
        const config = statusConfig[normalizedStatus] || 
          { label: value, variant: 'outline' };
        
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
      width: 120
    },
    {
      key: 'revenue',
      title: 'CR Total',
      dataIndex: 'revenue',
      sortable: true,
      render: (value: number) => (
        <div className="text-sm font-mono">
          {value ? formatCurrency(value) : '-'}
        </div>
      ),
      width: 120,
      align: 'right'
    }
  ], []);

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Erro ao carregar dados dos voos: {error.message}</p>
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
        <h2 className="text-2xl font-bold tracking-tight">Relatório Geral de Voos</h2>
        <p className="text-muted-foreground">
          Visão geral completa dos voos registrados no período selecionado
        </p>
      </div>

      {/* KPI Cards */}
      <KPIGrid cards={kpiData} loading={loading} />

      {/* Flight Statistics Summary */}
      {flightAggregation && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Duração Média</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatDuration(flightAggregation.averageDuration)}
              </div>
              <p className="text-xs text-muted-foreground">por voo</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Distância Média</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatDistance(flightAggregation.averageDistance)}
              </div>
              <p className="text-xs text-muted-foreground">por voo</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Aeroportos Únicos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {flightAggregation.uniqueAirports}
              </div>
              <p className="text-xs text-muted-foreground">visitados</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Países Únicos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {flightAggregation.uniqueCountries}
              </div>
              <p className="text-xs text-muted-foreground">visitados</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Flights Table */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Voos</CardTitle>
          <CardDescription>
            Lista detalhada de todos os voos registrados no período
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={flights || []}
            columns={columns}
            pagination={pagination}
            sorting={sorting}
            filtering={filtering}
            loading={loading}
            onPaginationChange={setPagination}
            onSortingChange={setSorting}
            onFilteringChange={setFiltering}
            emptyMessage="Nenhum voo encontrado no período selecionado"
          />
        </CardContent>
      </Card>
    </div>
  );
}