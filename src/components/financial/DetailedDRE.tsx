import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronDown, ChevronRight, FileText } from 'lucide-react';
import { DREData } from '@/hooks/supabase/useSupabaseFinancialReports';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface DetailedDREProps {
  dreData: DREData | null;
  isLoading?: boolean;
}

export const DetailedDRE: React.FC<DetailedDREProps> = ({ dreData, isLoading }) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    revenue: true,
    expenses: true
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!dreData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">Nenhum dado financeiro disponível.</p>
        </CardContent>
      </Card>
    );
  }

  const {
    totalRevenue,
    totalExpenses,
    netProfit,
    revenueByCategory,
    expensesByCategory
  } = dreData;

  const Row = ({ 
    label, 
    value, 
    isHeader = false, 
    isTotal = false, 
    isSubItem = false,
    onToggle,
    isExpanded,
    colorClass = "",
    icon = null
  }: { 
    label: string, 
    value: number, 
    isHeader?: boolean, 
    isTotal?: boolean, 
    isSubItem?: boolean,
    onToggle?: () => void,
    isExpanded?: boolean,
    colorClass?: string,
    icon?: React.ReactNode
  }) => (
    <div className={cn(
      "flex items-center justify-between py-2 px-4 border-b hover:bg-muted/50 transition-colors",
      isHeader && "bg-muted/30 font-semibold",
      isTotal && "font-bold text-lg bg-muted/50",
      isSubItem && "pl-12 text-sm text-muted-foreground"
    )}>
      <div className="flex items-center gap-2">
        {onToggle && (
          <Button variant="ghost" size="icon" className="h-6 w-6 p-0" onClick={onToggle}>
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        )}
        {!onToggle && isSubItem && <div className="w-6" />}
        {icon && <span className="mr-2">{icon}</span>}
        <span>{label}</span>
      </div>
      <div className={cn("font-mono", colorClass)}>
        {formatCurrency(value)}
      </div>
    </div>
  );

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/10 border-b pb-4">
        <CardTitle className="flex items-center text-xl">
          <FileText className="h-5 w-5 mr-2" />
          Demonstrativo do Resultado do Exercício
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {/* Receita Operacional Bruta */}
          <Row 
            label="RECEITA OPERACIONAL BRUTA" 
            value={totalRevenue} 
            isHeader 
            onToggle={() => toggleSection('revenue')}
            isExpanded={expandedSections.revenue}
            colorClass="text-green-600"
          />
          
          {expandedSections.revenue && revenueByCategory.map((category) => (
            <Row 
              key={category.category}
              label={category.category}
              value={category.amount}
              isSubItem
              icon={category.icon}
            />
          ))}

          {/* Deduções e Impostos (Placeholder se necessário futuramente) */}
          
          {/* Receita Líquida */}
          <Row 
            label="(=) RECEITA LÍQUIDA" 
            value={totalRevenue} 
            isTotal
            colorClass="text-green-700"
          />

          {/* Custos e Despesas */}
          <Row 
            label="(-) CUSTOS E DESPESAS OPERACIONAIS" 
            value={totalExpenses} 
            isHeader 
            onToggle={() => toggleSection('expenses')}
            isExpanded={expandedSections.expenses}
            colorClass="text-red-600"
          />

          {expandedSections.expenses && expensesByCategory.map((category) => (
            <Row 
              key={category.category}
              label={category.category}
              value={category.amount}
              isSubItem
              icon={category.icon}
            />
          ))}

          {/* Resultado Operacional */}
          <Row 
            label="(=) RESULTADO OPERACIONAL" 
            value={netProfit} 
            isTotal
            colorClass={netProfit >= 0 ? "text-blue-600" : "text-red-600"}
          />

          {/* Resultado Líquido do Exercício */}
          <div className="mt-4 border-t-2 border-black">
            <Row 
              label="LUCRO/PREJUÍZO LÍQUIDO DO PERÍODO" 
              value={netProfit} 
              isTotal
              colorClass={netProfit >= 0 ? "text-blue-700" : "text-red-700"}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
