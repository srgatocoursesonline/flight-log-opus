import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plane, 
  User, 
  MapPin, 
  Clock, 
  DollarSign, 
  Filter, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  CheckCircle,
  AlertCircle,
  XCircle,
  PlayCircle
} from 'lucide-react';
import { useMaintenanceManager } from '../../hooks/business/useMaintenanceManager';
import type { MaintenanceRecord, MaintenanceFilters, MaintenanceStatus } from '../../types/maintenance';

interface MaintenanceListProps {
  onEdit?: (record: MaintenanceRecord) => void;
  onView?: (record: MaintenanceRecord) => void;
}

const statusConfig = {
  pending: {
    label: 'Pendente',
    icon: AlertCircle,
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-100 dark:bg-yellow-900'
  },
  in_progress: {
    label: 'Em Andamento',
    icon: PlayCircle,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900'
  },
  completed: {
    label: 'Concluída',
    icon: CheckCircle,
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-900'
  },
  cancelled: {
    label: 'Cancelada',
    icon: XCircle,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-900'
  }
};

export function MaintenanceList({ onEdit, onView }: MaintenanceListProps) {
  const {
    records,
    loading,
    error,
    loadRecords,
    deleteMaintenanceRecord,
    updateMaintenanceRecord
  } = useMaintenanceManager();

  const [filters, setFilters] = useState<MaintenanceFilters>({
    status: undefined,
    aircraft_registration: '',
    date_from: '',
    date_to: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Carregar registros quando filtros mudarem
  useEffect(() => {
    const activeFilters: MaintenanceFilters = {};
    
    if (filters.status) activeFilters.status = filters.status;
    if (filters.aircraft) activeFilters.aircraft = filters.aircraft;
    if (filters.dateFrom) activeFilters.dateFrom = filters.dateFrom;
    if (filters.dateTo) activeFilters.dateTo = filters.dateTo;

    loadRecords(Object.keys(activeFilters).length > 0 ? activeFilters : undefined);
  }, [filters, loadRecords]);

  const handleFilterChange = (field: keyof MaintenanceFilters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value || undefined }));
  };

  const clearFilters = () => {
    setFilters({
      status: undefined,
      aircraft: '',
      dateFrom: '',
      dateTo: ''
    });
    setSearchTerm('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este registro de manutenção?')) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteMaintenanceRecord(id);
    } catch (err) {
      console.error('Erro ao excluir registro:', err);
    } finally {
      setDeletingId(null);
    }
  };

  // Filtrar registros por termo de busca
  const filteredRecords = records.filter(record => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      record.aircraft_registration?.toLowerCase().includes(searchLower) ||
      record.description?.toLowerCase().includes(searchLower) ||
      record.notes?.toLowerCase().includes(searchLower)
    );
  });

  const StatusBadge = ({ status, recordId }: { status: MaintenanceStatus; recordId: string }) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    const [isUpdating, setIsUpdating] = useState(false);
    
    const handleStatusChange = async () => {
      if (isUpdating) return;
      
      const statusOrder: MaintenanceStatus[] = ['pending', 'in_progress', 'completed', 'cancelled'];
      const currentIndex = statusOrder.indexOf(status);
      let nextStatus: MaintenanceStatus;
      
      // Ciclo: pending -> in_progress -> completed -> pending
      if (status === 'pending') {
        nextStatus = 'in_progress';
      } else if (status === 'in_progress') {
        nextStatus = 'completed';
      } else if (status === 'completed') {
        nextStatus = 'pending';
      } else {
        nextStatus = 'pending';
      }
      
      try {
        setIsUpdating(true);
        await updateMaintenanceRecord(recordId, { status: nextStatus });
      } catch (error) {
        console.error('Erro ao atualizar status:', error);
      } finally {
        setIsUpdating(false);
      }
    };
    
    return (
      <button
        onClick={handleStatusChange}
        disabled={isUpdating}
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all hover:scale-105 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${config.bg} ${config.color} cursor-pointer`}
        title="Clique para alterar o status"
      >
        <Icon className="h-3 w-3 mr-1" />
        {isUpdating ? 'Atualizando...' : config.label}
      </button>
    );
  };

  if (loading && records.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Carregando manutenções...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com busca e filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Busca */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por matrícula, modelo, mecânico..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Botão de filtros */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2 border rounded-lg transition-colors flex items-center space-x-2 ${
            showFilters
              ? 'bg-blue-50 dark:bg-blue-900 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300'
              : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <Filter className="h-4 w-4" />
          <span>Filtros</span>
        </button>
      </div>

      {/* Painel de filtros */}
      {showFilters && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Todos os status</option>
                <option value="pending">Pendente</option>
                <option value="in_progress">Em Andamento</option>
                <option value="completed">Concluída</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Matrícula
              </label>
              <input
                type="text"
                placeholder="Ex: PT-ABC"
                value={filters.aircraft || ''}
                onChange={(e) => handleFilterChange('aircraft', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data Inicial
              </label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data Final
              </label>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Lista de registros */}
      {filteredRecords.length === 0 ? (
        <div className="text-center py-12">
          <Plane className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhuma manutenção encontrada
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm || Object.values(filters).some(v => v)
              ? 'Tente ajustar os filtros de busca'
              : 'Comece criando sua primeira manutenção'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredRecords.map((record) => (
            <div
              key={record.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Plane className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {record.aircraft_registration}
                  </h3>
                  </div>
                </div>
                <StatusBadge status={record.status} recordId={record.id} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(Date.UTC(
                    new Date(record.date).getFullYear(),
                    new Date(record.date).getMonth(),
                    new Date(record.date).getDate()
                  )).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
                </div>



                <div className="flex items-center space-x-4">
                  {record.actual_hours > 0 && (
                    <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span>{record.actual_hours}h</span>
                    </div>
                  )}
                  {record.actual_cost > 0 && (
                    <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                      <DollarSign className="h-4 w-4" />
                      <span>R$ {record.actual_cost.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              {record.notes && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    {record.notes}
                  </p>
                </div>
              )}

              {/* Itens de manutenção */}
              {record.items && record.items.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Itens ({record.items.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {record.items.slice(0, 3).map((item) => (
                      <span
                        key={item.id}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      >
                        {item.maintenance_item?.name}
                      </span>
                    ))}
                    {record.items.length > 3 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                        +{record.items.length - 3} mais
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Ações */}
              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                {onView && (
                  <button
                    onClick={() => onView(record)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                    title="Visualizar"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                )}
                
                {onEdit && (
                  <button
                    onClick={() => onEdit(record)}
                    className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                )}
                
                <button
                  onClick={() => handleDelete(record.id)}
                  disabled={deletingId === record.id}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors disabled:opacity-50"
                  title="Excluir"
                >
                  {deletingId === record.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading overlay */}
      {loading && records.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-gray-700 dark:text-gray-300">Atualizando...</span>
          </div>
        </div>
      )}
    </div>
  );
}