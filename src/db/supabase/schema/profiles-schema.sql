-- Execução manual no SQL Editor do Supabase
-- Corrige todos os problemas relacionados a tabela profiles e colunas de carreira

-- Verificar se a tabela profiles existe e criar as colunas necessárias
BEGIN;

-- Adicionar colunas de carreira se não existirem
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_rating INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS career_level INTEGER DEFAULT 1;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS career_class TEXT DEFAULT 'D';

-- Validar se as colunas foram criadas corretamente
DO $$
DECLARE
  total_rating_exists boolean;
  career_level_exists boolean;
  career_class_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'total_rating'
  ) INTO total_rating_exists;
  
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'career_level'
  ) INTO career_level_exists;
  
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'career_class'
  ) INTO career_class_exists;
  
  RAISE NOTICE 'Coluna total_rating existe: %', total_rating_exists;
  RAISE NOTICE 'Coluna career_level existe: %', career_level_exists;
  RAISE NOTICE 'Coluna career_class existe: %', career_class_exists;
END $$;

-- Verificar se há registros na tabela profiles
DO $$
DECLARE
  profile_count integer;
BEGIN
  SELECT COUNT(*) FROM profiles INTO profile_count;
  RAISE NOTICE 'Número de perfis na tabela: %', profile_count;
END $$;

-- Mostrar estrutura atual da tabela profiles
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

COMMIT;