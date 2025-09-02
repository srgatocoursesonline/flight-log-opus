import React, { useState, useEffect, useCallback } from 'react';
import { useSupabaseFinancial } from '@/hooks/supabase/useSupabaseFinancial';
import { AddExpenseModal } from '@/components/financial/AddExpenseModal';
import { ExpensesList } from '@/components/financial/ExpensesList';
import { AddRevenueModal } from '@/components/financial/AddRevenueModal';
import { RevenuesList } from '@/components/financial/RevenuesList';
import { Button } from '@/components/ui/button';
import { Plus, Receipt, TrendingUp, DollarSign } from 'lucide-react';


const Financial = () => {
  const { financialStats, expenses, revenues } = useSupabaseFinancial();
  
  // Função para atualizar dados após transação
  const handleTransactionSuccess = useCallback(() => {
    // Força reload da página para garantir dados atualizados
    window.location.reload();
  }, []);
  
  // Estilos CSS responsivos
  const responsiveTextStyles = {
    '--responsive-font-min': '0.75rem',  // 12px
    '--responsive-font-max': '1.5rem',   // 24px
    '--responsive-font-scaler': '2vw'
  } as React.CSSProperties;
  
  // Receita baseada APENAS no CR dos voos reais que você lançar
  const currentRevenue = financialStats.totalRevenue;
  const currentExpenses = financialStats.totalExpenses;
  const currentProfit = financialStats.netProfit;
  const profitMargin = financialStats.profitMargin;
  
  const formatCR = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-6" style={responsiveTextStyles}>
      <div className="flex flex-col gap-2 fade-in">
        <h1 className="text-3xl font-bold tracking-tight gradient-title">
          Gestão Financeira
        </h1>
        <p className="text-muted-foreground">
          Controle seus custos operacionais e receitas de CR (Career Rating).
        </p>
      </div>
      

      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="hud-display stats-card fade-in p-4">
          <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-medium text-foreground" style={{ fontSize: 'clamp(var(--responsive-font-min), var(--responsive-font-scaler), 0.875rem)' }}>Receita Total (CR)</h3>
            <span className="text-success text-2xl">↗</span>
          </div>
          <p className="text-xl font-bold text-success">{
            // Usar clamp para tamanho de fonte responsivo
            <span style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.5rem)' }}>
              {formatCR(currentRevenue)} CR
            </span>
          }</p>
          <div className="text-xs text-muted-foreground">
            <div className="flex flex-wrap gap-2">
              <div className="truncate flex-1 min-w-0" title={`Base: ${formatCR(financialStats.baseRevenue)} CR`}>
                Base: {formatCR(financialStats.baseRevenue)} CR
              </div>
              <div className="truncate flex-1 min-w-0" title={`Voos: ${financialStats.flightStats.totalFlights} (${formatCR(financialStats.realFlightsCR)} CR)`}>
                Voos: {financialStats.flightStats.totalFlights} ({formatCR(financialStats.realFlightsCR)} CR)
              </div>
            </div>
            <div className="truncate mt-1" title={`Receitas: ${financialStats.totalRevenueTransactions} (${formatCR(financialStats.additionalRevenues)} CR)`}>
              Receitas: {financialStats.totalRevenueTransactions} ({formatCR(financialStats.additionalRevenues)} CR)
            </div>
          </div>
        </div>
        
        <div className="hud-display stats-card fade-in p-4" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-foreground" style={{ fontSize: 'clamp(var(--responsive-font-min), var(--responsive-font-scaler), 0.875rem)' }}>Custos Totais (CR)</h3>
            <span className="text-destructive text-2xl">↘</span>
          </div>
          <p className="text-xl font-bold text-destructive">{
            // Usar clamp para tamanho de fonte responsivo
            <span style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.5rem)' }}>
              {formatCR(currentExpenses)} CR
            </span>
          }</p>
          <p className="text-xs text-muted-foreground truncate" title={currentExpenses > 0 ? `${financialStats.totalTransactions} despesas` : 'Nenhuma despesa registrada'}>
            {currentExpenses > 0 ? `${financialStats.totalTransactions} despesas` : 'Nenhuma despesa registrada'}
          </p>
        </div>
        
        <div className="hud-display stats-card fade-in p-4" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-foreground" style={{ fontSize: 'clamp(var(--responsive-font-min), var(--responsive-font-scaler), 0.875rem)' }}>Lucro Líquido (CR)</h3>
            <span className={`text-2xl ${currentProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
              {currentProfit >= 0 ? '↗' : '↘'}
            </span>
          </div>
          <p className={`text-xl font-bold ${currentProfit >= 0 ? 'text-success' : 'text-destructive'}`}>{
            // Usar clamp para tamanho de fonte responsivo
            <span style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.5rem)' }}>
              {formatCR(currentProfit)} CR
            </span>
          }</p>
          <p className="text-xs text-muted-foreground">Receita - Despesas = Lucro</p>
        </div>
        
        <div className="hud-display stats-card fade-in p-4" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-foreground" style={{ fontSize: 'clamp(var(--responsive-font-min), var(--responsive-font-scaler), 0.875rem)' }}>Margem de Lucro</h3>
            <span className="text-accent text-2xl">📊</span>
          </div>
          <p className="text-xl font-bold text-success">{
            // Usar clamp para tamanho de fonte responsivo
            <span style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.5rem)' }}>
              {profitMargin.toFixed(1)}%
            </span>
          }</p>
          <p className="text-xs text-muted-foreground truncate" title={currentRevenue > 0 ? 'Margem excelente' : 'Registre voos para calcular'}>
            {currentRevenue > 0 ? 'Margem excelente' : 'Registre voos para calcular'}
          </p>
        </div>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sistema de Lançamento de Receitas */}
        <div className="hud-display fade-in p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              Lançamento de Receitas
            </h3>
            <AddRevenueModal 
              trigger={
                <Button variant="hud" size="sm" className="icon-hover">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Receita
                </Button>
              }
              onSuccess={handleTransactionSuccess}
            />
          </div>
          
          <RevenuesList onTransactionSuccess={handleTransactionSuccess} />
        </div>
        
        {/* Sistema de Lançamento de Despesas */}
        <div className="hud-display fade-in p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Lançamento de Despesas
            </h3>
            <AddExpenseModal 
              trigger={
                <Button variant="hud" size="sm" className="icon-hover">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Despesa
                </Button>
              }
              onSuccess={handleTransactionSuccess}
            />
          </div>
          
          <ExpensesList onTransactionSuccess={handleTransactionSuccess} />
        </div>
        
        {/* Resumo por Categoria */}
        <div className="hud-display fade-in p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-success" />
            Resumo de Performance
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 bg-muted/20 rounded-lg">
              <div>
                <p className="font-medium text-foreground text-sm">CR Médio por Voo</p>
                <p className="text-xs text-muted-foreground">Performance média</p>
              </div>
              <span className="font-bold text-primary text-sm">
                {financialStats.flightStats.totalFlights > 0 ? formatCR(Math.round(financialStats.realFlightsCR / financialStats.flightStats.totalFlights)) : '0'} CR
              </span>
            </div>
            
            <div className="flex items-center justify-between p-2 bg-muted/20 rounded-lg">
              <div>
                <p className="font-medium text-foreground text-sm">Total de Voos</p>
                <p className="text-xs text-muted-foreground">Missões completadas</p>
              </div>
              <span className="font-bold text-accent text-sm">{financialStats.flightStats.totalFlights}</span>
            </div>
            
            <div className="flex items-center justify-between p-2 bg-muted/20 rounded-lg">
              <div>
                <p className="font-medium text-foreground text-sm">Horas de Voo</p>
                <p className="text-xs text-muted-foreground">Tempo total em operação</p>
              </div>
              <span className="font-bold text-info text-sm">{financialStats.flightStats.totalFlightTime}h</span>
            </div>
            
            <div className="flex items-center justify-between p-2 bg-muted/20 rounded-lg">
              <div>
                <p className="font-medium text-foreground text-sm">Receitas Extras</p>
                <p className="text-xs text-muted-foreground">{financialStats.totalRevenueTransactions} registros</p>
              </div>
              <span className="font-bold text-success text-sm">
                {financialStats.additionalRevenues > 0 ? `+${formatCR(financialStats.additionalRevenues)}` : '0'} CR
              </span>
            </div>
            
            <div className="flex items-center justify-between p-2 bg-muted/20 rounded-lg">
              <div>
                <p className="font-medium text-foreground text-sm">Total de Despesas</p>
                <p className="text-xs text-muted-foreground">{financialStats.totalTransactions} registros</p>
              </div>
              <span className="font-bold text-destructive text-sm">
                {currentExpenses > 0 ? `-${formatCR(currentExpenses)}` : '0'} CR
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Status Atual */}
      <div className="hud-display fade-in p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">💼</span>
          <h3 className="text-lg font-semibold text-foreground">Status Financeiro Atual</h3>
        </div>
        
        <div className="grid gap-4 md:grid-cols-3">
          <div className={`text-center p-4 rounded-lg border ${
            currentProfit >= 0 
              ? 'bg-success/10 border-success/20' 
              : 'bg-destructive/10 border-destructive/20'
          }`}>
            <p className="text-2xl mb-2">{currentProfit >= 0 ? '🟢' : '🔴'}</p>
            <p className={`font-bold ${
              currentProfit >= 0 ? 'text-success' : 'text-destructive'
            }`}>
              {currentProfit >= 0 ? 'Situação Positiva' : 'Situação Negativa'}
            </p>
            <p className="text-sm text-muted-foreground">
              {currentProfit >= 0 
                ? (currentExpenses > 0 ? 'Lucro líquido positivo' : 'Sem despesas registradas')
                : 'Despesas superam receitas'
              }
            </p>
          </div>
          
          <div className="text-center p-4 bg-info/10 rounded-lg border border-info/20">
            <p className="text-2xl mb-2">📊</p>
            <p className="font-bold text-info">CR: {formatCR(financialStats.realFlightsCR)}</p>
            <p className="text-sm text-muted-foreground">
              {financialStats.realFlightsCR > 0 ? 'Career Rating dos seus voos' : 'Registre voos para acumular CR'}
            </p>
          </div>
          
          <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-2xl mb-2">🎯</p>
            <p className="font-bold text-primary">
              {currentRevenue > 0 ? 'Sistema Ativo' : 'Pronto para Usar'}
            </p>
            <p className="text-sm text-muted-foreground">
              {currentRevenue > 0 ? 'Receita sendo calculada automaticamente' : 'Lance seus voos e a receita será calculada'}
            </p>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground leading-relaxed">
            💡 <strong>Como funciona:</strong> Você tem uma base de {formatCR(financialStats.baseRevenue)} CR. 
            Quando registrar voos com status "completo", o CR desses voos será somado à base. 
            Receita Total = {formatCR(financialStats.baseRevenue)} CR (base) + CR dos seus voos reais.
            <br />
            <strong>Receitas:</strong> Além dos voos, use o sistema de receitas para registrar renda passiva e outras fontes.
            <br />
            <strong>Despesas:</strong> Use o sistema de lançamento acima para registrar seus custos operacionais.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Financial;