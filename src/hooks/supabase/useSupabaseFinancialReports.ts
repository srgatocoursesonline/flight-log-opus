// ============================================
// SUPABASE FINANCIAL REPORTS HOOK - DRE COMPLETO
// ============================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from 'date-fns';

export interface FinancialTransaction {
  id: string;
  type: 'revenue' | 'expense';
  description: string;
  amount: number;
  date: string;
  category: string;
  category_name?: string;
  category_icon?: string;
}

export interface DREData {
  // Receitas
  totalRevenue: number;
  revenueByCategory: Array<{
    category: string;
    amount: number;
    percentage: number;
    icon?: string;
  }>;
  
  // Despesas
  totalExpenses: number;
  expensesByCategory: Array<{
    category: string;
    amount: number;
    percentage: number;
    icon?: string;
  }>;
  
  // Resultados
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  ebitda: number;
  
  // Tendências
  monthlyTrend: Array<{
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
  }>;
  
  // Fluxo de caixa
  cashFlow: {
    operating: number;
    investing: number;
    financing: number;
    net: number;
  };
}

export interface FinancialFilters {
  startDate?: Date;
  endDate?: Date;
  categories?: string[];
  type?: 'revenue' | 'expense' | 'all';
}

export const useSupabaseFinancialReports = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [dreData, setDreData] = useState<DREData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Função para verificar conexão
  const checkConnection = async () => {
    try {
      const { error } = await supabase
        .from('financial_transactions')
        .select('id')
        .limit(1);
      
      return !error;
    } catch {
      return false;
    }
  };

  // Buscar transações com categorias - com retry e timeout
  const fetchTransactions = useCallback(async (filters?: FinancialFilters, retryCount = 0) => {
    if (!user) {
      setTransactions([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Timeout de 30 segundos
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout ao buscar transações')), 30000)
      );

      let query = supabase
        .from('financial_transactions')
        .select(`*`)
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false });

      // Aplicar filtros
      if (filters?.startDate) {
        query = query.gte('transaction_date', format(filters.startDate, 'yyyy-MM-dd'));
      }
      if (filters?.endDate) {
        query = query.lte('transaction_date', format(filters.endDate, 'yyyy-MM-dd'));
      }
      if (filters?.type && filters.type !== 'all') {
        query = query.eq('transaction_type', filters.type);
      }
      if (filters?.categories && filters.categories.length > 0) {
        query = query.in('category_id', filters.categories);
      }

      const queryPromise = query;
      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

      if (error) {
        setError('Erro ao carregar transações financeiras');
        toast.error('Erro ao carregar transações financeiras');
        return;
      }

      // Buscar categorias para mapeamento
      const [{ data: revenueCategories }, { data: expenseCategories }] = await Promise.all([
        supabase.from('revenue_categories').select('*').eq('user_id', user.id),
        supabase.from('expense_categories').select('*').eq('user_id', user.id)
      ]);

      const categoriesMap = new Map([
        ...(revenueCategories?.map(cat => [cat.id, { ...cat, type: 'revenue' }]) || []),
        ...(expenseCategories?.map(cat => [cat.id, { ...cat, type: 'expense' }]) || [])
      ]);

      // Transformar dados
      const transformedTransactions: FinancialTransaction[] = data.map(item => {
        const category = categoriesMap.get(item.category_id || '');
        return {
          id: item.id,
          type: item.transaction_type,
          description: item.description,
          amount: Number(item.amount),
          date: item.transaction_date,
          category: item.category_id || 'outros',
          category_name: category?.name || 'Outros',
          category_icon: category?.icon || '📊'
        };
      });

      setTransactions(transformedTransactions);
      setLastSync(new Date());
    } catch (err) {
      console.error('Erro ao buscar transações:', err);
      
      // Retry com backoff exponencial (máx 3 tentativas)
      if (retryCount < 2 && err instanceof Error && !err.message.includes('Timeout')) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchTransactions(filters, retryCount + 1);
      }
      
      setError('Erro ao conectar com o banco de dados');
      toast.error('Erro ao conectar com o banco de dados');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Calcular DRE completo
  const calculateDRE = useCallback((transactions: FinancialTransaction[]): DREData => {
    const revenues = transactions.filter(t => t.type === 'revenue');
    const expenses = transactions.filter(t => t.type === 'expense');

    // Calcular totais
    const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Agrupar por categoria
    const revenueByCategory = revenues.reduce((acc, r) => {
      const category = r.category_name || 'Outros';
      if (!acc[category]) {
        acc[category] = { amount: 0, count: 0, icon: r.category_icon };
      }
      acc[category].amount += r.amount;
      acc[category].count += 1;
      return acc;
    }, {} as Record<string, { amount: number; count: number; icon?: string }>);

    const expensesByCategory = expenses.reduce((acc, e) => {
      const category = e.category_name || 'Outros';
      if (!acc[category]) {
        acc[category] = { amount: 0, count: 0, icon: e.category_icon };
      }
      acc[category].amount += e.amount;
      acc[category].count += 1;
      return acc;
    }, {} as Record<string, { amount: number; count: number; icon?: string }>);

    // Calcular tendências mensais (últimos 12 meses)
    const monthlyTrend: DREData['monthlyTrend'] = [];
    for (let i = 11; i >= 0; i--) {
      const month = subMonths(new Date(), i);
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);

      const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= monthStart && transactionDate <= monthEnd;
      });

      const monthRevenue = monthTransactions
        .filter(t => t.type === 'revenue')
        .reduce((sum, r) => sum + r.amount, 0);

      const monthExpenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, e) => sum + e.amount, 0);

      monthlyTrend.push({
        month: format(month, 'MMM yyyy'),
        revenue: monthRevenue,
        expenses: monthExpenses,
        profit: monthRevenue - monthExpenses
      });
    }

    // Calcular resultados
    const grossProfit = totalRevenue;
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return {
      totalRevenue,
      revenueByCategory: Object.entries(revenueByCategory).map(([category, data]) => ({
        category,
        amount: data.amount,
        percentage: totalRevenue > 0 ? (data.amount / totalRevenue) * 100 : 0,
        icon: data.icon
      })).sort((a, b) => b.amount - a.amount),

      totalExpenses,
      expensesByCategory: Object.entries(expensesByCategory).map(([category, data]) => ({
        category,
        amount: data.amount,
        percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0,
        icon: data.icon
      })).sort((a, b) => b.amount - a.amount),

      grossProfit,
      netProfit,
      profitMargin,
      ebitda: netProfit, // Simplificado para este caso

      monthlyTrend,

      cashFlow: {
        operating: netProfit,
        investing: 0, // Não implementado ainda
        financing: 0, // Não implementado ainda
        net: netProfit
      }
    };
  }, []);

  // Atualizar DRE quando transações mudam
  useEffect(() => {
    if (transactions.length > 0) {
      const dre = calculateDRE(transactions);
      setDreData(dre);
    }
  }, [transactions, calculateDRE]);

  // Buscar DRE para período específico
  const getDREForPeriod = useCallback(async (startDate: Date, endDate: Date) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('financial_transactions')
        .select(`
          *,
          revenue_categories!inner(name, icon),
          expense_categories!inner(name, icon)
        `)
        .eq('user_id', user.id)
        .gte('transaction_date', format(startDate, 'yyyy-MM-dd'))
        .lte('transaction_date', format(endDate, 'yyyy-MM-dd'));

      if (error) {
        toast.error('Erro ao buscar DRE');
        return null;
      }

      const transformedTransactions: FinancialTransaction[] = data.map(item => ({
        id: item.id,
        type: item.transaction_type,
        description: item.description,
        amount: Number(item.amount),
        date: item.transaction_date,
        category: item.category_id || 'outros',
        category_name: item.revenue_categories?.name || item.expense_categories?.name || 'Outros',
        category_icon: item.revenue_categories?.icon || item.expense_categories?.icon || '📊'
      }));

      return calculateDRE(transformedTransactions);
    } catch (error) {
      toast.error('Erro ao calcular DRE');
      return null;
    }
  }, [user, calculateDRE]);

  // Configurar sincronização automática
  useEffect(() => {
    // Sincronizar a cada 30 segundos quando usuário estiver logado
    if (user) {
      const interval = setInterval(() => {
        fetchTransactions();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [user, fetchTransactions]);

  // Carregar transações iniciais
  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user?.id, fetchTransactions]);

  // Memoized values para performance
  const summary = useMemo(() => {
    const revenues = transactions.filter(t => t.type === 'revenue');
    const expenses = transactions.filter(t => t.type === 'expense');
    
    return {
      totalRevenue: revenues.reduce((sum, r) => sum + r.amount, 0),
      totalExpenses: expenses.reduce((sum, e) => sum + e.amount, 0),
      totalTransactions: transactions.length,
      revenueCount: revenues.length,
      expenseCount: expenses.length
    };
  }, [transactions]);

  return {
    transactions,
    dreData,
    summary,
    isLoading,
    error,
    lastSync,
    fetchTransactions,
    getDREForPeriod,
    refresh: fetchTransactions
  };
};