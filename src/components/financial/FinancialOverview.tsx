import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  DollarSign, 
  Receipt, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Target,
  PieChart
} from 'lucide-react';
import { DREData } from '@/hooks/supabase/useSupabaseFinancialReports';
import { formatCurrency } from '@/lib/utils';

interface FinancialOverviewProps {
  dreData: DREData | null;
  isLoading?: boolean;
}

export const FinancialOverview: React.FC<FinancialOverviewProps> = ({ dreData, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!dreData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">Nenhum dado financeiro disponível para visualização.</p>
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
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Receita */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center text-muted-foreground">
              <DollarSign className="h-4 w-4 mr-2 text-green-500" />
              Receita Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Entradas consolidadas
            </p>
          </CardContent>
        </Card>

        {/* Despesas */}
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center text-muted-foreground">
              <Receipt className="h-4 w-4 mr-2 text-red-500" />
              Despesas Totais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Saídas consolidadas
            </p>
          </CardContent>
        </Card>

        {/* Lucro Líquido */}
        <Card className={`border-l-4 ${netProfit >= 0 ? 'border-l-blue-500' : 'border-l-red-500'}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center text-muted-foreground">
              {netProfit >= 0 ? (
                <TrendingUp className="h-4 w-4 mr-2 text-blue-500" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-2 text-red-500" />
              )}
              Resultado Líquido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {formatCurrency(netProfit)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Lucro/Prejuízo do período
            </p>
          </CardContent>
        </Card>

        {/* Margem */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center text-muted-foreground">
              <Target className="h-4 w-4 mr-2 text-purple-500" />
              Margem de Lucro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {profitMargin.toFixed(1)}%
            </div>
            <Progress 
              value={Math.max(0, Math.min(100, profitMargin))} 
              className="h-1 mt-2 bg-purple-100" 
            />
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de Composição */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Receitas por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <PieChart className="h-5 w-5 mr-2 text-green-500" />
              Composição de Receitas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueByCategory.length > 0 ? (
                revenueByCategory.map((category) => (
                  <div key={category.category} className="space-y-1">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium flex items-center">
                        <span className="mr-2 text-lg">{category.icon || '💰'}</span>
                        {category.category}
                      </span>
                      <span className="font-bold text-green-600">
                        {formatCurrency(category.amount)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={category.percentage} 
                        className="h-2 bg-green-100 flex-1"
                      />
                      <span className="text-xs text-muted-foreground w-12 text-right">
                        {category.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mb-2 opacity-20" />
                  <p>Sem dados de receita para o período</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Despesas por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <PieChart className="h-5 w-5 mr-2 text-red-500" />
              Composição de Despesas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expensesByCategory.length > 0 ? (
                expensesByCategory.map((category) => (
                  <div key={category.category} className="space-y-1">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium flex items-center">
                        <span className="mr-2 text-lg">{category.icon || '💸'}</span>
                        {category.category}
                      </span>
                      <span className="font-bold text-red-600">
                        {formatCurrency(category.amount)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={category.percentage} 
                        className="h-2 bg-red-100 flex-1"
                      />
                      <span className="text-xs text-muted-foreground w-12 text-right">
                        {category.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mb-2 opacity-20" />
                  <p>Sem dados de despesa para o período</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
