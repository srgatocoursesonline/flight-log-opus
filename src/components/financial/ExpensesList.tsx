import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Edit, Trash2, Receipt } from 'lucide-react';
import { useFinancial } from '@/hooks/useFinancial';
import { useExpenseCategories } from '@/hooks/useExpenseCategories';
import { useToast } from '@/hooks/use-toast';
import { AddExpenseModal } from './AddExpenseModal';

export const ExpensesList = () => {
  const { expenses, deleteExpense } = useFinancial();
  const { categories } = useExpenseCategories();
  const { toast } = useToast();
  const [editingExpense, setEditingExpense] = useState(null);

  const formatCR = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getCategoryInfo = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category || { 
      name: 'Categoria Desconhecida', 
      icon: '❓', 
      description: '' 
    };
  };

  const handleDelete = (id: string) => {
    try {
      deleteExpense(id);
      toast({
        title: "Sucesso!",
        description: "Despesa excluída com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir despesa",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (amount: number) => {
    if (amount >= 10000) return 'destructive';
    if (amount >= 5000) return 'secondary';
    return 'default';
  };

  if (expenses.length === 0) {
    return (
      <Card className="hud-display">
        <CardContent className="p-8 text-center">
          <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Nenhuma despesa registrada
          </h3>
          <p className="text-muted-foreground mb-4">
            Comece adicionando suas primeiras despesas operacionais
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="hud-display">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Receipt className="h-5 w-5 text-primary" />
            Despesas Registradas ({expenses.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto">
            {expenses.map((expense, index) => {
              const categoryInfo = getCategoryInfo(expense.category);
              
              return (
                <div 
                  key={expense.id} 
                  className="flight-item p-4 border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="text-2xl">{categoryInfo.icon}</div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground truncate">
                            {expense.description}
                          </h4>
                          <Badge variant={getStatusColor(expense.amount)} className="text-xs">
                            {categoryInfo.name}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>📅 {formatDate(expense.date)}</span>
                          <span className="font-mono font-bold text-destructive">
                            -{formatCR(expense.amount)} CR
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingExpense(expense)}
                        className="icon-hover"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
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
                            <AlertDialogTitle>Excluir Despesa</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir a despesa "{expense.description}"? 
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(expense.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Edição */}
      {editingExpense && (
        <AddExpenseModal
          expense={editingExpense}
          trigger={null}
          onClose={() => setEditingExpense(null)}
        />
      )}
    </>
  );
};