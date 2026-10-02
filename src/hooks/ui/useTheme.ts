import { useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

// Função para aplicar tema imediatamente
const applyTheme = (theme: Theme) => {
  const root = document.documentElement;

  // Remover classe anterior
  root.classList.remove('light', 'dark');

  // Adicionar nova classe
  root.classList.add(theme);

  // Sincronizar theme-color do browser/PWA com o tema ativo
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? '#020817' : '#ffffff');

  // Salvar no localStorage
  localStorage.setItem('flight-log-theme', theme);
};

// Inicializar tema imediatamente (antes mesmo do React)
const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('flight-log-theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme;
    }
  }
  return 'dark'; // Tema padrão
};

// Aplicar tema inicial imediatamente
if (typeof window !== 'undefined') {
  applyTheme(getInitialTheme());
}

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return {
    theme,
    toggleTheme,
    setTheme
  };
};