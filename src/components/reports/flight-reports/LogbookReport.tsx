import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BookOpen, Download, Printer, FileText } from 'lucide-react';
import { DataTable } from '@/components/reports/shared';
import { useFlightReportData } from '@/hooks/reports/useReportData';
import { ReportFilters, ColumnDef, PaginationConfig, SortingConfig } from '@/types/reports';
import { FlightWithDetails } from '@/types/flight';
import { formatDuration, parseFlightTime } from '@/utils/reports/dataProcessing';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LogbookReportProps {
  filters: ReportFilters;
}

interface LogbookEntry {
  date: string;
  aircraft: string;
  registration: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  flightTime: string;
  flightType: string;
  pilotName?: string;
  coPilot?: string;
  observations?: string;
  totalTime: number; // For running totals
}

export function LogbookReport({ filters }: LogbookReportProps) {
  const { flights, flightAggregation, loading, error } = useFlightReportData(filters);
  
  // Table state
  const [pagination, setPagination] = useState<PaginationConfig>({
    page: 1,
    pageSize: 20,
    total: flights?.length || 0,
    showSizeChanger: true,
    pageSizeOptions: [10, 20, 50]
  });
  
  const [sorting, setSorting] = useState<SortingConfig>({
    field: 'date',
    direction: 'asc'
  });

  // Process flights into logbook entries with running totals
  const logbookEntries = useMemo(() => {
    if (!flights) return [];
    
    let runningTotal = 0;
    
    return flights
      .sort((a, b) => new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime())
      .map((flight): LogbookEntry => {
        const flightHours = parseFlightTime(flight.flight_time);
        runningTotal += flightHours;
        
        return {
          date: format(new Date(flight.departure_time), 'dd/MM/yyyy', { locale: ptBR }),
          aircraft: flight.aircraft_type,
          registration: flight.aircraft_registration || '-',
          origin: flight.departure_airport_details?.name || flight.departure_airport,
          destination: flight.arrival_airport_details?.name || flight.arrival_airport,
          departureTime: format(new Date(flight.departure_time), 'HH:mm', { locale: ptBR }),
          arrivalTime: format(new Date(flight.arrival_time), 'HH:mm', { locale: ptBR }),
          flightTime: formatDuration(flightHours),
          flightType: flight.flight_type || 'commercial',
          pilotName: flight.pilot_name || '-',
          coPilot: flight.co_pilot || '-',
          observations: flight.notes || '-',
          totalTime: runningTotal
        };
      });
  }, [flights]);

  // Calculate page totals for current page
  const pageEntries = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return logbookEntries.slice(startIndex, endIndex);
  }, [logbookEntries, pagination]);

  const pageTotal = useMemo(() => {
    return pageEntries.reduce((sum, entry) => {
      const hours = parseFlightTime(entry.flightTime);
      return sum + hours;
    }, 0);
  }, [pageEntries]);

  // Update pagination total when entries change
  React.useEffect(() => {
    setPagination(prev => ({ ...prev, total: logbookEntries.length }));
  }, [logbookEntries]);

  // Table columns for logbook format
  const columns: ColumnDef<LogbookEntry>[] = useMemo(() => [
    {
      key: 'date',
      title: 'Data',
      dataIndex: 'date',
      sortable: true,
      width: 100,
      className: 'font-mono text-sm'
    },
    {
      key: 'aircraft',
      title: 'Aeronave',
      render: (_, record: LogbookEntry) => (
        <div className="space-y-1">
          <div className="text-sm font-medium">{record.aircraft}</div>
          <div className="text-xs text-muted-foreground">{record.registration}</div>
        </div>
      ),
      width: 120
    },
    {
      key: 'route',
      title: 'Origem/Destino',
      render: (_, record: LogbookEntry) => (
        <div className="text-sm font-mono">
          {record.origin} → {record.destination}
        </div>
      ),
      width: 140
    },
    {
      key: 'times',
      title: 'Horários',
      render: (_, record: LogbookEntry) => (
        <div className="space-y-1">
          <div className="text-xs">
            <span className="text-muted-foreground">Dep:</span> {record.departureTime}
          </div>
          <div className="text-xs">
            <span className="text-muted-foreground">Arr:</span> {record.arrivalTime}
          </div>
        </div>
      ),
      width: 100
    },
    {
      key: 'flightTime',
      title: 'Tempo de Voo',
      dataIndex: 'flightTime',
      sortable: true,
      className: 'font-mono text-sm text-center',
      width: 100
    },
    {
      key: 'flightType',
      title: 'Tipo',
      dataIndex: 'flightType',
      render: (value: string) => {
        const typeConfig = {
          commercial: { label: 'Comercial', variant: 'default' as const },
          private: { label: 'Privado', variant: 'secondary' as const },
          training: { label: 'Treinamento', variant: 'outline' as const },
          ferry: { label: 'Ferry', variant: 'secondary' as const }
        };
        
        const config = typeConfig[value as keyof typeof typeConfig] || 
          { label: value, variant: 'outline' as const };
        
        return <Badge variant={config.variant} className="text-xs">{config.label}</Badge>;
      },
      width: 100
    },
    {
      key: 'crew',
      title: 'Tripulação',
      render: (_, record: LogbookEntry) => (
        <div className="space-y-1">
          <div className="text-xs">
            <span className="text-muted-foreground">PIC:</span> {record.pilotName}
          </div>
          {record.coPilot !== '-' && (
            <div className="text-xs">
              <span className="text-muted-foreground">SIC:</span> {record.coPilot}
            </div>
          )}
        </div>
      ),
      width: 150
    },
    {
      key: 'totalTime',
      title: 'Total Acumulado',
      dataIndex: 'totalTime',
      render: (value: number) => (
        <div className="font-mono text-sm font-medium">
          {formatDuration(value)}
        </div>
      ),
      width: 120,
      className: 'text-right'
    }
  ], []);

  const handleExport = (format: 'pdf' | 'excel') => {
    // TODO: Implement export functionality
    console.log(`Exporting logbook as ${format}`);
  };

  const handlePrint = () => {
    window.print();
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Erro ao carregar dados do logbook: {error.message}</p>
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Logbook de Voo
          </h2>
          <p className="text-muted-foreground">
            Registro oficial de voos em formato padrão ANAC/FAA
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
            <FileText className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('excel')}>
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
        </div>
      </div>

      {/* Summary Statistics */}
      {flightAggregation && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Voos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{flightAggregation.totalFlights}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Horas Totais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatDuration(flightAggregation.totalHours)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Aeronaves Diferentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.keys(flightAggregation.byAircraft).length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {flightAggregation.completionRate.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Logbook Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de Voos</CardTitle>
          <CardDescription>
            Formato oficial de logbook conforme padrões da aviação civil
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            data={logbookEntries}
            columns={columns}
            pagination={pagination}
            sorting={sorting}
            loading={loading}
            onPaginationChange={setPagination}
            onSortingChange={setSorting}
            emptyMessage="Nenhum voo registrado no período selecionado"
            className="logbook-table"
          />
          
          {/* Page Total */}
          {pageEntries.length > 0 && (
            <div className="border-t bg-muted/50 p-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">
                  Total da página ({pageEntries.length} voos):
                </span>
                <span className="font-mono font-medium">
                  {formatDuration(pageTotal)}
                </span>
              </div>
              {flightAggregation && (
                <div className="flex justify-between items-center text-sm mt-2 pt-2 border-t">
                  <span className="font-medium">
                    Total geral ({flightAggregation.totalFlights} voos):
                  </span>
                  <span className="font-mono font-bold">
                    {formatDuration(flightAggregation.totalHours)}
                  </span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Logbook Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Observações do Logbook</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>PIC:</strong> Pilot in Command (Piloto em Comando)
            </p>
            <p>
              <strong>SIC:</strong> Second in Command (Segundo em Comando)
            </p>
            <p>
              <strong>Formato:</strong> Este logbook segue os padrões estabelecidos pela ANAC e FAA para registro oficial de horas de voo.
            </p>
            <p>
              <strong>Certificação:</strong> Os dados apresentados são baseados nos registros do sistema e devem ser validados pelo piloto responsável.
            </p>
          </div>
          
          <Separator />
          
          <div className="text-xs text-muted-foreground">
            <p>
              Relatório gerado em {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} | 
              Período: {format(filters.dateRange.from, 'dd/MM/yyyy', { locale: ptBR })} - {format(filters.dateRange.to, 'dd/MM/yyyy', { locale: ptBR })}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}