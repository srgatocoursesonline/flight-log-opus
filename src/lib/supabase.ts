// ============================================
// SUPABASE CLIENT CONFIGURATION
// ============================================

import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase (obter do painel)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórias'
  );
}

// Criar cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// ============================================
// TYPES PARA TYPESCRIPT
// ============================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          email: string | null;
          avatar_url: string | null;
          total_flights: number;
          total_hours: number;
          career_rating: number;
          total_rating: number;
          career_level: number;
          career_class: 'S' | 'A' | 'B' | 'C' | 'D';
          world_ranking: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string;
          email?: string | null;
          avatar_url?: string | null;
          total_flights?: number;
          total_hours?: number;
          career_rating?: number;
          total_rating?: number;
          career_level?: number;
          career_class?: 'S' | 'A' | 'B' | 'C' | 'D';
          world_ranking?: number;
        };
        Update: {
          display_name?: string;
          email?: string | null;
          avatar_url?: string | null;
          total_flights?: number;
          total_hours?: number;
          career_rating?: number;
          total_rating?: number;
          career_level?: number;
          career_class?: 'S' | 'A' | 'B' | 'C' | 'D';
          world_ranking?: number;
        };
      };
      expense_categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          icon: string;
          description: string | null;
          is_default: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          name: string;
          icon?: string;
          description?: string | null;
          is_default?: boolean;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          icon?: string;
          description?: string | null;
          is_active?: boolean;
        };
      };
      revenue_categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          icon: string;
          description: string | null;
          is_default: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          name: string;
          icon?: string;
          description?: string | null;
          is_default?: boolean;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          icon?: string;
          description?: string | null;
          is_active?: boolean;
        };
      };
      custom_aircraft: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          manufacturer: string | null;
          aircraft_type: 'commercial' | 'business' | 'general' | 'bush' | 'aerobatic' | 'glider' | 'helicopter' | 'military' | 'other';
          description: string | null;
          hourly_rate: number;
          is_default: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          name: string;
          manufacturer?: string | null;
          aircraft_type?: 'commercial' | 'business' | 'general' | 'bush' | 'aerobatic' | 'glider' | 'helicopter' | 'military' | 'other';
          description?: string | null;
          hourly_rate?: number;
          is_default?: boolean;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          manufacturer?: string | null;
          aircraft_type?: 'commercial' | 'business' | 'general' | 'bush' | 'aerobatic' | 'glider' | 'helicopter' | 'military' | 'other';
          description?: string | null;
          hourly_rate?: number;
          is_active?: boolean;
        };
      };
      flight_statuses: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string;
          icon: string;
          description: string | null;
          hourly_multiplier: number;
          is_default: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          name: string;
          color?: string;
          icon?: string;
          description?: string | null;
          hourly_multiplier?: number;
          is_default?: boolean;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          color?: string;
          icon?: string;
          description?: string | null;
          hourly_multiplier?: number;
          is_active?: boolean;
        };
      };
      flights: {
        Row: {
          id: string;
          user_id: string;
          callsign: string;
          aircraft: string;
          departure: string;
          arrival: string;
          departure_time: string | null;
          arrival_time: string | null;
          flight_time: string | null;
          distance: number;
          fuel_used: number;
          landing_rate: number;
          experience_points: number;
          career_rating: number;
          status: string;
          flight_date: string;
          route: string | null;
          notes: string | null;
          is_example: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          callsign: string;
          aircraft: string;
          departure: string;
          arrival: string;
          departure_time?: string | null;
          arrival_time?: string | null;
          flight_time?: string | null;
          distance?: number;
          fuel_used?: number;
          landing_rate?: number;
          experience_points?: number;
          career_rating?: number;
          status?: string;
          flight_date: string;
          route?: string | null;
          notes?: string | null;
          is_example?: boolean;
        };
        Update: {
          callsign?: string;
          aircraft?: string;
          departure?: string;
          arrival?: string;
          departure_time?: string | null;
          arrival_time?: string | null;
          flight_time?: string | null;
          distance?: number;
          fuel_used?: number;
          landing_rate?: number;
          experience_points?: number;
          career_rating?: number;
          status?: string;
          flight_date?: string;
          route?: string | null;
          notes?: string | null;
        };
      };
      financial_transactions: {
        Row: {
          id: string;
          user_id: string;
          transaction_type: 'revenue' | 'expense';
          description: string;
          amount: number;
          category_id: string | null;
          transaction_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          transaction_type: 'revenue' | 'expense';
          description: string;
          amount: number;
          category_id?: string | null;
          transaction_date: string;
        };
        Update: {
          transaction_type?: 'revenue' | 'expense';
          description?: string;
          amount?: number;
          category_id?: string | null;
          transaction_date?: string;
        };
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          goal_type: 'flights' | 'hours' | 'rating' | 'distance' | 'custom';
          target_value: number;
          current_value: number;
          target_date: string | null;
          is_completed: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          title: string;
          description?: string | null;
          goal_type: 'flights' | 'hours' | 'rating' | 'distance' | 'custom';
          target_value: number;
          current_value?: number;
          target_date?: string | null;
          is_completed?: boolean;
          is_active?: boolean;
        };
        Update: {
          title?: string;
          description?: string | null;
          goal_type?: 'flights' | 'hours' | 'rating' | 'distance' | 'custom';
          target_value?: number;
          current_value?: number;
          target_date?: string | null;
          is_completed?: boolean;
          is_active?: boolean;
        };
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          theme: 'light' | 'dark';
          language: 'pt-BR' | 'en-US';
          notifications_enabled: boolean;
          auto_sync_enabled: boolean;
          offline_mode_enabled: boolean;
          analytics_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          theme?: 'light' | 'dark';
          language?: 'pt-BR' | 'en-US';
          notifications_enabled?: boolean;
          auto_sync_enabled?: boolean;
          offline_mode_enabled?: boolean;
          analytics_enabled?: boolean;
        };
        Update: {
          theme?: 'light' | 'dark';
          language?: 'pt-BR' | 'en-US';
          notifications_enabled?: boolean;
          auto_sync_enabled?: boolean;
          offline_mode_enabled?: boolean;
          analytics_enabled?: boolean;
        };
      };
    };
    Views: {
      flight_statistics: {
        Row: {
          user_id: string;
          total_flights: number;
          completed_flights: number;
          total_career_rating: number;
          total_distance: number;
          avg_career_rating: number;
        };
      };
      financial_balance: {
        Row: {
          user_id: string;
          total_revenue: number;
          total_expenses: number;
          net_balance: number;
        };
      };
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];