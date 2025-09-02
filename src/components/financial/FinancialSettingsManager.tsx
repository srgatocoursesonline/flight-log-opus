import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFinancialSettings } from '@/hooks/business/useFinancialSettings';

import { DollarSign, RotateCcw, Save } from 'lucide-react';
import { toast } from 'sonner';

export const FinancialSettingsManager = () => {
  const { settings, isLoading, updateInitialBalance, resetToDefault } = useFinancialSettings();
  const [tempValue, setTempValue] = useState(settings.initialBalance.toString());
  const [isSaving, setIsSaving] = useState(false);

  // Atualizar tempValue quando settings.initialBalance mudar
  useEffect(() => {
    setTempValue(settings.initialBalance.toString());
  }, [settings.initialBalance]);

  const formatCR = (amount: number) => {
    return new Intl.NumberFormat('pt-BR').format(amount);
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
        toast.error('Por favor, insira um valor numérico válido');
        return;
      }
      
      if (newValue < 0) {
        toast.error('O valor inicial não pode ser negativo');
        return;
      }
      
      console.log('🚀 Chamando updateInitialBalance com:', newValue);
      await updateInitialBalance(newValue);
      console.log('✅ updateInitialBalance concluído');
      toast.success('Valor inicial atualizado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao salvar valor inicial:', error);
      toast.error('Erro ao salvar o valor inicial');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (confirm('Tem certeza que deseja restaurar o valor padrão?')) {
      try {
        await resetToDefault();
        setTempValue('5922235');
        toast.success('Valor inicial restaurado para o padrão');
      } catch (error) {
        console.error('Erro ao restaurar valor padrão:', error);
        toast.error('Erro ao restaurar o valor padrão');
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
            Configurações Financeiras
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
          Configurações Financeiras
        </CardTitle>
        <CardDescription>
          Configure o valor inicial da sua conta para cálculos financeiros
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="initial-balance">Valor Inicial (CR)</Label>
            <div className="flex gap-2">
              <Input
                id="initial-balance"
                type="text"
                value={formatInputValue(tempValue)}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Digite o valor inicial"
                className="flex-1"
              />
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                size="sm"
              >
                <Save className="h-4 w-4 mr-1" />
                {isSaving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Valor atual: <span className="font-medium text-foreground">{formatCR(settings.initialBalance)} CR</span>
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div>
              <h4 className="font-medium text-foreground">Restaurar Padrão</h4>
              <p className="text-sm text-muted-foreground">
                Voltar ao valor padrão de {formatCR(5922235)}
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleReset}
              disabled={settings.initialBalance === 5922235}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Restaurar
            </Button>
          </div>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium text-foreground mb-2">💡 Como funciona</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            O valor inicial é a base do seu sistema financeiro. Todas as receitas e despesas 
            serão calculadas a partir deste valor. Quando você registrar voos com status "completo", 
            o CR desses voos será somado ao valor inicial.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            <strong>Fórmula:</strong> Receita Total = Valor Inicial + CR dos Voos + Receitas Extras
          </p>
        </div>
      </CardContent>
    </Card>
  );
};