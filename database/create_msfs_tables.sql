-- ============================================
-- SCHEMA PARA INTEGRAÇÃO MSFS 2024
-- ============================================
-- Este arquivo cria as tabelas necessárias para armazenar
-- dados de voo coletados do Microsoft Flight Simulator 2024

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELA PRINCIPAL: msfs_flights
-- ============================================

-- Tabela para armazenar voos coletados do MSFS 2024
CREATE TABLE IF NOT EXISTS msfs_flights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Dados básicos do voo
  aircraft_type TEXT NOT NULL,
  flight_date DATE NOT NULL,
  departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
  arrival_time TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Aeroporto de partida
  departure_icao TEXT,
  departure_name TEXT NOT NULL,
  departure_lat NUMERIC(10, 6) NOT NULL,
  departure_lon NUMERIC(10, 6) NOT NULL,
  
  -- Aeroporto de chegada
  arrival_icao TEXT,
  arrival_name TEXT NOT NULL,
  arrival_lat NUMERIC(10, 6) NOT NULL,
  arrival_lon NUMERIC(10, 6) NOT NULL,
  
  -- Dados de performance
  flight_time INTEGER NOT NULL, -- em minutos
  distance INTEGER NOT NULL, -- em km
  max_altitude INTEGER DEFAULT 0, -- em pés
  max_speed INTEGER DEFAULT 0, -- em km/h
  
  -- Metadados
  source TEXT NOT NULL DEFAULT 'MSFS_2024',
  status TEXT NOT NULL DEFAULT 'completed',
  raw_data JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

-- Índice por usuário e data (consultas mais comuns)
CREATE INDEX IF NOT EXISTS idx_msfs_flights_user_date 
ON msfs_flights(user_id, flight_date DESC);

-- Índice por aeroportos ICAO
CREATE INDEX IF NOT EXISTS idx_msfs_flights_departure_icao 
ON msfs_flights(departure_icao);

CREATE INDEX IF NOT EXISTS idx_msfs_flights_arrival_icao 
ON msfs_flights(arrival_icao);

-- Índice por tipo de aeronave
CREATE INDEX IF NOT EXISTS idx_msfs_flights_aircraft 
ON msfs_flights(aircraft_type);

-- ============================================
-- TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_msfs_flights_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER trigger_update_msfs_flights_updated_at
  BEFORE UPDATE ON msfs_flights
  FOR EACH ROW
  EXECUTE FUNCTION update_msfs_flights_updated_at();

-- ============================================
-- FUNÇÕES RPC PARA ESTATÍSTICAS
-- ============================================

CREATE OR REPLACE FUNCTION get_msfs_flight_stats(p_user_id UUID DEFAULT NULL)
RETURNS TABLE (
  total_flights BIGINT,
  total_hours NUMERIC,
  total_distance BIGINT,
  unique_aircraft BIGINT,
  unique_airports BIGINT,
  avg_flight_time NUMERIC,
  longest_flight NUMERIC,
  most_used_aircraft TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_flights,
    ROUND(SUM(flight_time) / 60.0, 2) as total_hours,
    SUM(distance) as total_distance,
    COUNT(DISTINCT aircraft_type) as unique_aircraft,
    COUNT(DISTINCT COALESCE(departure_icao, departure_name)) + 
    COUNT(DISTINCT COALESCE(arrival_icao, arrival_name)) as unique_airports,
    ROUND(AVG(flight_time), 2) as avg_flight_time,
    ROUND(MAX(flight_time) / 60.0, 2) as longest_flight,
    (
      SELECT aircraft_type 
      FROM msfs_flights mf2 
      WHERE (p_user_id IS NULL OR mf2.user_id = p_user_id)
      GROUP BY aircraft_type 
      ORDER BY COUNT(*) DESC 
      LIMIT 1
    ) as most_used_aircraft
  FROM msfs_flights mf
  WHERE (p_user_id IS NULL OR mf.user_id = p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- ============================================

-- Habilitar RLS nas tabelas
ALTER TABLE msfs_flights ENABLE ROW LEVEL SECURITY;

-- Política para msfs_flights: usuários só veem seus próprios voos
CREATE POLICY "Users can view their own MSFS flights" ON msfs_flights
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own MSFS flights" ON msfs_flights
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own MSFS flights" ON msfs_flights
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own MSFS flights" ON msfs_flights
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ============================================

COMMENT ON TABLE msfs_flights IS 'Armazena voos coletados automaticamente do Microsoft Flight Simulator 2024';
COMMENT ON COLUMN msfs_flights.flight_time IS 'Duração do voo em minutos';
COMMENT ON COLUMN msfs_flights.distance IS 'Distância do voo em quilômetros';
COMMENT ON COLUMN msfs_flights.max_altitude IS 'Altitude máxima atingida em pés';
COMMENT ON COLUMN msfs_flights.max_speed IS 'Velocidade máxima atingida em km/h';
COMMENT ON COLUMN msfs_flights.source IS 'Fonte dos dados (MSFS_2024, manual, etc.)';
COMMENT ON COLUMN msfs_flights.raw_data IS 'Dados brutos do SimConnect em formato JSON';