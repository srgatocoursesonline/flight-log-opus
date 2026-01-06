-- ============================================
-- SCRIPT PARA ADICIONAR COLUNA ACHIEVEMENTS
-- ============================================
-- Execute este script no SQL Editor do Supabase para adicionar a coluna achievements

BEGIN;

-- Adicionar coluna achievements se não existir
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS achievements TEXT DEFAULT '';

-- Adicionar coluna perfect_flights se não existir
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS perfect_flights INTEGER DEFAULT 0;

-- Adicionar coluna career_started se não existir
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS career_started TEXT;

-- Adicionar coluna description se não existir
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';

-- Verificar se as colunas foram criadas corretamente
DO $$
DECLARE
  achievements_exists boolean;
  perfect_flights_exists boolean;
  career_started_exists boolean;
  description_exists boolean;
BEGIN
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
  
  RAISE NOTICE 'Coluna achievements existe: %', achievements_exists;
  RAISE NOTICE 'Coluna perfect_flights existe: %', perfect_flights_exists;
  RAISE NOTICE 'Coluna career_started existe: %', career_started_exists;
  RAISE NOTICE 'Coluna description existe: %', description_exists;
END $$;

-- Mostrar estrutura atual da tabela profiles
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

COMMIT;

-- ============================================
-- INSTRUÇÕES DE USO
-- ============================================
-- 1. Copie todo este código
-- 2. Vá para o Supabase Dashboard
-- 3. Acesse SQL Editor
-- 4. Cole o código e execute
-- 5. Verifique se as colunas foram criadas com sucesso
-- ============================================