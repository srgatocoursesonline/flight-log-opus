-- ============================================
-- RECRIAR TABELA PROFILES
-- ============================================
-- Execute este script no SQL Editor do Supabase

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Recriar tabela profiles com todos os campos
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
  initial_flights INTEGER DEFAULT 0,
  initial_hours NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Comentários nas colunas para documentação
COMMENT ON COLUMN profiles.initial_flights IS 'Número inicial de voos (histórico anterior ao sistema)';
COMMENT ON COLUMN profiles.initial_hours IS 'Horas iniciais de voo (histórico anterior ao sistema)';
COMMENT ON COLUMN profiles.display_name IS 'Nome de exibição do piloto';
COMMENT ON COLUMN profiles.total_flights IS 'Total de voos registrados no sistema';
COMMENT ON COLUMN profiles.total_hours IS 'Total de horas de voo registradas no sistema';
COMMENT ON COLUMN profiles.career_rating IS 'Pontuação de carreira do piloto';
COMMENT ON COLUMN profiles.career_level IS 'Nível de carreira do piloto';
COMMENT ON COLUMN profiles.career_class IS 'Classe de carreira do piloto (D, C, B, A)';

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de segurança
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

SELECT 'Tabela profiles recriada com sucesso!' as status;