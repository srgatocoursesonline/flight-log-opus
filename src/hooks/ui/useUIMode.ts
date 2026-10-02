import { useEffect, useState } from 'react';

export type UIMode = 'classic' | 'new';

// Aplicar modo imediatamente (espelha o padrão do useTheme)
const applyUIMode = (mode: UIMode) => {
  const root = document.documentElement;
  root.classList.remove('ui-classic', 'ui-new');
  root.classList.add(`ui-${mode}`);
  localStorage.setItem('flight-log-ui-mode', mode);
};

const getInitialUIMode = (): UIMode => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('flight-log-ui-mode');
    if (saved === 'classic' || saved === 'new') {
      return saved;
    }
  }
  return 'classic';
};

// Aplicar modo inicial imediatamente
if (typeof window !== 'undefined') {
  applyUIMode(getInitialUIMode());
}

export const useUIMode = () => {
  const [mode, setMode] = useState<UIMode>(getInitialUIMode);

  useEffect(() => {
    applyUIMode(mode);
  }, [mode]);

  const toggleUIMode = () => {
    setMode(prev => (prev === 'classic' ? 'new' : 'classic'));
  };

  return {
    mode,
    isNewUI: mode === 'new',
    setMode,
    toggleUIMode
  };
};
