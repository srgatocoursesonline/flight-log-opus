/**
 * Função utilitária para refresh automático após operações de CRUD
 * Usado em todos os formulários e operações que modificam dados
 */
export const autoRefresh = (delay: number = 300) => {
  setTimeout(() => {
    window.location.reload();
  }, delay);
};

/**
 * Hook personalizado para executar refresh automático
 * após operações assíncronas
 */
export const useAutoRefresh = () => {
  const refreshAfterOperation = (callback: () => void, delay: number = 300) => {
    callback();
    autoRefresh(delay);
  };

  return { refreshAfterOperation, autoRefresh };
};