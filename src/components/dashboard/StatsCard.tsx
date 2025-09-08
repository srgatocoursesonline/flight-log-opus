import { ReactNode } from "react";
import { cn } from "@/lib/utils";

const formatNumber = (value: string | number): string => {
  if (typeof value === 'string') return value;
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  valueColor?: string;
}

export const StatsCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  className,
  valueColor 
}: StatsCardProps) => {
  return (
    <div className={cn("mobile-card hud-display stats-card relative overflow-hidden", className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="mobile-card-title text-readable-muted uppercase tracking-wider">
            {title}
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <p className={cn("mobile-value font-mono", valueColor || "text-green-600 dark:text-green-400")}>
              {formatNumber(value)}
            </p>
            {trend && (
              <span className={cn(
                "mobile-trend transition-all duration-300",
                trend.isPositive ? "text-success" : "text-destructive"
              )}>
                {trend.isPositive ? "+" : ""}{trend.value}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mobile-card-subtitle text-readable-muted mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div className="mobile-icon-container rounded-lg bg-primary/10 icon-hover flex-shrink-0">
            <div className="text-primary">
              {icon}
            </div>
          </div>
        )}
      </div>
      
      {/* HUD-style corner decorations */}
      <div className="absolute top-0 left-0 w-3 h-3 xs:w-4 xs:h-4 border-t-2 border-l-2 border-primary/30 transition-all duration-300" />
      <div className="absolute top-0 right-0 w-3 h-3 xs:w-4 xs:h-4 border-t-2 border-r-2 border-primary/30 transition-all duration-300" />
      <div className="absolute bottom-0 left-0 w-3 h-3 xs:w-4 xs:h-4 border-b-2 border-l-2 border-primary/30 transition-all duration-300" />
      <div className="absolute bottom-0 right-0 w-3 h-3 xs:w-4 xs:h-4 border-b-2 border-r-2 border-primary/30 transition-all duration-300" />
    </div>
  );
};