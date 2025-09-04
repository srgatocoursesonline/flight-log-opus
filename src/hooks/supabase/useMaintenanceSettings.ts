import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { MaintenanceCategory, MaintenanceItem } from '@/types/maintenance';

export interface MaintenanceCategoryWithItems extends MaintenanceCategory {
  items?: MaintenanceItem[];
}

export const useMaintenanceSettings = () => {
  const [categories, setCategories] = useState<MaintenanceCategoryWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar todas as categorias com seus itens
  const fetchCategoriesWithItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: categoriesData, error: categoriesError } = await supabase
        .from('maintenance_categories')
        .select('*')
        .order('name');

      if (categoriesError) throw categoriesError;

      const { data: itemsData, error: itemsError } = await supabase
        .from('maintenance_items')
        .select('*')
        .order('name');

      if (itemsError) throw itemsError;

      // Agrupar itens por categoria
      const categoriesWithItems = categoriesData.map(category => ({
        ...category,
        items: itemsData.filter(item => item.category_id === category.id)
      }));

      setCategories(categoriesWithItems);
    } catch (err) {
      console.error('Erro ao buscar categorias e itens:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  // Adicionar nova categoria
  const addCategory = async (categoryData: Omit<MaintenanceCategory, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);
      
      const { data, error } = await supabase
        .from('maintenance_categories')
        .insert([categoryData])
        .select()
        .single();

      if (error) throw error;

      // Adicionar à lista local
      setCategories(prev => [...prev, { ...data, items: [] }]);
      
      return { success: true, data };
    } catch (err) {
      console.error('Erro ao adicionar categoria:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar categoria';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Atualizar categoria
  const updateCategory = async (id: string, categoryData: Partial<MaintenanceCategory>) => {
    try {
      setError(null);
      
      const { data, error } = await supabase
        .from('maintenance_categories')
        .update(categoryData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Atualizar na lista local
      setCategories(prev => prev.map(cat => 
        cat.id === id ? { ...cat, ...data } : cat
      ));
      
      return { success: true, data };
    } catch (err) {
      console.error('Erro ao atualizar categoria:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar categoria';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Deletar categoria
  const deleteCategory = async (id: string) => {
    try {
      setError(null);
      
      // Verificar se há itens associados
      const { data: items, error: itemsError } = await supabase
        .from('maintenance_items')
        .select('id')
        .eq('category_id', id);

      if (itemsError) throw itemsError;

      if (items && items.length > 0) {
        throw new Error('Não é possível deletar categoria que possui itens associados');
      }

      const { error } = await supabase
        .from('maintenance_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Remover da lista local
      setCategories(prev => prev.filter(cat => cat.id !== id));
      
      return { success: true };
    } catch (err) {
      console.error('Erro ao deletar categoria:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar categoria';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Adicionar novo item
  const addItem = async (itemData: Omit<MaintenanceItem, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);
      
      const { data, error } = await supabase
        .from('maintenance_items')
        .insert([itemData])
        .select()
        .single();

      if (error) throw error;

      // Adicionar à lista local
      setCategories(prev => prev.map(cat => 
        cat.id === itemData.category_id 
          ? { ...cat, items: [...(cat.items || []), data] }
          : cat
      ));
      
      return { success: true, data };
    } catch (err) {
      console.error('Erro ao adicionar item:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar item';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Atualizar item
  const updateItem = async (id: string, itemData: Partial<MaintenanceItem>) => {
    try {
      setError(null);
      
      const { data, error } = await supabase
        .from('maintenance_items')
        .update(itemData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Atualizar na lista local
      setCategories(prev => prev.map(cat => ({
        ...cat,
        items: cat.items?.map(item => 
          item.id === id ? { ...item, ...data } : item
        )
      })));
      
      return { success: true, data };
    } catch (err) {
      console.error('Erro ao atualizar item:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar item';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Deletar item
  const deleteItem = async (id: string) => {
    try {
      setError(null);
      
      const { error } = await supabase
        .from('maintenance_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Remover da lista local
      setCategories(prev => prev.map(cat => ({
        ...cat,
        items: cat.items?.filter(item => item.id !== id)
      })));
      
      return { success: true };
    } catch (err) {
      console.error('Erro ao deletar item:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar item';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  useEffect(() => {
    fetchCategoriesWithItems();
  }, []);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategoriesWithItems,
    addCategory,
    updateCategory,
    deleteCategory,
    addItem,
    updateItem,
    deleteItem
  };
};