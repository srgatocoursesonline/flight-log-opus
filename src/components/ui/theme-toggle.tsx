import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/ui/useTheme';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="w-9 h-9 p-0 hover:bg-muted/50 transition-all duration-300 icon-hover"
      title={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4 text-warning transition-all duration-300" />
      ) : (
        <Moon className="h-4 w-4 text-primary transition-all duration-300" />
      )}
    </Button>
  );
};