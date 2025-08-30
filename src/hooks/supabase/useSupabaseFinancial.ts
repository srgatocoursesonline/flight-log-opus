// ============================================
// SUPABASE FINANCIAL MANAGER HOOK
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/config/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { autoRefresh } from '@/utils/autoRefresh';
import { useSupabaseFlights } from './useSupabaseFlights';

export interface Transaction {
  id: string;
  type: 'revenue' | 'expense';
  description: string;
  amount: number;
  date: string;
  category: string;
}

export const useSupabaseFinancial = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [revenues, setRevenues] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getFlightStats } = useSupabaseFlights();

  // Fetch financial transactions from database
  const fetchTransactions = useCallback(async () => {
    if (!user) {
      setExpenses([]);
      setRevenues([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching transactions:', error);
        setError('Erro ao carregar transações financeiras');
        toast.error('Erro ao carregar transações financeiras');
        return;
      }

      // Transform database data to match interface and separate by type
      const expenseTransactions: Transaction[] = [];
      const revenueTransactions: Transaction[] = [];

      data.forEach(item => {
        const transaction: Transaction = {
          id: item.id,
          type: item.transaction_type,
          description: item.description,
          amount: item.amount,
          date: item.transaction_date,
          category: item.category_id || 'outros', // Default category if none
        };

        if (item.transaction_type === 'expense') {
          expenseTransactions.push(transaction);
        } else if (item.transaction_type === 'revenue') {
          revenueTransactions.push(transaction);
        }
      });

      setExpenses(expenseTransactions);
      setRevenues(revenueTransactions);
    } catch (error) {
      console.error('Error in fetchTransactions:', error);
      setError('Erro ao conectar com o banco de dados');
      toast.error('Erro ao conectar com o banco de dados');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Add new revenue
  const addRevenue = async (revenue: Omit<Transaction, 'id' | 'type'>) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('financial_transactions')
        .insert({
          user_id: user.id,
          transaction_type: 'revenue',
          description: revenue.description,
          amount: revenue.amount,
          transaction_date: revenue.date,
          category_id: revenue.category,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding revenue:', error);
        toast.error('Erro ao adicionar receita');
        return;
      }

      // Refresh data
      await fetchTransactions();
      toast.success(`Receita "${revenue.description}" adicionada com sucesso!`);
      
      // Auto refresh for real-time updates
      autoRefresh();
    } catch (error) {
      console.error('Error in addRevenue:', error);
      toast.error('Erro ao adicionar receita');
    }
  };

  // Update revenue
  const updateRevenue = async (id: string, updates: Partial<Transaction>) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      // Transform updates to match database columns
      const dbUpdates: any = {};
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
      if (updates.date !== undefined) dbUpdates.transaction_date = updates.date;
      if (updates.category !== undefined) dbUpdates.category_id = updates.category;

      const { error } = await supabase
        .from('financial_transactions')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', user.id)
        .eq('transaction_type', 'revenue');

      if (error) {
        console.error('Error updating revenue:', error);
        toast.error('Erro ao atualizar receita');
        return;
      }

      // Update local state
      setRevenues(prev => 
        prev.map(revenue => 
          revenue.id === id 
            ? { ...revenue, ...updates }
            : revenue
        )
      );

      toast.success('Receita atualizada com sucesso!');
      
      // Auto refresh for real-time updates
      autoRefresh();
    } catch (error) {
      console.error('Error in updateRevenue:', error);
      toast.error('Erro ao atualizar receita');
    }
  };

  // Delete revenue
  const deleteRevenue = async (id: string) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      const { error } = await supabase
        .from('financial_transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
        .eq('transaction_type', 'revenue');

      if (error) {
        console.error('Error deleting revenue:', error);
        toast.error('Erro ao deletar receita');
        return;
      }

      // Update local state
      setRevenues(prev => prev.filter(revenue => revenue.id !== id));
      toast.success('Receita deletada com sucesso!');
      
      // Auto refresh for real-time updates
      autoRefresh();
    } catch (error) {
      console.error('Error in deleteRevenue:', error);
      toast.error('Erro ao deletar receita');
    }
  };

  // Add new expense
  const addExpense = async (expense: Omit<Transaction, 'id' | 'type'>) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('financial_transactions')
        .insert({
          user_id: user.id,
          transaction_type: 'expense',
          description: expense.description,
          amount: expense.amount,
          transaction_date: expense.date,
          category_id: expense.category,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding expense:', error);
        toast.error('Erro ao adicionar despesa');
        return;
      }

      // Refresh data
      await fetchTransactions();
      toast.success(`Despesa "${expense.description}" adicionada com sucesso!`);
      
      // Auto refresh for real-time updates
      autoRefresh();
    } catch (error) {
      console.error('Error in addExpense:', error);
      toast.error('Erro ao adicionar despesa');
    }
  };

  // Update expense
  const updateExpense = async (id: string, updates: Partial<Transaction>) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      // Transform updates to match database columns
      const dbUpdates: any = {};
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
      if (updates.date !== undefined) dbUpdates.transaction_date = updates.date;
      if (updates.category !== undefined) dbUpdates.category_id = updates.category;

      const { error } = await supabase
        .from('financial_transactions')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', user.id)
        .eq('transaction_type', 'expense');

      if (error) {
        console.error('Error updating expense:', error);
        toast.error('Erro ao atualizar despesa');
        return;
      }

      // Update local state
      setExpenses(prev => 
        prev.map(expense => 
          expense.id === id 
            ? { ...expense, ...updates }
            : expense
        )
      );

      toast.success('Despesa atualizada com sucesso!');
      
      // Auto refresh for real-time updates
      autoRefresh();
    } catch (error) {
      console.error('Error in updateExpense:', error);
      toast.error('Erro ao atualizar despesa');
    }
  };

  // Delete expense
  const deleteExpense = async (id: string) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      const { error } = await supabase
        .from('financial_transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
        .eq('transaction_type', 'expense');

      if (error) {
        console.error('Error deleting expense:', error);
        toast.error('Erro ao deletar despesa');
        return;
      }

      // Update local state
      setExpenses(prev => prev.filter(expense => expense.id !== id));
      toast.success('Despesa deletada com sucesso!');
      
      // Auto refresh for real-time updates
      autoRefresh();
    } catch (error) {
      console.error('Error in deleteExpense:', error);
      toast.error('Erro ao deletar despesa');
    }
  };

  // Get financial statistics
  const getFinancialStats = () => {
    const flightStats = getFlightStats();
    
    // Revenue = Base minimum (5.922.235 CR) + CR from real flights + additional revenues
    const baseRevenue = 5922235;
    const realFlightsCR = flightStats.totalCR || 0;
    const additionalRevenues = revenues.reduce((sum, revenue) => sum + revenue.amount, 0);
    const totalRevenue = baseRevenue + realFlightsCR + additionalRevenues;
    
    // Expenses from database
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Automatic calculation: Revenue - Expenses = Profit
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Calculate monthly values (current month)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyExpenses = expenses.filter(expense => {
      // Create date object from the date string (which is in YYYY-MM-DD format)
      // Using Date.UTC to avoid timezone conversion issues
      const [year, month, day] = expense.date.split('-').map(Number);
      const expenseDate = new Date(Date.UTC(year, month - 1, day));
      
      return expenseDate.getUTCMonth() === currentMonth && 
             expenseDate.getUTCFullYear() === currentYear;
    }).reduce((sum, expense) => sum + expense.amount, 0);

    const monthlyRevenue = totalRevenue; // For now, all revenue is considered current period
    const monthlyProfit = monthlyRevenue - monthlyExpenses;

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin,
      monthlyRevenue,
      monthlyExpenses,
      monthlyProfit,
      totalTransactions: expenses.length,
      totalRevenueTransactions: revenues.length,
      flightStats,
      baseRevenue,
      realFlightsCR,
      additionalRevenues
    };
  };

  return {
    expenses,
    revenues,
    transactions: expenses, // For compatibility
    isLoading,
    error,
    addExpense,
    addRevenue,
    addTransaction: addExpense, // For compatibility
    updateExpense,
    updateRevenue,
    updateTransaction: updateExpense, // For compatibility
    deleteExpense,
    deleteRevenue,
    deleteTransaction: deleteExpense, // For compatibility
    getFinancialStats,
    refresh: fetchTransactions,
  };
};