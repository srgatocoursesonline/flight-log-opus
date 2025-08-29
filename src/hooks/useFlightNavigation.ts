import { useNavigate } from 'react-router-dom';

export const useFlightNavigation = () => {
  const navigate = useNavigate();

  const navigateToAddFlight = () => {
    // Navegar para a página de voos com parâmetro para abrir modal
    navigate('/flights?openModal=true');
  };

  return { navigateToAddFlight };
};