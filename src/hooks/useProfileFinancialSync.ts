// ============================================
// PROFILE FINANCIAL SYNC HOOK
// Hook para sincronizar automaticamente o career_rating do perfil com o lucro líquido financeiro
// ============================================

import { useEffect } from 'react';
import { useProfile } from './useProfile';
import { useSupabaseFinancial } from './supabase/useSupabaseFinancial';
import { useAuth } from '@/contexts/AuthContext';

export const useProfileFinancialSync = () => {
  const { user } = useAuth();
  const { profile, syncCareerRatingWithNetProfit } = useProfile();
  const { financialStats } = useSupabaseFinancial();

  // Sincronizar career_rating sempre que o lucro líquido mudar
  useEffect(() => {
    if (user && profile && financialStats) {
      const netProfit = financialStats.netProfit || 0;
      
      // Só sincronizar se o career_rating atual for diferente do lucro líquido
      if (profile.career_rating !== netProfit) {
        syncCareerRatingWithNetProfit(netProfit);
      }
    }
  }, [user?.id, profile?.career_rating, financialStats?.netProfit]); // Remover syncCareerRatingWithNetProfit das dependências

  return {
    isProfileSynced: profile?.career_rating === (financialStats?.netProfit || 0),
    currentCareerRating: profile?.career_rating || 0,
    currentNetProfit: financialStats?.netProfit || 0
  };
};