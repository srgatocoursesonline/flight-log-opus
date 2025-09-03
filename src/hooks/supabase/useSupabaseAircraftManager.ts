// ============================================
// SUPABASE AIRCRAFT MANAGER HOOK
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type AircraftType = 'commercial' | 'business' | 'general' | 'bush' | 'aerobatic' | 'glider' | 'helicopter' | 'military' | 'other';

export interface CustomAircraft {
  id: string;
  name: string;
  manufacturer: string;
  type: AircraftType;
  description: string;
  isDefault: boolean;
  isActive: boolean;
  hourlyRate: number;
}

const aircraftTypes = [
  { value: 'commercial' as const, label: 'Comercial' },
  { value: 'business' as const, label: 'Executiva' },
  { value: 'general' as const, label: 'Aviação Geral' },
  { value: 'bush' as const, label: 'Bush/Sport' },
  { value: 'aerobatic' as const, label: 'Acrobática' },
  { value: 'glider' as const, label: 'Planador' },
  { value: 'helicopter' as const, label: 'Helicóptero' },
  { value: 'military' as const, label: 'Militar' },
  { value: 'other' as const, label: 'Outros' },
];

const defaultAircraft = [
  // General Aviation - Training & Light Aircraft
  'Cessna 152',
  'Cessna 172',
  'Cessna 182',
  'Cessna 206',
  'Piper Cherokee',
  'Piper Seneca',
  'Diamond DA40-NG',
  'Diamond DA42',
  'Diamond DA62',
  
  // Regional & Turboprop
  'Cessna 208 Caravan',
  'Cessna 208 B Grand Caravan EX',
  'ATR 72-600',
  'Beechcraft King Air 350i',
  'Beechcraft King Air 250',
  'Pilatus PC-12',
  
  // Business Jets
  'Beechcraft Baron G58',
  'Beechcraft Bonanza G36',
  'Cessna Citation CJ4',
  'Cessna Citation Sovereign',
  'Embraer Phenom 300',
  'Embraer Legacy 650',
  'Gulfstream G650',
  
  // Commercial Aviation - Narrow Body
  'Airbus A320neo',
  'Airbus A321LR',
  'Boeing 737-800',
  'Boeing 737 MAX 8',
  'Embraer E-Jet E190',
  
  // Commercial Aviation - Wide Body
  'Airbus A330-300',
  'Airbus A350-900',
  'Boeing 747-8 Intercontinental',
  'Boeing 777-300ER',
  'Boeing 787-9 Dreamliner',
  
  // Cargo Aircraft
  'Boeing 747-8F',
  'Airbus A330-200F',
  'ATR 72-500F',
  
  // Military & Special
  'Lockheed C-130 Hercules',
  'Boeing KC-135 Stratotanker',
  'Northrop T-38 Talon'
];

export const useSupabaseAircraftManager = () => {
  const { user } = useAuth();
  const [customAircraft, setCustomAircraft] = useState<CustomAircraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch aircraft from database
  const fetchAircraft = useCallback(async () => {
    if (!user) {
      setCustomAircraft([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('custom_aircraft')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching aircraft:', error);
        setError('Erro ao carregar aeronaves');
        toast.error('Erro ao carregar aeronaves');
        return;
      }

      // Transform database data to match interface
      const aircraft: CustomAircraft[] = data.map(item => ({
        id: item.id,
        name: item.name,
        manufacturer: item.manufacturer || '',
        type: item.aircraft_type || 'other',
        description: item.description || '',
        isDefault: item.is_default,
        isActive: item.is_active,
        hourlyRate: item.hourly_rate || 0,
      }));

      // If no aircraft data exists, create default aircraft
      if (aircraft.length === 0) {
  
        await createDefaultAircraft();
        // Fetch again after creating defaults
        setTimeout(() => fetchAircraft(), 1000);
        return;
      }

      setCustomAircraft(aircraft);
    } catch (error) {
      console.error('Error in fetchAircraft:', error);
      setError('Erro ao conectar com o banco de dados');
      toast.error('Erro ao conectar com o banco de dados');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    if (user) {
      fetchAircraft();
    }
  }, [user?.id]); // Apenas depende do user.id para evitar loops

  // Create default aircraft
  const createDefaultAircraft = async () => {
    if (!user) return;

    try {

      
      const defaultAircraftData = defaultAircraft.map(name => ({
        user_id: user.id,
        name: name,
        manufacturer: name.split(' ')[0], // Use first word as manufacturer
        aircraft_type: 'general',
        description: `Aeronave padrão: ${name}`,
        hourly_rate: 150,
        is_active: true,
        is_default: true,
      }));

      const { error } = await supabase
        .from('custom_aircraft')
        .insert(defaultAircraftData);

      if (error) {
        console.error('Error creating default aircraft:', error);
        return;
      }


      toast.success('Aeronaves padrão criadas com sucesso!');
    } catch (error) {
      console.error('Error in createDefaultAircraft:', error);
    }
  };

  // Add new aircraft
  const addAircraft = async (aircraftData: Omit<CustomAircraft, 'id' | 'isDefault'>) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('custom_aircraft')
        .insert({
          user_id: user.id,
          name: aircraftData.name,
          manufacturer: aircraftData.manufacturer,
          aircraft_type: aircraftData.type,
          description: aircraftData.description,
          hourly_rate: aircraftData.hourlyRate,
          is_active: aircraftData.isActive,
          is_default: false,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding aircraft:', error);
        toast.error('Erro ao adicionar aeronave');
        return;
      }

      // Refresh data
      await fetchAircraft();
      toast.success(`Aeronave "${aircraftData.name}" adicionada com sucesso!`);
    } catch (error) {
      console.error('Error in addAircraft:', error);
      toast.error('Erro ao adicionar aeronave');
    }
  };

  // Delete aircraft
  const deleteAircraft = async (aircraftId: string) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      const { error } = await supabase
        .from('custom_aircraft')
        .delete()
        .eq('id', aircraftId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting aircraft:', error);
        toast.error('Erro ao deletar aeronave');
        return;
      }

      // Update local state
      setCustomAircraft(prev => prev.filter(aircraft => aircraft.id !== aircraftId));
      toast.success('Aeronave deletada com sucesso!');
    } catch (error) {
      console.error('Error in deleteAircraft:', error);
      toast.error('Erro ao deletar aeronave');
    }
  };

  // Toggle aircraft active status
  const toggleAircraftActive = async (aircraftId: string) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      const aircraft = customAircraft.find(a => a.id === aircraftId);
      if (!aircraft) return;

      const { error } = await supabase
        .from('custom_aircraft')
        .update({ is_active: !aircraft.isActive })
        .eq('id', aircraftId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error toggling aircraft:', error);
        toast.error('Erro ao atualizar aeronave');
        return;
      }

      // Update local state
      setCustomAircraft(prev => 
        prev.map(a => 
          a.id === aircraftId 
            ? { ...a, isActive: !a.isActive }
            : a
        )
      );

      toast.success(`Aeronave ${!aircraft.isActive ? 'ativada' : 'desativada'} com sucesso!`);
    } catch (error) {
      console.error('Error in toggleAircraftActive:', error);
      toast.error('Erro ao atualizar aeronave');
    }
  };

  // Reset to defaults (this will trigger default data creation in database)
  const resetToDefaults = async () => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      // Delete all user aircraft
      const { error: deleteError } = await supabase
        .from('custom_aircraft')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('Error resetting aircraft:', deleteError);
        toast.error('Erro ao restaurar aeronaves padrão');
        return;
      }

      // Refresh data (default aircraft will be created by trigger)
      await fetchAircraft();
      toast.success('Aeronaves restauradas para padrão!');
    } catch (error) {
      console.error('Error in resetToDefaults:', error);
      toast.error('Erro ao restaurar aeronaves padrão');
    }
  };

  // Get all aircraft names (custom + default)
  const getAllAircraftNames = () => {
    const activeCustomNames = customAircraft
      .filter(aircraft => aircraft.isActive)
      .map(aircraft => aircraft.name);
    
    return [...activeCustomNames, ...defaultAircraft].sort();
  };

  return {
    customAircraft,
    loading,
    error,
    addAircraft,
    deleteAircraft,
    toggleAircraftActive,
    resetToDefaults,
    getAllAircraftNames,
    aircraftTypes,
    refresh: fetchAircraft,
  };
};