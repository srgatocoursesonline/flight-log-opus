import { CheckCircle2, Flame, Target, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface GoalProgressBarProps {
  current: number;
  target: number;
  showPercentage?: boolean;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  tier?: "bronze" | "silver" | "gold" | "platinum";
  goalType?: string;
}

const TIER_COLORS = {
  bronze: {
    bg: "bg-amber-600",
    text: "text-amber-600",
    border: "border-amber-600",
    bgLight: "bg-amber-600/10",
  },
  silver: {
    bg: "bg-slate-400",
    text: "text-slate-400",
    border: "border-slate-400",
    bgLight: "bg-slate-400/10",
  },
  gold: {
    bg: "bg-yellow-500",
    text: "text-yellow-500",
    border: "border-yellow-500",
    bgLight: "bg-yellow-500/10",
  },
  platinum: {
    bg: "bg-indigo-500",
    text: "text-indigo-500",
    border: "border-indigo-500",
    bgLight: "bg-indigo-500/10",
  },
};

// Função para formatar valores com unidades apropriadas
const formatGoalValue = (value: number, goalType?: string): string => {
  switch (goalType) {
    case "hours":
      return `${value.toFixed(1)}h`;
    case "distance":
      return `${Math.round(value)}km`;
    case "rating":
      return value.toFixed(1);
    case "flights":
    case "custom":
    default:
      return Math.round(value).toString();
  }
};

export function GoalProgressBar({
  current,
  target,
  showPercentage = true,
  showLabel = true,
  size = "md",
  tier,
  goalType,
}: GoalProgressBarProps) {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const isCompleted = percentage >= 100;

  const getProgressColor = () => {
    if (isCompleted) return "bg-success";
    if (percentage >= 75) return "bg-primary";
    if (percentage >= 50) return "bg-orange-500";
    if (percentage >= 25) return "bg-yellow-500";
    return "bg-muted-foreground";
  };

  const getProgressLabel = () => {
    if (isCompleted) return "Concluído!";
    if (percentage >= 75) return "Quase Lá!";
    if (percentage >= 50) return "No Caminho Certo";
    if (percentage >= 25) return "Começando";
    return "Em Progresso";
  };

  const getHeight = () => {
    switch (size) {
      case "sm":
        return "h-1.5";
      case "lg":
        return "h-4";
      default:
        return "h-2";
    }
  };

  const getIconSize = () => {
    switch (size) {
      case "sm":
        return "h-3 w-3";
      case "lg":
        return "h-5 w-5";
      default:
        return "h-4 w-4";
    }
  };

  const tierColors = tier ? TIER_COLORS[tier] : null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        {showLabel && (
          <div className="flex items-center gap-2">
            {isCompleted ? (
              <CheckCircle2 className={cn("text-success", getIconSize())} />
            ) : (
              <Target className={cn("text-muted-foreground", getIconSize())} />
            )}
            <span
              className={cn(
                "text-sm font-medium",
                isCompleted ? "text-success" : "text-muted-foreground"
              )}
            >
              {getProgressLabel()}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          {tier && tierColors && (
            <div
              className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium",
                tierColors.bgLight,
                tierColors.border,
                tierColors.text
              )}
            >
              <Award className="h-3 w-3" />
              <span className="capitalize">{tier}</span>
            </div>
          )}
          <span className="text-sm font-mono font-medium text-foreground">
            {formatGoalValue(current, goalType)}/{formatGoalValue(target, goalType)}
          </span>
          {showPercentage && (
            <span
              className={cn(
                "text-sm font-medium",
                isCompleted ? "text-success" : "text-muted-foreground"
              )}
            >
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      </div>

      <div className={cn("w-full bg-muted/50 rounded-full overflow-hidden", getHeight())}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000 ease-out relative",
            getProgressColor(),
            isCompleted && "animate-pulse"
          )}
          style={{ width: `${percentage}%` }}
        >
          {isCompleted && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          )}
        </div>
      </div>

      {percentage >= 50 && percentage < 100 && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Flame className="h-3 w-3 text-orange-500" />
          <span>Continue assim!</span>
        </div>
      )}
    </div>
  );
}
