import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Target, Plane, Clock, Award, Trophy } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const goalSchema = z.object({
  category: z.enum(["career_rating", "flight_hours", "achievements", "certifications"], {
    required_error: "Selecione uma categoria",
  }),
  goalType: z.string().min(1, "Selecione uma meta"),
  targetValue: z.string().min(1, "Digite o valor alvo"),
  targetDate: z.date().optional(),
  notificationsEnabled: z.boolean().default(true),
});

type GoalFormData = z.infer<typeof goalSchema>;

interface GoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: GoalFormData) => Promise<void>;
  existingGoals?: string[];
}

const GOAL_CATEGORIES = [
  {
    value: "career_rating",
    label: "Career Rating",
    icon: <Award className="h-4 w-4" />,
    description: "Metas relacionadas à pontuação de carreira",
  },
  {
    value: "flight_hours",
    label: "Flight Hours",
    icon: <Clock className="h-4 w-4" />,
    description: "Metas baseadas em horas de voo",
  },
  {
    value: "achievements",
    label: "Achievements",
    icon: <Trophy className="h-4 w-4" />,
    description: "Conquistas especiais e marcos",
  },
  {
    value: "certifications",
    label: "Certifications",
    icon: <Target className="h-4 w-4" />,
    description: "Certificações e qualificações",
  },
];

const GOAL_TEMPLATES: Record<string, Array<{ code: string; title: string; description: string; defaultTarget: string }>> = {
  career_rating: [
    { code: "CR_100", title: "CR 100 Perfeito", description: "Alcançar career rating de 100 pontos", defaultTarget: "100" },
    { code: "CR_50", title: "Estrela em Ascensão", description: "Atingir 50 pontos de career rating", defaultTarget: "50" },
    { code: "CR_75", title: "Piloto Experiente", description: "Atingir 75 pontos de career rating", defaultTarget: "75" },
  ],
  flight_hours: [
    { code: "HOURS_100", title: "100 Horas de Voo", description: "Registrar 100 horas de voo", defaultTarget: "100" },
    { code: "HOURS_500", title: "Maratonista dos Céus", description: "Acumular 500 horas de voo", defaultTarget: "500" },
    { code: "HOURS_1000", title: "Mestre dos Céus", description: "Atingir 1000 horas de voo", defaultTarget: "1000" },
    { code: "NIGHT_FLIGHT_10", title: "Voo Noturno Completo", description: "Completar 10 voos noturnos", defaultTarget: "10" },
  ],
  achievements: [
    { code: "FIRST_SOLO", title: "Primeiro Voo Solo", description: "Complete seu primeiro voo sem penalidades", defaultTarget: "1" },
    { code: "TRANSATLANTIC", title: "Travessia do Atlântico", description: "Complete um voo transatlântico", defaultTarget: "1" },
    { code: "AIRPORTS_50", title: "Explorador de Aeroportos", description: "Pousar em 50 aeroportos diferentes", defaultTarget: "50" },
    { code: "WEEKLY_STREAK_4", title: "Voador Consistente", description: "1 voo por semana durante 4 semanas", defaultTarget: "4" },
  ],
  certifications: [
    { code: "FUEL_EFFICIENCY", title: "Mestre da Eficiência", description: "Consumo eficiente em 10 voos", defaultTarget: "10" },
    { code: "NAV_MASTER", title: "Mestre da Navegação", description: "Completar 20 voos de navegação", defaultTarget: "20" },
    { code: "IFR_CERTIFIED", title: "Certificado IFR", description: "Completar 50 voos em IFR", defaultTarget: "50" },
  ],
};

export function GoalModal({ open, onOpenChange, onSubmit, existingGoals = [] }: GoalModalProps) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      notificationsEnabled: true,
    },
  });

  const selectedCategory = form.watch("category");
  const selectedGoalType = form.watch("goalType");

  const availableTemplates = selectedCategory ? GOAL_TEMPLATES[selectedCategory] : [];
  const filteredTemplates = availableTemplates.filter(
    (template) => !existingGoals.includes(template.code)
  );

  const handleGoalTypeChange = (value: string) => {
    const template = availableTemplates.find((t) => t.code === value);
    if (template) {
      form.setValue("goalType", value);
      form.setValue("targetValue", template.defaultTarget);
    }
  };

  const handleSubmit = async (data: GoalFormData) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating goal:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            {t("goals.setNewGoal")}
          </DialogTitle>
          <DialogDescription>
            {t("goals.modalDescription")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("goals.goalCategory")}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("goals.selectCategory")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {GOAL_CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          <div className="flex items-center gap-2">
                            {category.icon}
                            <div>
                              <div className="font-medium">{category.label}</div>
                              <div className="text-xs text-muted-foreground">{category.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedCategory && (
              <FormField
                control={form.control}
                name="goalType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("goals.goalType")}</FormLabel>
                    <Select
                      onValueChange={handleGoalTypeChange}
                      defaultValue={field.value}
                      disabled={filteredTemplates.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("goals.selectGoalType")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredTemplates.length > 0 ? (
                          filteredTemplates.map((template) => (
                            <SelectItem key={template.code} value={template.code}>
                              <div>
                                <div className="font-medium">{template.title}</div>
                                <div className="text-xs text-muted-foreground">{template.description}</div>
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-sm text-muted-foreground">
                            {t("goals.noAvailableGoals")}
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {selectedGoalType && (
              <>
                <FormField
                  control={form.control}
                  name="targetValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("goals.targetValue")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="100"
                          {...field}
                          className="font-mono"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>{t("goals.targetDate")}</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: ptBR })
                              ) : (
                                <span>{t("goals.pickDate")}</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notificationsEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          {t("goals.enableNotifications")}
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                          {t("goals.notificationsDescription")}
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting || !selectedGoalType}>
                {isSubmitting ? t("common.saving") : t("common.save")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
