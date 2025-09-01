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
import { Plus, Receipt } from 'lucide-react';
import { useSupabaseFinancial, type Transaction } from '@/hooks/supabase/useSupabaseFinancial';
import { useSupabaseExpenseCategories } from '@/hooks/supabase/useSupabaseExpenseCategories';
import { useToast } from '@/hooks/ui/use-toast';

interface AddExpenseModalProps {
  trigger?: React.ReactNode;
  expense?: Transaction;
  initialValues?: Partial<Transaction>;
  onClose?: () => void;
}

export interface AddExpenseModalRef {
  openModal: () => void;
}

export const AddExpenseModal = forwardRef<AddExpenseModalRef, AddExpenseModalProps>(({ trigger, expense, initialValues, onClose }, ref) => {
  const { t } = useTranslation();
  const { addExpense, updateExpense } = useSupabaseFinancial();
  const { getActiveCategories, categories } = useSupabaseExpenseCategories();
  const [prefillCategoryName, setPrefillCategoryName] = useState<string | null>(null);
  const { toast } = useToast();
  const [open, setOpen] = useState(!!expense || !!initialValues);

  // Expor método para abrir modal externamente
  useImperativeHandle(ref, () => ({
    openModal: () => setOpen(true)
  }));

  const [formData, setFormData] = useState({
  description: expense?.description || initialValues?.description || '',
  amount: expense?.amount?.toString() || initialValues?.amount?.toString?.() || '',
  date: expense?.date || initialValues?.date || (() => {
      // Get today's date in YYYY-MM-DD format without timezone issues
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    })(),
    category: expense?.category || '',
    notes: ''
  });

  // Abrir modal automaticamente quando for para edição
  useEffect(() => {
    if (expense) {
      setOpen(true);
      setFormData({
        description: expense.description,
        amount: expense.amount.toString(),
        date: expense.date,
        category: expense.category,
        notes: ''
      });
    }
    else if (initialValues) {
      setOpen(true);
      setFormData({
        description: initialValues.description || '',
        amount: initialValues.amount?.toString?.() || '',
        date: initialValues.date || (() => {
          const today = new Date();
          const year = today.getFullYear();
          const month = String(today.getMonth() + 1).padStart(2, '0');
          const day = String(today.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        })(),
        category: initialValues.category || '',
        notes: initialValues.notes || ''
      });
    }
  }, [expense, initialValues]);

  const activeCategories = getActiveCategories();

  // If modal opened with initialValues and categories load later, ensure the category id is reapplied
  useEffect(() => {
    if (initialValues?.category && activeCategories.length > 0) {
      const exists = activeCategories.find(c => c.id === initialValues.category);
      if (exists) {
        setFormData(fd => ({ ...fd, category: initialValues.category || '' }));
        setPrefillCategoryName(null);
      } else {
        // Category might be inactive; try to find in full categories list to show its name
        const cat = categories.find(c => c.id === initialValues.category);
        if (cat) {
          setFormData(fd => ({ ...fd, category: initialValues.category || '' }));
          setPrefillCategoryName(cat.name || null);
        }
      }
    }
  }, [activeCategories, initialValues]);

  // Clear the prefill label if user selects an active category
  useEffect(() => {
    if (formData.category && activeCategories.find(c => c.id === formData.category)) {
      setPrefillCategoryName(null);
    }
  }, [formData.category, activeCategories]);

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

    const expenseData = {
      description: formData.description.trim(),
      amount: parseFloat(formData.amount),
      date: formData.date,
      category: formData.category
    };

    try {
      if (expense) {
        updateExpense(expense.id, expenseData);
        toast({
          title: "Sucesso!",
          description: "Despesa atualizada com sucesso",
        });
      } else {
        addExpense(expenseData);
        toast({
          title: "Sucesso!",
          description: "Despesa adicionada com sucesso",
        });
      }

      setOpen(false);
      if (onClose) onClose();
      
      // Reset form se não for edição
      if (!expense) {
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
        description: "Erro ao salvar despesa",
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
      Nova Despesa
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen && onClose) {
        onClose();
      }
    }}>
      {trigger !== null && !expense && (
        <DialogTrigger asChild>
          {trigger || defaultTrigger}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto glass-panel">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Receipt className="h-5 w-5 text-primary" />
            {expense ? 'Editar Despesa' : 'Nova Despesa'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Descrição */}
          <div>
            <Label htmlFor="description" className="text-foreground">Descrição *</Label>
            <Input
              id="description"
              placeholder="Ex: Abastecimento do Cessna 172"
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
                {prefillCategoryName && (
                  <p className="text-xs text-muted-foreground mt-1">Categoria selecionada: {prefillCategoryName}</p>
                )}
            </div>
            
            <div>
              <Label htmlFor="amount" className="text-foreground">Valor (CR) *</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="1500"
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
              placeholder="Detalhes adicionais sobre a despesa..."
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
              {expense ? 'Atualizar Despesa' : 'Adicionar Despesa'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
});

AddExpenseModal.displayName = 'AddExpenseModal';