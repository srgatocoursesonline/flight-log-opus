// ============================================
// RANKING TYPES
// ============================================

import { ReactNode } from 'react';
import { Flight } from '@/hooks/supabase/useSupabaseFlights';
import { Transaction } from '@/hooks/supabase/useSupabaseFinancial';

export interface RankingItem {
  title: string;
  subtitle: string;
  value: string | number;
  details?: string;
  icon?: ReactNode;
  date?: string;
  route?: string;
  aircraft?: string;
  category?: string;
  flightData?: Flight;
  transactionData?: Transaction;
}

export interface RankingStats {
  bestLanding: RankingItem | null;
  longestFlight: RankingItem | null;
  flightsWithoutPenalties: RankingItem | null;
  highestCR: RankingItem | null;
  highestXP: RankingItem | null;
  highestPassiveIncome: RankingItem | null;
  highestExpense: RankingItem | null;
}

export interface RankingCardProps {
  title: string;
  subtitle: string;
  value: string | number;
  details?: string;
  icon?: ReactNode;
  date?: string;
  route?: string;
  aircraft?: string;
  category?: string;
  animationDelay?: string;
  onClick?: () => void;
}

export interface RankingSectionProps {
  title: string;
  icon?: ReactNode;
  children: React.ReactNode;
  animationDelay?: string;
}
