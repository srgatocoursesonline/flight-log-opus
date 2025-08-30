// ============================================
// SUPABASE EXPENSE CATEGORIES MANAGER HOOK
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/config/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ExpenseCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  isDefault: boolean;
  isActive: boolean;
}

export const useSupabaseExpenseCategories = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories from database
  const fetchCategories = useCallback(async () => {
    if (!user) {
      setCategories([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('expense_categories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching expense categories:', error);
        setError('Erro ao carregar categorias de despesa');
        toast.error('Erro ao carregar categorias de despesa');
        return;
      }

      // Transform database data to match interface
      const categoryData: ExpenseCategory[] = data.map(item => ({
        id: item.id,
        name: item.name,
        icon: item.icon,
        description: item.description || '',
        isDefault: item.is_default,
        isActive: item.is_active,
      }));

      setCategories(categoryData);
    } catch (error) {
      console.error('Error in fetchCategories:', error);
      setError('Erro ao conectar com o banco de dados');
      toast.error('Erro ao conectar com o banco de dados');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Add new category
  const addCategory = async (category: Omit<ExpenseCategory, 'id' | 'isDefault'>) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('expense_categories')
        .insert({
          user_id: user.id,
          name: category.name,
          icon: category.icon,
          description: category.description,
          is_active: category.isActive,
          is_default: false,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding category:', error);
        toast.error('Erro ao adicionar categoria');
        return;
      }

      // Refresh data
      await fetchCategories();
      toast.success(`Categoria "${category.name}" adicionada com sucesso!`);
    } catch (error) {
      console.error('Error in addCategory:', error);
      toast.error('Erro ao adicionar categoria');
    }
  };

  // Update category
  const updateCategory = async (id: string, updates: Partial<ExpenseCategory>) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      // Transform updates to match database columns
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

      const { error } = await supabase
        .from('expense_categories')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating category:', error);
        toast.error('Erro ao atualizar categoria');
        return;
      }

      // Update local state
      setCategories(prev => 
        prev.map(category => 
          category.id === id 
            ? { ...category, ...updates }
            : category
        )
      );

      toast.success('Categoria atualizada com sucesso!');
    } catch (error) {
      console.error('Error in updateCategory:', error);
      toast.error('Erro ao atualizar categoria');
    }
  };

  // Delete category
  const deleteCategory = async (id: string) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      const category = categories.find(cat => cat.id === id);
      if (category?.isDefault) {
        toast.error('Não é possível deletar categorias padrão');
        return;
      }

      const { error } = await supabase
        .from('expense_categories')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting category:', error);
        toast.error('Erro ao deletar categoria');
        return;
      }

      // Update local state
      setCategories(prev => prev.filter(category => category.id !== id));
      toast.success('Categoria deletada com sucesso!');
    } catch (error) {
      console.error('Error in deleteCategory:', error);
      toast.error('Erro ao deletar categoria');
    }
  };

  // Toggle category active status
  const toggleCategoryActive = async (id: string) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      const category = categories.find(cat => cat.id === id);
      if (!category) return;

      const { error } = await supabase
        .from('expense_categories')
        .update({ is_active: !category.isActive })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error toggling category:', error);
        toast.error('Erro ao atualizar categoria');
        return;
      }

      // Update local state
      setCategories(prev => 
        prev.map(cat => 
          cat.id === id 
            ? { ...cat, isActive: !cat.isActive }
            : cat
        )
      );

      toast.success(`Categoria ${!category.isActive ? 'ativada' : 'desativada'} com sucesso!`);
    } catch (error) {
      console.error('Error in toggleCategoryActive:', error);
      toast.error('Erro ao atualizar categoria');
    }
  };

  // Get active categories
  const getActiveCategories = () => {
    return categories.filter(category => category.isActive);
  };

  // Reset to defaults (this will trigger default data creation in database)
  const resetToDefaults = async () => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      // Delete all user categories
      const { error: deleteError } = await supabase
        .from('expense_categories')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('Error resetting categories:', deleteError);
        toast.error('Erro ao restaurar categorias padrão');
        return;
      }

      // Refresh data (default categories will be created by trigger)
      await fetchCategories();
      toast.success('Categorias restauradas para padrão!');
    } catch (error) {
      console.error('Error in resetToDefaults:', error);
      toast.error('Erro ao restaurar categorias padrão');
    }
  };

  return {
    categories,
    isLoading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryActive,
    getActiveCategories,
    resetToDefaults,
    refresh: fetchCategories,
  };
};