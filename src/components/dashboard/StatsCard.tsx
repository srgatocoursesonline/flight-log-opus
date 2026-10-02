import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { HudCorners } from "@/components/ui/hud-corners";

const formatNumber = (value: string | number, lng: string = 'pt-BR'): string => {
  if (typeof value === 'string') return value;
  return value.toLocaleString(lng === 'pt-BR' ? 'pt-BR' : 'en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
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

import { useTranslation } from "react-i18next";

export const StatsCard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  className,
  valueColor
}: StatsCardProps) => {
  const { i18n } = useTranslation();
  return (
    <div className={cn("mobile-card hud-display stats-card relative overflow-hidden", className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="mobile-card-title text-readable-muted uppercase tracking-wider">
            {title}
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <p className={cn("mobile-value font-mono", valueColor || "text-success")}>
              {formatNumber(value, i18n.language)}
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
      <HudCorners size="sm" />
    </div>
  );
};