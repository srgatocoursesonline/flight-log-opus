import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, DollarSign, Receipt, Target, Activity } from 'lucide-react';
import { DREData } from '@/hooks/supabase/useSupabaseFinancialReports';
import { formatCurrency } from '@/lib/utils';

interface DREStatementProps {
  dreData: DREData | null;
  isLoading?: boolean;
}

export const DREStatement: React.FC<DREStatementProps> = ({ dreData, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Demonstrativo de Resultados (DRE)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!dreData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Demonstrativo de Resultados (DRE)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Nenhum dado financeiro disponível.</p>
        </CardContent>
      </Card>
    );
  }

  const {
    totalRevenue,
    totalExpenses,
    netProfit,
    profitMargin,
    revenueByCategory,
    expensesByCategory
  } = dreData;

  return (
    <div className="space-y-6">
      {/* Resumo Executivo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Demonstrativo de Resultados (DRE)
            </span>
            <Badge 
              variant={netProfit >= 0 ? "default" : "destructive"}
              className="text-sm"
            >
              {netProfit >= 0 ? 'Lucro' : 'Prejuízo'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Receita Total */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center">
                  <DollarSign className="h-4 w-4 mr-1 text-green-500" />
                  Receita Total
                </span>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalRevenue)}
              </div>
            </div>

            {/* Despesas Totais */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center">
                  <Receipt className="h-4 w-4 mr-1 text-red-500" />
                  Despesas Totais
                </span>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </div>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(totalExpenses)}
              </div>
            </div>

            {/* Lucro Líquido */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center">
                  <Target className="h-4 w-4 mr-1 text-blue-500" />
                  Lucro Líquido
                </span>
                <Badge 
                  variant={netProfit >= 0 ? "default" : "destructive"}
                  className="text-xs"
                >
                  {profitMargin.toFixed(1)}%
                </Badge>
              </div>
              <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {formatCurrency(netProfit)}
              </div>
            </div>
          </div>

          {/* Barra de Progresso da Margem */}
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Margem de Lucro</span>
              <span>{profitMargin.toFixed(1)}%</span>
            </div>
            <Progress 
              value={Math.abs(profitMargin)} 
              className={`${netProfit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Detalhamento por Categoria */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Receitas por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-green-500" />
              Receitas por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {revenueByCategory.map((category) => (
                <div key={category.category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium flex items-center">
                      <span className="mr-2">{category.icon || '📊'}</span>
                      {category.category}
                    </span>
                    <span className="text-sm font-bold text-green-600">
                      {formatCurrency(category.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{category.percentage.toFixed(1)}% do total</span>
                  </div>
                  <Progress 
                    value={category.percentage} 
                    className="h-2 bg-green-100"
                  />
                </div>
              ))}
              {revenueByCategory.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma receita registrada
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Despesas por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Receipt className="h-4 w-4 mr-2 text-red-500" />
              Despesas por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expensesByCategory.map((category) => (
                <div key={category.category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium flex items-center">
                      <span className="mr-2">{category.icon || '📊'}</span>
                      {category.category}
                    </span>
                    <span className="text-sm font-bold text-red-600">
                      {formatCurrency(category.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{category.percentage.toFixed(1)}% do total</span>
                  </div>
                  <Progress 
                    value={category.percentage} 
                    className="h-2 bg-red-100"
                  />
                </div>
              ))}
              {expensesByCategory.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma despesa registrada
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estrutura DRE Detalhada */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Estrutura Detalhada do DRE</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Receita Bruta */}
            <div className="border-b pb-2">
              <div className="flex justify-between font-semibold">
                <span>RECEITA BRUTA</span>
                <span className="text-green-600">{formatCurrency(totalRevenue)}</span>
              </div>
            </div>

            {/* Deduções */}
            <div className="border-b pb-2">
              <div className="flex justify-between">
                <span className="ml-4">(-) Despesas Operacionais</span>
                <span className="text-red-600">-{formatCurrency(totalExpenses)}</span>
              </div>
            </div>

            {/* Resultado Líquido */}
            <div className="border-b pb-2">
              <div className="flex justify-between font-bold text-lg">
                <span>LUCRO LÍQUIDO DO PERÍODO</span>
                <span className={netProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {formatCurrency(netProfit)}
                </span>
              </div>
            </div>

            {/* Indicadores */}
            <div className="grid grid-cols-2 gap-4 pt-4 text-sm">
              <div>
                <span className="text-muted-foreground">Margem de Lucro: </span>
                <span className="font-semibold">{profitMargin.toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-muted-foreground">Ponto de Equilíbrio: </span>
                <span className="font-semibold">
                  {formatCurrency(totalRevenue > 0 ? totalExpenses : 0)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};