/**
 * Dashboard de monitoramento do sistema de aeroportos
 * Para uso em produção - mostra estatísticas e problemas
 */

import { useState, useEffect } from 'react';
import { 
  getAuditLogs, 
  getCacheStats, 
  exportAuditLogs, 
  clearAirportCache 
} from '@/lib/airportAutoFillService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database,
  Download,
  RefreshCw,
  Trash2,
  Plane
} from 'lucide-react';

interface AirportMonitoringDashboardProps {
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface SystemStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  cacheHitRate: number;
  lastUpdate: string;
}

export function AirportMonitoringDashboard({ 
  className, 
  autoRefresh = true, 
  refreshInterval = 30000 
}: AirportMonitoringDashboardProps) {
  const [stats, setStats] = useState<SystemStats>({
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    cacheHitRate: 0,
    lastUpdate: new Date().toISOString()
  });
  
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [cacheInfo, setCacheInfo] = useState({ cacheSize: 0, oldestEntry: 0, newestEntry: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  // Carregar dados
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [logs, cacheData] = await Promise.all([
        getAuditLogs(1000), // Últimos 1000 logs
        getCacheStats()
      ]);

      // Processar estatísticas
      const recentLogs = logs.slice(0, 100); // Últimos 100 para display
      const successfulRequests = logs.filter(log => log.success).length;
      const failedRequests = logs.filter(log => !log.success).length;
      const totalRequests = logs.length;
      
      // Calcular tempo médio de resposta (últimos 100)
      const recentResponseTimes = recentLogs.map(log => log.responseTime);
      const averageResponseTime = recentResponseTimes.length > 0 
        ? recentResponseTimes.reduce((a, b) => a + b, 0) / recentResponseTimes.length 
        : 0;

      // Calcular taxa de acerto do cache (últimos 100)
      const cacheHits = recentLogs.filter(log => log.source === 'cache').length;
      const cacheHitRate = totalRequests > 0 ? (cacheHits / recentLogs.length) * 100 : 0;

      setStats({
        totalRequests,
        successfulRequests,
        failedRequests,
        averageResponseTime: Math.round(averageResponseTime),
        cacheHitRate: Math.round(cacheHitRate * 100) / 100,
        lastUpdate: new Date().toISOString()
      });

      setRecentLogs(recentLogs);
      setCacheInfo(cacheData);
      setLastError(null);

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      setLastError('Erro ao carregar dados do sistema');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto refresh
  useEffect(() => {
    loadData();
    
    if (autoRefresh) {
      const interval = setInterval(loadData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const handleExportLogs = () => {
    try {
      const logsJson = exportAuditLogs();
      const blob = new Blob([logsJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `airport-monitoring-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar logs:', error);
    }
  };

  const handleClearCache = async () => {
    try {
      await clearAirportCache();
      await loadData();
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
    }
  };

  const successRate = stats.totalRequests > 0 
    ? Math.round((stats.successfulRequests / stats.totalRequests) * 100) 
    : 0;

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <div className={className}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {/* Taxa de Sucesso */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            {successRate >= 90 ? (
              <CheckCircle className="h-4 w-4 text-success" />
            ) : successRate >= 70 ? (
              <AlertTriangle className="h-4 w-4 text-warning" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.successfulRequests} de {stats.totalRequests} requisições
            </p>
          </CardContent>
        </Card>

        {/* Tempo Médio de Resposta */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(stats.averageResponseTime)}</div>
            <p className="text-xs text-muted-foreground">
              Últimas 100 requisições
            </p>
          </CardContent>
        </Card>

        {/* Taxa de Cache Hit */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cacheHitRate}%</div>
            <p className="text-xs text-muted-foreground">
              {cacheInfo.cacheSize} aeroportos em cache
            </p>
          </CardContent>
        </Card>

        {/* Falhas Recentes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Falhas</CardTitle>
            {stats.failedRequests > 0 ? (
              <TrendingDown className="h-4 w-4 text-destructive" />
            ) : (
              <TrendingUp className="h-4 w-4 text-success" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.failedRequests}</div>
            <p className="text-xs text-muted-foreground">
              Últimas 1000 requisições
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Logs Recentes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Plane className="w-5 h-5" />
                Logs Recentes
              </CardTitle>
              <CardDescription>
                Últimas 100 requisições de aeroportos
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={loadData} 
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button 
                onClick={handleExportLogs}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar
              </Button>
              <Button 
                onClick={handleClearCache}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 text-destructive hover:text-destructive/80"
              >
                <Trash2 className="w-4 h-4" />
                Limpar Cache
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {lastError ? (
            <div className="text-center text-red-600 py-8">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
              <p>{lastError}</p>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {recentLogs.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Plane className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhum log disponível</p>
                  </div>
                ) : (
                  recentLogs.map((log, index) => (
                    <div 
                      key={index} 
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        log.success 
                          ? 'bg-success/10 border-success/30'
                          : 'bg-destructive/10 border-destructive/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {log.success ? (
                          <CheckCircle className="w-5 h-5 text-success" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-destructive" />
                        )}
                        <div>
                          <div className="font-medium">{log.icaoCode}</div>
                          <div className="text-sm text-gray-600">
                            {log.airportName || log.error || 'Sem informações'}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Fonte: {log.source} • {log.responseTime}ms
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        {formatDate(log.timestamp)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Informações do Sistema */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Última atualização: {formatDate(stats.lastUpdate)}</p>
        {autoRefresh && <p>Atualização automática a cada {refreshInterval / 1000} segundos</p>}
      </div>
    </div>
  );
}