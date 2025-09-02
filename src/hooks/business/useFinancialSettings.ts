import { useState, useEffect, useCallback } from 'react';
import { autoRefresh } from '@/utils/autoRefresh';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface FinancialSettings {
  initialBalance: number;
  currency: string;
  lastUpdated: string;
}

const STORAGE_KEY = 'msfs-financial-settings';
const DEFAULT_INITIAL_BALANCE = 5922235; // Valor padrão atual

export const useFinancialSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<FinancialSettings>({
    initialBalance: DEFAULT_INITIAL_BALANCE,
    currency: 'CR',
    lastUpdated: new Date().toISOString()
  });
  const [isLoading, setIsLoading] = useState(true);

  // Carregar configurações do Supabase ou localStorage
  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      // Se usuário está logado, tentar carregar do Supabase
      if (user) {
        const { data: userSettings, error } = await supabase
          .from('user_settings')
          .select('initial_balance')
          .eq('user_id', user.id)
          .single();
        
        if (error) {
          // Se não existe configuração no Supabase, criar uma nova
          if (error.code === 'PGRST116') {
            const { error: insertError } = await supabase
              .from('user_settings')
              .insert({
                user_id: user.id,
                initial_balance: DEFAULT_INITIAL_BALANCE
              });
            
            if (insertError) {
              console.error('Erro ao criar configurações iniciais:', insertError);
            } else {
              setSettings({
                initialBalance: DEFAULT_INITIAL_BALANCE,
                currency: 'CR',
                lastUpdated: new Date().toISOString()
              });
            }
          }
        } else if (userSettings?.initial_balance) {
          setSettings({
            initialBalance: userSettings.initial_balance,
            currency: 'CR',
            lastUpdated: new Date().toISOString()
          });
        }
      } else {
        // Se não está logado, usar localStorage
        const savedSettings = localStorage.getItem(STORAGE_KEY);
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setSettings({
            initialBalance: parsed.initialBalance || DEFAULT_INITIAL_BALANCE,
            currency: parsed.currency || 'CR',
            lastUpdated: parsed.lastUpdated || new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Erro ao carregar configurações financeiras:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);
  
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Salvar configurações no Supabase e localStorage
  const saveSettings = async (newSettings: Partial<FinancialSettings>) => {
    try {
      const updatedSettings = {
        ...settings,
        ...newSettings,
        lastUpdated: new Date().toISOString()
      };
      
      // Salvar no localStorage (sempre)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSettings));
      
      // Se usuário está logado, salvar também no Supabase
      if (user && newSettings.initialBalance !== undefined) {
        const { error } = await supabase
          .from('user_settings')
          .update({ initial_balance: newSettings.initialBalance })
          .eq('user_id', user.id);
        
        if (error) {
          // Se der erro, tentar criar o registro
          if (error.code === 'PGRST116') {
            const { error: insertError } = await supabase
              .from('user_settings')
              .insert({
                user_id: user.id,
                initial_balance: newSettings.initialBalance
              });
            
            if (insertError) {
              console.error('Erro ao criar registro no Supabase:', insertError);
            }
          }
        }
      }
      
      setSettings(updatedSettings);
      
      // Refresh automático após salvar configurações
      autoRefresh();
    } catch (error) {
      console.error('Erro ao salvar configurações financeiras:', error);
    }
  };

  const updateInitialBalance = async (newBalance: number) => {
    console.log('🔍 DEBUG - updateInitialBalance chamado com:', newBalance);
    console.log('🔍 Estado atual:', settings);
    
    if (newBalance < 0) {
      throw new Error('O valor inicial não pode ser negativo');
    }
    
    console.log('🚀 Chamando saveSettings...');
    await saveSettings({ initialBalance: newBalance });
    console.log('✅ saveSettings concluído');
  };

  const resetToDefault = async () => {
    await saveSettings({
      initialBalance: DEFAULT_INITIAL_BALANCE,
      currency: 'CR'
    });
  };

  const getInitialBalance = () => {
    return settings.initialBalance;
  };

  return {
    settings,
    isLoading,
    updateInitialBalance,
    resetToDefault,
    getInitialBalance,
    saveSettings
  };
};