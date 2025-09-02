-- ============================================
-- SCRIPT PARA CORRIGIR TODOS OS PROBLEMAS DO BANCO DE DADOS
-- ============================================
-- Execute este script no SQL Editor do Supabase

BEGIN;

-- ============================================
-- SEÇÃO 1: CORRIGIR TABELA PROFILES
-- ============================================

-- Adicionar colunas faltantes na tabela profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS achievements TEXT DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS perfect_flights INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS career_started TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';

-- ============================================
-- SEÇÃO 2: CRIAR TABELA MSFS_FLIGHTS
-- ============================================

-- Criar tabela msfs_flights se não existir
CREATE TABLE IF NOT EXISTS public.msfs_flights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  flight_id TEXT NOT NULL,
  aircraft_type TEXT NOT NULL,
  departure_icao TEXT NOT NULL,
  arrival_icao TEXT NOT NULL,
  departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
  arrival_time TIMESTAMP WITH TIME ZONE,
  flight_duration INTEGER, -- em minutos
  distance NUMERIC(10, 2), -- em milhas náuticas
  max_altitude INTEGER, -- em pés
  avg_speed NUMERIC(8, 2), -- em knots
  fuel_used NUMERIC(10, 2), -- em galões
  landing_rate NUMERIC(8, 2), -- em pés por minuto
  flight_score INTEGER DEFAULT 0,
  weather_conditions JSONB,
  route_data JSONB,
  telemetry_data JSONB,
  status TEXT DEFAULT 'completed' CHECK (status IN ('planned', 'active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_msfs_flights_user_id ON msfs_flights(user_id);
CREATE INDEX IF NOT EXISTS idx_msfs_flights_departure_time ON msfs_flights(departure_time);
CREATE INDEX IF NOT EXISTS idx_msfs_flights_status ON msfs_flights(status);
CREATE INDEX IF NOT EXISTS idx_msfs_flights_aircraft_type ON msfs_flights(aircraft_type);
CREATE INDEX IF NOT EXISTS idx_msfs_flights_route ON msfs_flights(departure_icao, arrival_icao);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_msfs_flights_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_msfs_flights_updated_at ON msfs_flights;
CREATE TRIGGER trigger_update_msfs_flights_updated_at
  BEFORE UPDATE ON msfs_flights
  FOR EACH ROW
  EXECUTE FUNCTION update_msfs_flights_updated_at();

-- ============================================
-- SEÇÃO 3: FUNÇÕES RPC PARA MSFS
-- ============================================

-- Função para obter estatísticas de voos MSFS
DROP FUNCTION IF EXISTS get_msfs_flight_stats(UUID);
CREATE OR REPLACE FUNCTION get_msfs_flight_stats(user_uuid UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_flights', COALESCE(COUNT(*), 0),
    'total_hours', COALESCE(ROUND(SUM(flight_duration) / 60.0, 2), 0),
    'total_distance', COALESCE(ROUND(SUM(distance), 2), 0),
    'avg_score', COALESCE(ROUND(AVG(flight_score), 1), 0),
    'best_landing', COALESCE(MIN(ABS(landing_rate)), 0),
    'favorite_aircraft', (
      SELECT aircraft_type 
      FROM msfs_flights 
      WHERE user_id = user_uuid 
      GROUP BY aircraft_type 
      ORDER BY COUNT(*) DESC 
      LIMIT 1
    ),
    'recent_flights', (
      SELECT json_agg(
        json_build_object(
          'id', id,
          'aircraft_type', aircraft_type,
          'departure_icao', departure_icao,
          'arrival_icao', arrival_icao,
          'departure_time', departure_time,
          'flight_duration', flight_duration,
          'distance', distance,
          'flight_score', flight_score
        )
      )
      FROM (
        SELECT * FROM msfs_flights 
        WHERE user_id = user_uuid 
        ORDER BY departure_time DESC 
        LIMIT 5
      ) recent
    )
  ) INTO result
  FROM msfs_flights
  WHERE user_id = user_uuid;
  
  RETURN COALESCE(result, '{"total_flights": 0, "total_hours": 0, "total_distance": 0, "avg_score": 0, "best_landing": 0, "favorite_aircraft": null, "recent_flights": []}'::JSON);
END;
$$;

-- Função para obter voos recentes do MSFS
CREATE OR REPLACE FUNCTION get_recent_msfs_flights(user_uuid UUID, flight_limit INTEGER DEFAULT 10)
RETURNS TABLE(
  id UUID,
  aircraft_type TEXT,
  departure_icao TEXT,
  arrival_icao TEXT,
  departure_time TIMESTAMP WITH TIME ZONE,
  flight_duration INTEGER,
  distance NUMERIC,
  flight_score INTEGER,
  status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id,
    f.aircraft_type,
    f.departure_icao,
    f.arrival_icao,
    f.departure_time,
    f.flight_duration,
    f.distance,
    f.flight_score,
    f.status
  FROM msfs_flights f
  WHERE f.user_id = user_uuid
  ORDER BY f.departure_time DESC
  LIMIT flight_limit;
END;
$$;

-- Função para obter rotas populares do MSFS
CREATE OR REPLACE FUNCTION get_popular_msfs_routes(user_uuid UUID, route_limit INTEGER DEFAULT 5)
RETURNS TABLE(
  departure_icao TEXT,
  arrival_icao TEXT,
  flight_count BIGINT,
  avg_duration NUMERIC,
  avg_distance NUMERIC,
  avg_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.departure_icao,
    f.arrival_icao,
    COUNT(*) as flight_count,
    ROUND(AVG(f.flight_duration), 2) as avg_duration,
    ROUND(AVG(f.distance), 2) as avg_distance,
    ROUND(AVG(f.flight_score), 1) as avg_score
  FROM msfs_flights f
  WHERE f.user_id = user_uuid
  GROUP BY f.departure_icao, f.arrival_icao
  HAVING COUNT(*) > 1
  ORDER BY flight_count DESC, avg_score DESC
  LIMIT route_limit;
END;
$$;

-- ============================================
-- SEÇÃO 4: CONFIGURAR RLS PARA MSFS_FLIGHTS
-- ============================================

-- Ativar RLS na tabela msfs_flights
ALTER TABLE msfs_flights ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para msfs_flights
CREATE POLICY "Users can view own MSFS flights" ON msfs_flights
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own MSFS flights" ON msfs_flights
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own MSFS flights" ON msfs_flights
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own MSFS flights" ON msfs_flights
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- SEÇÃO 5: CONCEDER PERMISSÕES
-- ============================================

-- Conceder permissões para as funções RPC
GRANT EXECUTE ON FUNCTION get_msfs_flight_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_recent_msfs_flights TO authenticated;
GRANT EXECUTE ON FUNCTION get_popular_msfs_routes TO authenticated;

-- ============================================
-- SEÇÃO 6: VERIFICAÇÕES FINAIS
-- ============================================

-- Verificar se as colunas foram adicionadas à tabela profiles
DO $$
DECLARE
  achievements_exists boolean;
  perfect_flights_exists boolean;
  career_started_exists boolean;
  description_exists boolean;
  msfs_table_exists boolean;
BEGIN
  -- Verificar colunas da tabela profiles
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'achievements'
  ) INTO achievements_exists;
  
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'perfect_flights'
  ) INTO perfect_flights_exists;
  
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'career_started'
  ) INTO career_started_exists;
  
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'description'
  ) INTO description_exists;
  
  -- Verificar se a tabela msfs_flights existe
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'msfs_flights'
  ) INTO msfs_table_exists;
  
  -- Exibir resultados
  RAISE NOTICE '=== VERIFICAÇÃO DE CORREÇÕES ===';
  RAISE NOTICE 'Coluna achievements existe: %', achievements_exists;
  RAISE NOTICE 'Coluna perfect_flights existe: %', perfect_flights_exists;
  RAISE NOTICE 'Coluna career_started existe: %', career_started_exists;
  RAISE NOTICE 'Coluna description existe: %', description_exists;
  RAISE NOTICE 'Tabela msfs_flights existe: %', msfs_table_exists;
  
  IF achievements_exists AND perfect_flights_exists AND career_started_exists AND description_exists AND msfs_table_exists THEN
    RAISE NOTICE '✅ TODAS AS CORREÇÕES FORAM APLICADAS COM SUCESSO!';
  ELSE
    RAISE NOTICE '❌ ALGUMAS CORREÇÕES FALHARAM. VERIFIQUE OS LOGS ACIMA.';
  END IF;
END;
$$;

COMMIT;

SELECT '🎉 Script de correção executado com sucesso!' as status;