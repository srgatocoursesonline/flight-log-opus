// ============================================
// SUPABASE CLIENT CONFIGURATION
// ============================================

import { createClient } from '@supabase/supabase-js';



// Configurações do Supabase (obter do painel)
// Usar valores hardcoded como fallback se as variáveis não forem encontradas
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zgukopxlnolrdbgamwrw.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpndWtvcHhsbm9scmRiZ2Ftd3J3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNzk0MDAsImV4cCI6MjA3MTk1NTQwMH0.ijvaxFSjn2TrNFqf-2mJBJ5wU9wX0HOUuz7EomT65rE';



if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ ERRO CRÍTICO: Nem mesmo os valores fallback estão funcionando!');
  console.error('Por favor, contate o suporte técnico.');
  
  // Criar objeto de erro detalhado
  const error = new Error(
    'Configuração do Supabase falhou completamente - valores não disponíveis.'
  );
  error.name = 'SupabaseConfigCriticalError';
  throw error;
}

// Criar cliente Supabase com tratamento de erros
let supabase;
try {

  
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
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
  
  // Verificar conexão - podemos tentar obter um item da tabela pública

  setTimeout(async () => {
    try {
      const { error } = await supabase.from('profiles').select('id').limit(1);
      
      if (error) {
        console.error('Erro ao testar conexão com Supabase:', error.message);
        console.error('Código:', error.code, 'Detalhes:', error);
      } else {
    
      }
    } catch (testError) {
      console.error('Erro não tratado ao testar Supabase:', testError);
    }
  }, 1000); // Testar após 1 segundo para não bloquear a inicialização

} catch (error) {
  console.error('Erro crítico ao criar cliente Supabase:', error);
  // Criar um cliente vazio com métodos simulados para evitar que a aplicação quebre
  supabase = {
    auth: {
      getUser: () => Promise.resolve({ data: null, error: new Error('Cliente Supabase não inicializado corretamente') }),
      getSession: () => Promise.resolve({ data: { session: null }, error: new Error('Cliente Supabase não inicializado corretamente') }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: () => Promise.resolve({ error: new Error('Cliente Supabase não inicializado corretamente') }),
    },
    from: () => ({
      select: () => Promise.resolve({ data: null, error: new Error('Cliente Supabase não inicializado corretamente') }),
    }),
  };
}

export { supabase };

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
          career_started: string | null;
          achievements: string | null;
          perfect_flights: number | null;
          description: string | null;
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
          career_started?: string | null;
          achievements?: string | null;
          perfect_flights?: number | null;
          description?: string | null;
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
          career_started?: string | null;
          achievements?: string | null;
          perfect_flights?: number | null;
          description?: string | null;
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
          initial_balance: number;
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
          initial_balance?: number;
        };
        Update: {
          theme?: 'light' | 'dark';
          language?: 'pt-BR' | 'en-US';
          notifications_enabled?: boolean;
          auto_sync_enabled?: boolean;
          offline_mode_enabled?: boolean;
          analytics_enabled?: boolean;
          initial_balance?: number;
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