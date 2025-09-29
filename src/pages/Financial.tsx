import React, { useState, useEffect, useCallback } from 'react';
import { useSupabaseFinancial } from '@/hooks/supabase/useSupabaseFinancial';
import { AddExpenseModal } from '@/components/financial/AddExpenseModal';
import { ExpensesList } from '@/components/financial/ExpensesList';
import { AddRevenueModal } from '@/components/financial/AddRevenueModal';
import { RevenuesList } from '@/components/financial/RevenuesList';
import { Button } from '@/components/ui/button';
import { Plus, Receipt, TrendingUp, DollarSign, TrendingDown, BarChart3 } from 'lucide-react';

const Financial = () => {
  const { financialStats, expenses, revenues } = useSupabaseFinancial();
  
  // Aplicar zoom 90% ao entrar na página e restaurar ao sair
  useEffect(() => {
    const htmlEl = document.documentElement;
    const previousZoom = htmlEl.style.zoom;
    htmlEl.style.zoom = '0.9';
    return () => {
      htmlEl.style.zoom = previousZoom;
    };
  }, []);
  
  // Função para atualizar dados após transação
  const handleTransactionSuccess = useCallback(() => {
    // Força reload da página para garantir dados atualizados
    window.location.reload();
  }, []);
  
  // Receita total incluindo base inicial configurável + CR dos voos reais + receitas extras
  const currentRevenue = financialStats.totalRevenue;
  const currentExpenses = financialStats.totalExpenses;
  const currentProfit = financialStats.netProfit;
  const profitMargin = financialStats.profitMargin;
  
  const formatCR = (amount: number) => {
    return amount.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  return (
    <div className="mobile-container mobile-bottom-nav-padding mobile-page-layout pr-1">
      <div className="mobile-section mobile-fade-in">
        <h1 className="text-base font-bold gradient-title">
          Gestão Financeira
        </h1>
        <p className="text-xs text-readable-muted">
          Controle seus custos operacionais e receitas de CR (Career Rating).
        </p>
      </div>
      
      <div className="mobile-section">
        <div className="mobile-grid-4 gap-2 lg:gap-3">
          <div className="mobile-card mobile-slide-up stats-card">
            <div className="flex items-center justify-between">
              <h3 className="text-xs text-readable-muted uppercase tracking-wider font-medium">Receita Total (CR)</h3>
              <TrendingUp className="h-5 w-5 text-green-600 icon-hover" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-xs font-semibold text-green-600">
                {formatCR(currentRevenue)} CR
              </p>
            </div>
            <div className="text-xs text-readable-muted">
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
        
          <div className="mobile-card mobile-slide-up stats-card" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between">
              <h3 className="text-xs text-readable-muted uppercase tracking-wider font-medium">Custos Totais (CR)</h3>
              <TrendingDown className="h-5 w-5 text-red-600 icon-hover" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-xs font-semibold text-red-600">
                {formatCR(currentExpenses)} CR
              </p>
            </div>
            <p className="text-xs text-readable-muted truncate" title={currentExpenses > 0 ? `${financialStats.totalTransactions} despesas` : 'Nenhuma despesa registrada'}>
              {currentExpenses > 0 ? `${financialStats.totalTransactions} despesas` : 'Nenhuma despesa registrada'}
            </p>
          </div>
        
          <div className="mobile-card mobile-slide-up stats-card" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between">
              <h3 className="text-xs text-readable-muted uppercase tracking-wider font-medium">Lucro Líquido (CR)</h3>
              {currentProfit >= 0 ? 
                <TrendingUp className="h-5 w-5 text-green-600 icon-hover" /> : 
                <TrendingDown className="h-5 w-5 text-red-600 icon-hover" />
              }
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <p className={`text-xs font-semibold ${currentProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCR(currentProfit)} CR
              </p>
            </div>
            <p className="text-xs text-readable-muted">Receita - Despesas = Lucro</p>
          </div>
        
          <div className="mobile-card mobile-slide-up stats-card" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between">
              <h3 className="text-xs text-readable-muted uppercase tracking-wider font-medium">Margem de Lucro</h3>
              <BarChart3 className={`h-5 w-5 icon-hover ${profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <p className={`text-xs font-semibold ${profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {profitMargin.toFixed(1)}%
              </p>
            </div>
            <p className="text-xs text-readable-muted truncate" title={currentRevenue > 0 ? 'Margem excelente' : 'Registre voos para calcular'}>
              {currentRevenue > 0 ? 'Margem excelente' : 'Registre voos para calcular'}
            </p>
          </div>
        </div>
      </div>
      
      <div className="mobile-section">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2 lg:gap-3" style={{ scrollbarGutter: 'stable both-edges' }}>
          {/* Sistema de Lançamento de Receitas */}
          <div className="mobile-card mobile-fade-in stats-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-medium text-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600 icon-hover" />
                Lançamento de Receitas
              </h3>
              <AddRevenueModal 
                trigger={
                  <Button variant="hud" size="sm" className="icon-hover">
                    <Plus className="h-3 w-3 mr-1" />
                    Nova Receita
                  </Button>
                }
                onSuccess={handleTransactionSuccess}
              />
            </div>
            <RevenuesList onTransactionSuccess={handleTransactionSuccess} />
          </div>
          
          {/* Sistema de Lançamento de Despesas */}
          <div className="mobile-card mobile-fade-in stats-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-medium text-foreground flex items-center gap-2">
                <Receipt className="h-4 w-4 text-red-600 icon-hover" />
                Lançamento de Despesas
              </h3>
              <AddExpenseModal 
                trigger={
                  <Button variant="hud" size="sm" className="icon-hover">
                    <Plus className="h-3 w-3 mr-1" />
                    Nova Despesa
                  </Button>
                }
                onSuccess={handleTransactionSuccess}
              />
            </div>
            <ExpensesList onTransactionSuccess={handleTransactionSuccess} />
          </div>
          
          {/* Resumo de Performance */}
          <div className="mobile-card mobile-fade-in stats-card">
            <h3 className="text-xs font-medium text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600 icon-hover" />
              Resumo de Performance
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-muted/20 rounded-lg flight-item hover:bg-muted/30 transition-all duration-300">
                <div>
                  <p className="font-medium text-foreground text-sm">CR Médio por Voo</p>
                  <p className="text-xs text-readable-muted">Performance média</p>
                </div>
                <span className="font-bold text-primary text-sm">
                  {financialStats.flightStats.totalFlights > 0 ? formatCR(Math.round(financialStats.realFlightsCR / financialStats.flightStats.totalFlights)) : '0'} CR
                </span>
              </div>
              
              <div className="flex items-center justify-between p-2 bg-muted/20 rounded-lg flight-item hover:bg-muted/30 transition-all duration-300">
                <div>
                  <p className="font-medium text-foreground text-sm">Total de Voos</p>
                  <p className="text-xs text-readable-muted">Missões completadas</p>
                </div>
                <span className="font-bold text-blue-600 text-sm">{financialStats.flightStats.totalFlights}</span>
              </div>
              
              <div className="flex items-center justify-between p-2 bg-muted/20 rounded-lg flight-item hover:bg-muted/30 transition-all duration-300">
                <div>
                  <p className="font-medium text-foreground text-sm">Horas de Voo</p>
                  <p className="text-xs text-readable-muted">Tempo total em operação</p>
                </div>
                <span className="font-bold text-info text-sm">{financialStats.flightStats.totalFlightTime}h</span>
              </div>
              
              <div className="flex items-center justify-between p-2 bg-muted/20 rounded-lg flight-item hover:bg-muted/30 transition-all duration-300">
                <div>
                  <p className="font-medium text-foreground text-sm">Receitas Extras</p>
                  <p className="text-xs text-readable-muted">{financialStats.totalRevenueTransactions} registros</p>
                </div>
                <span className="font-bold text-green-600 text-sm">
                  {financialStats.additionalRevenues > 0 ? `+${formatCR(financialStats.additionalRevenues)}` : '0'} CR
                </span>
              </div>
              
              <div className="flex items-center justify-between p-2 bg-muted/20 rounded-lg flight-item hover:bg-muted/30 transition-all duration-300">
                <div>
                  <p className="font-medium text-foreground text-sm">Total de Despesas</p>
                  <p className="text-xs text-readable-muted">{financialStats.totalTransactions} registros</p>
                </div>
                <span className="font-bold text-red-600 text-sm">
                  {currentExpenses > 0 ? `-${formatCR(currentExpenses)}` : '0'} CR
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Status Atual */}
      <div className="hud-display financial-status-container financial-status-glow p-3 lg:p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm financial-emoji-bounce">💼</span>
          <h3 className="text-xs font-medium text-foreground">Status Financeiro Atual</h3>
        </div>
        
        <div className="grid gap-2 md:grid-cols-3">
          <div className={`financial-status-card text-center p-3 rounded-lg border ${
            currentProfit >= 0 
              ? 'bg-success/10 border-success/20 financial-status-pulse' 
              : 'bg-destructive/10 border-destructive/20'
          }`}>
            <p className="text-sm mb-1 financial-emoji-bounce">{currentProfit >= 0 ? '🟢' : '🔴'}</p>
            <p className={`font-bold ${
              currentProfit >= 0 ? 'text-success' : 'text-destructive'
            }`}>
              {currentProfit >= 0 ? 'Situação Positiva' : 'Situação Negativa'}
            </p>
            <p className="text-sm text-readable-muted">
              {currentProfit >= 0 
                ? (currentExpenses > 0 ? 'Lucro líquido positivo' : 'Sem despesas registradas')
                : 'Despesas superam receitas'
              }
            </p>
          </div>
          
          <div className="financial-status-card text-center p-3 bg-info/10 rounded-lg border border-info/20">
            <p className="text-sm mb-1 financial-emoji-bounce">📊</p>
            <p className="font-bold text-info">CR: {formatCR(financialStats.realFlightsCR)}</p>
            <p className="text-sm text-readable-muted">
              {financialStats.realFlightsCR > 0 ? 'Career Rating dos seus voos' : 'Registre voos para acumular CR'}
            </p>
          </div>
          
          <div className="financial-status-card text-center p-3 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-sm mb-1 financial-emoji-bounce">🎯</p>
            <p className="font-bold text-primary">
              {currentRevenue > 0 ? 'Sistema Ativo' : 'Pronto para Usar'}
            </p>
            <p className="text-sm text-readable-muted">
              {currentRevenue > 0 ? 'Receita sendo calculada automaticamente' : 'Lance seus voos e a receita será calculada'}
            </p>
          </div>
        </div>
        
        <div className="mt-3 text-center">
          <p className="text-xs text-readable-muted leading-relaxed">
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