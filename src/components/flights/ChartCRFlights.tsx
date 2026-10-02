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
import { useChartTheme } from '@/hooks/ui/useChartTheme';

// Hook personalizado para lidar com o tamanho da tela com debounce
const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setScreenSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, 150); // Delay de 150ms para debounce
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return screenSize;
};

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

const ChartCRFlights = React.memo(({ userId }) => {
  const [filter, setFilter] = useState('month');
  const nowRef = new Date();
  const [selectedMonth, setSelectedMonth] = useState(nowRef.getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(nowRef.getFullYear());
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [chartKey, setChartKey] = useState(0); // Forçar re-renderização do gráfico

  // Tema do gráfico (reage à troca dark/light)
  const { isDark } = useChartTheme();
  
  // Usar o hook personalizado para obter o tamanho da tela
  const { width } = useScreenSize();

  // Determinar altura do gráfico baseada no tamanho da tela (mais compacto)
  const getChartHeight = () => {
    if (width < 400) return 160; // telefones pequenos
    if (width < 640) return 180; // mobile
    if (width < 1024) return 220; // tablet
    return 240; // desktop
  };

  // Atualizar o gráfico quando a janela for redimensionada
  useEffect(() => {
    const handleResize = () => {
      setChartKey(prev => prev + 1);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Função auxiliar para extrair apenas a data (sem horário) de uma string ISO
  const extractDateOnly = (dateString) => {
    return dateString.split('T')[0]; // Retorna apenas YYYY-MM-DD
  };

  useEffect(() => {
    const fetchFlights = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
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

    switch (filter) {
      case 'day':
        // Para visão dia, mostrar o mês completo baseado em selectedMonth/selectedYear
        startDate = new Date(selectedYear, selectedMonth - 1, 1, 0, 0, 0, 0);
        endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59, 999); // Último dia do mês
        break;
      case 'month':
        // Mês selecionado inteiro
        startDate = new Date(selectedYear, selectedMonth - 1, 1, 0, 0, 0, 0);
        endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59, 999);
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
        return flightDateOnly >= startDateOnly && flightDateOnly <= endDateOnly;
      })
      .sort((a, b) => new Date(a.flight_date) - new Date(b.flight_date));

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
      
      while (currentDate <= endDateOnly) {
        const dateKey = currentDate.toISOString().split('T')[0];
        if (!dailyData[dateKey]) {
          dailyData[dateKey] = { date: dateKey, cr: 0, flights: 0 };
        }
        currentDate.setDate(currentDate.getDate() + 1);
        currentDate.setHours(0, 0, 0, 0); // Manter horário zerado após incremento
      }
      
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
      // Criar data no formato YYYY-MM-DD e garantir que seja interpretada corretamente
      const [year, month, day] = item.date.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      let label;
      if (filter === 'day' || filter === 'month') {
        // dd/M (mês sem zero à esquerda)
        label = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'numeric', timeZone: 'America/Sao_Paulo' });
      } else if (filter === 'quarter') {
        label = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'numeric', timeZone: 'America/Sao_Paulo' });
      } else { // year
        label = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit', timeZone: 'America/Sao_Paulo' });
      }
      return label;
    });
    
    const crData = processedData.map(item => item.cr);
    const flightsData = processedData.map(item => item.flights);

    const isDarkMode = isDark;
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
  }, [filter, flights, selectedMonth, selectedYear, isDark]);

  const isDayView = filter === 'day';
  const isMonthView = filter === 'month';

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    resizeDelay: 100,
    normalized: true,
    layout: {
      padding: {
        top: 4,
        right: 8,
        bottom: 0,
        left: 8,
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 12,
          boxWidth: 8,
          boxHeight: 8,
          color: (context) => {
            const isDarkMode = isDark;
            return isDarkMode ? '#f8fafc' : '#334155';
          },
          font: {
            size: 11,
          },
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: (context) => {
          const isDarkMode = isDark;
          return isDarkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)';
        },
        titleColor: (context) => {
          const isDarkMode = isDark;
          return isDarkMode ? '#f8fafc' : '#1e293b';
        },
        bodyColor: (context) => {
          const isDarkMode = isDark;
          return isDarkMode ? '#f8fafc' : '#1e293b';
        },
        borderColor: (context) => {
          const isDarkMode = isDark;
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
          display: false,
          color: (context) => {
            const isDarkMode = isDark;
            return isDarkMode ? '#f8fafc' : '#334155';
          },
        },
        ticks: {
          color: (context) => {
            const isDarkMode = isDark;
            return isDarkMode ? '#cbd5e1' : '#64748b';
          },
          maxRotation: 0,
          autoSkip: !(isDayView || isMonthView),
          maxTicksLimit: (isDayView || isMonthView) ? undefined : (width < 640 ? 6 : 10),
          font: {
            size: width < 640 ? 10 : 11,
          },
          callback: function(value) {
            const label = this.getLabelForValue(value as number) as string;
            if (isDayView || isMonthView) {
              // Converter "dd/mm" para "dd/m" removendo zero à esquerda do mês
              const parts = label.split('/');
              if (parts.length >= 2) {
                const day = parts[0];
                const month = String(Number(parts[1]));
                return `${day}/${month}`;
              }
            }
            return label;
          },
        },
        grid: {
          color: (context) => {
            const isDarkMode = isDark;
            return isDarkMode ? 'rgba(71, 85, 105, 0.2)' : 'rgba(203, 213, 225, 0.5)';
          },
        },
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: false,
          color: (context) => {
            const isDarkMode = isDark;
            return isDarkMode ? '#f8fafc' : '#334155';
          },
        },
        ticks: {
          color: (context) => {
            const isDarkMode = isDark;
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
          maxTicksLimit: width < 640 ? 4 : 6,
          font: {
            size: width < 640 ? 10 : 11,
          },
        },
        grid: {
          color: (context) => {
            const isDarkMode = isDark;
            return isDarkMode ? 'rgba(71, 85, 105, 0.2)' : 'rgba(203, 213, 225, 0.5)';
          },
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: false,
          color: (context) => {
            const isDarkMode = isDark;
            return isDarkMode ? '#f8fafc' : '#334155';
          },
        },
        ticks: {
          color: (context) => {
            const isDarkMode = isDark;
            return isDarkMode ? '#cbd5e1' : '#64748b';
          },
          maxTicksLimit: width < 640 ? 4 : 6,
          font: {
            size: width < 640 ? 10 : 11,
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

  const isDarkMode = isDark;

  if (loading) {
    return (
      <div className="w-full bg-card rounded-lg shadow-sm border" style={{ height: `${getChartHeight()}px` }}>
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
    <div className="bg-card rounded-lg shadow-sm border overflow-hidden min-w-0">
      <div className="p-2 border-b border-border flex-shrink-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h3 className="text-sm font-semibold text-balance">
            Evolução do Career Rating
          </h3>
          <div className="flex gap-2 w-full sm:w-auto justify-end items-center overflow-x-auto no-scrollbar flex-nowrap min-w-0">
            {(filter === 'day' || filter === 'month') && (
              <>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className={`px-2 py-1 rounded-md text-xs border bg-background ${isDarkMode ? 'text-muted-foreground' : 'text-foreground'}`}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className={`px-2 py-1 rounded-md text-xs border bg-background ${isDarkMode ? 'text-muted-foreground' : 'text-foreground'}`}
                >
                  {Array.from({ length: 6 }, (_, idx) => nowRef.getFullYear() - 4 + idx).map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </>
            )}
            {Object.entries(periodLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => {
                  setFilter(key);
                  setChartKey(prev => prev + 1);
                }}
                className={`px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 border min-w-[64px] whitespace-nowrap shrink-0 ${
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
      <div className="p-2">
        <div className="w-full overflow-x-hidden overflow-y-hidden" style={{ position: 'relative', height: `${getChartHeight()}px`, width: '100%', maxWidth: '100%' }}>
          {filter === 'day' ? (
            <Bar 
              key={`bar-${chartKey}`}
              data={{
                ...chartData,
                datasets: chartData.datasets.map(ds => ({
                  ...ds,
                  barPercentage: 0.6,
                  categoryPercentage: 0.5,
                  maxBarThickness: 18,
                  clip: 0,
                })),
              }} 
              options={options}
              style={{ width: '100%', height: '100%', display: 'block' }}
            />
          ) : (
            <Line 
              key={`line-${chartKey}`}
              data={{
                ...chartData,
                datasets: chartData.datasets.map(ds => ({
                  ...ds,
                  clip: 0,
                })),
              }}
              options={options}
              style={{ width: '100%', height: '100%', display: 'block' }}
            />
          )}
        </div>
      </div>
    </div>
  );
});

export { ChartCRFlights };