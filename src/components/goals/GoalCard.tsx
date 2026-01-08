import { CheckCircle2, MoreVertical, Archive, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GoalProgressBar } from "./GoalProgressBar";
import { GoalWithProgress } from "@/hooks/goals/useGoals";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface GoalCardProps {
  goal: GoalWithProgress;
  onArchive?: (goalId: string) => void;
  onDelete?: (goalId: string) => void;
  showActions?: boolean;
  variant?: "active" | "completed";
}

export function GoalCard({
  goal,
  onArchive,
  onDelete,
  showActions = true,
  variant = "active",
}: GoalCardProps) {

  const getBorderColor = () => {
    if (variant === "completed") return "border-success";
    if (goal.progress_percentage >= 75) return "border-primary";
    if (goal.progress_percentage >= 50) return "border-accent";
    return "border-primary";
  };

  const getBgColor = () => {
    if (variant === "completed") return "bg-success/10";
    return "bg-muted/20";
  };

  return (
    <div
      className={cn(
        "p-3 lg:p-4 rounded-lg border-l-4 transition-all duration-200 hover:shadow-md quick-action-card",
        getBorderColor(),
        getBgColor()
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-foreground truncate">{goal.title}</h4>
            {goal.is_completed && (
              <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
            )}
          </div>
          {goal.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {goal.description}
            </p>
          )}
        </div>
        
        {showActions && variant === "active" && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onArchive && (
                <DropdownMenuItem onClick={() => onArchive(goal.id)}>
                  <Archive className="h-4 w-4 mr-2" />
                  Arquivar
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(goal.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <GoalProgressBar
        current={goal.current_value}
        target={goal.target_value}
        tier={goal.tier}
        size="md"
        goalType={goal.goal_type}
      />

      {goal.target_date && !goal.is_completed && (
        <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
          <span>Prazo:</span>
          <span className="font-medium">
            {formatDistanceToNow(new Date(goal.target_date), {
              addSuffix: true,
              locale: ptBR,
            })}
          </span>
        </div>
      )}

      {goal.is_completed && goal.updated_at && (
        <div className="mt-2 text-xs text-success flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          <span>
            Concluído{" "}
            {formatDistanceToNow(new Date(goal.updated_at), {
              addSuffix: true,
              locale: ptBR,
            })}
          </span>
        </div>
      )}
    </div>
  );
}
