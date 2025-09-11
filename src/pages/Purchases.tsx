import { ShoppingCart, Package, TrendingUp, DollarSign, Plus, AlertCircle, Trash2, Edit } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NewPurchaseModal, NewPurchaseModalRef } from "@/components/financial/NewPurchaseModal";
import { useRef, useState, useEffect } from "react";
import { useSupabasePurchases } from "@/hooks/supabase/useSupabasePurchases";
import { useSupabaseAircraftManager } from "@/hooks/supabase/useSupabaseAircraftManager";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Componente StatusBadge clicável
const StatusBadge = ({ status, purchaseId }: { status: string; purchaseId: string }) => {
  const { updatePurchase } = useSupabasePurchases();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/50';
      case 'approved': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-900/50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'approved': return 'Aprovado';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const handleStatusChange = async () => {
    if (isUpdating) return;
    
    const statusOrder: string[] = ['pending', 'approved', 'completed', 'cancelled'];
    const currentIndex = statusOrder.indexOf(status);
    let nextStatus: string;
    
    // Ciclo: pending -> approved -> completed -> pending
    if (status === 'pending') {
      nextStatus = 'approved';
    } else if (status === 'approved') {
      nextStatus = 'completed';
    } else if (status === 'completed') {
      nextStatus = 'cancelled';
    } else if (status === 'cancelled') {
      nextStatus = 'pending';
    } else {
      nextStatus = 'pending';
    }
    
    try {
      setIsUpdating(true);
      const success = await updatePurchase(purchaseId, { status: nextStatus });
      
      if (success) {
        // Atualização automática da página após mudança de status
        setTimeout(() => {
          window.location.reload();
        }, 300); // Pequeno delay para melhor UX
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Badge 
      className={`${getStatusColor(status)} cursor-pointer transition-colors ${isUpdating ? 'opacity-50 animate-pulse' : ''}`}
      onClick={handleStatusChange}
      title="Clique para alterar o status"
    >
      {getStatusText(status)}
      {isUpdating && <span className="ml-1">↻</span>}
    </Badge>
  );
};

const Purchases = () => {
  const { t } = useTranslation();
  const newPurchaseModalRef = useRef<NewPurchaseModalRef>(null);
  const { purchases, isLoading, error, fetchPurchases, deletePurchase, updatePurchase } = useSupabasePurchases();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [purchaseToDelete, setPurchaseToDelete] = useState<string | null>(null);
  const [editingPurchase, setEditingPurchase] = useState<any>(null);

  const handleNewPurchase = () => {
    newPurchaseModalRef.current?.openModal();
  };

  const handleSuccess = async () => {
    await fetchPurchases();
  };

  const handleDeleteClick = (purchaseId: string) => {
    setPurchaseToDelete(purchaseId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (purchaseToDelete) {
      await deletePurchase(purchaseToDelete);
      setDeleteDialogOpen(false);
      setPurchaseToDelete(null);
    }
  };

  const handleEditClick = (purchase: any) => {
    setEditingPurchase(purchase);
  };

  const handleEditSubmit = async (formData: any) => {
    if (editingPurchase) {
      const success = await updatePurchase(editingPurchase.id, formData);
      if (success) {
        setEditingPurchase(null);
        await fetchPurchases();
      }
    }
  };

  const calculateStats = () => {
    if (!purchases.length) {
      return {
        totalMonth: 0,
        pending: 0,
        monthCount: 0
      };
    }

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthPurchases = purchases.filter(p => {
      const purchaseDate = new Date(p.purchaseDate);
      return purchaseDate.getMonth() === currentMonth && purchaseDate.getFullYear() === currentYear;
    });

    const totalMonth = monthPurchases.reduce((sum, p) => sum + p.finalValue, 0);
    const pending = purchases.filter(p => p.status === 'pending').length;
    
    return {
      totalMonth,
      pending,
      monthCount: monthPurchases.length
    };
  };

  const stats = calculateStats();

  if (error) {
    return (
      <div className="container mx-auto px-6 pt-8 pb-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 pt-8 pb-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mobile-title gradient-title flex items-center">
            <ShoppingCart className="h-8 w-8 mr-3 text-primary" />
            {t('navigation.purchases')}
          </h1>
          <p className="text-readable-muted mt-1 whitespace-nowrap overflow-hidden">
            Gerencie compras de combustível, equipamentos e suprimentos
          </p>
        </div>
        
        <Button onClick={handleNewPurchase}>
          <ShoppingCart className="h-4 w-4 mr-2" />
          Nova Compra
        </Button>
      </div>

      {/* Cards de Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Gastos Este Mês
            </CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalMonth)}</div>
            <p className="text-xs text-readable-muted">
              {stats.monthCount} {stats.monthCount === 1 ? 'compra' : 'compras'} este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pedidos Pendentes
            </CardTitle>
            <Package className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pending === 1 ? 'pedido pendente' : 'pedidos pendentes'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Compras
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{purchases.length}</div>
            <p className="text-xs text-muted-foreground">
              compras registradas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Compras */}
      
      <Card>
        <CardHeader>
          <CardTitle>Compras Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-readable-muted">Carregando compras...</p>
            </div>
          ) : purchases.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 mx-auto text-readable-muted mb-3" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma compra ainda</h3>
              <p className="text-readable-muted max-w-md mx-auto mb-4">
                Clique em "Nova Compra" para registrar compras de combustível, 
                equipamentos e suprimentos para suas operações.
              </p>
              <Button onClick={handleNewPurchase} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Primeira Compra
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {purchases.map((purchase) => (
                <div key={purchase.id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-foreground">{purchase.title}</h4>
                      <Badge variant="outline" className="text-muted-foreground">{purchase.purchaseCode}</Badge>
                      <StatusBadge status={purchase.status} purchaseId={purchase.id} />
                    </div>
                    <p className="text-sm text-readable-muted">
                      {purchase.category} • {purchase.subcategory}
                    </p>
                    <p className="text-sm text-readable-muted">
                      {format(new Date(purchase.purchaseDate), 'PPP', { locale: ptBR })} • {purchase.buyer}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{formatCurrency(purchase.finalValue)}</p>
                      <p className="text-xs text-readable-muted whitespace-nowrap">
                        {purchase.notes}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        onClick={() => handleEditClick(purchase)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        onClick={() => handleDeleteClick(purchase.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Nova Compra */}
      <NewPurchaseModal 
        ref={newPurchaseModalRef}
        onSuccess={handleSuccess}
      />

      {/* Modal de Edição */}
      {editingPurchase && (
        <EditPurchaseModal
          purchase={editingPurchase}
          isOpen={!!editingPurchase}
          onClose={() => setEditingPurchase(null)}
          onSuccess={handleEditSubmit}
        />
      )}

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta compra? Esta ação também excluirá 
              a transação financeira associada e não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// Modal de Edição de Compra - Definido fora do componente Purchases
const EditPurchaseModal = ({ purchase, isOpen, onClose, onSuccess }: any) => {
  const aircraftManager = useSupabaseAircraftManager();
  
  const [formData, setFormData] = useState({
    title: purchase?.title || '',
    category: purchase?.category || '',
    subcategory: purchase?.subcategory || '',
    budgetedValue: purchase?.budgetedValue || 0,
    negotiatedValue: purchase?.negotiatedValue || 0,
    finalValue: purchase?.finalValue || 0,
    purchaseDate: purchase?.purchaseDate || new Date().toISOString().split('T')[0],
    buyer: purchase?.buyer || '',
    notes: purchase?.notes || '',
    status: purchase?.status || 'pending'
  });

  useEffect(() => {
    if (purchase) {
      setFormData({
        title: purchase.title || '',
        category: purchase.category || '',
        subcategory: purchase.subcategory || '',
        budgetedValue: purchase.budgetedValue || 0,
        negotiatedValue: purchase.negotiatedValue || 0,
        finalValue: purchase.finalValue || 0,
        purchaseDate: purchase.purchaseDate || new Date().toISOString().split('T')[0],
        buyer: purchase.buyer || '',
        notes: purchase.notes || '',
        status: purchase.status || 'pending'
      });
    }
  }, [purchase]);

  // Aeronaves padrão caso não haja aeronaves cadastradas
  const defaultAircraft = [
    'Cessna 172',
    'Cessna 182',
    'Piper Archer',
    'Piper Warrior',
    'Beechcraft Bonanza',
    'Diamond DA40',
    'Cirrus SR22',
    'Pilatus PC-12',
    'King Air C90',
    'Citation CJ3'
  ];

  // Obter aeronaves do sistema de voos
  const getAircraftOptions = () => {
    const aircraft = aircraftManager.getAllAircraftNames();
    return aircraft.length > 0 ? aircraft : defaultAircraft;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (purchase) {
      await onSuccess({ ...formData, id: purchase.id });
      onClose();
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const PURCHASE_CATEGORIES = [
    { id: 'Aeronave', name: 'Aeronave', icon: '✈️' },
    { id: 'Combustível', name: 'Combustível', icon: '⛽' },
    { id: 'Equipamentos', name: 'Equipamentos', icon: '🔧' },
    { id: 'Suprimentos', name: 'Suprimentos', icon: '📦' }
  ];

  const SUBCATEGORIES: Record<string, string[]> = {
    'Aeronave': getAircraftOptions(),
    'Combustível': [
      'AVGAS 100LL',
      'JET A-1',
      'MOGAS',
      'Óleo para Motor',
      'Aditivos de Combustível'
    ],
    'Equipamentos': [
      'GPS Garmin',
      'Rádio COM',
      'Transponder',
      'Headset',
      'Tablet',
      'GoPro',
      'Bateria',
      'Alternador',
      'Velas de Ignição',
      'Filtros de Ar',
      'Óleo AeroShell',
      'Pneus'
    ],
    'Suprimentos': [
      'Óleo de Motor',
      'Filtros',
      'Velas',
      'Pneus',
      'Correias',
      'Mangueiras',
      'Parafusos',
      'Ferramentas',
      'Limpeza',
      'Documentação',
      'Charts',
      'Checklists'
    ]
  };

  if (!isOpen || !purchase) return null;

  // Modal de Edição com estilos corrigidos para modo escuro
  return (
      <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-border shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-foreground">Editar Compra</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-foreground hover:bg-accent"
            >
              ×
            </Button>
          </div>
  
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Título */}
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">Título *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                required
              />
            </div>
  
            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">Categoria *</label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                required
              >
                <option value="">Selecione a categoria</option>
                {PURCHASE_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>
  
            {/* Subcategoria */}
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">Subcategoria *</label>
              <select
                value={formData.subcategory}
                onChange={(e) => handleInputChange('subcategory', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                required
              >
                <option value="">Selecione a subcategoria</option>
                {SUBCATEGORIES[formData.category]?.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
  
            {/* Valores */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">Valor Orçado (CR)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.budgetedValue}
                  onChange={(e) => handleInputChange('budgetedValue', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">Valor Negociado (CR)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.negotiatedValue}
                  onChange={(e) => handleInputChange('negotiatedValue', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">Valor Final (CR) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.finalValue}
                  onChange={(e) => handleInputChange('finalValue', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                  required
                />
              </div>
            </div>
  
            {/* Data da Compra */}
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">Data da Compra *</label>
              <input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                required
              />
            </div>
  
            {/* Comprador */}
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">Comprador *</label>
              <input
                type="text"
                value={formData.buyer}
                onChange={(e) => handleInputChange('buyer', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                required
              />
            </div>
  
            {/* Status */}
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">Status *</label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                required
              >
                <option value="pending">Pendente</option>
                <option value="completed">Concluído</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
  
            {/* Observações */}
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">Observações</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                rows={3}
              />
            </div>
  
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-border hover:bg-accent"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Salvar Alterações
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
};

export default Purchases;