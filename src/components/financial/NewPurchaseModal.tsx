import { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Plus, ShoppingCart } from 'lucide-react';
import { useSupabaseFinancial } from '@/hooks/supabase/useSupabaseFinancial';
import { useSupabaseExpenseCategories } from '@/hooks/supabase/useSupabaseExpenseCategories';
import { useSupabasePurchases } from '@/hooks/supabase/useSupabasePurchases';
import { useSupabaseAircraftManager } from '@/hooks/supabase/useSupabaseAircraftManager';
import { useToast } from '@/hooks/ui/use-toast';
import { useProfile } from '@/hooks/useProfile';

interface NewPurchaseModalProps {
  trigger?: React.ReactNode;
  onClose?: () => void;
  onSuccess?: () => void;
}

export interface NewPurchaseModalRef {
  openModal: () => void;
}

interface PurchaseFormData {
  id: string;
  category: string;
  subcategory: string;
  budgetedAmount: string;
  negotiatedAmount: string;
  finalAmount: string;
  purchaseDate: string;
  buyer: string;
  notes: string;
}

// Categorias de compras
const PURCHASE_CATEGORIES = [
  { id: 'aircraft', name: 'Aeronave', icon: '✈️' },
  { id: 'fuel', name: 'Combustível', icon: '⛽' },
  { id: 'equipment', name: 'Equipamentos', icon: '🔧' },
  { id: 'supplies', name: 'Suprimentos', icon: '📦' }
];

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

// Subcategorias para outras categorias
const SUBCATEGORIES: Record<string, string[]> = {
  aircraft: [], // Será preenchido dinamicamente
  fuel: [
    'AVGAS 100LL',
    'JET A-1',
    'MOGAS',
    'Óleo para Motor',
    'Aditivos de Combustível'
  ],
  equipment: [
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
  supplies: [
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

export const NewPurchaseModal = forwardRef<NewPurchaseModalRef, NewPurchaseModalProps>(({ trigger, onClose, onSuccess }, ref) => {
  const { t } = useTranslation();
  const { addExpense } = useSupabaseFinancial();
  const { addPurchase } = useSupabasePurchases();
  const aircraftManager = useSupabaseAircraftManager();
  const { profile } = useProfile();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState<PurchaseFormData>({
    id: '',
    category: '',
    subcategory: '',
    budgetedAmount: '',
    negotiatedAmount: '',
    finalAmount: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    buyer: profile?.display_name || '',
    notes: ''
  });

  // Expor método para abrir modal externamente
  useImperativeHandle(ref, () => ({
    openModal: () => setOpen(true)
  }));

  // Gerar ID automático no formato C-00X
  const generatePurchaseId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `C-${String(timestamp + random).slice(-3)}`;
  };

  // Obter aeronaves do sistema de voos
  const getAircraftOptions = () => {
    const aircraft = aircraftManager.getAllAircraftNames();
    return aircraft.length > 0 ? aircraft : defaultAircraft;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category) {
      toast({
        title: "Erro",
        description: "Categoria é obrigatória",
        variant: "destructive",
      });
      return;
    }

    if (!formData.finalAmount || parseFloat(formData.finalAmount) <= 0) {
      toast({
        title: "Erro", 
        description: "Valor final deve ser maior que zero",
        variant: "destructive",
      });
      return;
    }

    try {
      const purchaseId = generatePurchaseId();
      const categoryName = PURCHASE_CATEGORIES.find(c => c.id === formData.category)?.name || formData.category;
      const subcategoryName = formData.subcategory || '';
      
      // Descrição combinada para o expense
      const description = subcategoryName 
        ? `${categoryName} - ${subcategoryName}`
        : categoryName;

      // Função para formatar valor numérico (tratar vírgula como decimal)
      const formatCurrencyValue = (value: string): number => {
        if (!value) return 0;
        // Substituir vírgula por ponto para tratamento decimal
        const normalizedValue = value.toString().replace(',', '.');
        return parseFloat(normalizedValue) || 0;
      };

      // Criar compra no sistema de compras
      const categoryMap: Record<string, 'Aeronave' | 'Combustível' | 'Equipamentos' | 'Suprimentos'> = {
        aircraft: 'Aeronave',
        fuel: 'Combustível',
        equipment: 'Equipamentos',
        supplies: 'Suprimentos'
      };

      const purchaseData = {
        title: description,
        category: categoryMap[formData.category],
        subcategory: formData.subcategory,
        budgetedValue: formatCurrencyValue(formData.budgetedAmount),
        negotiatedValue: formatCurrencyValue(formData.negotiatedAmount),
        finalValue: formatCurrencyValue(formData.finalAmount),
        purchaseDate: formData.purchaseDate,
        buyer: formData.buyer,
        notes: formData.notes
      };

      const success = await addPurchase(purchaseData);
      
      if (success) {
        // Criar expense no financeiro
        const expenseData = {
          description,
          amount: formatCurrencyValue(formData.finalAmount),
          date: formData.purchaseDate,
          category: formData.category,
          notes: `Compra ID: ${purchaseId}\n${formData.notes || ''}`
        };

        await addExpense(expenseData);
        
        toast({
          title: "Sucesso!",
          description: `Compra ${purchaseId} registrada e despesa criada no financeiro`,
        });

        // Limpar formulário
        setFormData({
          id: '',
          category: '',
          subcategory: '',
          budgetedAmount: '',
          negotiatedAmount: '',
          finalAmount: '',
          purchaseDate: new Date().toISOString().split('T')[0],
          buyer: profile?.display_name || '',
          notes: ''
        });

        setOpen(false);
        onSuccess?.();
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao registrar compra",
        variant: "destructive",
      });
    }
  };

  const handleCategoryChange = (value: string) => {
    setFormData({
      ...formData,
      category: value,
      subcategory: '' // Reset subcategory when category changes
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Nova Compra
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Lançar Nova Compra</DialogTitle>
          <DialogDescription>
            Registre uma nova compra para sua operação aeronáutica
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Categoria */}
          <div>
            <Label htmlFor="category" className="label-text">Categoria *</Label>
            <Select value={formData.category} onValueChange={handleCategoryChange}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {PURCHASE_CATEGORIES.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subcategoria - Aeronaves ou outras */}
          {formData.category === 'aircraft' && (
            <div>
              <Label htmlFor="subcategory" className="label-text">Modelo da Aeronave *</Label>
              <Select 
                value={formData.subcategory} 
                onValueChange={(value) => setFormData({ ...formData, subcategory: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione a aeronave" />
                </SelectTrigger>
                <SelectContent>
                  {getAircraftOptions().map((aircraft) => (
                    <SelectItem key={aircraft} value={aircraft}>
                      {aircraft}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Subcategoria para outras categorias */}
          {formData.category && formData.category !== 'aircraft' && SUBCATEGORIES[formData.category]?.length > 0 && (
            <div>
              <Label htmlFor="subcategory" className="label-text">Subcategoria</Label>
              <Select value={formData.subcategory} onValueChange={(value) => setFormData({ ...formData, subcategory: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione a subcategoria" />
                </SelectTrigger>
                <SelectContent>
                  {SUBCATEGORIES[formData.category].map((subcategory) => (
                    <SelectItem key={subcategory} value={subcategory}>
                      {subcategory}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Valores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="budgetedAmount" className="label-text">Valor Orçado (CR)</Label>
              <Input
                id="budgetedAmount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.budgetedAmount}
                onChange={(e) => setFormData({ ...formData, budgetedAmount: e.target.value })}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="negotiatedAmount" className="label-text">Valor Negociado (CR)</Label>
              <Input
                id="negotiatedAmount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.negotiatedAmount}
                onChange={(e) => setFormData({ ...formData, negotiatedAmount: e.target.value })}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="finalAmount" className="label-text">Valor Final (CR) *</Label>
              <Input
                id="finalAmount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.finalAmount}
                onChange={(e) => setFormData({ ...formData, finalAmount: e.target.value })}
                className="mt-1"
                required
              />
            </div>
          </div>

          {/* Data da Compra */}
          <div>
            <Label htmlFor="purchaseDate" className="label-text">Data da Compra *</Label>
            <Input
              id="purchaseDate"
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
              className="mt-1"
              required
            />
          </div>

          {/* Comprador */}
          <div>
            <Label htmlFor="buyer" className="label-text">Comprador *</Label>
            <Input
              id="buyer"
              type="text"
              placeholder="Nome do comprador"
              value={formData.buyer}
              onChange={(e) => setFormData({ ...formData, buyer: e.target.value })}
              className="mt-1"
              required
            />
          </div>

          {/* Observações */}
          <div>
            <Label htmlFor="notes" className="label-text">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Detalhes adicionais sobre a compra..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="mt-1"
              rows={3}
              maxLength={500}
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="hud">
              <Plus className="h-4 w-4 mr-2" />
              Registrar Compra
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
});

NewPurchaseModal.displayName = 'NewPurchaseModal';