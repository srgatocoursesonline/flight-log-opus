import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export interface ProfileData {
  id: string;
  display_name: string;
  email?: string;
  avatar_url?: string;
  total_flights: number;
  total_hours: number;
  career_rating: number;
  total_rating: number;
  career_level: number;
  career_class: 'S' | 'A' | 'B' | 'C' | 'D';
  world_ranking: number;
  career_started?: string;
  achievements?: string;
  perfect_flights?: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar dados do perfil
  const fetchProfile = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      setProfile(data);
    } catch (err) {
      console.error('Erro ao buscar perfil:', err);
      setError('Erro ao carregar dados do perfil');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Sincronizar career_rating do perfil com lucro líquido financeiro
  const syncCareerRatingWithNetProfit = async (netProfit: number) => {
    if (!user || !profile) {
      return;
    }

    try {
      // CR deve ser sempre igual ao lucro líquido (sem arredondamento)
      const newCareerRating = netProfit;
      
      // Só atualizar se o valor for diferente do atual
      if (profile.career_rating !== newCareerRating) {
        const { error } = await supabase
          .from('profiles')
          .update({
            career_rating: newCareerRating,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (error) {
          console.error('Erro ao sincronizar career_rating:', error);
        } else {
          // Atualizar estado local
          setProfile(prev => prev ? { ...prev, career_rating: newCareerRating } : null);
        }
      }
    } catch (err) {
      console.error('Erro ao sincronizar career_rating com lucro líquido:', err);
    }
  };

  // Atualizar perfil
  const updateProfile = async (updates: Partial<ProfileData>) => {
    if (!user || !profile) {
      throw new Error('Usuário não autenticado ou perfil não carregado');
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      // Atualizar estado local
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      
      // Recarregar dados para garantir sincronização
      await fetchProfile();
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      throw err;
    }
  };

  // Obter estatísticas calculadas (sem dependências financeiras para evitar loops)
  const getProfileStats = useCallback(() => {
    if (!profile) return null;
    
    // CR dinâmico baseado no career_rating do perfil
    const dynamicCR = profile.career_rating || 0;
    
    // Total de voos e horas do perfil
    const totalFlights = profile.total_flights || 0;
    const totalHours = profile.total_hours || 0;
    
    // Calcular tempo desde o início da carreira
    let careerDuration = '';
    if (profile.career_started) {
      const startDate = new Date(profile.career_started);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const months = Math.floor(diffDays / 30);
      careerDuration = `${months} meses`;
    }
    
    // Taxa de sucesso dos voos perfeitos
    const perfectFlightRate = totalFlights > 0 
      ? ((profile.perfect_flights || 0) / totalFlights * 100).toFixed(1)
      : '0.0';
    
    return {
      dynamicCR,
      totalFlights,
      totalHours,
      careerDuration,
      perfectFlightRate,
      perfectFlights: profile.perfect_flights || 0,
      achievements: profile.achievements || ''
    };
  }, [profile]);

  // Criar perfil se não existir
  const createProfile = async (profileData: Partial<ProfileData>) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          display_name: profileData.display_name || 'Cmdte. Rodrigo',
          email: user.email,
          avatar_url: profileData.avatar_url || '',
          total_flights: profileData.total_flights || 0,
          total_hours: profileData.total_hours || 0,
          career_rating: profileData.career_rating || 0,
          total_rating: profileData.total_rating || 0,
          career_level: profileData.career_level || 1,
          career_class: profileData.career_class || 'D',
          world_ranking: profileData.world_ranking || 0,
          career_started: profileData.career_started || new Date().toISOString().split('T')[0],
          achievements: profileData.achievements || '',
          perfect_flights: profileData.perfect_flights || 0,
          description: profileData.description || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      await fetchProfile();
    } catch (err) {
      console.error('Erro ao criar perfil:', err);
      throw err;
    }
  };

  // Upload de avatar
  const uploadAvatar = async (file: File): Promise<string> => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload do arquivo
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err) {
      console.error('Erro no upload do avatar:', err);
      throw err;
    }
  };

  // Carregar perfil quando o usuário mudar
  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user?.id]);

  return {
    profile,
    isLoading,
    error,
    fetchProfile,
    updateProfile,
    createProfile,
    uploadAvatar,
    getProfileStats,
    syncCareerRatingWithNetProfit
  };
};