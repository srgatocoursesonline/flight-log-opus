import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface UserProfile {
  display_name: string;
}

export const useGreeting = () => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState<string>('Capitão');
  const [isLoading, setIsLoading] = useState(true);

  // Função para obter a saudação baseada no horário
  const getTimeBasedGreeting = (): string => {
    const hour = new Date().getHours();
    
    if (hour >= 0 && hour < 12) {
      return 'Bom dia';
    } else if (hour >= 12 && hour < 19) {
      return 'Boa tarde';
    } else {
      return 'Boa noite';
    }
  };

  // Buscar o display_name do usuário
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setDisplayName('Capitão');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Buscar o perfil do usuário na tabela profiles
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Erro ao buscar perfil do usuário:', error);
          // Fallback para o display_name dos metadados do usuário
          const metaDisplayName = user.user_metadata?.display_name;
          setDisplayName(metaDisplayName || 'Capitão');
        } else if (profile?.display_name) {
          setDisplayName(profile.display_name);
        } else {
          // Fallback para o display_name dos metadados do usuário
          const metaDisplayName = user.user_metadata?.display_name;
          setDisplayName(metaDisplayName || 'Capitão');
        }
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        setDisplayName('Capitão');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  // Gerar a saudação completa
  const getGreeting = (): string => {
    const timeGreeting = getTimeBasedGreeting();
    return `${timeGreeting}, ${displayName}`;
  };

  return {
    greeting: getGreeting(),
    displayName,
    timeGreeting: getTimeBasedGreeting(),
    isLoading
  };
};