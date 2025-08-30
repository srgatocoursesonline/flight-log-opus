-- ============================================
-- SCRIPT DE MIGRAÇÃO SEGURA DO BANCO DE DADOS
-- ============================================
-- Este script adiciona apenas as tabelas e estruturas que estão faltando
-- SEM AFETAR os dados existentes nas tabelas profiles, flights e goals

-- IMPORTANTE: Execute este script no painel SQL do Supabase
-- Este script é SEGURO e não irá apagar dados existentes

-- ============================================
-- SEÇÃO 1: ADICIONAR TABELAS FALTANTES
-- ============================================

-- 3. Tabela de Categorias de Despesas (expense_categories) - NOVA
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

-- 4. Tabela de Categorias de Receitas (revenue_categories) - NOVA
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

-- 5. Tabela de Aeronaves Personalizadas (custom_aircraft) - NOVA
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

-- 6. Tabela de Status de Voo (flight_statuses) - NOVA
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

-- 7. Tabela de Transações Financeiras (financial_transactions) - NOVA
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

-- 9. Tabela de Configurações do Usuário (user_settings) - NOVA
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

-- ============================================
-- SEÇÃO 2: ADICIONAR COLUNAS FALTANTES (SE NECESSÁRIO)
-- ============================================

-- Verificar e adicionar colunas faltantes na tabela profiles
DO $$
BEGIN
    -- Adicionar coluna display_name se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'display_name') THEN
        ALTER TABLE profiles ADD COLUMN display_name TEXT DEFAULT 'Cmdte. Rodrigo';
    END IF;
    
    -- Adicionar coluna total_hours se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'total_hours') THEN
        ALTER TABLE profiles ADD COLUMN total_hours INTEGER DEFAULT 0;
    END IF;
    
    -- Adicionar coluna world_ranking se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'world_ranking') THEN
        ALTER TABLE profiles ADD COLUMN world_ranking INTEGER DEFAULT 0;
    END IF;
END $$;

-- Verificar e adicionar colunas faltantes na tabela flights
DO $$
BEGIN
    -- Adicionar colunas de informações de aeroporto se não existirem
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'flights' AND column_name = 'origin_airport_info') THEN
        ALTER TABLE flights ADD COLUMN origin_airport_info JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'flights' AND column_name = 'destination_airport_info') THEN
        ALTER TABLE flights ADD COLUMN destination_airport_info JSONB;
    END IF;
    
    -- Adicionar colunas de país se não existirem
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'flights' AND column_name = 'origin_country') THEN
        ALTER TABLE flights ADD COLUMN origin_country TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'flights' AND column_name = 'destination_country') THEN
        ALTER TABLE flights ADD COLUMN destination_country TEXT;
    END IF;
    
    -- Adicionar coluna service_type se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'flights' AND column_name = 'service_type') THEN
        ALTER TABLE flights ADD COLUMN service_type TEXT;
    END IF;
END $$;

-- ============================================
-- SEÇÃO 3: CRIAR VIEWS E FUNÇÕES
-- ============================================

-- Remover views e funções existentes para evitar conflitos
DROP VIEW IF EXISTS flight_statistics;
DROP VIEW IF EXISTS financial_balance;
DROP FUNCTION IF EXISTS exec_sql(TEXT);

-- Função para executar SQL diretamente (necessária para diagnósticos)
CREATE OR REPLACE FUNCTION public.exec_sql(sql_query text)
RETURNS TABLE(result jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  rec record;
  results jsonb := '[]'::jsonb;
BEGIN
  -- Para queries SELECT, retornar os resultados
  IF UPPER(TRIM(sql_query)) LIKE 'SELECT%' THEN
    FOR rec IN EXECUTE sql_query LOOP
      results := results || to_jsonb(rec);
    END LOOP;
    RETURN QUERY SELECT results;
  ELSE
    -- Para outros comandos, apenas executar
    EXECUTE sql_query;
    RETURN QUERY SELECT '{"success": true}'::jsonb;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT jsonb_build_object('error', SQLERRM, 'sqlstate', SQLSTATE);
END;
$$;

-- View para Estatísticas de Voo
CREATE VIEW flight_statistics AS
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

-- View para Saldo Financeiro
CREATE VIEW financial_balance AS
SELECT
  user_id,
  SUM(CASE WHEN transaction_type = 'revenue' THEN amount ELSE 0 END) AS total_revenue,
  SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END) AS total_expenses,
  SUM(CASE WHEN transaction_type = 'revenue' THEN amount ELSE -amount END) AS net_balance
FROM financial_transactions
GROUP BY user_id;

-- Remover funções existentes para evitar conflitos
DROP FUNCTION IF EXISTS fetch_career_data(UUID);
DROP FUNCTION IF EXISTS update_career_data(UUID, TEXT);
DROP FUNCTION IF EXISTS update_career_data(UUID, JSON);

-- Função RPC para Buscar Dados de Carreira
CREATE FUNCTION fetch_career_data(user_id UUID) RETURNS SETOF profiles
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM profiles WHERE id = user_id;
$$;

-- Função RPC para Atualizar Dados de Carreira
CREATE OR REPLACE FUNCTION public.update_career_data(user_id uuid, data_json json)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_rating_val integer;
  career_level_val integer;
  career_class_val text;
BEGIN
  -- Extrair valores do JSON
  total_rating_val := (data_json->>'totalRating')::integer;
  career_level_val := (data_json->>'level')::integer;
  career_class_val := data_json->>'careerClass';
  
  -- Atualizar o perfil do usuário
  UPDATE profiles 
  SET 
    total_rating = COALESCE(total_rating_val, total_rating),
    career_level = COALESCE(career_level_val, career_level),
    career_class = COALESCE(career_class_val, career_class),
    updated_at = NOW()
  WHERE id = user_id;
  
  RETURN true;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Erro ao atualizar dados de carreira: %', SQLERRM;
  RETURN false;
END;
$$;

-- ============================================
-- SEÇÃO 4: CONFIGURAR RLS PARA NOVAS TABELAS
-- ============================================

-- Ativar RLS nas novas tabelas
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_aircraft ENABLE ROW LEVEL SECURITY;
ALTER TABLE flight_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes para evitar conflitos
DROP POLICY IF EXISTS expense_categories_policy ON expense_categories;
DROP POLICY IF EXISTS revenue_categories_policy ON revenue_categories;
DROP POLICY IF EXISTS custom_aircraft_policy ON custom_aircraft;
DROP POLICY IF EXISTS flight_statuses_policy ON flight_statuses;
DROP POLICY IF EXISTS financial_transactions_policy ON financial_transactions;
DROP POLICY IF EXISTS user_settings_policy ON user_settings;

-- Criar políticas para as novas tabelas
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

CREATE POLICY user_settings_policy ON user_settings 
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- SEÇÃO 5: DADOS INICIAIS PARA NOVAS TABELAS
-- ============================================

-- Inserir categorias padrão de despesas (apenas se a tabela estiver vazia)
INSERT INTO expense_categories (user_id, name, icon, description, is_default, is_active)
SELECT 
    p.id,
    'Combustível',
    'fuel',
    'Gastos com combustível de aeronaves',
    true,
    true
FROM profiles p
WHERE NOT EXISTS (SELECT 1 FROM expense_categories WHERE user_id = p.id);

INSERT INTO expense_categories (user_id, name, icon, description, is_default, is_active)
SELECT 
    p.id,
    'Manutenção',
    'wrench',
    'Custos de manutenção de aeronaves',
    true,
    true
FROM profiles p
WHERE NOT EXISTS (SELECT 1 FROM expense_categories WHERE user_id = p.id AND name = 'Manutenção');

-- Inserir categorias padrão de receitas (apenas se a tabela estiver vazia)
INSERT INTO revenue_categories (user_id, name, icon, description, is_default, is_active)
SELECT 
    p.id,
    'Voos Comerciais',
    'plane',
    'Receita de voos comerciais',
    true,
    true
FROM profiles p
WHERE NOT EXISTS (SELECT 1 FROM revenue_categories WHERE user_id = p.id);

INSERT INTO revenue_categories (user_id, name, icon, description, is_default, is_active)
SELECT 
    p.id,
    'Instrução de Voo',
    'graduation-cap',
    'Receita de aulas de pilotagem',
    true,
    true
FROM profiles p
WHERE NOT EXISTS (SELECT 1 FROM revenue_categories WHERE user_id = p.id AND name = 'Instrução de Voo');

-- ============================================
-- SEÇÃO 6: CONCEDER PERMISSÕES
-- ============================================

-- Conceder permissões de execução para usuários autenticados
GRANT EXECUTE ON FUNCTION public.exec_sql TO authenticated;
GRANT EXECUTE ON FUNCTION public.fetch_career_data TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_career_data TO authenticated;

-- ============================================
-- MIGRAÇÃO CONCLUÍDA COM SUCESSO!
-- ============================================
-- Todas as tabelas e estruturas foram adicionadas de forma segura
-- Seus dados existentes foram preservados
-- As novas funcionalidades estão prontas para uso