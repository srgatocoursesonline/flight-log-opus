import { useEffect, useMemo, useState } from 'react';

export interface ChartTheme {
  primary: string;
  success: string;
  warning: string;
  destructive: string;
  mutedForeground: string;
  foreground: string;
  border: string;
  background: string;
  card: string;
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
  isDark: boolean;
}

const VARS: Record<keyof Omit<ChartTheme, 'isDark'>, string> = {
  primary: '--primary',
  success: '--success',
  warning: '--warning',
  destructive: '--destructive',
  mutedForeground: '--muted-foreground',
  foreground: '--foreground',
  border: '--border',
  background: '--background',
  card: '--card',
  chart1: '--chart-1',
  chart2: '--chart-2',
  chart3: '--chart-3',
  chart4: '--chart-4',
  chart5: '--chart-5',
};

/**
 * Resolve os tokens CSS em cores concretas (hsl) para uso em canvas/SVG
 * (Chart.js e Recharts). Re-resolve na troca de tema (classe no <html>).
 */
export const useChartTheme = (): ChartTheme => {
  const readTheme = () =>
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark')
      ? 'dark'
      : 'light';

  const [theme, setTheme] = useState<'dark' | 'light'>(readTheme);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(readTheme());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  return useMemo<ChartTheme>(() => {
    const style = getComputedStyle(document.documentElement);
    const resolve = (token: string) => {
      const raw = style.getPropertyValue(token).trim();
      // Tokens HSL crus ("207 89% 55%") — normaliza para hsl() com vírgulas
      return raw ? `hsl(${raw.replace(/\s+/g, ', ')})` : '#64748B';
    };

    const colors = {} as Record<keyof Omit<ChartTheme, 'isDark'>, string>;
    (Object.keys(VARS) as Array<keyof typeof VARS>).forEach(key => {
      colors[key] = resolve(VARS[key]);
    });

    return { ...colors, isDark: theme === 'dark' };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);
};
