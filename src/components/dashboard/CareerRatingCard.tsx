import { Trophy, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { useSupabaseCareerManager } from '@/hooks/supabase/useSupabaseCareerManager';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useProfileFinancialSync } from '@/hooks/useProfileFinancialSync';

export function CareerRatingCard() {
  const { careerData, isLoading, refresh } = useSupabaseCareerManager();
  const [showReminder, setShowReminder] = useState(true);
  const navigate = useNavigate();
  
  // Sincronização automática do career_rating com lucro líquido
  useProfileFinancialSync();

  
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
      <div className="hud-display stats-card p-6 relative overflow-hidden">
        <Alert className="bg-primary/10 border-primary/20">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Dados de Carreira não Encontrados</AlertTitle>
          <AlertDescription>
            Configure seus dados de carreira do Microsoft Flight Simulator para visualizar seu progresso.
            <Button 
              variant="hud" 
              size="sm" 
              className="mt-2"
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
          <p className="mobile-card-title text-readable-muted uppercase tracking-wider">
            Rating de Carreira
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <p className="mobile-value text-yellow-700 dark:text-yellow-400 font-mono">
              {isLoading ? '...' : (careerData?.totalRating?.toLocaleString() || '0')}
            </p>
            <span className="mobile-trend text-success">
              +5.2%
            </span>
          </div>
          {careerData && (
            <p className="mobile-card-subtitle text-readable-muted mt-1">
              Classe {careerData.careerClass} • Nível {careerData.level}
            </p>
          )}
        </div>
        
        <div className="mobile-icon-container rounded-lg bg-primary/10 icon-hover flex-shrink-0">
          <div className="text-primary">
            <Trophy className="h-6 w-6" />
          </div>
        </div>
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