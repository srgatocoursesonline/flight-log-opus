import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useMaintenanceSettings } from '@/hooks/supabase/useMaintenanceSettings';
import { MaintenanceCategory } from '@/types/maintenance';

interface CategoryFormData {
  name: string;
  description: string;
  icon: string;
}

const MaintenanceCategoriesManager: React.FC = () => {
  const { categories, loading, error, addCategory, updateCategory, deleteCategory } = useMaintenanceSettings();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MaintenanceCategory | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    icon: 'wrench'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      icon: 'wrench'
    });
  };

  const handleAdd = () => {
    resetForm();
    setEditingCategory(null);
    setIsAddDialogOpen(true);
  };

  const handleEdit = (category: MaintenanceCategory) => {
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon || 'wrench'
    });
    setEditingCategory(category);
    setIsAddDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Nome da categoria é obrigatório');
      return;
    }

    setIsSubmitting(true);

    try {
      let result;
      
      if (editingCategory) {
        result = await updateCategory(editingCategory.id, formData);
      } else {
        result = await addCategory(formData);
      }

      if (result.success) {
        setIsAddDialogOpen(false);
        resetForm();
        setEditingCategory(null);
      } else {
        alert(result.error || 'Erro ao salvar categoria');
      }
    } catch (err) {
      console.error('Erro ao salvar categoria:', err);
      alert('Erro ao salvar categoria');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (category: MaintenanceCategory) => {
    const result = await deleteCategory(category.id);
    
    if (!result.success) {
      alert(result.error || 'Erro ao deletar categoria');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Categorias de Manutenção</h3>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          Carregando categorias...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Categorias de Manutenção</h3>
        </div>
        <div className="text-center py-8 text-destructive">
          Erro: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Categorias de Manutenção</h3>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                </DialogTitle>
                <DialogDescription>
                  {editingCategory 
                    ? 'Edite as informações da categoria de manutenção.'
                    : 'Adicione uma nova categoria de manutenção.'
                  }
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Sistema Elétrico"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrição da categoria..."
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="icon">Ícone</Label>
                  <Input
                    id="icon"
                    value={formData.icon}
                    onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                    placeholder="wrench"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : (editingCategory ? 'Atualizar' : 'Criar')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {categories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma categoria encontrada</p>
            <p className="text-sm">Clique em "Nova Categoria" para começar</p>
          </div>
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-primary" />
                  <h4 className="font-medium text-foreground">{category.name}</h4>
                  <span className="text-xs text-muted-foreground">
                    ({category.items?.length || 0} itens)
                  </span>
                </div>
                {category.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {category.description}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(category)}
                  className="h-8 w-8 p-0"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir a categoria "{category.name}"?
                        {category.items && category.items.length > 0 && (
                          <span className="block mt-2 text-destructive font-medium">
                            Esta categoria possui {category.items.length} itens associados e não pode ser excluída.
                          </span>
                        )}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(category)}
                        disabled={category.items && category.items.length > 0}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MaintenanceCategoriesManager;