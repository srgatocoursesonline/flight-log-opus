import { useState } from "react";
import { Target, Plus, CheckCircle, Clock, Trophy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { GoalModal } from "@/components/goals/GoalModal";
import { GoalCard } from "@/components/goals/GoalCard";
import { useGoals } from "@/hooks/goals/useGoals";
import { useCreateGoal, GOAL_TEMPLATES } from "@/hooks/goals/useCreateGoal";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const Goals = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const {
    goals,
    activeGoals,
    completedGoals,
    isLoading,
    isLoadingFlights,
    error,
    archiveGoal,
    deleteGoal,
    autoValidateGoals,
  } = useGoals();

  const createGoal = useCreateGoal();

  const handleSetNewGoal = () => {
    setIsModalOpen(true);
  };

  const handleCreateGoal = async (data: any) => {
    const template = GOAL_TEMPLATES[data.goalType];
    if (!template) {
      toast.error("Meta não encontrada");
      return;
    }

    await createGoal.mutateAsync({
      title: template.title,
      description: template.description,
      goal_type: template.goal_type,
      target_value: parseFloat(data.targetValue),
      target_date: data.targetDate,
      notificationsEnabled: data.notificationsEnabled,
    });
  };

  const handleArchiveGoal = async (goalId: string) => {
    try {
      await archiveGoal.mutateAsync(goalId);
      toast.success("Meta arquivada!");
    } catch (error) {
      toast.error("Erro ao arquivar meta");
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await deleteGoal.mutateAsync(goalId);
      toast.success("Meta excluída!");
    } catch (error) {
      toast.error("Erro ao excluir meta");
    }
  };

  const existingGoalCodes = goals.map((g) => {
    // Try to match goal title to template code
    const code = Object.keys(GOAL_TEMPLATES).find(
      (key) => GOAL_TEMPLATES[key].title === g.title
    );
    return code;
  }).filter(Boolean) as string[];

  if (error) {
    return (
      <div className="mobile-container mobile-bottom-nav-padding mobile-page-layout">
        <div className="mobile-section">
          <div className="text-center text-destructive">
            <p>Erro ao carregar metas</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container mobile-bottom-nav-padding mobile-page-layout">
      <div className="mobile-section mobile-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="mobile-title gradient-title">
              {t('goals.title')}
            </h1>
            <p className="mobile-subtitle">
              {t('goals.subtitle')}
            </p>
          </div>
          <Button variant="hud" className="icon-hover" onClick={handleSetNewGoal}>
            <Plus className="h-4 w-4 mr-2" />
            {t('goals.setNewGoal')}
          </Button>
        </div>
      </div>

      <div className="mobile-section">
        <div className="mobile-grid-2 gap-2 lg:gap-3">
          {/* Active Goals Card */}
          <div className="hud-display stats-card mobile-slide-up p-3 lg:p-4" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-3 mb-4">
              <Target className="h-6 w-6 text-primary icon-hover" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">{t('goals.activeGoals')}</h3>
                <p className="text-xs text-muted-foreground">
                  {activeGoals.length} {activeGoals.length === 1 ? 'meta ativa' : 'metas ativas'}
                </p>
              </div>
            </div>
             
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : activeGoals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">{t('goals.noActiveGoals')}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={handleSetNewGoal}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('goals.setNewGoal')}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {activeGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    variant="active"
                    onArchive={handleArchiveGoal}
                    onDelete={handleDeleteGoal}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Completed Goals Card */}
          <div className="hud-display stats-card mobile-slide-up p-3 lg:p-4" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="h-6 w-6 text-success icon-hover" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">{t('goals.completedGoals')}</h3>
                <p className="text-xs text-muted-foreground">
                  {completedGoals.length} {completedGoals.length === 1 ? 'meta concluída' : 'metas concluídas'}
                </p>
              </div>
            </div>
             
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : completedGoals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">{t('goals.noCompletedGoals')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {completedGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    variant="completed"
                    showActions={false}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <GoalModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleCreateGoal}
        existingGoals={existingGoalCodes}
      />
    </div>
  );
};

export default Goals;