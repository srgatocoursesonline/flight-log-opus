import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Settings, ChevronDown, ChevronRight } from 'lucide-react';
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useMaintenanceSettings } from '@/hooks/supabase/useMaintenanceSettings';
import { MaintenanceItem } from '@/types/maintenance';

interface ItemFormData {
  name: string;
  description: string;
  estimated_hours: number;
  estimated_cost: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category_id: string;
}

const MaintenanceItemsManager: React.FC = () => {
  const { categories, loading, error, addItem, updateItem, deleteItem } = useMaintenanceSettings();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MaintenanceItem | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState<ItemFormData>({
    name: '',
    description: '',
    estimated_hours: 1,
    estimated_cost: 0,
    priority: 'medium',
    category_id: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      estimated_hours: 1,
      estimated_cost: 0,
      priority: 'medium',
      category_id: ''
    });
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleAdd = (categoryId?: string) => {
    resetForm();
    if (categoryId) {
      setFormData(prev => ({ ...prev, category_id: categoryId }));
    }
    setEditingItem(null);
    setIsAddDialogOpen(true);
  };

  const handleEdit = (item: MaintenanceItem) => {
    setFormData({
      name: item.name,
      description: item.description || '',
      estimated_hours: item.estimated_hours,
      estimated_cost: item.estimated_cost,
      priority: item.priority,
      category_id: item.category_id
    });
    setEditingItem(item);
    setIsAddDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Nome do item é obrigatório');
      return;
    }

    if (!formData.category_id) {
      alert('Categoria é obrigatória');
      return;
    }

    setIsSubmitting(true);

    try {
      let result;
      
      if (editingItem) {
        result = await updateItem(editingItem.id, formData);
      } else {
        result = await addItem(formData);
      }

      if (result.success) {
        setIsAddDialogOpen(false);
        resetForm();
        setEditingItem(null);
      } else {
        alert(result.error || 'Erro ao salvar item');
      }
    } catch (err) {
      console.error('Erro ao salvar item:', err);
      alert('Erro ao salvar item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: MaintenanceItem) => {
    const result = await deleteItem(item.id);
    
    if (!result.success) {
      alert(result.error || 'Erro ao deletar item');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-muted-foreground';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'critical': return 'Crítica';
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return priority;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Itens de Manutenção</h3>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          Carregando itens...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Itens de Manutenção</h3>
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
        <h3 className="text-lg font-semibold text-foreground">Itens de Manutenção</h3>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleAdd()} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? 'Editar Item' : 'Novo Item'}
                </DialogTitle>
                <DialogDescription>
                  {editingItem 
                    ? 'Edite as informações do item de manutenção.'
                    : 'Adicione um novo item de manutenção.'
                  }
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Troca de óleo"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrição do item..."
                    rows={2}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="estimated_hours">Horas Estimadas</Label>
                    <Input
                      id="estimated_hours"
                      type="number"
                      min="0"
                      step="0.5"
                      value={formData.estimated_hours}
                      onChange={(e) => setFormData(prev => ({ ...prev, estimated_hours: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="estimated_cost">Custo Estimado (R$)</Label>
                    <Input
                      id="estimated_cost"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.estimated_cost}
                      onChange={(e) => setFormData(prev => ({ ...prev, estimated_cost: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: 'low' | 'medium' | 'high' | 'critical') => 
                      setFormData(prev => ({ ...prev, priority: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="critical">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
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
                  {isSubmitting ? 'Salvando...' : (editingItem ? 'Atualizar' : 'Criar')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {categories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma categoria encontrada</p>
            <p className="text-sm">Crie categorias primeiro para adicionar itens</p>
          </div>
        ) : (
          categories.map((category) => (
            <Collapsible
              key={category.id}
              open={expandedCategories.has(category.id)}
              onOpenChange={() => toggleCategory(category.id)}
            >
              <div className="border border-border rounded-lg bg-card">
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      {expandedCategories.has(category.id) ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <Settings className="h-4 w-4 text-primary" />
                      <h4 className="font-medium text-foreground">{category.name}</h4>
                      <span className="text-xs text-muted-foreground">
                        ({category.items?.length || 0} itens)
                      </span>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAdd(category.id);
                      }}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Adicionar Item
                    </Button>
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="border-t border-border/50 p-4 space-y-2">
                    {!category.items || category.items.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground">
                        <p>Nenhum item nesta categoria</p>
                        <p className="text-sm">Clique em "Adicionar Item" para começar</p>
                      </div>
                    ) : (
                      category.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 border border-border rounded-md bg-background hover:bg-accent/30 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h5 className="font-medium text-foreground">{item.name}</h5>
                              <span className={`text-xs font-medium ${getPriorityColor(item.priority)}`}>
                                {getPriorityLabel(item.priority)}
                              </span>
                            </div>
                            {item.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {item.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>{item.estimated_hours}h</span>
                              <span>R$ {item.estimated_cost.toFixed(2)}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(item)}
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
                                    Tem certeza que deseja excluir o item "{item.name}"?
                                    Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(item)}
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
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))
        )}
      </div>
    </div>
  );
};

export default MaintenanceItemsManager;