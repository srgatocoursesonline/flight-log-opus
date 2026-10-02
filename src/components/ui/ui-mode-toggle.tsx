import { Sparkles, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUIMode } from '@/hooks/ui/useUIMode';
import { useTranslation } from 'react-i18next';

/**
 * Alterna entre o visual clássico e o novo (rebranding).
 * O modo é persistido por usuário (localStorage) e aplicado
 * antes do paint via classe ui-new/ui-classic no <html>.
 */
export const UIModeToggle = () => {
  const { mode, toggleUIMode } = useUIMode();
  const { t } = useTranslation();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleUIMode}
      className="w-9 h-9 p-0 hover:bg-muted/50 transition-all duration-300 icon-hover"
      title={mode === 'classic' ? t('statusBar.uiModeNew') : t('statusBar.uiModeClassic')}
    >
      {mode === 'classic' ? (
        <Sparkles className="h-4 w-4 text-muted-foreground transition-all duration-300" />
      ) : (
        <History className="h-4 w-4 text-primary transition-all duration-300" />
      )}
    </Button>
  );
};
