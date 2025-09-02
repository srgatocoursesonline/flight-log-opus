import { useState, useEffect } from 'react';
import { useFlights } from './useFlights';
import { useFinancialSettings } from './useFinancialSettings';

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
  };

  const updateRevenue = (id: string, updates: Partial<Transaction>) => {
    const updatedRevenues = revenues.map(revenue =>
      revenue.id === id ? { ...revenue, ...updates } : revenue
    );
    saveRevenues(updatedRevenues);
  };

  const deleteRevenue = (id: string) => {
    const updatedRevenues = revenues.filter(revenue => revenue.id !== id);
    saveRevenues(updatedRevenues);
  };

  const addExpense = (expense: Omit<Transaction, 'id' | 'type'>) => {
    const newExpense: Transaction = {
      ...expense,
      id: Date.now().toString(),
      type: 'expense'
    };
    const updatedExpenses = [newExpense, ...expenses];
    saveExpenses(updatedExpenses);
  };

  const updateExpense = (id: string, updates: Partial<Transaction>) => {
    const updatedExpenses = expenses.map(expense =>
      expense.id === id ? { ...expense, ...updates } : expense
    );
    saveExpenses(updatedExpenses);
  };

  const deleteExpense = (id: string) => {
    const updatedExpenses = expenses.filter(expense => expense.id !== id);
    saveExpenses(updatedExpenses);
  };

  const getFinancialStats = () => {
    const flightStats = getFlightStats();
    const { getInitialBalance } = useFinancialSettings();
    
    // Receita = Valor inicial configurável + CR dos voos reais + receitas lançadas
    const baseRevenue = getInitialBalance();
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