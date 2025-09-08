import { Trophy, AlertCircle, Edit3, Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { useSupabaseCareerManager } from '@/hooks/supabase/useSupabaseCareerManager';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useProfileFinancialSync } from '@/hooks/useProfileFinancialSync';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export function CareerRatingCard() {
  const { careerData, isLoading, refresh, updateCareerData } = useSupabaseCareerManager();
  const [showReminder, setShowReminder] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    totalRating: 0,
    level: 1,
    careerClass: 'D' as 'S' | 'A' | 'B' | 'C' | 'D'
  });
  const navigate = useNavigate();
  
  // Sincronização automática do career_rating com lucro líquido
  useProfileFinancialSync();

  // Sincronizar dados de edição quando careerData muda
  useEffect(() => {
    if (careerData) {
      setEditData({
        totalRating: careerData.totalRating,
        level: careerData.level,
        careerClass: careerData.careerClass
      });
    }
  }, [careerData]);
  
  // Verificar se o lembrete deve ser exibido (baseado em localStorage)
  useEffect(() => {
    const reminderHidden = localStorage.getItem('career_reminder_hidden');
    if (reminderHidden === 'true') {
      setShowReminder(false);
    }
  }, []);

  const hideReminder = () => {
    localStorage.setItem('career_reminder_hidden', 'true');
    setShowReminder(false);
  };

  const navigateToSettings = () => {
    navigate('/settings');
    // Abrir a seção de carreira após um pequeno delay
    setTimeout(() => {
      // Enviar evento para abrir a seção de carreira
      const event = new CustomEvent('openCareerSection');
      window.dispatchEvent(event);
    }, 100);
  };

  const startEditing = () => {
    if (careerData) {
      setEditData({
        totalRating: careerData.totalRating,
        level: careerData.level,
        careerClass: careerData.careerClass
      });
    }
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    if (careerData) {
      setEditData({
        totalRating: careerData.totalRating,
        level: careerData.level,
        careerClass: careerData.careerClass
      });
    }
  };

  const saveChanges = async () => {
    try {
      await updateCareerData(editData);
      setIsEditing(false);
      toast.success('Dados de carreira atualizados com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar os dados');
    }
  };

  const getClassColor = (careerClass: string) => {
    switch (careerClass) {
      case 'S': return 'bg-purple-500/20 text-purple-500 border-purple-500/30';
      case 'A': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'B': return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'C': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'D': return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
      default: return 'bg-muted/30 text-readable-muted border-muted/50';
    }
  };

  const getPerformanceText = (careerClass: string) => {
    switch (careerClass) {
      case 'S': return 'Desempenho Excepcional';
      case 'A': return 'Desempenho Excelente';
      case 'B': return 'Bom Desempenho';
      case 'C': return 'Desempenho Competente';
      case 'D': return 'Desempenho em Desenvolvimento';
      default: return 'Desempenho Padrão';
    }
  };

  // Se não há dados de carreira, exibir um lembrete para configurar
  if (!careerData && !isLoading) {
    return (
      <div className="hud-display stats-card p-4 relative overflow-hidden">
        <Alert className="bg-primary/10 border-primary/20">
          <AlertCircle className="h-3.5 w-3.5" />
          <AlertTitle className="text-sm">Dados de Carreira não Encontrados</AlertTitle>
          <AlertDescription className="text-xs">
            Configure seus dados de carreira do Microsoft Flight Simulator para visualizar seu progresso.
            <Button 
              variant="hud" 
              size="sm" 
              className="mt-1 h-7 text-xs"
              onClick={navigateToSettings}
            >
              Configurar Agora
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mobile-card hud-display stats-card relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-readable-muted uppercase tracking-wider">
              Rating de Carreira
            </p>
            {!isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={startEditing}
                className="h-5 w-5 p-0 hover:bg-primary/10"
                title="Editar CR, Nível e Classe"
              >
                <Edit3 className="h-2.5 w-2.5" />
              </Button>
            )}
          </div>
          
          {isEditing ? (
            <div className="space-y-2">
            <div>
              <label className="text-xs text-readable-muted mb-0.5 block">Rating Total</label>
              <Input
                type="number"
                value={editData.totalRating}
                onChange={(e) => setEditData(prev => ({ ...prev, totalRating: parseInt(e.target.value) || 0 }))}
                className="h-7 text-xs"
                min="0"
                max="9999999"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-readable-muted mb-0.5 block">Nível</label>
                <Input
                  type="number"
                  value={editData.level}
                  onChange={(e) => setEditData(prev => ({ ...prev, level: parseInt(e.target.value) || 1 }))}
                  className="h-7 text-xs"
                  min="1"
                />
              </div>
              <div>
                <label className="text-xs text-readable-muted mb-0.5 block">Classe</label>
                <Select
                  value={editData.careerClass}
                  onValueChange={(value: 'S' | 'A' | 'B' | 'C' | 'D') => setEditData(prev => ({ ...prev, careerClass: value }))}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="S">Classe S (Elite)</SelectItem>
                    <SelectItem value="A">Classe A (Especialista)</SelectItem>
                    <SelectItem value="B">Classe B (Profissional)</SelectItem>
                    <SelectItem value="C">Classe C (Experiente)</SelectItem>
                    <SelectItem value="D">Classe D (Iniciante)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-1.5 pt-1">
              <Button
                size="sm"
                onClick={saveChanges}
                className="h-6 px-2 text-xs"
                disabled={isLoading}
              >
                <Save className="h-2.5 w-2.5 mr-1" />
                Salvar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={cancelEditing}
                className="h-6 px-2 text-xs"
              >
                <X className="h-2.5 w-2.5 mr-1" />
                Cancelar
              </Button>
            </div>
          </div>
          ) : (
            <>
              <div className="mt-1 flex items-baseline gap-1">
                <p className="mobile-value text-2xl font-bold text-foreground font-mono">
                  {isLoading ? '...' : (careerData?.totalRating?.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || '0')}
                </p>
                <span className="mobile-trend text-success text-xs">
                  +5.2%
                </span>
              </div>
              {careerData && (
                <p className="mobile-card-subtitle text-readable-muted mt-0.5 text-xs">
                  Classe {careerData.careerClass} • Nível {careerData.level}
                </p>
              )}
            </>
          )}
        </div>
        
        {!isEditing && (
          <div className="mobile-icon-container rounded-lg bg-primary/10 icon-hover flex-shrink-0">
            <div className="text-primary">
              <Trophy className="h-5 w-5" />
            </div>
          </div>
        )}
      </div>
      
      {/* HUD-style corner decorations */}
      <div className="absolute top-0 left-0 w-3 h-3 xs:w-4 xs:h-4 border-t-2 border-l-2 border-primary/30 transition-all duration-300" />
      <div className="absolute top-0 right-0 w-3 h-3 xs:w-4 xs:h-4 border-t-2 border-r-2 border-primary/30 transition-all duration-300" />
      <div className="absolute bottom-0 left-0 w-3 h-3 xs:w-4 xs:h-4 border-b-2 border-l-2 border-primary/30 transition-all duration-300" />
      <div className="absolute bottom-0 right-0 w-3 h-3 xs:w-4 xs:h-4 border-b-2 border-r-2 border-primary/30 transition-all duration-300" />
    </div>
  );
}

export default CareerRatingCard;