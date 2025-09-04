import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useSupabaseFinancial } from '../supabase/useSupabaseFinancial';
import type {
  MaintenanceCategory,
  MaintenanceItem,
  MaintenanceRecord,
  MaintenanceRecordItem,
  MaintenanceStatus,
  MaintenancePriority,
  MaintenanceFilters,
  MaintenanceStats
} from '../../types/maintenance';

interface CreateMaintenanceRecordData {
  aircraft_registration: string;
  aircraft_model?: string;
  maintenance_date: string;
  mechanic_name?: string;
  mechanic_license?: string;
  location?: string;
  notes?: string;
  next_maintenance_date?: string;
  next_maintenance_hours?: number;
  items: {
    maintenance_item_id: string;
    estimated_hours?: number;
    estimated_cost?: number;
    notes?: string;
  }[];
}

interface UpdateMaintenanceRecordData {
  aircraft_registration?: string;
  aircraft_model?: string;
  maintenance_date?: string;
  mechanic_name?: string;
  mechanic_license?: string;
  location?: string;
  status?: MaintenanceStatus;
  notes?: string;
  next_maintenance_date?: string;
  next_maintenance_hours?: number;
}

interface UpdateMaintenanceItemData {
  status?: MaintenanceStatus;
  actual_hours?: number;
  actual_cost?: number;
  notes?: string;
  completed_at?: string;
}

export function useMaintenanceManager() {
  const { user } = useAuth();
  const { addExpense } = useSupabaseFinancial();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<MaintenanceCategory[]>([]);
  const [items, setItems] = useState<MaintenanceItem[]>([]);
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [stats, setStats] = useState<MaintenanceStats>({
    totalRecords: 0,
    pendingRecords: 0,
    completedRecords: 0,
    totalCost: 0,
    totalHours: 0,
    averageCostPerRecord: 0
  });

  // Carregar categorias de manutenção
  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('maintenance_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar itens de manutenção por categoria
  const loadItemsByCategory = useCallback(async (categoryId?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('maintenance_items')
        .select(`
          *,
          category:maintenance_categories(*)
        `)
        .order('name');

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar itens');
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar registros de manutenção
  const loadRecords = useCallback(async (filters?: MaintenanceFilters) => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Primeiro, carregar os registros principais
      let query = supabase
        .from('maintenance_records')
        .select('*')
        .eq('profile_id', user.id)
        .order('maintenance_date', { ascending: false });

      // Aplicar filtros
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.aircraft_registration) {
        query = query.ilike('aircraft_registration', `%${filters.aircraft_registration}%`);
      }
      if (filters?.date_from) {
        query = query.gte('maintenance_date', filters.date_from);
      }
      if (filters?.date_to) {
        query = query.lte('maintenance_date', filters.date_to);
      }

      const { data: records, error: recordsError } = await query;
      if (recordsError) throw recordsError;

      // Se não há registros, retornar array vazio
      if (!records || records.length === 0) {
        setRecords([]);
        return;
      }

      // Carregar os itens para cada registro
      const recordsWithItems = await Promise.all(
        records.map(async (record) => {
          const { data: items, error: itemsError } = await supabase
            .from('maintenance_record_items')
            .select(`
              *,
              maintenance_item:maintenance_items(
                *,
                category:maintenance_categories(*)
              )
            `)
            .eq('maintenance_record_id', record.id);

          if (itemsError) {
            console.error('Erro ao carregar itens:', itemsError);
            return { ...record, items: [] };
          }

          return { ...record, items: items || [] };
        })
      );

      setRecords(recordsWithItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar registros');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Criar registro de manutenção
  const createMaintenanceRecord = async (data: CreateMaintenanceRecordData) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      setLoading(true);
      setError(null);

      // Criar o registro principal
      const { data: record, error: recordError } = await supabase
        .from('maintenance_records')
        .insert({
          profile_id: user.id,
          aircraft_registration: data.aircraft_registration,
          aircraft_model: data.aircraft_model,
          maintenance_date: data.maintenance_date,
          mechanic_name: data.mechanic_name,
          mechanic_license: data.mechanic_license,
          location: data.location,
          notes: data.notes,
          next_maintenance_date: data.next_maintenance_date,
          next_maintenance_hours: data.next_maintenance_hours,
          status: 'pending'
        })
        .select()
        .single();

      if (recordError) throw recordError;

      // Criar os itens do registro
      if (data.items.length > 0) {
        const recordItems = data.items.map(item => ({
          maintenance_record_id: record.id,
          maintenance_item_id: item.maintenance_item_id,
          actual_hours: item.estimated_hours || 0,
          actual_cost: item.estimated_cost || 0,
          notes: item.notes,
          status: 'pending' as MaintenanceStatus
        }));

        const { error: itemsError } = await supabase
          .from('maintenance_record_items')
          .insert(recordItems);

        if (itemsError) throw itemsError;
      }

      // Criar despesa financeira automática
      const totalCost = data.items.reduce((sum, item) => sum + (item.estimated_cost || 0), 0);
      if (totalCost > 0) {
        try {
          // Buscar categoria de manutenção ou usar categoria padrão
          const { data: categories } = await supabase
            .from('expense_categories')
            .select('id')
            .or(`user_id.eq.${user.id},user_id.is.null`)
            .ilike('name', '%manutenção%')
            .limit(1);
          
          const categoryId = categories?.[0]?.id || 'outros';
          
          await addExpense({
            description: `Manutenção - ${data.aircraft_registration}`,
            amount: totalCost,
            date: data.maintenance_date,
            category: categoryId
          });
        } catch (expenseError) {
          console.warn('Erro ao criar despesa automática:', expenseError);
          // Não falha a criação da manutenção se houver erro na despesa
        }
      }

      // Recarregar dados
      await loadRecords();
      await calculateStats();

      return record;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar registro';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Atualizar registro de manutenção
  const updateMaintenanceRecord = async (id: string, data: UpdateMaintenanceRecordData) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('maintenance_records')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      // Recarregar dados
      await loadRecords();
      await calculateStats();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar registro';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Atualizar item de manutenção
  const updateMaintenanceItem = async (id: string, data: UpdateMaintenanceItemData) => {
    try {
      setLoading(true);
      setError(null);

      const updateData = { ...data };
      if (data.status === 'completed' && !data.completed_at) {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('maintenance_record_items')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      // Recarregar dados
      await loadRecords();
      await calculateStats();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar item';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Deletar registro de manutenção
  const deleteMaintenanceRecord = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('maintenance_records')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Recarregar dados
      await loadRecords();
      await calculateStats();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar registro';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Calcular estatísticas
  const calculateStats = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('maintenance_records')
        .select(`
          status,
          items:maintenance_record_items(
            actual_cost,
            actual_hours
          )
        `)
        .eq('profile_id', user.id);

      if (error) throw error;

      const totalRecords = data.length;
      const pendingRecords = data.filter(r => r.status === 'pending' || r.status === 'in_progress').length;
      const completedRecords = data.filter(r => r.status === 'completed').length;
      
      const totalCost = data.reduce((sum, record) => {
        const recordCost = record.items?.reduce((itemSum: number, item: any) => itemSum + (item.actual_cost || 0), 0) || 0;
        return sum + recordCost;
      }, 0);
      
      const totalHours = data.reduce((sum, record) => {
        const recordHours = record.items?.reduce((itemSum: number, item: any) => itemSum + (item.actual_hours || 0), 0) || 0;
        return sum + recordHours;
      }, 0);
      
      const averageCostPerRecord = totalRecords > 0 ? totalCost / totalRecords : 0;

      setStats({
        totalRecords,
        pendingRecords,
        completedRecords,
        totalCost,
        totalHours,
        averageCostPerRecord
      });
    } catch (err) {
      console.error('Erro ao calcular estatísticas:', err);
    }
  }, [user]);

  // Carregar dados iniciais
  useEffect(() => {
    loadCategories();
    loadItemsByCategory();
    if (user) {
      loadRecords();
      calculateStats();
    }
  }, [user, loadCategories, loadItemsByCategory, loadRecords, calculateStats]);

  return {
    // Estados
    loading,
    error,
    categories,
    items,
    records,
    stats,

    // Ações
    loadCategories,
    loadItemsByCategory,
    loadRecords,
    createMaintenanceRecord,
    updateMaintenanceRecord,
    updateMaintenanceItem,
    deleteMaintenanceRecord,
    calculateStats,

    // Utilitários
    clearError: () => setError(null)
  };
}