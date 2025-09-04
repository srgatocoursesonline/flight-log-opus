import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Calendar, User, MapPin, FileText, Plane, Wrench } from 'lucide-react';
import { useMaintenanceManager } from '../../hooks/business/useMaintenanceManager';
import type { MaintenanceCategory, MaintenanceItem } from '../../types/maintenance';

interface AddMaintenanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface SelectedItem {
  maintenance_item_id: string;
  name: string;
  estimated_hours: number;
  estimated_cost: number;
  notes?: string;
}

export function AddMaintenanceModal({ open, onOpenChange, onSuccess }: AddMaintenanceModalProps) {
  const {
    categories,
    items,
    loading,
    error,
    loadItemsByCategory,
    createMaintenanceRecord,
    clearError
  } = useMaintenanceManager();

  const [formData, setFormData] = useState({
    aircraft_registration: '',
    aircraft_model: '',
    maintenance_date: new Date().toISOString().split('T')[0],
    mechanic_name: '',
    mechanic_license: '',
    location: '',
    notes: '',
    next_maintenance_date: '',
    next_maintenance_hours: 0
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [categoryItems, setCategoryItems] = useState<MaintenanceItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Carregar itens quando categoria for selecionada
  useEffect(() => {
    if (selectedCategory) {
      const filteredItems = items.filter(item => item.category_id === selectedCategory);
      setCategoryItems(filteredItems);
    } else {
      setCategoryItems([]);
    }
  }, [selectedCategory, items]);

  // Limpar formulário quando modal abrir/fechar
  useEffect(() => {
    if (open) {
      clearError();
    } else {
      setFormData({
        aircraft_registration: '',
        aircraft_model: '',
        maintenance_date: new Date().toISOString().split('T')[0],
        mechanic_name: '',
        mechanic_license: '',
        location: '',
        notes: '',
        next_maintenance_date: '',
        next_maintenance_hours: 0
      });
      setSelectedCategory('');
      setSelectedItems([]);
      setCategoryItems([]);
    }
  }, [open]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddItem = (item: MaintenanceItem) => {
    const isAlreadySelected = selectedItems.some(selected => selected.maintenance_item_id === item.id);
    if (isAlreadySelected) return;

    const newItem: SelectedItem = {
      maintenance_item_id: item.id,
      name: item.name,
      estimated_hours: item.estimated_hours || 0,
      estimated_cost: item.estimated_cost || 0,
      notes: ''
    };

    setSelectedItems(prev => [...prev, newItem]);
  };

  const handleRemoveItem = (itemId: string) => {
    setSelectedItems(prev => prev.filter(item => item.maintenance_item_id !== itemId));
  };

  const handleItemChange = (itemId: string, field: keyof SelectedItem, value: string | number) => {
    setSelectedItems(prev => prev.map(item => 
      item.maintenance_item_id === itemId 
        ? { ...item, [field]: value }
        : item
    ));
  };

  const calculateTotals = () => {
    const totalHours = selectedItems.reduce((sum, item) => sum + item.estimated_hours, 0);
    const totalCost = selectedItems.reduce((sum, item) => sum + item.estimated_cost, 0);
    return { totalHours, totalCost };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.aircraft_registration.trim()) {
      alert('Matrícula da aeronave é obrigatória');
      return;
    }

    if (selectedItems.length === 0) {
      alert('Selecione pelo menos um item de manutenção');
      return;
    }

    try {
      setSubmitting(true);
      
      await createMaintenanceRecord({
        ...formData,
        next_maintenance_hours: formData.next_maintenance_hours || undefined,
        items: selectedItems.map(item => ({
          maintenance_item_id: item.maintenance_item_id,
          estimated_hours: item.estimated_hours,
          estimated_cost: item.estimated_cost,
          notes: item.notes
        }))
      });

      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      console.error('Erro ao criar registro de manutenção:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const { totalHours, totalCost } = calculateTotals();

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Wrench className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Nova Manutenção
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Registrar nova manutenção da aeronave
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Informações da Aeronave */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Plane className="h-4 w-4 inline mr-2" />
                  Matrícula da Aeronave *
                </label>
                <input
                  type="text"
                  value={formData.aircraft_registration}
                  onChange={(e) => handleInputChange('aircraft_registration', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Ex: PT-ABC"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Modelo da Aeronave
                </label>
                <input
                  type="text"
                  value={formData.aircraft_model}
                  onChange={(e) => handleInputChange('aircraft_model', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Ex: Cessna 172"
                />
              </div>
            </div>

            {/* Informações da Manutenção */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Data da Manutenção *
                </label>
                <input
                  type="date"
                  value={formData.maintenance_date}
                  onChange={(e) => handleInputChange('maintenance_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <MapPin className="h-4 w-4 inline mr-2" />
                  Local
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Ex: Hangar 1, SBSP"
                />
              </div>
            </div>

            {/* Informações do Mecânico */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <User className="h-4 w-4 inline mr-2" />
                  Nome do Mecânico
                </label>
                <input
                  type="text"
                  value={formData.mechanic_name}
                  onChange={(e) => handleInputChange('mechanic_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Licença do Mecânico
                </label>
                <input
                  type="text"
                  value={formData.mechanic_license}
                  onChange={(e) => handleInputChange('mechanic_license', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Número da licença"
                />
              </div>
            </div>

            {/* Seleção de Categoria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Categoria de Manutenção
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Selecione uma categoria</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Itens Disponíveis */}
            {selectedCategory && categoryItems.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Itens Disponíveis
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                  {categoryItems.map(item => {
                    const isSelected = selectedItems.some(selected => selected.maintenance_item_id === item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleAddItem(item)}
                        disabled={isSelected}
                        className={`p-2 text-left rounded-lg border transition-colors ${
                          isSelected
                            ? 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 cursor-not-allowed'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900 hover:border-blue-300 dark:hover:border-blue-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.name}
                          </span>
                          {!isSelected && (
                            <Plus className="h-4 w-4 text-blue-500" />
                          )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {item.estimated_hours}h • R$ {item.estimated_cost?.toFixed(2)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Itens Selecionados */}
            {selectedItems.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Itens Selecionados ({selectedItems.length})
                </label>
                <div className="space-y-3 max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                  {selectedItems.map(item => (
                    <div key={item.maintenance_item_id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {item.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.maintenance_item_id)}
                          className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <div>
                          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Horas Estimadas
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            value={item.estimated_hours}
                            onChange={(e) => handleItemChange(item.maintenance_item_id, 'estimated_hours', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Custo Estimado (R$)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.estimated_cost}
                            onChange={(e) => handleItemChange(item.maintenance_item_id, 'estimated_cost', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Observações
                          </label>
                          <input
                            type="text"
                            value={item.notes || ''}
                            onChange={(e) => handleItemChange(item.maintenance_item_id, 'notes', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            placeholder="Observações específicas"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totais */}
                <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-blue-900 dark:text-blue-100">
                      Total Estimado:
                    </span>
                    <div className="text-right">
                      <div className="text-blue-900 dark:text-blue-100 font-semibold">
                        {totalHours.toFixed(1)}h • R$ {totalCost.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Observações Gerais */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FileText className="h-4 w-4 inline mr-2" />
                Observações Gerais
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Observações adicionais sobre a manutenção..."
              />
            </div>

            {/* Próxima Manutenção */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Próxima Manutenção (Data)
                </label>
                <input
                  type="date"
                  value={formData.next_maintenance_date}
                  onChange={(e) => handleInputChange('next_maintenance_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Próxima Manutenção (Horas)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.next_maintenance_hours}
                  onChange={(e) => handleInputChange('next_maintenance_hours', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Horas de voo para próxima manutenção"
                />
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-3">
                <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || loading || selectedItems.length === 0 || !formData.aircraft_registration.trim()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span>Criar Manutenção</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}