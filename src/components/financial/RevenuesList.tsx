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
import { Edit, Trash2, TrendingUp, Copy } from 'lucide-react';
import { useSupabaseFinancial, type Transaction } from '@/hooks/supabase/useSupabaseFinancial';
import { useSupabaseRevenueCategories } from '@/hooks/supabase/useSupabaseRevenueCategories';
import { useToast } from '@/hooks/ui/use-toast';
import { AddRevenueModal } from './AddRevenueModal';
import { FilterControls } from './FilterControls';

interface RevenuesListProps {
  onTransactionSuccess?: () => void;
}

export const RevenuesList = ({ onTransactionSuccess }: RevenuesListProps) => {
  const { t } = useTranslation();
  const { revenues, deleteRevenue } = useSupabaseFinancial();
  const { categories } = useSupabaseRevenueCategories();
  const { toast } = useToast();
  const [editingRevenue, setEditingRevenue] = useState<Transaction | null>(null);
  const [prefillRevenue, setPrefillRevenue] = useState<Partial<Transaction> | null>(null);
  
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
      'commercial-flights': 'commercialFlights',
      'flight-instruction': 'flightInstruction',
      'air-freight': 'airFreight',
      'air-taxi': 'airTaxi',
      'parachuting': 'parachuting',
      'vip-charter': 'vipCharter',
      'special-contracts': 'specialContracts',
      'medical-transport': 'medicalTransport',
      'search-rescue': 'searchRescue',
      'fire-support': 'fireSupport',
      'reputation-bonus': 'reputationBonus',
      'other-revenues': 'otherRevenues'
    };
    return translationMap[categoryId];
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRevenue(id);
      // Force page refresh to ensure UI updates
      window.location.reload();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir receita",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (amount: number) => {
    if (amount >= 50000) return 'default';
    if (amount >= 10000) return 'secondary';
    return 'outline';
  };

  // Filtrar receitas
  const filteredRevenues = useMemo(() => {
    return revenues.filter(revenue => {
      // Filtro por categoria
      if (selectedCategory !== 'all' && revenue.category !== selectedCategory) {
        return false;
      }

      // Filtro por data inicial
      if (startDate && revenue.date < startDate) {
        return false;
      }

      // Filtro por data final
      if (endDate && revenue.date > endDate) {
        return false;
      }

      return true;
    });
  }, [revenues, selectedCategory, startDate, endDate]);

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

  if (revenues.length === 0) {
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
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhuma receita registrada
            </h3>
            <p className="text-muted-foreground mb-4">
              Comece adicionando suas fontes de receita extras
            </p>
          </CardContent>
        </Card>
      </>
    );
  }

  if (filteredRevenues.length === 0 && hasActiveFilters) {
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
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhuma receita encontrada
            </h3>
            <p className="text-muted-foreground mb-4">
              Tente ajustar os filtros para encontrar as receitas desejadas
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
            <TrendingUp className="h-4 w-4 text-success icon-hover" />
            Receitas Registradas ({filteredRevenues.length}{revenues.length !== filteredRevenues.length ? ` de ${revenues.length}` : ''})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto">
            {filteredRevenues.map((revenue, index) => {
              const categoryInfo = getCategoryInfo(revenue.category);
              
              return (
                <div 
                  key={revenue.id} 
                  className="flight-item p-2 border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="text-sm">{categoryInfo.icon}</div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-foreground truncate text-xs" title={revenue.description}>
                            {revenue.description}
                          </h4>
                          <Badge variant={getStatusColor(revenue.amount)} className="text-xs px-1 py-0 text-[10px]">
                            {categoryInfo.name}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="truncate" title={`Data: ${formatDate(revenue.date)}`}>📅 {formatDate(revenue.date)}</span>
                          <span className="revenue-amount truncate" title={`Valor: +${formatCR(revenue.amount)} CR`}>
                            +{formatCR(revenue.amount)} CR
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingRevenue(revenue)}
                        className="icon-hover"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Prefill only description and category; leave amount empty, date will default to today in modal, notes empty
                          setEditingRevenue(null);
                          setPrefillRevenue({
                            description: revenue.description,
                            category: revenue.category,
                            amount: '',
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
                            <AlertDialogTitle>Excluir Receita</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir a receita "{revenue.description}"? 
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(revenue.id)}
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
      <AddRevenueModal
  key={editingRevenue?.id || (prefillRevenue ? `prefill-${(prefillRevenue as any)._prefillKey}` : 'new')}
        revenue={editingRevenue || undefined}
        initialValues={prefillRevenue || undefined}
        trigger={null}
        onClose={() => {
          setEditingRevenue(null);
          setPrefillRevenue(null);
        }}
        onSuccess={onTransactionSuccess}
      />
    </>
  );
};