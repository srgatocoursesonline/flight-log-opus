import { useState, useEffect } from 'react';

export interface CustomAircraft {
  id: string;
  name: string;
  manufacturer: string;
  type: 'commercial' | 'business' | 'general' | 'bush' | 'aerobatic' | 'glider' | 'helicopter' | 'military' | 'other';
  description: string;
  isDefault: boolean;
  isActive: boolean;
  hourlyRate?: number; // CR por hora de voo
}

const DEFAULT_AIRCRAFT_ADDITIONS: CustomAircraft[] = [
  {
    id: 'custom-cessna-172',
    name: 'Cessna 172 (Personalizado)',
    manufacturer: 'Cessna',
    type: 'general',
    description: 'Configuração personalizada do Cessna 172',
    isDefault: false,
    isActive: true,
    hourlyRate: 150
  }
];

const STORAGE_KEY = 'msfs-custom-aircraft';

export const useAircraftManager = () => {
  const [customAircraft, setCustomAircraft] = useState<CustomAircraft[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar aeronaves personalizadas do localStorage
  useEffect(() => {
    try {
      const savedAircraft = localStorage.getItem(STORAGE_KEY);
      if (savedAircraft) {
        const parsedAircraft = JSON.parse(savedAircraft);
        setCustomAircraft(parsedAircraft);
      } else {
        // Primeira inicialização
        setCustomAircraft(DEFAULT_AIRCRAFT_ADDITIONS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_AIRCRAFT_ADDITIONS));
      }
    } catch (error) {
      console.error('Erro ao carregar aeronaves personalizadas:', error);
      setCustomAircraft(DEFAULT_AIRCRAFT_ADDITIONS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Salvar aeronaves no localStorage
  const saveAircraft = (newAircraft: CustomAircraft[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newAircraft));
      setCustomAircraft(newAircraft);
    } catch (error) {
      console.error('Erro ao salvar aeronaves personalizadas:', error);
    }
  };

  const addAircraft = (aircraft: Omit<CustomAircraft, 'id' | 'isDefault'>) => {
    const newAircraft: CustomAircraft = {
      ...aircraft,
      id: Date.now().toString(),
      isDefault: false
    };
    const updatedAircraft = [...customAircraft, newAircraft];
    saveAircraft(updatedAircraft);
  };

  const updateAircraft = (id: string, updates: Partial<CustomAircraft>) => {
    const updatedAircraft = customAircraft.map(aircraft =>
      aircraft.id === id ? { ...aircraft, ...updates } : aircraft
    );
    saveAircraft(updatedAircraft);
  };

  const deleteAircraft = (id: string) => {
    const aircraft = customAircraft.find(a => a.id === id);
    if (aircraft?.isDefault) {
      throw new Error('Não é possível excluir aeronaves padrão');
    }
    
    const updatedAircraft = customAircraft.filter(aircraft => aircraft.id !== id);
    saveAircraft(updatedAircraft);
  };

  const toggleAircraftActive = (id: string) => {
    const updatedAircraft = customAircraft.map(aircraft =>
      aircraft.id === id ? { ...aircraft, isActive: !aircraft.isActive } : aircraft
    );
    saveAircraft(updatedAircraft);
  };

  const getActiveAircraft = () => {
    return customAircraft.filter(aircraft => aircraft.isActive);
  };

  const getAircraftByType = (type: CustomAircraft['type']) => {
    return customAircraft.filter(aircraft => aircraft.type === type && aircraft.isActive);
  };

  const resetToDefaults = () => {
    setCustomAircraft(DEFAULT_AIRCRAFT_ADDITIONS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_AIRCRAFT_ADDITIONS));
  };

  return {
    customAircraft,
    isLoading,
    addAircraft,
    updateAircraft,
    deleteAircraft,
    toggleAircraftActive,
    getActiveAircraft,
    getAircraftByType,
    resetToDefaults
  };
};