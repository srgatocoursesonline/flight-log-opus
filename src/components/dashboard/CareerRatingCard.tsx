import { Trophy, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { useSupabaseCareerManager } from '@/hooks/useSupabaseCareerManager';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const CareerRatingCard = () => {
  const { careerData, isLoading, refresh } = useSupabaseCareerManager();
  const [showReminder, setShowReminder] = useState(true);
  const navigate = useNavigate();
  
  // Debug: Log career data changes
  useEffect(() => {
    console.log('CareerRatingCard - careerData updated:', careerData);
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
    <div className="hud-display stats-card fade-in p-6 relative overflow-hidden">
      {showReminder && careerData && (
        <Alert className="mb-4 bg-primary/10 border-primary/20">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Lembrete</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>Verifique regularmente seu Rating total no Microsoft Flight Simulator.</span>
            <Button 
              variant="link" 
              className="p-0 h-auto text-xs text-primary"
              onClick={hideReminder}
            >
              Ocultar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Rating de Carreira
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-3xl font-bold tracking-tight text-foreground font-mono">
              {isLoading ? '...' : (careerData?.totalRating?.toLocaleString() || '0')}
            </p>
            <span className="text-sm font-medium text-success">
              +5.2%
            </span>
          </div>
          {careerData && (
            <div className="mt-1 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Badge className={`text-xs font-medium border ${getClassColor(careerData.careerClass)}`}>
                  Classe {careerData.careerClass}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Nível {careerData.level}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {getPerformanceText(careerData.careerClass)}
              </p>
              {/* Debug information */}
              <p className="text-xs text-muted-foreground mt-1">
                Última atualização: {careerData.lastUpdated ? new Date(careerData.lastUpdated).toLocaleTimeString() : 'N/A'}
              </p>
            </div>
          )}
        </div>
        
        <div className="rounded-lg bg-primary/10 p-3 icon-hover">
          <div className="text-primary">
            <Trophy className="h-6 w-6" />
          </div>
        </div>
      </div>
      
      {/* HUD-style corner decorations */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/30 transition-all duration-300" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary/30 transition-all duration-300" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary/30 transition-all duration-300" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary/30 transition-all duration-300" />
    </div>
  );
};