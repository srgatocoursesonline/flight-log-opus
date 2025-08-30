import { useState, useEffect } from 'react';

// Tipos para configurações de voo
export type FuelUnit = 'lb' | 'kg';

export interface FlightSettings {
  fuelUnit: FuelUnit;
}

// Configurações padrão
const DEFAULT_SETTINGS: FlightSettings = {
  fuelUnit: 'lb'
};

// Chave para localStorage
const STORAGE_KEY = 'msfs-flight-settings';

/**
 * Hook para gerenciar configurações de voo
 * Inclui unidade de combustível e outras preferências
 */
export const useFlightSettings = () => {
  const [settings, setSettings] = useState<FlightSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar configurações do localStorage na inicialização
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedSettings = JSON.parse(stored) as FlightSettings;
        setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações de voo:', error);
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Salvar configurações no localStorage
  const saveSettings = (newSettings: Partial<FlightSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSettings));
      return true;
    } catch (error) {
      console.error('Erro ao salvar configurações de voo:', error);
      return false;
    }
  };

  // Atualizar unidade de combustível
  const setFuelUnit = (unit: FuelUnit) => {
    return saveSettings({ fuelUnit: unit });
  };

  // Resetar para configurações padrão
  const resetToDefaults = () => {
    try {
      setSettings(DEFAULT_SETTINGS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
      return true;
    } catch (error) {
      console.error('Erro ao resetar configurações:', error);
      return false;
    }
  };

  // Função utilitária para obter o label da unidade
  const getFuelUnitLabel = (unit?: FuelUnit) => {
    const targetUnit = unit || settings.fuelUnit;
    return targetUnit === 'kg' ? 'Combustível (kg)' : 'Combustível (lb)';
  };

  // Função utilitária para obter o placeholder da unidade
  const getFuelUnitPlaceholder = (unit?: FuelUnit) => {
    const targetUnit = unit || settings.fuelUnit;
    return targetUnit === 'kg' ? '2850' : '6283';
  };

  // Função para converter entre unidades (lb para kg e vice-versa)
  const convertFuelUnit = (value: number, fromUnit: FuelUnit, toUnit: FuelUnit): number => {
    if (fromUnit === toUnit) return value;
    
    if (fromUnit === 'lb' && toUnit === 'kg') {
      return Math.round(value * 0.453592); // 1 lb = 0.453592 kg
    } else if (fromUnit === 'kg' && toUnit === 'lb') {
      return Math.round(value / 0.453592); // 1 kg = 2.20462 lb
    }
    
    return value;
  };

  return {
    settings,
    isLoading,
    setFuelUnit,
    resetToDefaults,
    getFuelUnitLabel,
    getFuelUnitPlaceholder,
    convertFuelUnit,
    
    // Propriedades de conveniência
    fuelUnit: settings.fuelUnit,
    isFuelInKg: settings.fuelUnit === 'kg',
    isFuelInLb: settings.fuelUnit === 'lb'
  };
};

export default useFlightSettings;