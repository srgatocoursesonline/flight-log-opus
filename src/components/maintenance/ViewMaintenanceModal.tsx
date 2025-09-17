import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Plane,
  User,
  MapPin,
  Clock,
  DollarSign,
  FileText,
  Wrench,
  Eye,
  X,
  CheckCircle,
  AlertCircle,
  XCircle,
  PlayCircle
} from 'lucide-react';
import type { MaintenanceRecord, MaintenanceStatus } from '../../types/maintenance';

interface ViewMaintenanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: MaintenanceRecord | null;
}

const statusConfig = {
  pending: {
    label: 'Pendente',
    icon: AlertCircle,
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-100 dark:bg-yellow-900',
    variant: 'secondary' as const
  },
  in_progress: {
    label: 'Em Andamento',
    icon: PlayCircle,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900',
    variant: 'default' as const
  },
  completed: {
    label: 'Concluída',
    icon: CheckCircle,
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-900',
    variant: 'default' as const
  },
  cancelled: {
    label: 'Cancelada',
    icon: XCircle,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-900',
    variant: 'destructive' as const
  }
};

const StatusBadge = ({ status }: { status: MaintenanceStatus }) => {
  const config = statusConfig[status];
  const Icon = config.icon;
  
  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};

const InfoItem = ({ 
  icon: Icon, 
  label, 
  value, 
  className = "" 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string | number | null | undefined;
  className?: string;
}) => {
  if (!value) return null;
  
  return (
    <div className={`flex items-center space-x-2 text-sm ${className}`}>
      <Icon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
      <span className="text-gray-600 dark:text-gray-400">{label}:</span>
      <span className="text-gray-900 dark:text-white font-medium">{value}</span>
    </div>
  );
};

export function ViewMaintenanceModal({
  open,
  onOpenChange,
  record
}: ViewMaintenanceModalProps) {
  if (!record) return null;

  const formatDate = (date: string) => {
    const d = new Date(date);
    const utcDate = new Date(Date.UTC(
      d.getFullYear(),
      d.getMonth(),
      d.getDate()
    ));
    return utcDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC'
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const totalEstimatedCost = record.items?.reduce((sum, item) => {
    return sum + (item.estimated_cost || 0);
  }, 0) || 0;

  const totalActualCost = record.items?.reduce((sum, item) => {
    return sum + (item.actual_cost || 0);
  }, 0) || 0;

  const totalEstimatedHours = record.items?.reduce((sum, item) => {
    return sum + (item.estimated_hours || 0);
  }, 0) || 0;

  const totalActualHours = record.items?.reduce((sum, item) => {
    return sum + (item.actual_hours || 0);
  }, 0) || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Detalhes da Manutenção
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cabeçalho com informações principais */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Plane className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {record.aircraft}
                  </h2>
                </div>
              </div>
              <StatusBadge status={record.status} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoItem
                icon={Calendar}
                label="Data da Manutenção"
                value={formatDate(record.date)}
              />
              
              {record.description && (
                <InfoItem
                  icon={FileText}
                  label="Descrição"
                  value={record.description}
                />
              )}
              
              {record.mechanic_license && (
                <InfoItem
                  icon={FileText}
                  label="Licença"
                  value={record.mechanic_license}
                />
              )}
              

            </div>
          </div>

          {/* Resumo de Custos e Horas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wider font-medium">
                    Custo Estimado
                  </p>
                  <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                    {formatCurrency(totalEstimatedCost)}
                  </p>
                </div>
                <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-green-600 dark:text-green-400 uppercase tracking-wider font-medium">
                    Custo Real
                  </p>
                  <p className="text-lg font-bold text-green-700 dark:text-green-300">
                    {formatCurrency(totalActualCost)}
                  </p>
                </div>
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-purple-600 dark:text-purple-400 uppercase tracking-wider font-medium">
                    Horas Estimadas
                  </p>
                  <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                    {totalEstimatedHours}h
                  </p>
                </div>
                <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-orange-600 dark:text-orange-400 uppercase tracking-wider font-medium">
                    Horas Reais
                  </p>
                  <p className="text-lg font-bold text-orange-700 dark:text-orange-300">
                    {totalActualHours}h
                  </p>
                </div>
                <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>

          {/* Itens de Manutenção */}
          {record.items && record.items.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Itens de Manutenção ({record.items.length})
              </h3>
              
              <div className="space-y-3">
                {record.items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {item.maintenance_item?.name}
                        </h4>
                        {item.maintenance_item?.category && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {item.maintenance_item.category.name}
                          </p>
                        )}
                      </div>
                      <StatusBadge status={item.status} />
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Horas Est.:</span>
                        <span className="ml-1 font-medium">{item.estimated_hours || 0}h</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Horas Reais:</span>
                        <span className="ml-1 font-medium">{item.actual_hours || 0}h</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Custo Est.:</span>
                        <span className="ml-1 font-medium">{formatCurrency(item.estimated_cost || 0)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Custo Real:</span>
                        <span className="ml-1 font-medium">{formatCurrency(item.actual_cost || 0)}</span>
                      </div>
                    </div>
                    
                    {item.notes && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <strong>Observações:</strong> {item.notes}
                        </p>
                      </div>
                    )}
                    
                    {item.completed_at && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Concluído em: {formatDate(item.completed_at)}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Observações */}
          {record.notes && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Observações
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {record.notes}
                </p>
              </div>
            </div>
          )}

          {/* Informações de Auditoria */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Informações do Sistema
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500 dark:text-gray-400">
              <div>
                <span>Criado em:</span>
                <span className="ml-1">
                  {record.created_at ? formatDate(record.created_at) : 'N/A'}
                </span>
              </div>
              <div>
                <span>Atualizado em:</span>
                <span className="ml-1">
                  {record.updated_at ? formatDate(record.updated_at) : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Botão de Fechar */}
        <div className="flex justify-end pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4 mr-2" />
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}