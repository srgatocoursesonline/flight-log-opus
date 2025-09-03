import { BarChart3, FileText, Download, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const FinancialReports = () => {
  const { t } = useTranslation();

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
          <div className="text-center py-12">
            <BarChart3 className="h-16 w-16 mx-auto text-readable-muted mb-4" />
            <h3 className="text-lg font-semibold mb-2">Em Desenvolvimento</h3>
            <p className="text-readable-muted max-w-md mx-auto">
              O sistema completo de relatórios financeiros está sendo desenvolvido. 
              Em breve você terá acesso a relatórios detalhados, gráficos interativos 
              e análises avançadas de performance financeira.
            </p>
            <Badge variant="outline" className="mt-4">
              Disponível em breve
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialReports;