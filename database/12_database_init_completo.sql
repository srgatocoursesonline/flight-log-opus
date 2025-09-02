-- ============================================
-- SCRIPT DE INICIALIZAÇÃO COMPLETO DO BANCO DE DADOS
-- ============================================
-- Execute este script no painel SQL do Supabase para criar TUDO de uma vez
-- Este script combina o database_init.sql original + melhorias dos scripts 01-11
-- VERSÃO FINAL CONSOLIDADA

-- 0. Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela de Perfis (profiles)
DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  display_name TEXT DEFAULT 'Cmdte. Rodrigo',
  email TEXT,
  avatar_url TEXT,
  total_flights INTEGER DEFAULT 0,
  total_hours INTEGER DEFAULT 0,
  career_rating INTEGER DEFAULT 0,
  total_rating INTEGER DEFAULT 0,
  career_level INTEGER DEFAULT 1,
  career_class TEXT DEFAULT 'D',
  world_ranking INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE profiles IS 'Perfis dos usuários com dados de carreira';

-- 2. Tabela de Configurações do Usuário (user_settings)
DROP TABLE IF EXISTS public.user_settings CASCADE;

CREATE TABLE public.user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark')),
  language TEXT DEFAULT 'pt-BR' CHECK (language IN ('pt-BR', 'en-US')),
  notifications_enabled BOOLEAN DEFAULT true,
  auto_sync_enabled BOOLEAN DEFAULT true,
  offline_mode_enabled BOOLEAN DEFAULT false,
  analytics_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE user_settings IS 'Configurações personalizadas do usuário';
CREATE UNIQUE INDEX idx_user_settings_unique_user ON user_settings(user_id);

-- 3. Tabela de Categorias de Receitas (revenue_categories)
DROP TABLE IF EXISTS public.revenue_categories CASCADE;

CREATE TABLE public.revenue_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'dollar-sign',
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE revenue_categories IS 'Categorias de receitas financeiras';
CREATE INDEX idx_revenue_categories_user_id ON revenue_categories(user_id);

-- 4. Tabela de Categorias de Despesas (expense_categories)
DROP TABLE IF EXISTS public.expense_categories CASCADE;

CREATE TABLE public.expense_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'receipt',
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE expense_categories IS 'Categorias de despesas financeiras';
CREATE INDEX idx_expense_categories_user_id ON expense_categories(user_id);

-- 5. Tabela de Status de Voo (flight_statuses)
DROP TABLE IF EXISTS public.flight_statuses CASCADE;

CREATE TABLE public.flight_statuses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  icon TEXT DEFAULT 'check-circle',
  description TEXT,
  hourly_multiplier NUMERIC DEFAULT 1.0,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE flight_statuses IS 'Status possíveis para os voos';
CREATE INDEX idx_flight_statuses_user_id ON flight_statuses(user_id);

-- 6. Tabela de Aeronaves Personalizadas (custom_aircraft)
DROP TABLE IF EXISTS public.custom_aircraft CASCADE;

CREATE TABLE public.custom_aircraft (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  manufacturer TEXT,
  aircraft_type TEXT DEFAULT 'general' CHECK (aircraft_type IN ('general', 'commercial', 'cargo', 'military', 'helicopter', 'glider')),
  description TEXT,
  hourly_rate NUMERIC DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE custom_aircraft IS 'Aeronaves personalizadas dos usuários';
CREATE INDEX idx_custom_aircraft_user_id ON custom_aircraft(user_id);

-- 7. Tabela de Transações Financeiras (financial_transactions)
DROP TABLE IF EXISTS public.financial_transactions CASCADE;

CREATE TABLE public.financial_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('revenue', 'expense')),
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  category_id UUID,
  transaction_date TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE financial_transactions IS 'Transações financeiras (receitas e despesas)';
CREATE INDEX idx_financial_transactions_user_id ON financial_transactions(user_id);
CREATE INDEX idx_financial_transactions_date ON financial_transactions(transaction_date);
CREATE INDEX idx_financial_transactions_type ON financial_transactions(transaction_type);

-- 8. Tabela de Voos (flights)
DROP TABLE IF EXISTS public.flights CASCADE;

CREATE TABLE public.flights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  callsign TEXT NOT NULL,
  aircraft TEXT NOT NULL,
  departure TEXT NOT NULL,
  arrival TEXT NOT NULL,
  departure_time TEXT,
  arrival_time TEXT,
  flight_time TEXT,
  distance NUMERIC DEFAULT 0,
  fuel_used NUMERIC DEFAULT 0,
  landing_rate NUMERIC DEFAULT 0,
  experience_points INTEGER DEFAULT 0,
  career_rating INTEGER DEFAULT 0,
  status TEXT DEFAULT 'completed',
  flight_date TEXT NOT NULL,
  route TEXT,
  notes TEXT,
  is_example BOOLEAN DEFAULT false,
  service_type TEXT,
  origin_country TEXT,
  destination_country TEXT,
  origin_airport_info JSONB,
  destination_airport_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE flights IS 'Registro de voos realizados';
CREATE INDEX idx_flights_user_id ON flights(user_id);
CREATE INDEX idx_flights_date ON flights(flight_date);
CREATE INDEX idx_flights_status ON flights(status);

-- 9. Tabela de Objetivos (goals)
DROP TABLE IF EXISTS public.goals CASCADE;

CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('flights', 'hours', 'rating', 'distance', 'custom')),
  target_value NUMERIC NOT NULL CHECK (target_value > 0),
  current_value NUMERIC DEFAULT 0,
  target_date TEXT,
  is_completed BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE goals IS 'Metas e objetivos dos usuários';
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_type ON goals(goal_type);

-- 10. HABILITAR RLS EM TODAS AS TABELAS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_aircraft ENABLE ROW LEVEL SECURITY;
ALTER TABLE flight_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- 11. POLÍTICAS RLS GRANULARES
-- Profiles
DROP POLICY IF EXISTS profiles_select_policy ON profiles;
DROP POLICY IF EXISTS profiles_insert_policy ON profiles;
DROP POLICY IF EXISTS profiles_update_policy ON profiles;
DROP POLICY IF EXISTS profiles_delete_policy ON profiles;

CREATE POLICY profiles_select_policy ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY profiles_insert_policy ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY profiles_update_policy ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY profiles_delete_policy ON profiles FOR DELETE USING (auth.uid() = id);

-- User Settings
DROP POLICY IF EXISTS user_settings_select_policy ON user_settings;
DROP POLICY IF EXISTS user_settings_insert_policy ON user_settings;
DROP POLICY IF EXISTS user_settings_update_policy ON user_settings;
DROP POLICY IF EXISTS user_settings_delete_policy ON user_settings;

CREATE POLICY user_settings_select_policy ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY user_settings_insert_policy ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY user_settings_update_policy ON user_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY user_settings_delete_policy ON user_settings FOR DELETE USING (auth.uid() = user_id);

-- Flights
DROP POLICY IF EXISTS flights_select_policy ON flights;
DROP POLICY IF EXISTS flights_insert_policy ON flights;
DROP POLICY IF EXISTS flights_update_policy ON flights;
DROP POLICY IF EXISTS flights_delete_policy ON flights;

CREATE POLICY flights_select_policy ON flights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY flights_insert_policy ON flights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY flights_update_policy ON flights FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY flights_delete_policy ON flights FOR DELETE USING (auth.uid() = user_id);

-- Financial Transactions
DROP POLICY IF EXISTS financial_transactions_select_policy ON financial_transactions;
DROP POLICY IF EXISTS financial_transactions_insert_policy ON financial_transactions;
DROP POLICY IF EXISTS financial_transactions_update_policy ON financial_transactions;
DROP POLICY IF EXISTS financial_transactions_delete_policy ON financial_transactions;

CREATE POLICY financial_transactions_select_policy ON financial_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY financial_transactions_insert_policy ON financial_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY financial_transactions_update_policy ON financial_transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY financial_transactions_delete_policy ON financial_transactions FOR DELETE USING (auth.uid() = user_id);

-- Aplicar políticas similares para outras tabelas
CREATE POLICY expense_categories_policy ON expense_categories FOR ALL USING (auth.uid() = user_id);
CREATE POLICY revenue_categories_policy ON revenue_categories FOR ALL USING (auth.uid() = user_id);
CREATE POLICY custom_aircraft_policy ON custom_aircraft FOR ALL USING (auth.uid() = user_id);
CREATE POLICY flight_statuses_policy ON flight_statuses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY goals_policy ON goals FOR ALL USING (auth.uid() = user_id);

SELECT '🎯 TABELAS E POLÍTICAS CRIADAS COM SUCESSO!' as status;