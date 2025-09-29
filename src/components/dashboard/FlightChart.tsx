import React, { useEffect, useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTranslation } from 'react-i18next';
import { useSupabaseFlights } from '@/hooks/supabase/useSupabaseFlights';

interface ChartDataPoint {
  date: string;
  flights: number;
  cr: number;
}

// Função para obter as cores baseado no tema
const getChartColors = () => {
  const isDark = document.documentElement.classList.contains('dark');
  return {
    flightLine: isDark ? '#60a5fa' : '#3b82f6',  // blue-400 : blue-500
    flightDot: isDark ? '#60a5fa' : '#3b82f6',
    crLine: isDark ? '#34d399' : '#10b981',      // emerald-400 : emerald-500
    crDot: isDark ? '#34d399' : '#10b981',
    grid: isDark ? '#1f2937' : '#e5e7eb',        // gray-800 : gray-200
    text: isDark ? '#9ca3af' : '#6b7280',        // gray-400 : gray-500
    tooltipBg: isDark ? '#1f2937' : '#ffffff',
    tooltipBorder: isDark ? '#374151' : '#e5e7eb',
    tooltipText: isDark ? '#f3f4f6' : '#1f2937',
  };
};

type FilterPeriod = '3' | '6' | '12' | 'all';

export const FlightChart = () => {
  const { t } = useTranslation();
  const { flights, isLoading } = useSupabaseFlights();
  const [colors, setColors] = useState(getChartColors());
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('6');

  // Atualizar cores quando o tema mudar
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setColors(getChartColors());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  // Usar useMemo para evitar loop infinito
  const chartData = useMemo(() => {
    if (!flights || flights.length === 0) {
      return [];
    }

    // Agrupar voos por mês
    const monthlyData: { [key: string]: { flights: number; cr: number } } = {};

    flights.forEach((flight) => {
      // Extrair ano-mês da data (formato: YYYY-MM)
      const date = new Date(flight.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { flights: 0, cr: 0 };
      }

      monthlyData[monthKey].flights += 1;
      monthlyData[monthKey].cr += flight.careerRating || 0;
    });

    // Converter para array e ordenar por data
    const sortedData = Object.keys(monthlyData)
      .sort()
      .map((key) => ({
        date: key,
        flights: monthlyData[key].flights,
        cr: monthlyData[key].cr,
      }));

    // Aplicar filtro baseado no período selecionado
    let dataToShow: ChartDataPoint[];
    if (filterPeriod === 'all') {
      dataToShow = sortedData;
    } else {
      const monthsToShow = parseInt(filterPeriod);
      dataToShow = sortedData.slice(-monthsToShow);
    }

    return dataToShow;
  }, [flights, filterPeriod]);

  // Formatar o rótulo do tooltip
  const formatTooltipLabel = (value: string) => {
    const [year, month] = value.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
  };

  // Formatar o valor do tooltip
  const formatTooltipValue = (value: number, name: string) => {
    if (name === 'cr') {
      return [`R$ ${value.toFixed(0)}`, 'Career Rating'];
    }
    return [value, 'Voos'];
  };

  if (isLoading) {
    return (
      <div className="hud-display chart-container fade-in p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-1">{t('flightChart.title')}</h3>
          <p className="text-sm text-readable-muted">{t('flightChart.subtitle')}</p>
        </div>
        <div className="h-80 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm">Carregando dados...</p>
          </div>
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="hud-display chart-container fade-in p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-1">{t('flightChart.title')}</h3>
          <p className="text-sm text-readable-muted">{t('flightChart.subtitle')}</p>
        </div>
        <div className="h-80 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Nenhum voo registrado. Adicione seus primeiros voos para ver o gráfico!
          </p>
        </div>
      </div>
    );
  }

  const filterOptions: { value: FilterPeriod; label: string }[] = [
    { value: '3', label: '3 meses' },
    { value: '6', label: '6 meses' },
    { value: '12', label: '12 meses' },
    { value: 'all', label: 'Todos' },
  ];

  return (
    <div className="hud-display chart-container fade-in p-6">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">{t('flightChart.title')}</h3>
            <p className="text-sm text-readable-muted">{t('flightChart.subtitle')}</p>
          </div>
          
          {/* Filtros de Período */}
          <div className="flex gap-2 flex-wrap">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilterPeriod(option.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border ${
                  filterPeriod === option.value
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-card hover:bg-accent border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="h-80 relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
            <XAxis 
              dataKey="date" 
              stroke={colors.text}
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatTooltipLabel}
            />
            <YAxis 
              yAxisId="left"
              stroke={colors.flightLine}
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke={colors.crLine}
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `R$ ${value}`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: colors.tooltipBg,
                border: `1px solid ${colors.tooltipBorder}`,
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                color: colors.tooltipText,
              }}
              labelStyle={{ color: colors.tooltipText, fontWeight: 600 }}
              itemStyle={{ color: colors.tooltipText }}
              labelFormatter={formatTooltipLabel}
              formatter={formatTooltipValue}
              cursor={{ fill: colors.grid, opacity: 0.3 }}
            />
            <Bar 
              yAxisId="left"
              dataKey="flights" 
              fill={colors.flightLine}
              radius={[8, 8, 0, 0]}
              maxBarSize={80}
              animationDuration={1500}
              animationEasing="ease-out"
              name="flights"
            />
            <Bar 
              yAxisId="right"
              dataKey="cr" 
              fill={colors.crLine}
              radius={[8, 8, 0, 0]}
              maxBarSize={80}
              animationDuration={1500}
              animationEasing="ease-out"
              name="cr"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded" 
            style={{ backgroundColor: colors.flightLine }}
          />
          <span className="text-sm text-readable-muted">{t('flightChart.flights')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded" 
            style={{ backgroundColor: colors.crLine }}
          />
          <span className="text-sm text-readable-muted">{t('flightChart.careerRating')}</span>
        </div>
      </div>
    </div>
  );
};