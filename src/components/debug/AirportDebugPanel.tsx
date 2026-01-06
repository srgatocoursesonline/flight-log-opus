/**
 * Componente de debug para monitorar o sistema de preenchimento automático de aeroportos
 * Permite visualizar logs, estatísticas do cache e testar a funcionalidade
 */

import { useState, useEffect } from 'react';
import { 
  getAuditLogs, 
  getCacheStats, 
  exportAuditLogs, 
  clearAirportCache 
} from '@/lib/airportAutoFillService';
import { useAirportAutoFill } from '@/hooks/business/useAirportAutoFill';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Trash2, Download, Search, RefreshCw, Plane } from 'lucide-react';

interface AirportDebugPanelProps {
  className?: string;
}

export function AirportDebugPanel({ className }: AirportDebugPanelProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [cacheStats, setCacheStats] = useState({ cacheSize: 0, oldestEntry: 0, newestEntry: 0 });
  const [testCode, setTestCode] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { 
    loading, 
    error, 
    fillAirportInfo, 
    clearCache, 
    getCacheStatistics,
    getLogs 
  } = useAirportAutoFill();

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [logsData, cacheData] = await Promise.all([
        getLogs(100),
        getCacheStatistics()
      ]);
      setLogs(logsData);
      setCacheStats(cacheData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleTestAirport = async () => {
    if (!testCode.trim()) return;
    
    const result = await fillAirportInfo(testCode.trim());
    if (result) {
      // Recarregar dados após teste
      await loadData();
    }
  };

  const handleClearCache = async () => {
    clearCache();
    await loadData();
  };

  const handleExportLogs = () => {
    const logsJson = exportAuditLogs();
    const blob = new Blob([logsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `airport-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR');
  };

  const getStatusBadge = (success: boolean) => {
    return success ? (
      <Badge variant="default" className="bg-green-500 hover:bg-green-600">
        <Plane className="w-3 h-3 mr-1" />
        Sucesso
      </Badge>
    ) : (
      <Badge variant="destructive">
        <Plane className="w-3 h-3 mr-1" />
        Erro
      </Badge>
    );
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="w-5 h-5" />
            Debug - Sistema de Aeroportos
          </CardTitle>
          <CardDescription>
            Monitoramento do preenchimento automático de aeroportos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Estatísticas do Cache */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{cacheStats.cacheSize}</div>
              <div className="text-sm text-gray-600">Aeroportos em Cache</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {cacheStats.oldestEntry ? Math.floor((Date.now() - cacheStats.oldestEntry) / 1000 / 60) : 0}
              </div>
              <div className="text-sm text-gray-600">Minutos (mais antigo)</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {cacheStats.newestEntry ? Math.floor((Date.now() - cacheStats.newestEntry) / 1000 / 60) : 0}
              </div>
              <div className="text-sm text-gray-600">Minutos (mais novo)</div>
            </div>
          </div>

          {/* Teste de Aeroporto */}
          <div className="space-y-3">
            <Label htmlFor="test-code">Testar Código ICAO</Label>
            <div className="flex gap-2">
              <Input
                id="test-code"
                placeholder="Ex: SBGR, KJFK, EGLL"
                value={testCode}
                onChange={(e) => setTestCode(e.target.value)}
                className="flex-1"
                maxLength={4}
                disabled={loading}
              />
              <Button 
                onClick={handleTestAirport} 
                disabled={loading || !testCode.trim()}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                Buscar
              </Button>
            </div>
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {error}
              </div>
            )}
          </div>

          <Separator />

          {/* Controles */}
          <div className="flex gap-2">
            <Button 
              onClick={loadData} 
              disabled={isRefreshing}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button 
              onClick={handleClearCache} 
              variant="outline"
              size="sm"
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
              Limpar Cache
            </Button>
            <Button 
              onClick={handleExportLogs} 
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar Logs
            </Button>
          </div>

          <Separator />

          {/* Logs de Auditoria */}
          <div className="space-y-3">
            <Label>Logs de Auditoria ({logs.length})</Label>
            <ScrollArea className="h-64 border rounded-lg">
              <div className="p-3 space-y-2">
                {logs.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    Nenhum log disponível
                  </div>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                      <div className="flex items-center gap-3">
                        {getStatusBadge(log.success)}
                        <div>
                          <div className="font-medium">{log.icaoCode}</div>
                          <div className="text-gray-600">
                            {log.airportName || log.error || 'Sem informações'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-gray-500">
                        <div>{formatTimestamp(log.timestamp)}</div>
                        <div className="text-xs">
                          {log.source} • {log.responseTime}ms
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}