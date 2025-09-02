import React from 'react';
import { useSupabaseFinancial } from '@/hooks/supabase/useSupabaseFinancial';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const FinancialDebug = () => {
  const { 
    expenses, 
    revenues, 
    financialStats, 
    isLoading, 
    error, 
    refresh 
  } = useSupabaseFinancial();

  const handleRefresh = () => {
    console.log('=== FINANCIAL DEBUG - ANTES DO REFRESH ===');
    console.log('Expenses:', expenses);
    console.log('Revenues:', revenues);
    console.log('Financial Stats:', financialStats);
    console.log('Is Loading:', isLoading);
    console.log('Error:', error);
    
    refresh();
    
    setTimeout(() => {
      console.log('=== FINANCIAL DEBUG - APÓS O REFRESH ===');
      console.log('Expenses:', expenses);
      console.log('Revenues:', revenues);
      console.log('Financial Stats:', financialStats);
      console.log('Is Loading:', isLoading);
      console.log('Error:', error);
    }, 1000);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Debug do Sistema Financeiro</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleRefresh} className="w-full">
          Refresh Manual + Debug Console
        </Button>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded">
            <h3 className="font-semibold text-blue-800">Receitas</h3>
            <p className="text-2xl font-bold text-blue-600">{revenues.length}</p>
            <p className="text-sm text-blue-600">
              Total: {financialStats.totalRevenue.toFixed(2)} CR
            </p>
          </div>
          
          <div className="bg-red-50 p-4 rounded">
            <h3 className="font-semibold text-red-800">Despesas</h3>
            <p className="text-2xl font-bold text-red-600">{expenses.length}</p>
            <p className="text-sm text-red-600">
              Total: {financialStats.totalExpenses.toFixed(2)} CR
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded">
            <h3 className="font-semibold text-green-800">Lucro</h3>
            <p className={`text-2xl font-bold ${
              financialStats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {financialStats.netProfit.toFixed(2)} CR
            </p>
            <p className="text-sm text-green-600">
              Margem: {financialStats.profitMargin.toFixed(1)}%
            </p>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="font-semibold mb-2">Estado do Hook</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Loading: <span className={isLoading ? 'text-orange-600' : 'text-green-600'}>{isLoading ? 'Sim' : 'Não'}</span></div>
            <div>Error: <span className={error ? 'text-red-600' : 'text-green-600'}>{error || 'Nenhum'}</span></div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="font-semibold mb-2">Últimas Transações</h3>
          <div className="space-y-2">
            <div>
              <h4 className="font-medium text-green-700">Receitas ({revenues.length}):</h4>
              {revenues.slice(0, 3).map(revenue => (
                <div key={revenue.id} className="text-sm text-gray-600">
                  {revenue.description}: {revenue.amount} CR ({revenue.date})
                </div>
              ))}
            </div>
            <div>
              <h4 className="font-medium text-red-700">Despesas ({expenses.length}):</h4>
              {expenses.slice(0, 3).map(expense => (
                <div key={expense.id} className="text-sm text-gray-600">
                  {expense.description}: {expense.amount} CR ({expense.date})
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialDebug;