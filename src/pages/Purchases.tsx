import { ShoppingCart, Package, TrendingUp, DollarSign } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const Purchases = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-6 pt-8 pb-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mobile-title gradient-title flex items-center">
            <ShoppingCart className="h-8 w-8 mr-3 text-primary" />
            {t('navigation.purchases')}
          </h1>
          <p className="text-readable-muted mt-1">
            Gerencie compras de combustível, equipamentos e suprimentos
          </p>
        </div>
        
        <Button>
          <ShoppingCart className="h-4 w-4 mr-2" />
          Nova Compra
        </Button>
      </div>

      {/* Cards de Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Gastos Este Mês
            </CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 45.230</div>
            <p className="text-xs text-readable-muted">
              +12% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pedidos Pendentes
            </CardTitle>
            <Package className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">
              Aguardando entrega
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Economia Mensal
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 3.450</div>
            <p className="text-xs text-muted-foreground">
              Através de negociações
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder Content */}
      <Card>
        <CardHeader>
          <CardTitle>Sistema de Compras</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <ShoppingCart className="h-16 w-16 mx-auto text-readable-muted mb-4" />
            <h3 className="text-lg font-semibold mb-2">Em Desenvolvimento</h3>
            <p className="text-readable-muted max-w-md mx-auto">
              O sistema completo de compras está sendo desenvolvido. 
              Em breve você poderá gerenciar todas as compras de combustível, 
              equipamentos e suprimentos para suas operações.
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

export default Purchases;