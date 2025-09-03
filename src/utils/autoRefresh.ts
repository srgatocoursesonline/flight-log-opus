/**
 * Função utilitária para refresh automático após operações de CRUD
 * Usado em todos os formulários e operações que modificam dados
 * NOTA: Removido window.location.reload() para evitar loops infinitos
 */
export const autoRefresh = (callback?: () => void, delay: number = 300) => {
  if (callback && typeof callback === 'function') {
    const timeoutId = setTimeout(callback, delay);
    return () => clearTimeout(timeoutId);
  }
  // Se não há callback válido, não faz nada (evita reload da página)
  // Removido o console.warn para reduzir logs
  return () => {};
};

/**
 * Hook personalizado para executar refresh automático
 * após operações assíncronas
 */
export const useAutoRefresh = () => {
  const refreshAfterOperation = (callback: () => void, delay: number = 300) => {
    callback();
    // Não chama mais autoRefresh automaticamente para evitar reloads
  };

  return { refreshAfterOperation, autoRefresh };
};