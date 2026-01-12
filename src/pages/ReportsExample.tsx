import React, { useState } from 'react';
import { FilterSidebar } from '@/components/reports/dashboard/FilterSidebar';
import { useReportFilters } from '@/hooks/reports/useReportFilters';
import { MultiSelectOption } from '@/components/reports/shared/MultiSelectFilter';

// Dados mock para demonstração
const MOCK_AIRCRAFT_OPTIONS: MultiSelectOption[] = [
  { value: 'B737-800', label: 'Boeing 737-800', description: 'Comercial narrow-body' },
  { value: 'A320', label: 'Airbus A320', description: 'Comercial narrow-body' },
  { value: 'C172', label: 'Cessna 172', description: 'Monomotor de treinamento' },
  { value: 'PA28', label: 'Piper Cherokee', description: 'Aeronave monomotor' },
  { value: 'B777-300ER', label: 'Boeing 777-300ER', description: 'Wide-body longo curso' },
  { value: 'E190', label: 'Embraer E190', description: 'Jato regional' }
];

const MOCK_AIRPORT_OPTIONS: MultiSelectOption[] = [
  { value: 'SBSP', label: 'SBSP - Congonhas', description: 'São Paulo, Brasil' },
  { value: 'SBGR', label: 'SBGR - Guarulhos', description: 'São Paulo, Brasil' },
  { value: 'SBRJ', label: 'SBRJ - Santos Dumont', description: 'Rio de Janeiro, Brasil' },
  { value: 'SBGL', label: 'SBGL - Galeão', description: 'Rio de Janeiro, Brasil' },
  { value: 'SBBR', label: 'SBBR - Brasília', description: 'Brasília, Brasil' },
  { value: 'SBPA', label: 'SBPA - Porto Alegre', description: 'Porto Alegre, Brasil' },
  { value: 'SBRF', label: 'SBRF - Recife', description: 'Recife, Brasil' },
  { value: 'SBSV', label: 'SBSV - Salvador', description: 'Salvador, Brasil' }
];

export function ReportsExample() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const filterHook = useReportFilters();

  return (
    <div className="flex h-screen bg-background">
      <FilterSidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        filterHook={filterHook}
        aircraftOptions={MOCK_AIRCRAFT_OPTIONS}
        airportOptions={MOCK_AIRPORT_OPTIONS}
      />
      
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Relatórios e Análises</h1>
              <p className="text-muted-foreground">
                Demonstração do sistema global de filtros
              </p>
            </div>
            
            <div className="grid gap-6">
              {/* Exibição do Estado dos Filtros */}
              <div className="bg-card border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Estado Atual dos Filtros</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Período:</strong>
                      <div className="text-muted-foreground">
                        {filterHook.filters.dateRange.preset || 'Personalizado'} 
                        ({filterHook.filters.dateRange.from.toLocaleDateString()} - {filterHook.filters.dateRange.to.toLocaleDateString()})
                      </div>
                    </div>
                    
                    <div>
                      <strong>Aeronaves:</strong>
                      <div className="text-muted-foreground">
                        {filterHook.filters.aircraft?.length || 0} selecionada{filterHook.filters.aircraft?.length !== 1 ? 's' : ''}
                        {filterHook.filters.aircraft?.length > 0 && (
                          <div className="text-xs mt-1">
                            {filterHook.filters.aircraft.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <strong>Aeroportos de Partida:</strong>
                      <div className="text-muted-foreground">
                        {filterHook.filters.airports?.departure?.length || 0} selecionado{filterHook.filters.airports?.departure?.length !== 1 ? 's' : ''}
                        {filterHook.filters.airports?.departure?.length > 0 && (
                          <div className="text-xs mt-1">
                            {filterHook.filters.airports.departure.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <strong>Aeroportos de Chegada:</strong>
                      <div className="text-muted-foreground">
                        {filterHook.filters.airports?.arrival?.length || 0} selecionado{filterHook.filters.airports?.arrival?.length !== 1 ? 's' : ''}
                        {filterHook.filters.airports?.arrival?.length > 0 && (
                          <div className="text-xs mt-1">
                            {filterHook.filters.airports.arrival.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <strong>Status do Voo:</strong>
                      <div className="text-muted-foreground">
                        {filterHook.filters.status?.length || 0} selecionado{filterHook.filters.status?.length !== 1 ? 's' : ''}
                        {filterHook.filters.status?.length > 0 && (
                          <div className="text-xs mt-1">
                            {filterHook.filters.status.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <strong>Modo de Comparação:</strong>
                      <div className="text-muted-foreground">
                        {filterHook.filters.comparison?.enabled ? 'Ativado' : 'Desativado'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm">
                      <strong>Filtros Ativos:</strong> 
                      <span className={filterHook.isFiltered ? 'text-primary' : 'text-muted-foreground'}>
                        {filterHook.isFiltered ? 'Sim' : 'Não'}
                      </span>
                    </div>
                    
                    {filterHook.isFiltered && (
                      <button
                        onClick={filterHook.resetFilters}
                        className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90"
                      >
                        Limpar Todos os Filtros
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Conteúdo de Exemplo do Relatório */}
              <div className="bg-card border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Conteúdo de Exemplo do Relatório</h2>
                <div className="text-muted-foreground">
                  <p>Aqui é onde o conteúdo do seu relatório seria exibido.</p>
                  <p>O conteúdo seria filtrado com base no estado atual dos filtros mostrado acima.</p>
                  <p className="mt-4">
                    Experimente usar a barra lateral de filtros à esquerda para ver como o estado dos filtros muda em tempo real.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}