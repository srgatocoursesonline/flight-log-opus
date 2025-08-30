import { useState, useEffect } from 'react';
import { useFlights } from './useFlights';
import { autoRefresh } from '@/utils/autoRefresh';

export interface Transaction {
  id: string;
  type: 'revenue' | 'expense';
  description: string;
  amount: number;
  date: string;
  category: string;
}

const STORAGE_KEY = 'msfs-financial-expenses';
const REVENUE_STORAGE_KEY = 'msfs-financial-revenues';

export const useFinancial = () => {
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [revenues, setRevenues] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getFlightStats } = useFlights();

  // Carregar despesas e receitas do localStorage
  useEffect(() => {
    try {
      const savedExpenses = localStorage.getItem(STORAGE_KEY);
      if (savedExpenses) {
        setExpenses(JSON.parse(savedExpenses));
      }
      
      const savedRevenues = localStorage.getItem(REVENUE_STORAGE_KEY);
      if (savedRevenues) {
        setRevenues(JSON.parse(savedRevenues));
      }
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Salvar receitas no localStorage
  const saveRevenues = (newRevenues: Transaction[]) => {
    try {
      localStorage.setItem(REVENUE_STORAGE_KEY, JSON.stringify(newRevenues));
      setRevenues(newRevenues);
    } catch (error) {
      console.error('Erro ao salvar receitas:', error);
    }
  };

  // Salvar despesas no localStorage
  const saveExpenses = (newExpenses: Transaction[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newExpenses));
      setExpenses(newExpenses);
    } catch (error) {
      console.error('Erro ao salvar despesas:', error);
    }
  };

  const addRevenue = (revenue: Omit<Transaction, 'id' | 'type'>) => {
    const newRevenue: Transaction = {
      ...revenue,
      id: Date.now().toString(),
      type: 'revenue'
    };
    const updatedRevenues = [newRevenue, ...revenues];
    saveRevenues(updatedRevenues);
    
    // Refresh automático após adicionar receita
    autoRefresh();
  };

  const updateRevenue = (id: string, updates: Partial<Transaction>) => {
    const updatedRevenues = revenues.map(revenue =>
      revenue.id === id ? { ...revenue, ...updates } : revenue
    );
    saveRevenues(updatedRevenues);
    
    // Refresh automático após atualizar receita
    autoRefresh();
  };

  const deleteRevenue = (id: string) => {
    const updatedRevenues = revenues.filter(revenue => revenue.id !== id);
    saveRevenues(updatedRevenues);
    
    // Refresh automático após excluir receita
    autoRefresh();
  };

  const addExpense = (expense: Omit<Transaction, 'id' | 'type'>) => {
    const newExpense: Transaction = {
      ...expense,
      id: Date.now().toString(),
      type: 'expense'
    };
    const updatedExpenses = [newExpense, ...expenses];
    saveExpenses(updatedExpenses);
    
    // Refresh automático após adicionar despesa
    autoRefresh();
  };

  const updateExpense = (id: string, updates: Partial<Transaction>) => {
    const updatedExpenses = expenses.map(expense =>
      expense.id === id ? { ...expense, ...updates } : expense
    );
    saveExpenses(updatedExpenses);
    
    // Refresh automático após atualizar despesa
    autoRefresh();
  };

  const deleteExpense = (id: string) => {
    const updatedExpenses = expenses.filter(expense => expense.id !== id);
    saveExpenses(updatedExpenses);
    
    // Refresh automático após excluir despesa
    autoRefresh();
  };

  const getFinancialStats = () => {
    const flightStats = getFlightStats();
    
    // Receita = Base mínima (5.922.235 CR) + CR dos voos reais + receitas lançadas
    const baseRevenue = 5922235;
    const realFlightsCR = flightStats.totalCR || 0;
    const additionalRevenues = revenues.reduce((sum, revenue) => sum + revenue.amount, 0);
    const totalRevenue = baseRevenue + realFlightsCR + additionalRevenues;
    
    // Despesas do localStorage
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Cálculo automático: Receita - Despesas = Lucro
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Calcular valores mensais (último mês)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && 
             expenseDate.getFullYear() === currentYear;
    }).reduce((sum, expense) => sum + expense.amount, 0);

    const monthlyRevenue = totalRevenue; // Por enquanto, toda receita é considerada do período atual
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
    transactions: expenses, // Para compatibilidade
    isLoading,
    addExpense,
    addRevenue,
    addTransaction: addExpense, // Para compatibilidade
    updateExpense,
    updateRevenue,
    updateTransaction: updateExpense, // Para compatibilidade
    deleteExpense,
    deleteRevenue,
    deleteTransaction: deleteExpense, // Para compatibilidade
    getFinancialStats
  };
};