import React, { useState } from 'react';
import { Wrench, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useMaintenanceManager } from '../hooks/business/useMaintenanceManager';
import { AddMaintenanceModal } from '../components/maintenance/AddMaintenanceModal';
import { EditMaintenanceModal } from '../components/maintenance/EditMaintenanceModal';
import { ViewMaintenanceModal } from '../components/maintenance/ViewMaintenanceModal';
import { MaintenanceList } from '../components/maintenance/MaintenanceList';
import MaintenanceSummary from '../components/maintenance/MaintenanceSummary';
import type { MaintenanceRecord } from '../types/maintenance';

const Maintenance = () => {
  const { t } = useTranslation();
  const { records: maintenanceRecords, loading, loadRecords, calculateStats } = useMaintenanceManager();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null);

  const handleAddSuccess = () => {
    setShowAddModal(false);
    // Forçar recarregamento dos dados após adicionar nova manutenção
    loadRecords();
    calculateStats();
  };

  const handleEdit = (record: MaintenanceRecord) => {
    setSelectedRecord(record);
    setShowEditModal(true);
  };

  const handleView = (record: MaintenanceRecord) => {
    setSelectedRecord(record);
    setShowViewModal(true);
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedRecord(null);
    // Forçar recarregamento dos dados após editar manutenção
    loadRecords();
    calculateStats();
  };

  const handleViewClose = () => {
    setShowViewModal(false);
    setSelectedRecord(null);
  };

  return (
    <div className="container mx-auto px-6 pt-8 pb-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mobile-title gradient-title flex items-center">
            <Wrench className="h-8 w-8 mr-3 text-primary" />
            {t('navigation.maintenance')}
          </h1>
          <p className="text-readable-muted mt-1">
            Gerencie a manutenção de suas aeronaves e equipamentos
          </p>
        </div>
        
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Manutenção
        </Button>
      </div>

      {/* Cards de Estatísticas */}
      {!loading && maintenanceRecords && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-card rounded-lg p-4 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {maintenanceRecords.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Wrench className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-4 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Concluídas</p>
                <p className="text-2xl font-bold text-green-600">
                  {maintenanceRecords.filter(r => r.status === 'completed').length}
                </p>
              </div>
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Wrench className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-4 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Horas Totais</p>
                <p className="text-2xl font-bold text-purple-600">
                  {maintenanceRecords.reduce((sum, r) => sum + (r.actual_hours || 0), 0).toFixed(1)}h
                </p>
              </div>
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Wrench className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-4 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Custo Total</p>
                <p className="text-2xl font-bold text-red-600">
                  R$ {maintenanceRecords.reduce((sum, r) => {
                    const recordCost = r.items?.reduce((itemSum, item) => itemSum + (item.actual_cost || 0), 0) || 0;
                    return sum + recordCost;
                  }, 0).toFixed(2)}
                </p>
              </div>
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <Wrench className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resumo Detalhado de Manutenção */}
      {!loading && maintenanceRecords && (
        <MaintenanceSummary maintenanceRecords={maintenanceRecords} />
      )}

      {/* Lista de Manutenções */}
      <MaintenanceList 
        onEdit={handleEdit}
        onView={handleView}
      />

      {/* Modal de Nova Manutenção */}
      <AddMaintenanceModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSuccess={handleAddSuccess}
      />

      {/* Modal de Edição de Manutenção */}
      <EditMaintenanceModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        record={selectedRecord}
        onSuccess={handleEditSuccess}
      />

      {/* Modal de Visualização de Manutenção */}
      <ViewMaintenanceModal
        open={showViewModal}
        onOpenChange={setShowViewModal}
        record={selectedRecord}
      />
    </div>
  );
};

export default Maintenance;