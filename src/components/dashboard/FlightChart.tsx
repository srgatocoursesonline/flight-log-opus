import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';

const mockData = [
  { date: '2024-01', flights: 8, cr: 85 },
  { date: '2024-02', flights: 12, cr: 88 },
  { date: '2024-03', flights: 15, cr: 92 },
  { date: '2024-04', flights: 18, cr: 89 },
  { date: '2024-05', flights: 22, cr: 94 },
  { date: '2024-06', flights: 25, cr: 96 },
];

export const FlightChart = () => {
  const { t } = useTranslation();
  
  return (
    <div className="hud-display chart-container fade-in p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-1">{t('flightChart.title')}</h3>
        <p className="text-sm text-muted-foreground">{t('flightChart.subtitle')}</p>
      </div>
      
      <div className="h-80 relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-panel)',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Line 
              type="monotone" 
              dataKey="flights" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
              animationDuration={2000}
              animationEasing="ease-out"
            />
            <Line 
              type="monotone" 
              dataKey="cr" 
              stroke="hsl(var(--accent))" 
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--accent))', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: 'hsl(var(--accent))', strokeWidth: 2 }}
              animationDuration={2000}
              animationEasing="ease-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-sm text-muted-foreground">{t('flightChart.flights')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-accent" />
          <span className="text-sm text-muted-foreground">{t('flightChart.careerRating')}</span>
        </div>
      </div>
    </div>
  );
};