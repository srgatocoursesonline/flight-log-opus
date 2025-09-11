-- TABELA DE AEROPORTOS MANUAIS
CREATE TABLE IF NOT EXISTS public.manual_airports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  icao_code VARCHAR(10) NOT NULL,
  name TEXT NOT NULL,
  city TEXT,
  country TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  timezone TEXT,
  elevation INTEGER,
  iata_code VARCHAR(5),
  airport_type VARCHAR(50) DEFAULT 'unknown',
  region TEXT,
  municipality TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, icao_code)
);