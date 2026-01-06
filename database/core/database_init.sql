-- ============================================
-- SCRIPT DE INICIALIZAÇÃO DO BANCO DE DADOS
-- ============================================
-- Execute este script no painel SQL do Supabase para criar todas as tabelas e campos necessários
-- Isto é útil se as migrações automáticas não funcionarem

-- 1. Tabela de Perfis (profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
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

-- 2. Tabela de Voos (flights)
CREATE TABLE IF NOT EXISTS public.flights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
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

-- 3. Tabela de Categorias de Despesas (expense_categories)
CREATE TABLE IF NOT EXISTS public.expense_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'receipt',
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Tabela de Categorias de Receitas (revenue_categories)
CREATE TABLE IF NOT EXISTS public.revenue_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'dollar-sign',
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Tabela de Aeronaves Personalizadas (custom_aircraft)
CREATE TABLE IF NOT EXISTS public.custom_aircraft (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  name TEXT NOT NULL,
  manufacturer TEXT,
  aircraft_type TEXT DEFAULT 'general',
  description TEXT,
  hourly_rate NUMERIC DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Tabela de Status de Voo (flight_statuses)
CREATE TABLE IF NOT EXISTS public.flight_statuses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
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

-- 7. Tabela de Transações Financeiras (financial_transactions)
CREATE TABLE IF NOT EXISTS public.financial_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('revenue', 'expense')),
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  category_id UUID,
  transaction_date TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 8. Tabela de Objetivos (goals)
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('flights', 'hours', 'rating', 'distance', 'custom')),
  target_value NUMERIC NOT NULL,
  current_value NUMERIC DEFAULT 0,
  target_date TEXT,
  is_completed BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 9. Tabela de Configurações do Usuário (user_settings)
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark')),
  language TEXT DEFAULT 'pt-BR' CHECK (language IN ('pt-BR', 'en-US')),
  notifications_enabled BOOLEAN DEFAULT true,
  auto_sync_enabled BOOLEAN DEFAULT true,
  offline_mode_enabled BOOLEAN DEFAULT false,
  analytics_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 10. Criar ou Atualizar Função RPC para Execução de SQL
-- Primeiro, remover a função existente se ela existir
DROP FUNCTION IF EXISTS exec_sql(TEXT);

-- Agora criar a nova função
CREATE FUNCTION exec_sql(sql_query TEXT) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  EXECUTE sql_query;
  RETURN '{"success": true}'::JSONB;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'detail', SQLSTATE
  );
END;
$$;

-- 11. Criar View para Estatísticas de Voo
CREATE OR REPLACE VIEW flight_statistics AS
SELECT
  user_id,
  COUNT(*) AS total_flights,
  COUNT(*) FILTER (WHERE status = 'completed') AS completed_flights,
  SUM(career_rating) AS total_career_rating,
  SUM(distance) AS total_distance,
  CASE 
    WHEN COUNT(*) > 0 THEN SUM(career_rating) / COUNT(*) 
    ELSE 0 
  END AS avg_career_rating
FROM flights
GROUP BY user_id;

-- 12. Criar View para Saldo Financeiro
CREATE OR REPLACE VIEW financial_balance AS
SELECT
  user_id,
  SUM(CASE WHEN transaction_type = 'revenue' THEN amount ELSE 0 END) AS total_revenue,
  SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END) AS total_expenses,
  SUM(CASE WHEN transaction_type = 'revenue' THEN amount ELSE -amount END) AS net_balance
FROM financial_transactions
GROUP BY user_id;

-- 13. Função RPC para Buscar Dados de Carreira
-- Primeiro, remover a função existente se ela existir
DROP FUNCTION IF EXISTS fetch_career_data(UUID);

-- Agora criar a nova função
CREATE FUNCTION fetch_career_data(user_id UUID) RETURNS SETOF profiles
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM profiles WHERE id = user_id;
$$;

-- 14. Função RPC para Atualizar Dados de Carreira
-- Primeiro, remover a função existente se ela existir
DROP FUNCTION IF EXISTS update_career_data(UUID, TEXT);

-- Agora criar a nova função
CREATE FUNCTION update_career_data(user_id UUID, data_json TEXT) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  data JSONB := data_json::JSONB;
  result JSONB;
BEGIN
  UPDATE profiles 
  SET 
    total_rating = COALESCE((data->>'totalRating')::INTEGER, total_rating),
    career_level = COALESCE((data->>'level')::INTEGER, career_level),
    career_class = COALESCE(data->>'careerClass', career_class),
    updated_at = NOW()
  WHERE id = user_id;
  
  RETURN '{"success": true}'::JSONB;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'detail', SQLSTATE
  );
END;
$$;

-- 15. Adicionar Políticas de Segurança RLS
-- Ativar RLS em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_aircraft ENABLE ROW LEVEL SECURITY;
ALTER TABLE flight_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Política: Usuários só podem acessar seus próprios dados
-- Remover políticas existentes se existirem
DROP POLICY IF EXISTS profiles_policy ON profiles;
DROP POLICY IF EXISTS flights_policy ON flights;
DROP POLICY IF EXISTS expense_categories_policy ON expense_categories;
DROP POLICY IF EXISTS revenue_categories_policy ON revenue_categories;
DROP POLICY IF EXISTS custom_aircraft_policy ON custom_aircraft;
DROP POLICY IF EXISTS flight_statuses_policy ON flight_statuses;
DROP POLICY IF EXISTS financial_transactions_policy ON financial_transactions;
DROP POLICY IF EXISTS goals_policy ON goals;
DROP POLICY IF EXISTS user_settings_policy ON user_settings;

-- Criar novas políticas
CREATE POLICY profiles_policy ON profiles 
  FOR ALL USING (auth.uid() = id);

CREATE POLICY flights_policy ON flights 
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY expense_categories_policy ON expense_categories 
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY revenue_categories_policy ON revenue_categories 
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY custom_aircraft_policy ON custom_aircraft 
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY flight_statuses_policy ON flight_statuses 
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY financial_transactions_policy ON financial_transactions 
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY goals_policy ON goals 
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY user_settings_policy ON user_settings 
  FOR ALL USING (auth.uid() = user_id);

-- 16. Dados Iniciais (Default Categories)
-- Adicione categorias padrão para facilitar o uso inicial da aplicação