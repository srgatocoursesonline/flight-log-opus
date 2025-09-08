import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
import { Edit, Trash2, Receipt, Copy } from 'lucide-react';
import { useSupabaseFinancial, type Transaction } from '@/hooks/supabase/useSupabaseFinancial';
import { useSupabaseExpenseCategories } from '@/hooks/supabase/useSupabaseExpenseCategories';
import { useToast } from '@/hooks/ui/use-toast';
import { AddExpenseModal } from './AddExpenseModal';
import { FilterControls } from './FilterControls';

interface ExpensesListProps {
  onTransactionSuccess?: () => void;
}

export const ExpensesList = ({ onTransactionSuccess }: ExpensesListProps) => {
  const { t } = useTranslation();
  const { expenses, deleteExpense } = useSupabaseFinancial();
  const { categories } = useSupabaseExpenseCategories();
  const { toast } = useToast();
  const [editingExpense, setEditingExpense] = useState<Transaction | null>(null);
  const [prefillExpense, setPrefillExpense] = useState<Partial<Transaction> | null>(null);
  
  // Estados dos filtros
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const formatCR = (amount: number) => {
    return amount.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const formatDate = (dateString: string) => {
    // Create date object from the date string (which is in YYYY-MM-DD format)
    // Using Date.UTC to avoid timezone conversion issues
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    
    // Format to Brazilian date format without timezone conversion
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC' // Ensure we use UTC to avoid timezone shifts
    });
  };

  const getCategoryInfo = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (category) {
      // Try to get translation for the category name
      const translationKey = getCategoryTranslationKey(categoryId);
      const translatedName = translationKey ? t(`financial.${translationKey}`) : category.name;
      return {
        ...category,
        name: translatedName
      };
    }
    return { 
      name: 'Categoria Desconhecida', 
      icon: '❓', 
      description: '' 
    };
  };

  const getCategoryTranslationKey = (categoryId: string) => {
    const translationMap: Record<string, string> = {
      'aircraft-fuel': 'aircraftFuel',
      'aircraft-maintenance': 'aircraftMaintenance',
      'aircraft-insurance': 'aircraftInsurance',
      'hangar-rent': 'hangarRent',
      'pilot-training': 'pilotTraining',
      'flight-equipment': 'flightEquipment',
      'airport-fees': 'airportFees',
      'navigation-fees': 'navigationFees',
      'weather-services': 'weatherServices',
      'other-expenses': 'otherExpenses'
    };
    return translationMap[categoryId];
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteExpense(id);
      // Force page refresh to ensure UI updates
      window.location.reload();
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

  // Filtrar despesas
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      // Filtro por categoria
      if (selectedCategory !== 'all' && expense.category !== selectedCategory) {
        return false;
      }

      // Filtro por data inicial
      if (startDate && expense.date < startDate) {
        return false;
      }

      // Filtro por data final
      if (endDate && expense.date > endDate) {
        return false;
      }

      return true;
    });
  }, [expenses, selectedCategory, startDate, endDate]);

  // Verificar se há filtros ativos
  const hasActiveFilters = selectedCategory !== 'all' || startDate !== '' || endDate !== '';

  // Limpar filtros
  const clearFilters = () => {
    setSelectedCategory('all');
    setStartDate('');
    setEndDate('');
  };

  // Preparar categorias para o filtro
  const categoriesForFilter = categories.map(category => ({
    id: category.id,
    name: getCategoryInfo(category.id).name,
    icon: category.icon
  }));

  if (expenses.length === 0) {
    return (
      <>
        <FilterControls
          categories={categoriesForFilter}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          startDate={startDate}
          onStartDateChange={setStartDate}
          endDate={endDate}
          onEndDateChange={setEndDate}
          onClearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />
        
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
      </>
    );
  }

  if (filteredExpenses.length === 0 && hasActiveFilters) {
    return (
      <>
        <FilterControls
          categories={categoriesForFilter}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          startDate={startDate}
          onStartDateChange={setStartDate}
          endDate={endDate}
          onEndDateChange={setEndDate}
          onClearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />
        
        <Card className="hud-display">
          <CardContent className="p-8 text-center">
            <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhuma despesa encontrada
            </h3>
            <p className="text-muted-foreground mb-4">
              Tente ajustar os filtros para encontrar as despesas desejadas
            </p>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <FilterControls
        categories={categoriesForFilter}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />
      
      <Card className="hud-display stats-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground text-xs font-medium">
            <Receipt className="h-4 w-4 text-primary icon-hover" />
            Despesas Registradas ({filteredExpenses.length}{expenses.length !== filteredExpenses.length ? ` de ${expenses.length}` : ''})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto">
            {filteredExpenses.map((expense, index) => {
              const categoryInfo = getCategoryInfo(expense.category);
              
              return (
                <div 
                  key={expense.id} 
                  className="flight-item p-2 border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="text-sm">{categoryInfo.icon}</div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-foreground truncate text-xs" title={expense.description}>
                            {expense.description}
                          </h4>
                          <Badge variant={getStatusColor(expense.amount)} className="text-xs px-1 py-0 text-[10px]">
                            {categoryInfo.name}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="truncate" title={`Data: ${formatDate(expense.date)}`}>📅 {formatDate(expense.date)}</span>
                          <span className="expense-amount truncate" title={`Valor: -${formatCR(expense.amount)} CR`}>
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

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Ensure we're not in edit mode
                          setEditingExpense(null);
                          setPrefillExpense({
                            description: expense.description,
                            category: expense.category,
                            amount: '', // keep as empty string so modal shows blank
                            date: undefined,
                            notes: '',
                            _prefillKey: Date.now()
                          } as any);
                        }}
                        className="icon-hover"
                        title="Clonar"
                      >
                        <Copy className="h-4 w-4" />
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
      <AddExpenseModal
  key={editingExpense?.id || (prefillExpense ? `prefill-${(prefillExpense as any)._prefillKey}` : 'new')}
        expense={editingExpense || undefined}
        initialValues={prefillExpense || undefined}
        trigger={null}
        onClose={() => {
          setEditingExpense(null);
          setPrefillExpense(null);
        }}
        onSuccess={onTransactionSuccess}
      />
    </>
  );
};