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
  raw_data JSONB, -- dados brutos do SimConnect
  
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

-- Índice por coordenadas (para buscas geográficas)
CREATE INDEX IF NOT EXISTS idx_msfs_flights_departure_coords 
ON msfs_flights(departure_lat, departure_lon);

CREATE INDEX IF NOT EXISTS idx_msfs_flights_arrival_coords 
ON msfs_flights(arrival_lat, arrival_lon);

-- Índice por fonte e status
CREATE INDEX IF NOT EXISTS idx_msfs_flights_source_status 
ON msfs_flights(source, status);

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
-- TABELA AUXILIAR: msfs_telemetry (OPCIONAL)
-- ============================================

-- Tabela para armazenar dados de telemetria em tempo real (opcional)
-- Útil para análises detalhadas e replay de voos
CREATE TABLE IF NOT EXISTS msfs_telemetry (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flight_id UUID REFERENCES msfs_flights(id) ON DELETE CASCADE,
  
  -- Dados de telemetria
  timestamp_ms BIGINT NOT NULL, -- timestamp em milissegundos
  latitude NUMERIC(10, 6) NOT NULL,
  longitude NUMERIC(10, 6) NOT NULL,
  altitude INTEGER NOT NULL, -- em pés
  speed INTEGER NOT NULL, -- em km/h
  heading INTEGER NOT NULL, -- em graus (0-360)
  vertical_speed INTEGER DEFAULT 0, -- em pés/min
  on_ground BOOLEAN NOT NULL DEFAULT false,
  
  -- Dados adicionais (JSON para flexibilidade)
  additional_data JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para telemetria por voo e timestamp
CREATE INDEX IF NOT EXISTS idx_msfs_telemetry_flight_timestamp 
ON msfs_telemetry(flight_id, timestamp_ms);

-- ============================================
-- FUNÇÕES RPC PARA ESTATÍSTICAS
-- ============================================

-- Função para obter estatísticas dos voos MSFS
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

-- Função para obter voos recentes do MSFS
CREATE OR REPLACE FUNCTION get_recent_msfs_flights(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  aircraft_type TEXT,
  departure_icao TEXT,
  departure_name TEXT,
  arrival_icao TEXT,
  arrival_name TEXT,
  flight_time INTEGER,
  distance INTEGER,
  flight_date DATE,
  departure_time TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mf.id,
    mf.aircraft_type,
    mf.departure_icao,
    mf.departure_name,
    mf.arrival_icao,
    mf.arrival_name,
    mf.flight_time,
    mf.distance,
    mf.flight_date,
    mf.departure_time
  FROM msfs_flights mf
  WHERE mf.user_id = p_user_id
  ORDER BY mf.departure_time DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter rotas mais populares
CREATE OR REPLACE FUNCTION get_popular_msfs_routes(
  p_user_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  route TEXT,
  flight_count BIGINT,
  avg_flight_time NUMERIC,
  total_distance BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CONCAT(
      COALESCE(departure_icao, LEFT(departure_name, 20)), 
      ' → ', 
      COALESCE(arrival_icao, LEFT(arrival_name, 20))
    ) as route,
    COUNT(*) as flight_count,
    ROUND(AVG(flight_time), 2) as avg_flight_time,
    SUM(distance) as total_distance
  FROM msfs_flights
  WHERE (p_user_id IS NULL OR user_id = p_user_id)
  GROUP BY departure_icao, departure_name, arrival_icao, arrival_name
  ORDER BY flight_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- ============================================

-- Habilitar RLS nas tabelas
ALTER TABLE msfs_flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE msfs_telemetry ENABLE ROW LEVEL SECURITY;

-- Política para msfs_flights: usuários só veem seus próprios voos
CREATE POLICY "Users can view their own MSFS flights" ON msfs_flights
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own MSFS flights" ON msfs_flights
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own MSFS flights" ON msfs_flights
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own MSFS flights" ON msfs_flights
  FOR DELETE USING (auth.uid() = user_id);

-- Política para msfs_telemetry: usuários só veem telemetria de seus voos
CREATE POLICY "Users can view telemetry of their own flights" ON msfs_telemetry
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM msfs_flights 
      WHERE msfs_flights.id = msfs_telemetry.flight_id 
      AND msfs_flights.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert telemetry for their own flights" ON msfs_telemetry
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM msfs_flights 
      WHERE msfs_flights.id = msfs_telemetry.flight_id 
      AND msfs_flights.user_id = auth.uid()
    )
  );

-- ============================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ============================================

COMMENT ON TABLE msfs_flights IS 'Armazena voos coletados automaticamente do Microsoft Flight Simulator 2024';
COMMENT ON COLUMN msfs_flights.aircraft_type IS 'Tipo/modelo da aeronave utilizada no voo';
COMMENT ON COLUMN msfs_flights.flight_time IS 'Duração do voo em minutos';
COMMENT ON COLUMN msfs_flights.distance IS 'Distância do voo em quilômetros';
COMMENT ON COLUMN msfs_flights.max_altitude IS 'Altitude máxima atingida em pés';
COMMENT ON COLUMN msfs_flights.max_speed IS 'Velocidade máxima atingida em km/h';
COMMENT ON COLUMN msfs_flights.source IS 'Fonte dos dados (MSFS_2024, manual, etc.)';
COMMENT ON COLUMN msfs_flights.raw_data IS 'Dados brutos do SimConnect em formato JSON';

COMMENT ON TABLE msfs_telemetry IS 'Dados de telemetria em tempo real dos voos MSFS (opcional)';
COMMENT ON COLUMN msfs_telemetry.timestamp_ms IS 'Timestamp em milissegundos desde o início do voo';
COMMENT ON COLUMN msfs_telemetry.additional_data IS 'Dados adicionais de telemetria em formato JSON';

-- ============================================
-- DADOS INICIAIS (OPCIONAL)
-- ============================================

-- Inserir alguns dados de exemplo para testes (opcional)
-- Descomente as linhas abaixo se quiser dados de exemplo

/*
INSERT INTO msfs_flights (
  aircraft_type, flight_date, departure_time, arrival_time,
  departure_icao, departure_name, departure_lat, departure_lon,
  arrival_icao, arrival_name, arrival_lat, arrival_lon,
  flight_time, distance, max_altitude, max_speed, source
) VALUES (
  'Cessna 172', '2024-01-15', '2024-01-15 10:00:00+00', '2024-01-15 11:30:00+00',
  'SBSP', 'São Paulo/Congonhas Airport', -23.626692, -46.655981,
  'SBRJ', 'Rio de Janeiro/Santos Dumont Airport', -22.910461, -43.163133,
  90, 365, 8500, 180, 'MSFS_2024'
);
*/

-- ============================================
-- FIM DO SCHEMA
-- ============================================

-- Verificar se tudo foi criado corretamente
SELECT 'Schema MSFS criado com sucesso!' as status;