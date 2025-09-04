import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wrench, Clock, DollarSign, AlertTriangle, CheckCircle, Calendar } from 'lucide-react';
import { MaintenanceRecord } from '@/types/maintenance';

interface MaintenanceSummaryProps {
  maintenanceRecords: MaintenanceRecord[];
}

interface MaintenanceStats {
  totalRecords: number;
  pendingRecords: number;
  completedRecords: number;
  totalEstimatedCost: number;
  totalActualCost: number;
  totalEstimatedHours: number;
  totalActualHours: number;
  avgCostPerMaintenance: number;
  avgHoursPerMaintenance: number;
  costVariance: number;
  hoursVariance: number;
}

const MaintenanceSummary: React.FC<MaintenanceSummaryProps> = ({ maintenanceRecords }) => {
  const calculateStats = (): MaintenanceStats => {
    const totalRecords = maintenanceRecords.length;
    const pendingRecords = maintenanceRecords.filter(record => record.status === 'pending').length;
    const completedRecords = maintenanceRecords.filter(record => record.status === 'completed').length;
    
    const totalEstimatedCost = maintenanceRecords.reduce((sum, record) => {
      const recordCost = record.items?.reduce((itemSum, item) => itemSum + (item.estimated_cost || 0), 0) || 0;
      return sum + recordCost;
    }, 0);
    
    const totalActualCost = maintenanceRecords.reduce((sum, record) => {
      const recordCost = record.items?.reduce((itemSum, item) => itemSum + (item.actual_cost || 0), 0) || 0;
      return sum + recordCost;
    }, 0);
    
    const totalEstimatedHours = maintenanceRecords.reduce((sum, record) => {
      const recordHours = record.items?.reduce((itemSum, item) => itemSum + (item.estimated_hours || 0), 0) || 0;
      return sum + recordHours;
    }, 0);
    
    const totalActualHours = maintenanceRecords.reduce((sum, record) => {
      const recordHours = record.items?.reduce((itemSum, item) => itemSum + (item.actual_hours || 0), 0) || 0;
      return sum + recordHours;
    }, 0);
    
    const avgCostPerMaintenance = totalRecords > 0 ? totalActualCost / totalRecords : 0;
    const avgHoursPerMaintenance = totalRecords > 0 ? totalActualHours / totalRecords : 0;
    
    const costVariance = totalEstimatedCost > 0 ? ((totalActualCost - totalEstimatedCost) / totalEstimatedCost) * 100 : 0;
    const hoursVariance = totalEstimatedHours > 0 ? ((totalActualHours - totalEstimatedHours) / totalEstimatedHours) * 100 : 0;
    
    return {
      totalRecords,
      pendingRecords,
      completedRecords,
      totalEstimatedCost,
      totalActualCost,
      totalEstimatedHours,
      totalActualHours,
      avgCostPerMaintenance,
      avgHoursPerMaintenance,
      costVariance,
      hoursVariance
    };
  };

  const stats = calculateStats();
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatHours = (hours: number) => {
    return `${hours.toFixed(1)}h`;
  };

  const formatPercentage = (percentage: number) => {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="mobile-card mobile-slide-up stats-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-readable-muted uppercase tracking-wider font-medium">Total de Manutenções</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalRecords}</p>
              </div>
              <Wrench className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2 flex gap-2">
              <Badge variant="outline" className="text-xs">
                {stats.completedRecords} concluídas
              </Badge>
              {stats.pendingRecords > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {stats.pendingRecords} pendentes
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="mobile-card mobile-slide-up stats-card" style={{ animationDelay: '0.1s' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-readable-muted uppercase tracking-wider font-medium">Custo Total</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalActualCost)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-red-600" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-readable-muted">
                Estimado: {formatCurrency(stats.totalEstimatedCost)}
              </p>
              {stats.totalEstimatedCost > 0 && (
                <Badge 
                  variant={stats.costVariance > 0 ? "destructive" : "default"}
                  className="text-xs mt-1"
                >
                  {formatPercentage(stats.costVariance)}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="mobile-card mobile-slide-up stats-card" style={{ animationDelay: '0.2s' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-readable-muted uppercase tracking-wider font-medium">Horas Totais</p>
                <p className="text-2xl font-bold text-purple-600">{formatHours(stats.totalActualHours)}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-readable-muted">
                Estimado: {formatHours(stats.totalEstimatedHours)}
              </p>
              {stats.totalEstimatedHours > 0 && (
                <Badge 
                  variant={stats.hoursVariance > 0 ? "destructive" : "default"}
                  className="text-xs mt-1"
                >
                  {formatPercentage(stats.hoursVariance)}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="mobile-card mobile-slide-up stats-card" style={{ animationDelay: '0.3s' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-readable-muted uppercase tracking-wider font-medium">Custo Médio</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.avgCostPerMaintenance)}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-readable-muted">
                Por manutenção
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo Detalhado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Resumo de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-foreground">Análise de Custos</h4>
              
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <div>
                  <p className="font-medium text-foreground text-sm">Custo Total Estimado</p>
                  <p className="text-xs text-readable-muted">Planejamento inicial</p>
                </div>
                <span className="font-bold text-blue-600 text-sm">
                  {formatCurrency(stats.totalEstimatedCost)}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <div>
                  <p className="font-medium text-foreground text-sm">Custo Total Real</p>
                  <p className="text-xs text-readable-muted">Valor efetivamente gasto</p>
                </div>
                <span className="font-bold text-red-600 text-sm">
                  {formatCurrency(stats.totalActualCost)}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <div>
                  <p className="font-medium text-foreground text-sm">Variação de Custo</p>
                  <p className="text-xs text-readable-muted">Diferença vs estimativa</p>
                </div>
                <span className={`font-bold text-sm ${
                  stats.costVariance > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {stats.totalEstimatedCost > 0 ? formatPercentage(stats.costVariance) : 'N/A'}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-foreground">Análise de Tempo</h4>
              
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <div>
                  <p className="font-medium text-foreground text-sm">Horas Estimadas</p>
                  <p className="text-xs text-readable-muted">Tempo planejado</p>
                </div>
                <span className="font-bold text-blue-600 text-sm">
                  {formatHours(stats.totalEstimatedHours)}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <div>
                  <p className="font-medium text-foreground text-sm">Horas Reais</p>
                  <p className="text-xs text-readable-muted">Tempo efetivamente gasto</p>
                </div>
                <span className="font-bold text-purple-600 text-sm">
                  {formatHours(stats.totalActualHours)}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <div>
                  <p className="font-medium text-foreground text-sm">Variação de Tempo</p>
                  <p className="text-xs text-readable-muted">Diferença vs estimativa</p>
                </div>
                <span className={`font-bold text-sm ${
                  stats.hoursVariance > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {stats.totalEstimatedHours > 0 ? formatPercentage(stats.hoursVariance) : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertas e Recomendações */}
      {(stats.pendingRecords > 0 || stats.costVariance > 20 || stats.hoursVariance > 20) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Alertas e Recomendações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.pendingRecords > 0 && (
                <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Você tem {stats.pendingRecords} manutenção(ões) pendente(s) que requer(em) atenção.
                  </p>
                </div>
              )}
              
              {stats.costVariance > 20 && (
                <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <p className="text-sm text-red-800 dark:text-red-200">
                    Os custos reais estão {formatPercentage(stats.costVariance)} acima do estimado. Considere revisar o planejamento.
                  </p>
                </div>
              )}
              
              {stats.hoursVariance > 20 && (
                <div className="flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <p className="text-sm text-orange-800 dark:text-orange-200">
                    O tempo real está {formatPercentage(stats.hoursVariance)} acima do estimado. Considere ajustar as estimativas futuras.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MaintenanceSummary;