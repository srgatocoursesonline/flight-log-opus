import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  DollarSign, 
  Receipt, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Download,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { DetailedDRE } from './DetailedDRE';
import { FinancialOverview } from './FinancialOverview';
import { useSupabaseFinancialReports } from '@/hooks/supabase/useSupabaseFinancialReports';
import { formatCurrency, formatDate } from '@/lib/utils';

export const FinancialReports: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    transactions,
    dreData,
    isLoading,
    error,
    refresh,
    lastSync: lastUpdated
  } = useSupabaseFinancialReports();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExportData = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      transactions,
      dreData,
      summary: {
        totalRevenue: dreData?.totalRevenue || 0,
        totalExpenses: dreData?.totalExpenses || 0,
        netProfit: dreData?.netProfit || 0,
        profitMargin: dreData?.profitMargin || 0
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar dados financeiros: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{t('financialReports.title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('financialReports.subtitle')}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {t('financialReports.refresh')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportData}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {t('financialReports.export')}
          </Button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>{t('financialReports.updatedAt')}: {lastUpdated ? formatDate(lastUpdated) : t('common.loading')}</span>
        </div>
        <Badge variant="secondary" className="text-xs">
          {isLoading ? t('financialReports.syncing') : t('financialReports.synced')}
        </Badge>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-green-500" />
              Receita Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(dreData?.totalRevenue || 0)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Receipt className="h-4 w-4 mr-2 text-red-500" />
              Despesas Totais
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(dreData?.totalExpenses || 0)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-blue-500" />
              Lucro Líquido
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className={`text-2xl font-bold ${
                (dreData?.netProfit || 0) >= 0 ? 'text-blue-600' : 'text-red-600'
              }`}>
                {formatCurrency(dreData?.netProfit || 0)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingDown className="h-4 w-4 mr-2 text-purple-500" />
              Margem de Lucro
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold text-purple-600">
                {((dreData?.profitMargin || 0)).toFixed(1)}%
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">{t('financialReports.overview')}</TabsTrigger>
          <TabsTrigger value="dre">{t('financialReports.detailedDRE')}</TabsTrigger>
          <TabsTrigger value="transactions">{t('financialReports.transactions')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <FinancialOverview dreData={dreData} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="dre" className="space-y-6">
          <DetailedDRE dreData={dreData} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('financialReports.transactions')}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div>
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </div>
              ) : transactions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  {t('financial.noTransactions')}
                </p>
              ) : (
                <div className="space-y-3">
                  {transactions.slice(0, 10).map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div>
                        <div className="font-medium">
                          {transaction.description || transaction.category}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(transaction.date)} • {transaction.category}
                        </div>
                      </div>
                      <div className={`font-bold ${transaction.type === 'revenue' ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {transaction.type === 'revenue' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
