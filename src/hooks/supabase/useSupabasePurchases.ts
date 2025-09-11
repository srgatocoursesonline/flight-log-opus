import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Purchase } from "@/entities/purchase";
import { toast } from 'sonner';

export interface Purchase {
  id?: string;
  purchaseCode: string;
  title: string;
  category: 'Aeronave' | 'Combustível' | 'Equipamentos' | 'Suprimentos';
  subcategory: string;
  budgetedValue: number;
  negotiatedValue: number;
  finalValue: number;
  purchaseDate: string;
  buyer: string;
  notes?: string;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
}

export interface PurchaseFormData {
  title: string;
  category: 'Aeronave' | 'Combustível' | 'Equipamentos' | 'Suprimentos';
  subcategory: string;
  budgetedValue: number;
  negotiatedValue: number;
  finalValue: number;
  purchaseDate: string;
  buyer: string;
  notes?: string;
}

export const useSupabasePurchases = () => {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar compras do banco
  const fetchPurchases = useCallback(async () => {
    if (!user) {
      setPurchases([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        setError('Erro ao carregar compras');
        toast.error('Erro ao carregar compras');
        return;
      }

      // Transformar dados do banco para o formato da interface
      const purchaseData: Purchase[] = data.map(item => ({
        id: item.id,
        purchaseCode: item.purchase_code,
        title: item.title,
        category: item.category,
        subcategory: item.subcategory,
        budgetedValue: parseFloat(item.budgeted_value),
        negotiatedValue: parseFloat(item.negotiated_value),
        finalValue: parseFloat(item.final_value),
        purchaseDate: item.purchase_date,
        buyer: item.buyer,
        notes: item.notes || '',
        status: item.status,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));

      setPurchases(purchaseData);
    } catch (error) {
      setError('Erro ao conectar com o banco de dados');
      toast.error('Erro ao conectar com o banco de dados');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Gerar código de compra automático
  const generatePurchaseCode = useCallback(async (): Promise<string> => {
    if (!user) return 'C-001';

    try {
      const { data, error } = await supabase
        .rpc('generate_purchase_code', { user_id: user.id });

      if (error) {
        console.error('Erro ao gerar código de compra:', error);
        return 'C-001'; // Fallback
      }

      return data || 'C-001';
    } catch (error) {
      console.error('Erro na função generate_purchase_code:', error);
      return 'C-001';
    }
  }, [user]);

  // Adicionar nova compra
  const addPurchase = useCallback(async (purchaseData: PurchaseFormData) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return false;
    }

    try {
      const purchaseCode = await generatePurchaseCode();
      
      // Inserir compra
      const { data, error } = await supabase
        .from('purchases')
        .insert({
          user_id: user.id,
          purchase_code: purchaseCode,
          title: purchaseData.title,
          category: purchaseData.category,
          subcategory: purchaseData.subcategory,
          budgeted_value: purchaseData.budgetedValue,
          negotiated_value: purchaseData.negotiatedValue,
          final_value: purchaseData.finalValue,
          purchase_date: purchaseData.purchaseDate,
          buyer: purchaseData.buyer,
          notes: purchaseData.notes || '',
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar compra:', error);
        toast.error('Erro ao adicionar compra');
        return false;
      }

      // Buscar categoria de despesa correspondente
      let categoryId = null;
      
      // Mapear categorias de compra para categorias de despesa
      const categoryMapping = {
        'Aeronave': 'Compra de Nova Aeronave',
        'Combustível': 'Combustível',
        'Equipamentos': 'Manutenção',
        'Suprimentos': 'Manutenção'
      };

      const expenseCategoryName = categoryMapping[purchaseData.category];
      
      if (expenseCategoryName) {
        const { data: categoryData } = await supabase
          .from('expense_categories')
          .select('id')
          .eq('user_id', user.id)
          .eq('name', expenseCategoryName)
          .single();
          
        if (categoryData) {
          categoryId = categoryData.id;
        } else {
          console.warn(`Categoria de despesa '${expenseCategoryName}' não encontrada para o usuário`);
        }
      } else {
        console.warn(`Categoria de compra '${purchaseData.category}' não mapeada para despesa`);
      }
      
      // Adicionar como despesa no financeiro
      const { error: expenseError } = await supabase
        .from('financial_transactions')
        .insert({
          user_id: user.id,
          transaction_type: 'expense',
          description: `${purchaseData.title} - ${purchaseData.category}`,
          amount: purchaseData.finalValue,
          category_id: categoryId,
          transaction_date: purchaseData.purchaseDate
        });

      if (expenseError) {
        console.error('Erro ao adicionar despesa:', expenseError);
        // Não falha a compra, apenas loga o erro
      }

      await fetchPurchases();
      toast.success(`Compra ${purchaseCode} adicionada com sucesso!`);
      return true;
    } catch (error) {
      console.error('Erro ao adicionar compra:', error);
      toast.error('Erro ao adicionar compra');
      return false;
    }
  }, [user, fetchPurchases, generatePurchaseCode]);

  // Atualizar compra
  const updatePurchase = useCallback(async (id: string, updates: Partial<PurchaseFormData>): Promise<boolean> => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return false;
    }

    try {
      const dbUpdates: any = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.subcategory !== undefined) dbUpdates.subcategory = updates.subcategory;
      if (updates.budgetedValue !== undefined) dbUpdates.budgeted_value = updates.budgetedValue;
      if (updates.negotiatedValue !== undefined) dbUpdates.negotiated_value = updates.negotiatedValue;
      if (updates.finalValue !== undefined) dbUpdates.final_value = updates.finalValue;
      if (updates.purchaseDate !== undefined) dbUpdates.purchase_date = updates.purchaseDate;
      if (updates.buyer !== undefined) dbUpdates.buyer = updates.buyer;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

      const { error } = await supabase
        .from('purchases')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        toast.error('Erro ao atualizar compra');
        return false;
      }

      await fetchPurchases();
      toast.success('Compra atualizada com sucesso!');
      return true;
    } catch (error) {
      toast.error('Erro ao atualizar compra');
      return false;
    }
  }, [user, fetchPurchases]);

  // Deletar compra
  const deletePurchase = useCallback(async (purchaseId: string) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return false;
    }

    try {
      // Primeiro, buscar a transação financeira associada
      const { data: purchaseData } = await supabase
        .from('purchases')
        .select('financial_transaction_id')
        .eq('id', purchaseId)
        .eq('user_id', user.id)
        .single();

      if (purchaseData?.financial_transaction_id) {
        // Excluir a transação financeira
        await supabase
          .from('financial_transactions')
          .delete()
          .eq('id', purchaseData.financial_transaction_id)
          .eq('user_id', user.id);
      }

      // Excluir a compra
      const { error } = await supabase
        .from('purchases')
        .delete()
        .eq('id', purchaseId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao excluir compra:', error);
        toast.error('Erro ao excluir compra');
        return false;
      }

      toast.success('Compra excluída com sucesso!');
      await fetchPurchases();
      return true;
    } catch (error) {
      console.error('Erro ao excluir compra:', error);
      toast.error('Erro ao excluir compra');
      return false;
    }
  }, [user, fetchPurchases]);

  // Buscar estatísticas de compras
  const getPurchaseStats = useCallback(async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('purchases')
        .select('final_value, category, status')
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao buscar estatísticas:', error);
        return null;
      }

      const total = data.reduce((sum, item) => sum + parseFloat(item.final_value), 0);
      const byCategory = data.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + parseFloat(item.final_value);
        return acc;
      }, {} as Record<string, number>);

      const pending = data.filter(item => item.status === 'pending').length;

      return {
        total,
        byCategory,
        pending,
        count: data.length
      };
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error);
      return null;
    }
  }, [user]);

  // Efeito inicial
  useEffect(() => {
    if (user) {
      fetchPurchases();
    }
  }, [user?.id, fetchPurchases]);

  return {
    purchases,
    isLoading,
    error,
    addPurchase,
    updatePurchase,
    deletePurchase,
    fetchPurchases,
    generatePurchaseCode,
    getPurchaseStats
  };
};