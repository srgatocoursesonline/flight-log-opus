import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

interface MobileCardAction {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: "default" | "destructive";
  disabled?: boolean;
}

interface MobileCardProps {
  title: string;
  subtitle?: string;
  value?: string | number;
  badge?: ReactNode;
  icon?: ReactNode;
  primaryAction?: MobileCardAction;
  secondaryActions?: MobileCardAction[];
  onClick?: () => void;
  className?: string;
  children?: ReactNode;
  compact?: boolean;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const MobileCard = ({
  title,
  subtitle,
  value,
  badge,
  icon,
  primaryAction,
  secondaryActions,
  onClick,
  className,
  children,
  compact = false,
  trend
}: MobileCardProps) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleTouchStart = () => setIsPressed(true);
  const handleTouchEnd = () => setIsPressed(false);

  return (
    <div
      className={cn(
        "mobile-card relative overflow-hidden transition-all duration-200",
        "bg-card border border-border/50 rounded-lg shadow-sm",
        "hover:shadow-md hover:border-border",
        "active:scale-[0.98] active:shadow-sm",
        isPressed && "scale-[0.98] shadow-sm",
        onClick && "cursor-pointer",
        compact ? "p-2" : "p-3",
        className
      )}
      onClick={onClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
    >
      {/* Header with title and actions */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {icon && (
            <div className={cn(
              "rounded-lg bg-primary/10 flex-shrink-0 transition-colors",
              compact ? "p-1.5" : "p-2"
            )}>
              <div className="text-primary">
                {icon}
              </div>
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={cn(
                "font-semibold text-foreground truncate",
                compact ? "text-sm" : "text-base"
              )}>
                {title}
              </h3>
              {badge && <div className="flex-shrink-0">{badge}</div>}
            </div>
            
            {subtitle && (
              <p className={cn(
                "text-muted-foreground truncate",
                compact ? "text-xs" : "text-sm"
              )}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {primaryAction && (
            <Button
              size="sm"
              variant="ghost"
              className="mobile-touch-target h-8 px-2"
              onClick={(e) => {
                e.stopPropagation();
                primaryAction.onClick();
              }}
              disabled={primaryAction.disabled}
            >
              {primaryAction.icon}
              <span className="sr-only">{primaryAction.label}</span>
            </Button>
          )}
          
          {secondaryActions && secondaryActions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="mobile-touch-target h-8 w-8 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Mais ações</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {secondaryActions.map((action, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      action.onClick();
                    }}
                    disabled={action.disabled}
                    className={cn(
                      "flex items-center gap-2 mobile-touch-target",
                      action.variant === "destructive" && "text-destructive focus:text-destructive"
                    )}
                  >
                    {action.icon}
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Value and trend */}
      {value !== undefined && (
        <div className="flex items-baseline gap-2 mb-2">
          <span className={cn(
            "font-bold text-foreground font-mono",
            compact ? "text-lg" : "text-2xl"
          )}>
            {value}
          </span>
          {trend && (
            <span className={cn(
              "text-xs font-medium transition-colors",
              trend.isPositive ? "text-success" : "text-destructive"
            )}>
              {trend.isPositive ? "+" : ""}{trend.value}%
            </span>
          )}
        </div>
      )}

      {/* Custom content */}
      {children && (
        <div className="mt-2">
          {children}
        </div>
      )}

      {/* Mobile-specific touch feedback */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary/20 transition-all duration-300" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-primary/20 transition-all duration-300" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-primary/20 transition-all duration-300" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-primary/20 transition-all duration-300" />
      </div>
    </div>
  );
};

// Specialized variants
export const MobileStatsCard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  className,
  ...props
}: Omit<MobileCardProps, 'children'>) => (
  <MobileCard
    title={title}
    value={value}
    subtitle={subtitle}
    icon={icon}
    trend={trend}
    className={cn("mobile-stats-card", className)}
    {...props}
  />
);

export const MobileActionCard = ({
  title,
  subtitle,
  icon,
  primaryAction,
  secondaryActions,
  className,
  ...props
}: Omit<MobileCardProps, 'children' | 'value'>) => (
  <MobileCard
    title={title}
    subtitle={subtitle}
    icon={icon}
    primaryAction={primaryAction}
    secondaryActions={secondaryActions}
    className={cn("mobile-action-card", className)}
    {...props}
  />
);

export const MobileCompactCard = ({
  className,
  ...props
}: MobileCardProps) => (
  <MobileCard
    compact
    className={cn("mobile-compact-card", className)}
    {...props}
  />
);