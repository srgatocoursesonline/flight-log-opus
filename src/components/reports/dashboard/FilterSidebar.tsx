import React from 'react';
import { ChevronLeft, ChevronRight, Filter, RotateCcw } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

import { DateRangePicker } from '../shared/DateRangePicker';
import { MultiSelectFilter, MultiSelectOption } from '../shared/MultiSelectFilter';
import { UseReportFiltersReturn } from '@/hooks/reports/useReportFilters';
import { FlightStatus } from '@/types/reports';

interface FilterSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  filterHook: UseReportFiltersReturn;
  aircraftOptions: MultiSelectOption[];
  airportOptions: MultiSelectOption[];
  className?: string;
}

// Opções de status de voo
const FLIGHT_STATUS_OPTIONS: MultiSelectOption[] = [
  { value: 'scheduled', label: 'Agendado', description: 'Voos planejados' },
  { value: 'boarding', label: 'Embarcando', description: 'Passageiros embarcando' },
  { value: 'departed', label: 'Decolou', description: 'Voo decolou' },
  { value: 'arrived', label: 'Chegou', description: 'Voo pousou' },
  { value: 'cancelled', label: 'Cancelado', description: 'Voo foi cancelado' },
  { value: 'delayed', label: 'Atrasado', description: 'Voo está atrasado' }
];

// Opções de categorias (normalmente viriam do banco de dados)
const EXPENSE_CATEGORY_OPTIONS: MultiSelectOption[] = [
  { value: 'fuel', label: 'Combustível', description: 'Custos de combustível' },
  { value: 'maintenance', label: 'Manutenção', description: 'Manutenção da aeronave' },
  { value: 'insurance', label: 'Seguro', description: 'Prêmios de seguro' },
  { value: 'hangar', label: 'Hangar', description: 'Aluguel de hangar' },
  { value: 'training', label: 'Treinamento', description: 'Treinamento de pilotos' },
  { value: 'other', label: 'Outros', description: 'Outras despesas' }
];

const REVENUE_CATEGORY_OPTIONS: MultiSelectOption[] = [
  { value: 'charter', label: 'Fretamento', description: 'Voos fretados' },
  { value: 'instruction', label: 'Instrução', description: 'Instrução de voo' },
  { value: 'rental', label: 'Aluguel', description: 'Aluguel de aeronave' },
  { value: 'cargo', label: 'Carga', description: 'Transporte de carga' },
  { value: 'other', label: 'Outros', description: 'Outras receitas' }
];

const MAINTENANCE_CATEGORY_OPTIONS: MultiSelectOption[] = [
  { value: 'routine', label: 'Rotina', description: 'Manutenção programada' },
  { value: 'repair', label: 'Reparo', description: 'Reparos não programados' },
  { value: 'inspection', label: 'Inspeção', description: 'Inspeções obrigatórias' },
  { value: 'upgrade', label: 'Upgrade', description: 'Upgrades de equipamentos' },
  { value: 'compliance', label: 'Conformidade', description: 'Conformidade regulatória' }
];

export function FilterSidebar({
  isCollapsed,
  onToggleCollapse,
  filterHook,
  aircraftOptions,
  airportOptions,
  className
}: FilterSidebarProps) {
  const {
    filters,
    updateDateRange,
    updateDatePreset,
    updateAircraftFilter,
    updateAirportFilter,
    updateStatusFilter,
    updateCategoryFilter,
    toggleComparison,
    resetFilters,
    isFiltered,
    datePresets
  } = filterHook;

  return (
    <div className={cn(
      'transition-all duration-300 ease-in-out border-r bg-background',
      isCollapsed ? 'w-12' : 'w-80',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <h2 className="font-semibold">Filtros</h2>
            {isFiltered && (
              <Badge variant="secondary" className="text-xs">
                Ativo
              </Badge>
            )}
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="h-8 w-8 p-0"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Collapsed state */}
      {isCollapsed && (
        <div className="p-2 space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="w-full h-8 p-0"
            title="Expandir filtros"
          >
            <Filter className="h-4 w-4" />
          </Button>
          {isFiltered && (
            <div className="w-2 h-2 bg-primary rounded-full mx-auto" title="Filtros ativos" />
          )}
        </div>
      )}

      {/* Expanded state */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Botão para resetar filtros */}
          {isFiltered && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="w-full"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Limpar Filtros
            </Button>
          )}

          {/* Filtro de Período */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Período</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <DateRangePicker
                from={filters.dateRange.from}
                to={filters.dateRange.to}
                preset={filters.dateRange.preset}
                onDateRangeChange={updateDateRange}
                onPresetChange={updateDatePreset}
                datePresets={datePresets}
              />
            </CardContent>
          </Card>

          {/* Filtro de Aeronaves */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Aeronaves</CardTitle>
            </CardHeader>
            <CardContent>
              <MultiSelectFilter
                options={aircraftOptions}
                selectedValues={filters.aircraft || []}
                onSelectionChange={updateAircraftFilter}
                placeholder="Selecionar aeronaves..."
                searchable
              />
            </CardContent>
          </Card>

          {/* Filtros de Aeroportos */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Aeroportos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <MultiSelectFilter
                title="Partida"
                options={airportOptions}
                selectedValues={filters.airports?.departure || []}
                onSelectionChange={(values) => updateAirportFilter('departure', values)}
                placeholder="Selecionar aeroportos de partida..."
                maxDisplayItems={2}
                searchable
              />
              <MultiSelectFilter
                title="Chegada"
                options={airportOptions}
                selectedValues={filters.airports?.arrival || []}
                onSelectionChange={(values) => updateAirportFilter('arrival', values)}
                placeholder="Selecionar aeroportos de chegada..."
                maxDisplayItems={2}
                searchable
              />
            </CardContent>
          </Card>

          {/* Filtro de Status do Voo */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Status do Voo</CardTitle>
            </CardHeader>
            <CardContent>
              <MultiSelectFilter
                options={FLIGHT_STATUS_OPTIONS}
                selectedValues={filters.status || []}
                onSelectionChange={(values) => updateStatusFilter(values as FlightStatus[])}
                placeholder="Selecionar status..."
                searchable={false}
              />
            </CardContent>
          </Card>

          {/* Filtros de Categorias */}
          <Collapsible>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="pb-3 cursor-pointer hover:bg-muted/50">
                  <CardTitle className="text-sm flex items-center justify-between">
                    Categorias
                    <ChevronRight className="h-4 w-4 transition-transform data-[state=open]:rotate-90" />
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  <MultiSelectFilter
                    title="Despesas"
                    options={EXPENSE_CATEGORY_OPTIONS}
                    selectedValues={filters.categories?.expense || []}
                    onSelectionChange={(values) => updateCategoryFilter('expense', values)}
                    placeholder="Selecionar categorias de despesas..."
                    maxDisplayItems={2}
                  />
                  <Separator />
                  <MultiSelectFilter
                    title="Receitas"
                    options={REVENUE_CATEGORY_OPTIONS}
                    selectedValues={filters.categories?.revenue || []}
                    onSelectionChange={(values) => updateCategoryFilter('revenue', values)}
                    placeholder="Selecionar categorias de receitas..."
                    maxDisplayItems={2}
                  />
                  <Separator />
                  <MultiSelectFilter
                    title="Manutenção"
                    options={MAINTENANCE_CATEGORY_OPTIONS}
                    selectedValues={filters.categories?.maintenance || []}
                    onSelectionChange={(values) => updateCategoryFilter('maintenance', values)}
                    placeholder="Selecionar categorias de manutenção..."
                    maxDisplayItems={2}
                  />
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Comparação de Períodos */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Comparação de Períodos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id="comparison-mode"
                  checked={filters.comparison?.enabled || false}
                  onCheckedChange={toggleComparison}
                />
                <Label htmlFor="comparison-mode" className="text-sm">
                  Comparar com período anterior
                </Label>
              </div>
              {filters.comparison?.enabled && (
                <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                  Os dados serão comparados com o período anterior equivalente
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}