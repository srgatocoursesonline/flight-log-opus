import { BarChart3, FileText, Download, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSupabaseFinancial } from "@/hooks/supabase/useSupabaseFinancial";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useSupabaseExpenseCategories } from "@/hooks/supabase/useSupabaseExpenseCategories";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Tooltip as PieTooltip, ResponsiveContainer as PieContainer, LineChart, Line } from 'recharts';

const FinancialReports = () => {
  const { t } = useTranslation();
  const { transactions, totalRevenue, totalExpenses, profit, loading } = useSupabaseFinancial();
  const { categories: expenseCategories } = useSupabaseExpenseCategories();

  // Preparar dados para gráfico
  const mockTransactions = [
    { id: '1', type: 'revenue', description: 'Venda de voo', amount: 1500, date: '2024-10-01', category: 'voos' },
    { id: '2', type: 'expense', description: 'Combustível', amount: 800, date: '2024-10-05', category: 'combustivel' },
    { id: '3', type: 'revenue', description: 'Serviço adicional', amount: 500, date: '2024-09-15', category: 'servicos' },
    { id: '4', type: 'expense', description: 'Manutenção', amount: 1200, date: '2024-09-20', category: 'manutencao' },
  ];
  const effectiveTransactions = transactions?.length > 0 ? transactions : mockTransactions;
  const chartData = effectiveTransactions.reduce((acc, transaction) => {
    const month = format(new Date(transaction.date), 'MMM yyyy', { locale: ptBR });
    const existing = acc.find(item => item.month === month);
    if (existing) {
      if (transaction.type === 'revenue') existing.revenue += transaction.amount;
      else existing.expenses += Math.abs(transaction.amount);
    } else {
      acc.push({
        month,
        revenue: transaction.type === 'revenue' ? transaction.amount : 0,
        expenses: transaction.type === 'expense' ? Math.abs(transaction.amount) : 0
      });
    }
    return acc;
  }, []) || [];

  // Dados para gráfico de pizza de despesas por categoria
  const expenseByCategory = effectiveTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const catName = expenseCategories.find(c => c.id === t.category)?.name || 'Outros';
      acc[catName] = (acc[catName] || 0) + Math.abs(t.amount);
      return acc;
    }, {}) || {};

  const pieData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

  // Adicionar profit ao chartData para gráfico de linha
  const enhancedChartData = chartData.map(item => ({
    ...item,
    profit: item.revenue - item.expenses
  }));

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="container mx-auto px-6 pt-8 pb-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mobile-title gradient-title flex items-center">
            <BarChart3 className="h-8 w-8 mr-3 text-primary" />
            {t('navigation.financialReports')}
          </h1>
          <p className="text-readable-muted mt-1">
            Relatórios detalhados e análises financeiras das operações
          </p>
        </div>
        
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Exportar Relatório
        </Button>
      </div>

      {/* Cards de Relatórios Disponíveis */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Relatório Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-readable-muted mb-3">
              Resumo completo das receitas e despesas do mês
            </p>
            <Badge variant="outline">Disponível</Badge>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
              Análise de Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Métricas de performance financeira e operacional
            </p>
            <Badge variant="outline">Disponível</Badge>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Calendar className="h-5 w-5 mr-2 text-purple-600" />
              Relatório Anual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Balanço anual completo com projeções
            </p>
            <Badge variant="secondary">Em breve</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Resumo Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">R$ 125.430</div>
            <p className="text-xs text-readable-muted">Receita Total</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">R$ 89.230</div>
            <p className="text-xs text-readable-muted">Despesas Totais</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">R$ 36.200</div>
            <p className="text-xs text-readable-muted">Lucro Líquido</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">28.9%</div>
            <p className="text-xs text-readable-muted">Margem de Lucro</p>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder Content */}
      <Card>
        <CardHeader>
          <CardTitle>Sistema de Relatórios Financeiros</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Seção DRE */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Demonstração do Resultado do Exercício (DRE)</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Receita Total:</span>
                <span className="font-bold">R$ {(totalRevenue ?? 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Despesas Totais:</span>
                <span className="font-bold text-red-600">R$ {(totalExpenses ?? 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span>Lucro Líquido:</span>
                <span className="font-bold text-green-600">R$ {(profit ?? 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Gráfico de Comparação */}
          <div className="h-[400px] mb-8">
            <h3 className="text-xl font-semibold mb-4">Comparação Receita vs Despesa</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" name="Receita" fill="#22c55e" />
                <Bar dataKey="expenses" name="Despesa" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Relatório de Fluxo de Caixa */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Fluxo de Caixa Simplificado</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Entradas (Receitas):</span>
                <span className="font-bold text-green-600">R$ {(totalRevenue ?? 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Saídas (Despesas):</span>
                <span className="font-bold text-red-600">R$ {(totalExpenses ?? 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span>Fluxo Líquido:</span>
                <span className="font-bold">R$ {((totalRevenue ?? 0) - (totalExpenses ?? 0)).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Balanço Patrimonial Simplificado */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Balanço Patrimonial Simplificado</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Ativos (Receitas Acumuladas):</span>
                <span className="font-bold">R$ {(totalRevenue ?? 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Passivos (Despesas):</span>
                <span className="font-bold">R$ {(totalExpenses ?? 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span>Patrimônio Líquido:</span>
                <span className="font-bold">R$ {(profit ?? 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Gráfico de Pizza */}
          <div className="h-[400px] mb-8">
            <h3 className="text-xl font-semibold mb-4">Despesas por Categoria</h3>
            <PieContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <PieTooltip />
              </PieChart>
            </PieContainer>
          </div>

          {/* Gráfico de Linha Evolução Mensal */}
          <div className="h-[400px] mb-8">
            <h3 className="text-xl font-semibold mb-4">Evolução Mensal do Lucro</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={enhancedChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="profit" name="Lucro" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialReports;