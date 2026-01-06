-- ============================================
-- RECRIAR TABELA FLIGHTS
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- IMPORTANTE: Execute APÓS criar a tabela profiles

-- 1. Recriar tabela flights com todos os campos
CREATE TABLE IF NOT EXISTS public.flights (
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
  service_type TEXT DEFAULT 'employee' CHECK (service_type IN ('employee', 'freelance')),
  origin_country TEXT,
  destination_country TEXT,
  origin_airport_info JSONB DEFAULT '{}'::jsonb,
  destination_airport_info JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Comentários nas colunas para documentação
COMMENT ON COLUMN flights.callsign IS 'Indicativo de chamada do voo';
COMMENT ON COLUMN flights.aircraft IS 'Tipo de aeronave utilizada';
COMMENT ON COLUMN flights.departure IS 'Aeroporto de partida (código ICAO)';
COMMENT ON COLUMN flights.arrival IS 'Aeroporto de chegada (código ICAO)';
COMMENT ON COLUMN flights.flight_time IS 'Tempo total de voo';
COMMENT ON COLUMN flights.distance IS 'Distância percorrida em milhas náuticas';
COMMENT ON COLUMN flights.fuel_used IS 'Combustível utilizado';
COMMENT ON COLUMN flights.landing_rate IS 'Taxa de pouso (fpm)';
COMMENT ON COLUMN flights.experience_points IS 'Pontos de experiência ganhos';
COMMENT ON COLUMN flights.career_rating IS 'Pontuação de carreira do voo';
COMMENT ON COLUMN flights.service_type IS 'Tipo de serviço (employee=Funcionário, freelance=Autônomo)';
COMMENT ON COLUMN flights.origin_country IS 'País de origem do voo';
COMMENT ON COLUMN flights.destination_country IS 'País de destino do voo';
COMMENT ON COLUMN flights.origin_airport_info IS 'Informações detalhadas do aeroporto de origem';
COMMENT ON COLUMN flights.destination_airport_info IS 'Informações detalhadas do aeroporto de destino';
COMMENT ON COLUMN flights.is_example IS 'Indica se é um voo de exemplo/demonstração';

-- 3. Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_flights_user_id ON flights(user_id);
CREATE INDEX IF NOT EXISTS idx_flights_flight_date ON flights(flight_date);
CREATE INDEX IF NOT EXISTS idx_flights_departure ON flights(departure);
CREATE INDEX IF NOT EXISTS idx_flights_arrival ON flights(arrival);
CREATE INDEX IF NOT EXISTS idx_flights_status ON flights(status);
CREATE INDEX IF NOT EXISTS idx_flights_created_at ON flights(created_at);

-- 4. Habilitar Row Level Security (RLS)
ALTER TABLE flights ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de segurança
CREATE POLICY "Users can view own flights" ON flights
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own flights" ON flights
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own flights" ON flights
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own flights" ON flights
  FOR DELETE USING (auth.uid() = user_id);

SELECT 'Tabela flights recriada com sucesso!' as status;