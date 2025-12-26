import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFinancialSettings } from '@/hooks/business/useFinancialSettings';

import { DollarSign, RotateCcw, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export const FinancialSettingsManager = () => {
  const { t, i18n } = useTranslation();
  const { settings, isLoading, updateInitialBalance, resetToDefault } = useFinancialSettings();
  const [tempValue, setTempValue] = useState(settings.initialBalance.toString());
  const [isSaving, setIsSaving] = useState(false);

  // Atualizar tempValue quando settings.initialBalance mudar
  useEffect(() => {
    setTempValue(settings.initialBalance.toString());
  }, [settings.initialBalance]);

  const formatCR = (amount: number) => {
    return amount.toLocaleString(i18n.language === 'pt-BR' ? 'pt-BR' : 'en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const newValue = parseFloat(tempValue.replace(/[^0-9.-]/g, ''));

      console.log('🔍 DEBUG - handleSave:', {
        tempValue,
        newValue,
        currentBalance: settings.initialBalance,
        isNaN: isNaN(newValue)
      });

      if (isNaN(newValue)) {
        toast.error(t('settings.financial.invalidValue', 'Por favor, insira um valor numérico válido'));
        return;
      }

      if (newValue < 0) {
        toast.error(t('settings.financial.negativeValue', 'O valor inicial não pode ser negativo'));
        return;
      }

      console.log('🚀 Chamando updateInitialBalance com:', newValue);
      await updateInitialBalance(newValue);
      console.log('✅ updateInitialBalance concluído');
      toast.success(t('settings.financial.success', 'Valor inicial atualizado com sucesso!'));
    } catch (error) {
      console.error('❌ Erro ao salvar valor inicial:', error);
      toast.error(t('settings.financial.error', 'Erro ao salvar o valor inicial'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (confirm(t('settings.financial.confirmReset', 'Tem certeza que deseja restaurar o valor padrão?'))) {
      try {
        await resetToDefault();
        setTempValue('5922235');
        toast.success(t('settings.financial.resetSuccess', 'Valor inicial restaurado para o padrão'));
      } catch (error) {
        console.error('Erro ao restaurar valor padrão:', error);
        toast.error(t('settings.financial.resetError', 'Erro ao restaurar o valor padrão'));
      }
    }
  };

  const handleInputChange = (value: string) => {
    // Permitir apenas números, pontos e vírgulas - sem limitação de dígitos
    const cleanValue = value.replace(/[^0-9.,]/g, '').replace(',', '.');
    // Remover múltiplos pontos decimais
    const parts = cleanValue.split('.');
    const finalValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleanValue;
    setTempValue(finalValue);
  };

  const formatInputValue = (value: string) => {
    // Não formatar durante a edição para permitir valores grandes
    return value;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {t('settings.financial.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-10 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          {t('settings.financial.title')}
        </CardTitle>
        <CardDescription>
          {t('settings.financial.initialBalanceDesc')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="initial-balance">{t('settings.financial.initialBalance')} (CR)</Label>
            <div className="flex gap-2">
              <Input
                id="initial-balance"
                type="text"
                value={formatInputValue(tempValue)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e.target.value)}
                placeholder={t('settings.financial.placeholder', 'Digite o valor inicial')}
                className="flex-1"
              />
              <Button
                onClick={handleSave}
                disabled={isSaving}
                size="sm"
              >
                <Save className="h-4 w-4 mr-1" />
                {isSaving ? t('common.saving') : t('common.save')}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('settings.financial.currentValue', 'Valor atual')}: <span className="font-medium text-foreground">{formatCR(settings.initialBalance)} CR</span>
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div>
              <h4 className="font-medium text-foreground">{t('settings.financial.restoreDefault', 'Restaurar Padrão')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('settings.financial.restoreDesc', 'Voltar ao valor padrão de {{value}}', { value: formatCR(5922235) })}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={settings.initialBalance === 5922235}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              {t('common.restore', 'Restaurar')}
            </Button>
          </div>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium text-foreground mb-2">💡 {t('settings.financial.howItWorks', 'Como funciona')}</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t('settings.financial.howItWorksDesc', 'O valor inicial é a base do seu sistema financeiro. Todas as receitas e despesas serão calculadas a partir deste valor. Quando você registrar voos com status "completo", o CR desses voos será somado ao valor inicial.')}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            <strong>{t('settings.financial.formula', 'Fórmula')}:</strong> {t('settings.financial.formulaDesc', 'Receita Total = Valor Inicial + CR dos Voos + Receitas Extras')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};