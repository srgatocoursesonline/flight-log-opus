import { Wrench, AlertTriangle, Calendar, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const Maintenance = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-6 pt-8 pb-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mobile-title gradient-title flex items-center">
            <Wrench className="h-8 w-8 mr-3 text-primary" />
            {t('navigation.maintenance')}
          </h1>
          <p className="text-readable-muted mt-1">
            Gerencie a manutenção de suas aeronaves e equipamentos
          </p>
        </div>
        
        <Button>
          <Wrench className="h-4 w-4 mr-2" />
          Nova Manutenção
        </Button>
      </div>

      {/* Cards de Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20 stats-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">
              Manutenções Pendentes
            </CardTitle>
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700 dark:text-red-300">3</div>
            <p className="text-xs text-red-600/70 dark:text-red-400/70">
              Requerem atenção
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20 stats-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
              Concluídas Este Mês
            </CardTitle>
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">12</div>
            <p className="text-xs text-green-600/70 dark:text-green-400/70">
              +20% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-950/20 stats-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
              Próxima Manutenção
            </CardTitle>
            <Calendar className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">5 dias</div>
            <p className="text-xs text-yellow-600/70 dark:text-yellow-400/70">
              A320neo - 100h check
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder Content */}
      <Card>
        <CardHeader>
          <CardTitle>Sistema de Manutenção</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Wrench className="h-16 w-16 mx-auto text-readable-muted mb-4" />
            <h3 className="text-lg font-semibold mb-2">Em Desenvolvimento</h3>
            <p className="text-readable-muted max-w-md mx-auto">
              O sistema completo de manutenção está sendo desenvolvido. 
              Em breve você poderá gerenciar todas as manutenções de suas aeronaves.
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

export default Maintenance;