import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMaintenanceManager } from '../../hooks/business/useMaintenanceManager';
import type { MaintenanceRecord, MaintenanceStatus } from '../../types/maintenance';
import { Loader2, Save, X } from 'lucide-react';

interface EditMaintenanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: MaintenanceRecord | null;
  onSuccess?: () => void;
}

const statusOptions = [
  { value: 'pending', label: 'Pendente' },
  { value: 'in_progress', label: 'Em Andamento' },
  { value: 'completed', label: 'Concluída' },
  { value: 'cancelled', label: 'Cancelada' },
];

export function EditMaintenanceModal({
  open,
  onOpenChange,
  record,
  onSuccess
}: EditMaintenanceModalProps) {
  const { updateMaintenanceRecord, loading } = useMaintenanceManager();
  const [formData, setFormData] = useState({
    aircraft_registration: '',
    aircraft_model: '',
    maintenance_date: '',
    mechanic_name: '',
    mechanic_license: '',
    location: '',
    status: 'pending' as MaintenanceStatus,
    notes: '',
    next_maintenance_date: '',
    next_maintenance_hours: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preencher formulário quando o record mudar
  useEffect(() => {
    if (record) {
      setFormData({
        aircraft_registration: record.aircraft || '',
        aircraft_model: record.aircraft_model || '',
        maintenance_date: record.date ? new Date(record.date).toISOString().split('T')[0] : '',
        mechanic_name: record.mechanic_name || '',
        mechanic_license: record.mechanicLicense || '',
        location: record.location || '',
        status: record.status || 'pending',
        notes: record.notes || '',
        next_maintenance_date: record.next_maintenance_date || '',
        next_maintenance_hours: record.nextMaintenanceHours || 0,
      });
    }
  }, [record]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!record) return;

    try {
      setIsSubmitting(true);
      
      const updateData = {
        aircraft: formData.aircraft_registration,
        date: formData.maintenance_date,
        mechanicLicense: formData.mechanic_license || undefined,
        status: formData.status,
        notes: formData.notes || undefined,
        nextMaintenanceHours: formData.next_maintenance_hours || undefined,
      };

      await updateMaintenanceRecord(record.id, {
         aircraft_registration: formData.aircraft_registration,
         aircraft_model: formData.aircraft_model,
         maintenance_date: formData.maintenance_date,
         mechanic_name: formData.mechanic_name,
         mechanic_license: formData.mechanic_license || undefined,
         location: formData.location,
         status: formData.status,
         notes: formData.notes || undefined,
         next_maintenance_date: formData.next_maintenance_date,
         next_maintenance_hours: formData.next_maintenance_hours || undefined,
       });
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao atualizar manutenção:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Editar Manutenção
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações da Aeronave */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Informações da Aeronave
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="aircraft_registration">Matrícula *</Label>
                <Input
                  id="aircraft_registration"
                  value={formData.aircraft_registration}
                  onChange={(e) => handleInputChange('aircraft_registration', e.target.value)}
                  placeholder="Ex: PT-ABC"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="aircraft_model">Modelo</Label>
                <Input
                  id="aircraft_model"
                  value={formData.aircraft_model}
                  onChange={(e) => handleInputChange('aircraft_model', e.target.value)}
                  placeholder="Ex: Cessna 172"
                />
              </div>
            </div>
          </div>

          {/* Informações da Manutenção */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Informações da Manutenção
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maintenance_date">Data da Manutenção *</Label>
                <Input
                  id="maintenance_date"
                  type="date"
                  value={formData.maintenance_date}
                  onChange={(e) => handleInputChange('maintenance_date', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mechanic_name">Nome do Mecânico</Label>
                <Input
                  id="mechanic_name"
                  value={formData.mechanic_name}
                  onChange={(e) => handleInputChange('mechanic_name', e.target.value)}
                  placeholder="Nome completo"
                />
              </div>
              
              <div>
                <Label htmlFor="mechanic_license">Licença do Mecânico</Label>
                <Input
                  id="mechanic_license"
                  value={formData.mechanic_license}
                  onChange={(e) => handleInputChange('mechanic_license', e.target.value)}
                  placeholder="Número da licença"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="location">Local</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Local da manutenção"
              />
            </div>
          </div>

          {/* Próxima Manutenção */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Próxima Manutenção
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="next_maintenance_date">Data da Próxima Manutenção</Label>
                <Input
                  id="next_maintenance_date"
                  type="date"
                  value={formData.next_maintenance_date}
                  onChange={(e) => handleInputChange('next_maintenance_date', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="next_maintenance_hours">Horas para Próxima Manutenção</Label>
                <Input
                  id="next_maintenance_hours"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.next_maintenance_hours}
                  onChange={(e) => handleInputChange('next_maintenance_hours', parseFloat(e.target.value) || 0)}
                  placeholder="0.0"
                />
              </div>
            </div>
          </div>

          {/* Observações */}
          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Observações sobre a manutenção..."
              rows={4}
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            
            <Button
              type="submit"
              disabled={isSubmitting || !formData.aircraft_registration || !formData.maintenance_date}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}