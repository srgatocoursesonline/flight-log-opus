import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Award, AlertCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSupabaseCareerManager, type CareerData } from '@/hooks/supabase/useSupabaseCareerManager';
import { useToast } from '@/hooks/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export const CareerRatingManager = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { careerData, updateCareerData, isLoading, error, refresh } = useSupabaseCareerManager();
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<CareerData>>({
    totalRating: 0,
    level: 1,
    careerClass: 'D'
  });
  const [showReminder, setShowReminder] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when career data loads
  useEffect(() => {
    if (careerData) {
      setFormData({
        totalRating: careerData.totalRating || 0,
        level: careerData.level || 1,
        careerClass: careerData.careerClass || 'D'
      });
    }
  }, [careerData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.totalRating === undefined || formData.totalRating < 0) {
      toast({
        title: t('common.error'),
        description: t('careerManager.errorPositiveRating'),
        variant: "destructive",
      });
      return;
    }

    if (formData.level === undefined || formData.level < 1) {
      toast({
        title: t('common.error'),
        description: t('careerManager.errorPositiveLevel'),
        variant: "destructive",
      });
      return;
    }

    if (!formData.careerClass) {
      toast({
        title: t('common.error'),
        description: t('careerManager.errorClassRequired'),
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);


      const updateData = {
        totalRating: formData.totalRating,
        level: formData.level,
        careerClass: formData.careerClass
      };



      // Fazer duas tentativas de atualização
      try {
        const result = await updateCareerData(updateData);


        // Verificar resposta
        if (result?.success) {
          toast({
            title: t('common.success'),
            description: t('careerManager.success'),
          });
        } else {
          console.warn('Resultado não indicou sucesso:', result);
          toast({
            title: t('common.warning', 'Aviso'),
            description: t('careerManager.warningUpdated'),
            variant: "default",
          });
        }
      } catch (updateError) {
        console.error('Falha na primeira tentativa:', updateError);

        // Tentar atualização direta via SQL
        try {
          const { data, error } = await supabase.rpc('exec_sql', {
            sql_query: `
              UPDATE profiles 
              SET 
                total_rating = ${updateData.totalRating}, 
                career_level = ${updateData.level}, 
                career_class = '${updateData.careerClass}',
                updated_at = NOW()
              WHERE id = '${user?.id}';
            `
          });

          if (error) throw error;


          toast({
            title: t('common.success'),
            description: t('careerManager.successSql'),
          });
        } catch (sqlError) {
          console.error('Erro na tentativa de SQL direto:', sqlError);
          throw sqlError;
        }
      }

      // Atualizar localmente em vez de recarregar a página
      setFormData((prev: Partial<CareerData>) => ({
        ...prev,
        ...updateData
      }));
    } catch (error: any) {
      console.error('Error handling form submission:', error);
      toast({
        title: t('common.error'),
        description: t('careerManager.errorUpdate', { message: error.message || 'Erro desconhecido' }),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getClassColor = (careerClass: string) => {
    switch (careerClass) {
      case 'S': return 'bg-purple-500/20 text-purple-500 border-purple-500/30';
      case 'A': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'B': return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'C': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'D': return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
      default: return 'bg-muted/30 text-muted-foreground border-muted/50';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === 'pt-BR' ? 'pt-BR' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <Card className="hud-display">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Trophy className="h-5 w-5 text-primary" />
            {t('careerManager.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-6">
            <div className="animate-pulse">{t('common.loading')}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!careerData) return null;

  return (
    <Card className="hud-display">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Trophy className="h-5 w-5 text-primary" />
          {t('careerManager.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {showReminder && (
          <Alert className="mb-4 bg-primary/10 border-primary/20">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t('careerManager.reminder')}</AlertTitle>
            <AlertDescription>
              {t('careerManager.reminderDesc')}
              <Button
                variant="link"
                className="p-0 h-auto text-xs text-primary ml-2"
                onClick={() => setShowReminder(false)}
              >
                {t('careerManager.dontShowAgain')}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-4 bg-destructive/10 border-destructive/20">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertTitle className="text-destructive">{t('common.error')}</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="total-rating">{t('careerManager.totalRating')}</Label>
              <Input
                id="total-rating"
                type="number"
                placeholder="263185"
                value={formData.totalRating !== undefined ? formData.totalRating : ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, totalRating: e.target.value !== '' ? parseInt(e.target.value) : 0 })}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="level">{t('careerManager.level')}</Label>
              <Input
                id="level"
                type="number"
                min="1"
                placeholder="35"
                value={formData.level !== undefined ? formData.level : ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, level: e.target.value !== '' ? parseInt(e.target.value) : 1 })}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="career-class">{t('careerManager.class')}</Label>
              <Select
                value={formData.careerClass || 'D'}
                onValueChange={(value: 'S' | 'A' | 'B' | 'C' | 'D') => setFormData({ ...formData, careerClass: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={t('careerManager.selectClass')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="S">{t('careerRating.classElite')}</SelectItem>
                  <SelectItem value="A">{t('careerRating.classSpecialist')}</SelectItem>
                  <SelectItem value="B">{t('careerRating.classProfessional')}</SelectItem>
                  <SelectItem value="C">{t('careerRating.classExperienced')}</SelectItem>
                  <SelectItem value="D">{t('careerRating.classBeginner')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {careerData && (
            <div className="flex items-center justify-between px-4 py-3 bg-muted/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">{t('careerManager.currentStatus')}</span>
                <span className="text-sm font-medium">
                  {t('careerRating.level')} {careerData.level}
                </span>
                <Badge className={`text-xs font-medium border ${getClassColor(careerData.careerClass)}`}>
                  {t('careerRating.class')} {careerData.careerClass}
                </Badge>
              </div>
              {careerData.lastUpdated && (
                <span className="text-xs text-muted-foreground">
                  {t('careerManager.lastUpdated')} {formatDate(careerData.lastUpdated)}
                </span>
              )}
            </div>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="hud"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('careerManager.updating') : t('careerManager.updateButton')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};