import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export const useGreeting = () => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState('Capitão');
  const [isLoading, setIsLoading] = useState(false);
  
  // Função para obter greeting baseado no horário
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return 'Bom dia';
    } else if (hour >= 12 && hour < 18) {
      return 'Boa tarde';
    } else {
      return 'Boa noite';
    }
  };
  
  const greeting = getTimeBasedGreeting();

  useEffect(() => {
    const fetchUserProfile = async () => {
      // Se não há usuário, usar fallback imediatamente
      if (!user) {
        setDisplayName('Capitão');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      try {
        // Primeiro, tentar obter nome dos metadados do usuário (mais rápido)
        const metaDisplayName = user.user_metadata?.display_name || user.user_metadata?.full_name;
        const emailName = user.email?.split('@')[0];
        
        // Se temos nome nos metadados, usar como fallback inicial
        if (metaDisplayName) {
          setDisplayName(metaDisplayName);
        } else if (emailName) {
          setDisplayName(emailName.charAt(0).toUpperCase() + emailName.slice(1));
        }
        
        // Tentar buscar o perfil do usuário na tabela profiles
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', user.id)
          .single();

        // Se conseguiu buscar o perfil e tem display_name, usar ele
        if (!error && profile?.display_name) {
          setDisplayName(profile.display_name);
        }
        // Se não conseguiu buscar ou não tem display_name, manter o fallback já definido
        
      } catch (error) {
        console.warn('Erro ao buscar perfil do usuário:', error);
        // Manter o nome que já foi definido ou usar fallback final
        if (displayName === 'Capitão') {
          const metaDisplayName = user.user_metadata?.display_name || user.user_metadata?.full_name;
          const emailName = user.email?.split('@')[0];
          
          if (metaDisplayName) {
            setDisplayName(metaDisplayName);
          } else if (emailName) {
            setDisplayName(emailName.charAt(0).toUpperCase() + emailName.slice(1));
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  return { displayName, isLoading, greeting };
};