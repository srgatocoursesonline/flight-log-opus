import { ReactNode } from "react";
import { cn } from "@/lib/utils";

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
}

export const StatsCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  className 
}: StatsCardProps) => {
  return (
    <div className={cn("hud-display p-6 relative overflow-hidden", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-3xl font-bold tracking-tight text-foreground font-mono">
              {value}
            </p>
            {trend && (
              <span className={cn(
                "text-sm font-medium",
                trend.isPositive ? "text-success" : "text-destructive"
              )}>
                {trend.isPositive ? "+" : ""}{trend.value}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div className="rounded-lg bg-primary/10 p-3">
            <div className="text-primary">
              {icon}
            </div>
          </div>
        )}
      </div>
      
      {/* HUD-style corner decorations */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/30" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary/30" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary/30" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary/30" />
    </div>
  );
};