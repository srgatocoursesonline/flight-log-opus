import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Bar } from 'react-chartjs-2';
import { supabase } from '@/lib/supabase';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const ChartCRFlights = ({ userId }) => {
  console.log('ChartCRFlights component rendered with userId:', userId);
  const [filter, setFilter] = useState('month');
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [chartKey, setChartKey] = useState(0); // Forçar re-renderização do gráfico

  // Função auxiliar para extrair apenas a data (sem horário) de uma string ISO
  const extractDateOnly = (dateString) => {
    return dateString.split('T')[0]; // Retorna apenas YYYY-MM-DD
  };

  useEffect(() => {
    console.log('useEffect triggered with userId:', userId);
    const fetchFlights = async () => {
      console.log('Fetching flights for userId:', userId);
      if (!userId) {
        console.log('No userId provided, skipping fetch');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Executing Supabase query...');
        const { data: supabaseFlights, error } = await supabase
          .from('flights')
          .select(`
            id,
            flight_date,
            career_rating
          `)
          .eq('user_id', userId)
          .order('flight_date', { ascending: true })
          .limit(365); // Limite de 1 ano para performance

        if (error) {
          console.error('Erro ao buscar voos:', error);
          return;
        }

        console.log('Flights fetched from Supabase:', supabaseFlights?.length || 0, supabaseFlights);
        setFlights(supabaseFlights || []);
      } catch (err) {
        console.error('Erro inesperado:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, [userId]);

  useEffect(() => {
    let startDate;
    let endDate;
    const now = new Date();
    
    // Criar data de hoje com horário zerado (meia-noite)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    // Debug: Verificar data atual e timezone
    console.log('Data/hora atual:', new Date().toString());
    console.log('Data de hoje (meia-noite):', today.toISOString());
    console.log('Timezone offset:', new Date().getTimezoneOffset());

    switch (filter) {
      case 'day':
        // Para visão dia, mostrar o mês completo
        startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999); // Último dia do mês
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999); // Fim do dia
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1, 0, 0, 0, 0);
        endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999); // Fim do dia
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
        endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999); // Fim do dia
        break;
      default:
        startDate = new Date(2024, 9, 1, 0, 0, 0, 0);
        endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999); // Fim do dia
    }

    const filteredData = flights
      .filter(flight => {
        // Comparar apenas a data (sem horário) para evitar problemas de timezone
        const flightDateOnly = extractDateOnly(flight.flight_date);
        const startDateOnly = extractDateOnly(startDate.toISOString());
        const endDateOnly = extractDateOnly(endDate.toISOString());
        console.log(`Flight date: ${flight.flight_date}, Date only: ${flightDateOnly}, Start: ${startDateOnly}, End: ${endDateOnly}`);
        return flightDateOnly >= startDateOnly && flightDateOnly <= endDateOnly;
      })
      .sort((a, b) => new Date(a.flight_date) - new Date(b.flight_date));

    console.log(`Filtered flights for ${filter}:`, filteredData.length, 'flights from', startDate.toISOString(), 'to', endDate.toISOString());
    
    // Debug: Verificar primeiras e últimas datas dos voos
    if (filteredData.length > 0) {
      console.log('Primeira data do voo:', filteredData[0].flight_date);
      console.log('Última data do voo:', filteredData[filteredData.length - 1].flight_date);
      console.log('Data de hoje ISO:', new Date().toISOString().split('T')[0]);
    }

    let processedData;
    
    if (filter === 'day') {
      // Para dias, agrupar por dia individual
      const dailyData = {};
      filteredData.forEach(flight => {
        const date = new Date(flight.flight_date);
        const dateKey = date.toISOString().split('T')[0];
        if (!dailyData[dateKey]) {
          dailyData[dateKey] = { date: dateKey, cr: 0, flights: 0 };
        }
        dailyData[dateKey].cr += flight.career_rating || 0;
        dailyData[dateKey].flights += 1;
      });
      
      // Preencher dias vazios
      const currentDate = new Date(startDate);
      currentDate.setHours(0, 0, 0, 0); // Garantir horário zerado
      const endDateOnly = new Date(endDate);
      endDateOnly.setHours(0, 0, 0, 0); // Garantir horário zerado para comparação
      
      console.log('Preenchendo dias vazios - Start:', currentDate.toISOString(), 'End:', endDateOnly.toISOString());
      while (currentDate <= endDateOnly) {
        const dateKey = currentDate.toISOString().split('T')[0];
        console.log('Processando data:', dateKey);
        if (!dailyData[dateKey]) {
          dailyData[dateKey] = { date: dateKey, cr: 0, flights: 0 };
        }
        currentDate.setDate(currentDate.getDate() + 1);
        currentDate.setHours(0, 0, 0, 0); // Manter horário zerado após incremento
      }
      console.log('Dias preenchidos:', Object.keys(dailyData).sort());
      
      processedData = Object.keys(dailyData).sort().map(date => dailyData[date]);
    } else if (filter === 'month') {
      // Para mês, agrupar por dia
      const dailyData = {};
      filteredData.forEach(flight => {
        const date = new Date(flight.flight_date);
        const dateKey = date.toISOString().split('T')[0];
        if (!dailyData[dateKey]) {
          dailyData[dateKey] = { date: dateKey, cr: 0, flights: 0 };
        }
        dailyData[dateKey].cr += flight.career_rating || 0;
        dailyData[dateKey].flights += 1;
      });
      processedData = Object.keys(dailyData).sort().map(date => dailyData[date]);
    } else if (filter === 'quarter') {
      // Para trimestre, agrupar por semana
      const weeklyData = {};
      filteredData.forEach(flight => {
        const date = new Date(flight.flight_date);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay()); // Domingo da semana
        const weekKey = weekStart.toISOString().split('T')[0];
        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = { date: weekKey, cr: 0, flights: 0 };
        }
        weeklyData[weekKey].cr += flight.career_rating || 0;
        weeklyData[weekKey].flights += 1;
      });
      processedData = Object.keys(weeklyData).sort().map(date => weeklyData[date]);
    } else { // year
      // Para ano, agrupar por mês
      const monthlyData = {};
      filteredData.forEach(flight => {
        const date = new Date(flight.flight_date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { date: monthKey, cr: 0, flights: 0 };
        }
        monthlyData[monthKey].cr += flight.career_rating || 0;
        monthlyData[monthKey].flights += 1;
      });
      processedData = Object.keys(monthlyData).sort().map(date => monthlyData[date]);
    }

    const labels = processedData.map(item => {
      console.log('Processando label para data:', item.date);
      // Criar data no formato YYYY-MM-DD e garantir que seja interpretada corretamente
      const [year, month, day] = item.date.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      console.log('Date object:', date.toISOString());
      let label;
      if (filter === 'day' || filter === 'month') {
        label = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' });
      } else if (filter === 'quarter') {
        label = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' });
      } else { // year
        label = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit', timeZone: 'America/Sao_Paulo' });
      }
      console.log('Label gerado:', label);
      return label;
    });
    
    const crData = processedData.map(item => item.cr);
    const flightsData = processedData.map(item => item.flights);

    console.log('Processed chart data:', { labels: labels.length, crData, flightsData, filter });
    
    // Debug: Verificar últimos labels e datas processadas
    if (labels.length > 0) {
      console.log('Últimos 3 labels:', labels.slice(-3));
      console.log('Últimas 3 datas processadas:', processedData.slice(-3).map(item => item.date));
    }

    const isDarkMode = document.documentElement.classList.contains('dark');
    const crColor = isDarkMode ? '#3B82F6' : '#2563eb';
    const flightsColor = isDarkMode ? '#10B981' : '#059669';

    setChartData({
      labels,
      datasets: [
        {
          label: 'Career Rating (R$)',
          data: crData,
          borderColor: crColor,
          backgroundColor: filter === 'day' ? crColor : `${crColor}20`,
          yAxisID: 'y',
          tension: 0.4,
          pointBackgroundColor: crColor,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          borderWidth: filter === 'day' ? 1 : 2,
          borderRadius: filter === 'day' ? 4 : 0,
          borderSkipped: filter === 'day' ? false : true,
        },
        {
          label: 'Quantidade de Voos',
          data: flightsData,
          borderColor: flightsColor,
          backgroundColor: filter === 'day' ? flightsColor : `${flightsColor}20`,
          yAxisID: 'y1',
          tension: 0.4,
          pointBackgroundColor: flightsColor,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          borderWidth: filter === 'day' ? 1 : 2,
          borderRadius: filter === 'day' ? 4 : 0,
          borderSkipped: filter === 'day' ? false : true,
        },
      ],
    });
  }, [filter, flights]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    resizeDelay: 100,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          color: (context) => {
            const isDarkMode = document.documentElement.classList.contains('dark');
            return isDarkMode ? '#f8fafc' : '#334155';
          },
        },
      },
      title: {
        display: true,
        text: `Evolução do CR - Período: ${filter === 'day' ? 'Dia' : filter === 'month' ? 'Mês' : filter === 'quarter' ? 'Trimestre' : 'Ano'}`,
        color: (context) => {
          const isDarkMode = document.documentElement.classList.contains('dark');
          return isDarkMode ? '#f8fafc' : '#334155';
        },
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        backgroundColor: (context) => {
          const isDarkMode = document.documentElement.classList.contains('dark');
          return isDarkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)';
        },
        titleColor: (context) => {
          const isDarkMode = document.documentElement.classList.contains('dark');
          return isDarkMode ? '#f8fafc' : '#1e293b';
        },
        bodyColor: (context) => {
          const isDarkMode = document.documentElement.classList.contains('dark');
          return isDarkMode ? '#f8fafc' : '#1e293b';
        },
        borderColor: (context) => {
          const isDarkMode = document.documentElement.classList.contains('dark');
          return isDarkMode ? '#475569' : '#cbd5e1';
        },
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.dataset.yAxisID === 'y') {
              // Career Rating - formatar como moeda
              label += new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(context.parsed.y);
            } else {
              // Quantidade de voos
              label += context.parsed.y + ' voos';
            }
            return label;
          }
        }
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Data',
          color: (context) => {
            const isDarkMode = document.documentElement.classList.contains('dark');
            return isDarkMode ? '#f8fafc' : '#334155';
          },
        },
        ticks: {
          color: (context) => {
            const isDarkMode = document.documentElement.classList.contains('dark');
            return isDarkMode ? '#cbd5e1' : '#64748b';
          },
          maxRotation: 45,
        },
        grid: {
          color: (context) => {
            const isDarkMode = document.documentElement.classList.contains('dark');
            return isDarkMode ? 'rgba(71, 85, 105, 0.2)' : 'rgba(203, 213, 225, 0.5)';
          },
        },
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Career Rating (R$)',
          color: (context) => {
            const isDarkMode = document.documentElement.classList.contains('dark');
            return isDarkMode ? '#f8fafc' : '#334155';
          },
        },
        ticks: {
          color: (context) => {
            const isDarkMode = document.documentElement.classList.contains('dark');
            return isDarkMode ? '#cbd5e1' : '#64748b';
          },
          callback: function(value) {
            return new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(value);
          },
        },
        grid: {
          color: (context) => {
            const isDarkMode = document.documentElement.classList.contains('dark');
            return isDarkMode ? 'rgba(71, 85, 105, 0.2)' : 'rgba(203, 213, 225, 0.5)';
          },
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Quantidade de Voos',
          color: (context) => {
            const isDarkMode = document.documentElement.classList.contains('dark');
            return isDarkMode ? '#f8fafc' : '#334155';
          },
        },
        ticks: {
          color: (context) => {
            const isDarkMode = document.documentElement.classList.contains('dark');
            return isDarkMode ? '#cbd5e1' : '#64748b';
          },
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  const periodLabels = {
    day: 'Dia',
    month: 'Mês',
    quarter: 'Trimestre',
    year: 'Ano',
  };

  const isDarkMode = document.documentElement.classList.contains('dark');

  if (loading) {
    return (
      <div className="w-full h-96 bg-card rounded-lg shadow-sm border">
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm">Carregando dados dos voos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-96 bg-card rounded-lg shadow-sm border flex flex-col">
      <div className="p-3 border-b border-border flex-shrink-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h3 className="text-base font-semibold text-balance">
            Evolução do Career Rating
          </h3>
          <div className="flex flex-wrap gap-1 w-full sm:w-auto">
            {Object.entries(periodLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => {
                  setFilter(key);
                  setChartKey(prev => prev + 1); // Forçar re-renderização do gráfico
                }}
                className={`px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 border flex-1 sm:flex-none ${
                  filter === key
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                    : isDarkMode
                    ? 'border-border bg-background/50 text-muted-foreground hover:bg-accent hover:text-foreground'
                    : 'border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="p-2 flex-1 min-h-0 relative">
        <div className="w-full h-full">
          {filter === 'day' ? (
            <Bar 
              key={`bar-${chartKey}`}
              data={chartData} 
              options={options}
              className="w-full h-full"
            />
          ) : (
            <Line 
              key={`line-${chartKey}`}
              data={chartData} 
              options={options}
              className="w-full h-full"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export { ChartCRFlights };