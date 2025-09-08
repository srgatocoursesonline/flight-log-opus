import { ShoppingCart, Package, TrendingUp, DollarSign, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NewPurchaseModal, NewPurchaseModalRef } from "@/components/financial/NewPurchaseModal";
import { useRef } from "react";

const Purchases = () => {
  const { t } = useTranslation();
  const newPurchaseModalRef = useRef<NewPurchaseModalRef>(null);

  const handleNewPurchase = () => {
    newPurchaseModalRef.current?.openModal();
  };

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
        
        <Button onClick={handleNewPurchase}>
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
            <div className="text-2xl font-bold">R$ 0,00</div>
            <p className="text-xs text-readable-muted">
              Sem gastos registrados
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
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Nenhum pedido pendente
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
            <div className="text-2xl font-bold">R$ 0,00</div>
            <p className="text-xs text-muted-foreground">
              Aguardando primeiras compras
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Compras Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Compras Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <ShoppingCart className="h-12 w-12 mx-auto text-readable-muted mb-3" />
            <h3 className="text-lg font-semibold mb-2">Sistema de Compras Ativo</h3>
            <p className="text-readable-muted max-w-md mx-auto mb-4">
              Clique em "Nova Compra" para registrar compras de combustível, 
              equipamentos e suprimentos para suas operações.
            </p>
            <Button onClick={handleNewPurchase} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Primeira Compra
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Nova Compra */}
      <NewPurchaseModal 
        ref={newPurchaseModalRef}
        onSuccess={() => {
          // Recarregar dados ou atualizar lista
        }}
      />
    </div>
  );
};

export default Purchases;