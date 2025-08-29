import { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Plus, TrendingUp } from 'lucide-react';
import { useSupabaseFinancial, type Transaction } from '@/hooks/useSupabaseFinancial';
import { useSupabaseRevenueCategories } from '@/hooks/useSupabaseRevenueCategories';
import { useToast } from '@/hooks/use-toast';

interface AddRevenueModalProps {
  trigger?: React.ReactNode;
  revenue?: Transaction;
  onClose?: () => void;
}

export interface AddRevenueModalRef {
  openModal: () => void;
}

export const AddRevenueModal = forwardRef<AddRevenueModalRef, AddRevenueModalProps>(({ trigger, revenue, onClose }, ref) => {
  const { t } = useTranslation();
  const { addRevenue, updateRevenue } = useSupabaseFinancial();
  const { getActiveCategories } = useSupabaseRevenueCategories();
  const { toast } = useToast();
  const [open, setOpen] = useState(!!revenue);

  // Expor método para abrir modal externamente
  useImperativeHandle(ref, () => ({
    openModal: () => setOpen(true)
  }));

  const [formData, setFormData] = useState({
    description: revenue?.description || '',
    amount: revenue?.amount?.toString() || '',
    date: revenue?.date || (() => {
      // Get today's date in YYYY-MM-DD format without timezone issues
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    })(),
    category: revenue?.category || '',
    notes: ''
  });

  // Abrir modal automaticamente quando for para edição
  useEffect(() => {
    if (revenue) {
      setOpen(true);
      setFormData({
        description: revenue.description,
        amount: revenue.amount.toString(),
        date: revenue.date,
        category: revenue.category,
        notes: ''
      });
    }
  }, [revenue]);

  const activeCategories = getActiveCategories();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description.trim()) {
      toast({
        title: "Erro",
        description: "Descrição é obrigatória",
        variant: "destructive",
      });
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast({
        title: "Erro", 
        description: "Valor deve ser maior que zero",
        variant: "destructive",
      });
      return;
    }

    if (!formData.category) {
      toast({
        title: "Erro",
        description: "Categoria é obrigatória",
        variant: "destructive",
      });
      return;
    }

    const revenueData = {
      description: formData.description.trim(),
      amount: parseFloat(formData.amount),
      date: formData.date,
      category: formData.category
    };

    try {
      if (revenue) {
        updateRevenue(revenue.id, revenueData);
        toast({
          title: "Sucesso!",
          description: "Receita atualizada com sucesso",
        });
      } else {
        addRevenue(revenueData);
        toast({
          title: "Sucesso!",
          description: "Receita adicionada com sucesso",
        });
      }

      setOpen(false);
      if (onClose) onClose();
      
      // Reset form se não for edição
      if (!revenue) {
        // Get today's date in YYYY-MM-DD format without timezone issues
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayString = `${year}-${month}-${day}`;
        
        setFormData({
          description: '',
          amount: '',
          date: todayString,
          category: '',
          notes: ''
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar receita",
        variant: "destructive",
      });
    }
  };

  const formatCategoryOption = (category: any) => (
    <div className="flex items-center gap-2">
      <span>{category.icon}</span>
      <span>{category.name}</span>
    </div>
  );

  const defaultTrigger = (
    <Button variant="hud" className="icon-hover">
      <Plus className="h-4 w-4 mr-2" />
      Nova Receita
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen && onClose) {
        onClose();
      }
    }}>
      {trigger !== null && !revenue && (
        <DialogTrigger asChild>
          {trigger || defaultTrigger}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto glass-panel">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <TrendingUp className="h-5 w-5 text-success" />
            {revenue ? 'Editar Receita' : 'Nova Receita'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Descrição */}
          <div>
            <Label htmlFor="description" className="text-foreground">Descrição *</Label>
            <Input
              id="description"
              placeholder="Ex: Rendimento de investimentos"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1"
              required
              maxLength={100}
            />
          </div>

          {/* Categoria e Valor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category" className="text-foreground">Categoria *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {activeCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {formatCategoryOption(category)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="amount" className="text-foreground">Valor (CR) *</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="2500"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="mt-1"
                required
              />
            </div>
          </div>

          {/* Data */}
          <div>
            <Label htmlFor="date" className="text-foreground">Data *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="mt-1"
              required
            />
          </div>

          {/* Observações */}
          <div>
            <Label htmlFor="notes" className="text-foreground">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Detalhes adicionais sobre a receita..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="mt-1"
              rows={3}
              maxLength={250}
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="hud">
              {revenue ? 'Atualizar Receita' : 'Adicionar Receita'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
});

AddRevenueModal.displayName = 'AddRevenueModal';