import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
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
import { Switch } from '@/components/ui/switch';
import { Plus, Settings, Trash2, Edit, RotateCcw } from 'lucide-react';
import { useSupabaseExpenseCategories, type ExpenseCategory } from '@/hooks/useSupabaseExpenseCategories';
import { useToast } from '@/hooks/use-toast';

export const ExpenseCategoriesManager = () => {
  const { 
    categories, 
    addCategory, 
    updateCategory, 
    deleteCategory, 
    toggleCategoryActive,
    resetToDefaults 
  } = useSupabaseExpenseCategories();
  const { toast } = useToast();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    icon: '',
    description: ''
  });

  const handleAddCategory = () => {
    if (!newCategory.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome da categoria é obrigatório",
        variant: "destructive",
      });
      return;
    }

    if (!newCategory.icon.trim()) {
      toast({
        title: "Erro", 
        description: "Ícone da categoria é obrigatório",
        variant: "destructive",
      });
      return;
    }

    try {
      addCategory({
        name: newCategory.name.trim(),
        icon: newCategory.icon.trim(),
        description: newCategory.description.trim(),
        isActive: true
      });

      toast({
        title: "Sucesso!",
        description: "Categoria adicionada com sucesso",
      });

      setNewCategory({ name: '', icon: '', description: '' });
      setIsAddDialogOpen(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar categoria",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCategory = () => {
    if (!editingCategory || !editingCategory.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome da categoria é obrigatório",
        variant: "destructive",
      });
      return;
    }

    try {
      updateCategory(editingCategory.id, {
        name: editingCategory.name.trim(),
        icon: editingCategory.icon.trim(),
        description: editingCategory.description.trim()
      });

      toast({
        title: "Sucesso!",
        description: "Categoria atualizada com sucesso",
      });

      setEditingCategory(null);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar categoria",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = (id: string) => {
    try {
      deleteCategory(id);
      toast({
        title: "Sucesso!",
        description: "Categoria excluída com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir categoria",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = (id: string) => {
    try {
      toggleCategoryActive(id);
      toast({
        title: "Sucesso!",
        description: "Status da categoria atualizado",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar status da categoria",
        variant: "destructive",
      });
    }
  };

  const handleResetToDefaults = () => {
    try {
      resetToDefaults();
      toast({
        title: "Sucesso!",
        description: "Categorias restauradas para os padrões",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao restaurar categorias padrão",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="hud-display">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Settings className="h-5 w-5 text-primary" />
            Categorias de Despesas
          </CardTitle>
          
          <div className="flex gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restaurar Padrões
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="glass-panel">
                <AlertDialogHeader>
                  <AlertDialogTitle>Restaurar Categorias Padrão</AlertDialogTitle>
                  <AlertDialogDescription>
                    Isso irá restaurar todas as categorias para os valores padrão e 
                    remover todas as categorias personalizadas. Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleResetToDefaults}>
                    Restaurar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="hud" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Categoria
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-panel">
                <DialogHeader>
                  <DialogTitle>Adicionar Nova Categoria</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome da Categoria *</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Hangaragem"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      className="mt-1"
                      maxLength={50}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="icon">Ícone (Emoji) *</Label>
                    <Input
                      id="icon"
                      placeholder="Ex: 🏗️"
                      value={newCategory.icon}
                      onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                      className="mt-1"
                      maxLength={10}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Input
                      id="description"
                      placeholder="Ex: Custo de armazenamento em hangar"
                      value={newCategory.description}
                      onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                      className="mt-1"
                      maxLength={100}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAddCategory}>
                      Adicionar Categoria
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <span className="text-2xl">{category.icon}</span>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-foreground">{category.name}</h4>
                    {category.isDefault && (
                      <Badge variant="outline" className="text-xs">
                        Padrão
                      </Badge>
                    )}
                    {!category.isActive && (
                      <Badge variant="secondary" className="text-xs">
                        Inativa
                      </Badge>
                    )}
                  </div>
                  {category.description && (
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={category.isActive}
                  onCheckedChange={() => handleToggleActive(category.id)}
                  aria-label={`Ativar/Desativar ${category.name}`}
                />
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingCategory(category)}
                  className="icon-hover"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                
                {!category.isDefault && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="icon-hover text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="glass-panel">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Categoria</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir a categoria "{category.name}"? 
                          Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteCategory(category.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      {/* Modal de Edição */}
      {editingCategory && (
        <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
          <DialogContent className="glass-panel">
            <DialogHeader>
              <DialogTitle>Editar Categoria</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nome da Categoria *</Label>
                <Input
                  id="edit-name"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ 
                    ...editingCategory, 
                    name: e.target.value 
                  })}
                  className="mt-1"
                  maxLength={50}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-icon">Ícone (Emoji) *</Label>
                <Input
                  id="edit-icon"
                  value={editingCategory.icon}
                  onChange={(e) => setEditingCategory({ 
                    ...editingCategory, 
                    icon: e.target.value 
                  })}
                  className="mt-1"
                  maxLength={10}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-description">Descrição</Label>
                <Input
                  id="edit-description"
                  value={editingCategory.description}
                  onChange={(e) => setEditingCategory({ 
                    ...editingCategory, 
                    description: e.target.value 
                  })}
                  className="mt-1"
                  maxLength={100}
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setEditingCategory(null)}>
                  Cancelar
                </Button>
                <Button onClick={handleUpdateCategory}>
                  Salvar Alterações
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};