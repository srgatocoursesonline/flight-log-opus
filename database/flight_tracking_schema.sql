-- ============================================
-- FLIGHT TRACKING SCHEMA - MVP Sprint 1
-- Sistema de tracking em tempo real para MSFS
-- ============================================

-- Tabela para sessões de voo
CREATE TABLE IF NOT EXISTS flight_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id VARCHAR(255) NOT NULL, -- ID único do dispositivo/conector
  
  -- Dados da aeronave
  aircraft_title VARCHAR(255) NOT NULL,
  aircraft_type VARCHAR(100),
  
  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  
  -- Posições de partida e chegada
  departure_lat DOUBLE PRECISION,
  departure_lon DOUBLE PRECISION,
  departure_airport VARCHAR(10), -- ICAO code
  arrival_lat DOUBLE PRECISION,
  arrival_lon DOUBLE PRECISION,
  arrival_airport VARCHAR(10), -- ICAO code
  
  -- Métricas do voo
  max_altitude DOUBLE PRECISION DEFAULT 0,
  max_ground_speed DOUBLE PRECISION DEFAULT 0,
  max_indicated_airspeed DOUBLE PRECISION DEFAULT 0,
  total_distance DOUBLE PRECISION DEFAULT 0, -- em milhas náuticas
  flight_time INTEGER DEFAULT 0, -- em segundos
  
  -- Estado da sessão
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para pontos de telemetria em tempo real
CREATE TABLE IF NOT EXISTS flight_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_session_id UUID REFERENCES flight_sessions(id) ON DELETE CASCADE,
  
  -- Posição
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  altitude DOUBLE PRECISION NOT NULL, -- pés
  
  -- Velocidades
  ground_speed DOUBLE PRECISION DEFAULT 0, -- knots
  indicated_airspeed DOUBLE PRECISION DEFAULT 0, -- knots
  true_airspeed DOUBLE PRECISION DEFAULT 0, -- knots
  vertical_speed DOUBLE PRECISION DEFAULT 0, -- pés/min
  
  -- Orientação
  heading DOUBLE PRECISION DEFAULT 0, -- graus magnéticos
  
  -- Estado da aeronave
  on_ground BOOLEAN DEFAULT false,
  
  -- Dados ambientais
  wind_speed DOUBLE PRECISION DEFAULT 0, -- knots
  wind_direction DOUBLE PRECISION DEFAULT 0, -- graus
  
  -- Dados da aeronave
  fuel_quantity DOUBLE PRECISION DEFAULT 0, -- galões
  engine_rpm DOUBLE PRECISION DEFAULT 0,
  
  -- Timestamp
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Índice para consultas rápidas por sessão e tempo
  CONSTRAINT flight_points_session_time_idx UNIQUE (flight_session_id, recorded_at)
);

-- Tabela para dispositivos autorizados
CREATE TABLE IF NOT EXISTS authorized_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id VARCHAR(255) NOT NULL UNIQUE,
  device_name VARCHAR(255) NOT NULL,
  device_token VARCHAR(512) NOT NULL, -- Token para autenticação
  
  -- Status do dispositivo
  is_active BOOLEAN DEFAULT true,
  last_seen_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_flight_sessions_user_id ON flight_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_flight_sessions_device_id ON flight_sessions(device_id);
CREATE INDEX IF NOT EXISTS idx_flight_sessions_started_at ON flight_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_flight_sessions_status ON flight_sessions(status);

CREATE INDEX IF NOT EXISTS idx_flight_points_session_id ON flight_points(flight_session_id);
CREATE INDEX IF NOT EXISTS idx_flight_points_recorded_at ON flight_points(recorded_at);
CREATE INDEX IF NOT EXISTS idx_flight_points_session_time ON flight_points(flight_session_id, recorded_at);

CREATE INDEX IF NOT EXISTS idx_authorized_devices_user_id ON authorized_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_authorized_devices_device_id ON authorized_devices(device_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_flight_sessions_updated_at BEFORE UPDATE ON flight_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_authorized_devices_updated_at BEFORE UPDATE ON authorized_devices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para iniciar uma nova sessão de voo
CREATE OR REPLACE FUNCTION start_flight_session(
  p_user_id UUID,
  p_device_id VARCHAR(255),
  p_aircraft_title VARCHAR(255),
  p_departure_lat DOUBLE PRECISION,
  p_departure_lon DOUBLE PRECISION
)
RETURNS UUID AS $$
DECLARE
  session_id UUID;
BEGIN
  -- Verificar se o dispositivo está autorizado
  IF NOT EXISTS (
    SELECT 1 FROM authorized_devices 
    WHERE device_id = p_device_id AND user_id = p_user_id AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Device not authorized for this user';
  END IF;
  
  -- Finalizar qualquer sessão ativa do mesmo dispositivo
  UPDATE flight_sessions 
  SET status = 'cancelled', ended_at = NOW()
  WHERE device_id = p_device_id AND status = 'active';
  
  -- Criar nova sessão
  INSERT INTO flight_sessions (
    user_id, device_id, aircraft_title,
    departure_lat, departure_lon
  ) VALUES (
    p_user_id, p_device_id, p_aircraft_title,
    p_departure_lat, p_departure_lon
  ) RETURNING id INTO session_id;
  
  -- Atualizar last_seen do dispositivo
  UPDATE authorized_devices 
  SET last_seen_at = NOW() 
  WHERE device_id = p_device_id;
  
  RETURN session_id;
END;
$$ LANGUAGE plpgsql;

-- Função para finalizar uma sessão de voo
CREATE OR REPLACE FUNCTION end_flight_session(
  p_session_id UUID,
  p_arrival_lat DOUBLE PRECISION,
  p_arrival_lon DOUBLE PRECISION
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE flight_sessions 
  SET 
    status = 'completed',
    ended_at = NOW(),
    arrival_lat = p_arrival_lat,
    arrival_lon = p_arrival_lon,
    flight_time = EXTRACT(EPOCH FROM (NOW() - started_at))::INTEGER
  WHERE id = p_session_id AND status = 'active';
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Função para adicionar ponto de telemetria
CREATE OR REPLACE FUNCTION add_flight_point(
  p_session_id UUID,
  p_latitude DOUBLE PRECISION,
  p_longitude DOUBLE PRECISION,
  p_altitude DOUBLE PRECISION,
  p_ground_speed DOUBLE PRECISION DEFAULT 0,
  p_indicated_airspeed DOUBLE PRECISION DEFAULT 0,
  p_true_airspeed DOUBLE PRECISION DEFAULT 0,
  p_vertical_speed DOUBLE PRECISION DEFAULT 0,
  p_heading DOUBLE PRECISION DEFAULT 0,
  p_on_ground BOOLEAN DEFAULT false,
  p_wind_speed DOUBLE PRECISION DEFAULT 0,
  p_wind_direction DOUBLE PRECISION DEFAULT 0,
  p_fuel_quantity DOUBLE PRECISION DEFAULT 0,
  p_engine_rpm DOUBLE PRECISION DEFAULT 0
)
RETURNS UUID AS $$
DECLARE
  point_id UUID;
BEGIN
  -- Inserir ponto de telemetria
  INSERT INTO flight_points (
    flight_session_id, latitude, longitude, altitude,
    ground_speed, indicated_airspeed, true_airspeed, vertical_speed,
    heading, on_ground, wind_speed, wind_direction,
    fuel_quantity, engine_rpm
  ) VALUES (
    p_session_id, p_latitude, p_longitude, p_altitude,
    p_ground_speed, p_indicated_airspeed, p_true_airspeed, p_vertical_speed,
    p_heading, p_on_ground, p_wind_speed, p_wind_direction,
    p_fuel_quantity, p_engine_rpm
  ) RETURNING id INTO point_id;
  
  -- Atualizar métricas da sessão
  UPDATE flight_sessions 
  SET 
    max_altitude = GREATEST(max_altitude, p_altitude),
    max_ground_speed = GREATEST(max_ground_speed, p_ground_speed),
    max_indicated_airspeed = GREATEST(max_indicated_airspeed, p_indicated_airspeed)
  WHERE id = p_session_id;
  
  RETURN point_id;
END;
$$ LANGUAGE plpgsql;

-- View para estatísticas de voo em tempo real
CREATE OR REPLACE VIEW flight_session_stats AS
SELECT 
  fs.id,
  fs.user_id,
  fs.aircraft_title,
  fs.started_at,
  fs.ended_at,
  fs.status,
  fs.max_altitude,
  fs.max_ground_speed,
  fs.max_indicated_airspeed,
  fs.total_distance,
  fs.flight_time,
  
  -- Estatísticas calculadas dos pontos
  COUNT(fp.id) as total_points,
  MIN(fp.recorded_at) as first_point_time,
  MAX(fp.recorded_at) as last_point_time,
  
  -- Posição atual (último ponto)
  (SELECT latitude FROM flight_points WHERE flight_session_id = fs.id ORDER BY recorded_at DESC LIMIT 1) as current_lat,
  (SELECT longitude FROM flight_points WHERE flight_session_id = fs.id ORDER BY recorded_at DESC LIMIT 1) as current_lon,
  (SELECT altitude FROM flight_points WHERE flight_session_id = fs.id ORDER BY recorded_at DESC LIMIT 1) as current_altitude,
  (SELECT ground_speed FROM flight_points WHERE flight_session_id = fs.id ORDER BY recorded_at DESC LIMIT 1) as current_speed
  
FROM flight_sessions fs
LEFT JOIN flight_points fp ON fs.id = fp.flight_session_id
GROUP BY fs.id;

-- Comentários para documentação
COMMENT ON TABLE flight_sessions IS 'Sessões de voo com dados de início, fim e métricas gerais';
COMMENT ON TABLE flight_points IS 'Pontos de telemetria coletados em tempo real durante o voo';
COMMENT ON TABLE authorized_devices IS 'Dispositivos autorizados para enviar dados de telemetria';
COMMENT ON VIEW flight_session_stats IS 'View com estatísticas calculadas das sessões de voo';