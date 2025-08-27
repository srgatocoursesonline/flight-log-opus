import { useNavigate } from 'react-router-dom';

export const useFlightNavigation = () => {
  const navigate = useNavigate();

  const navigateToAddFlight = () => {
    // Navegar para a página de voos
    navigate('/flights');
    
    // Aguardar um breve momento para garantir que a página carregou
    // e então disparar evento para abrir o modal
    setTimeout(() => {
      const event = new CustomEvent('openAddFlightModal');
      window.dispatchEvent(event);
    }, 100);
  };

  return { navigateToAddFlight };
};