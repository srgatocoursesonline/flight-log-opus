-- EXECUTE ESTE SQL NO EDITOR SQL DO SUPABASE
-- Este script corrige todos os problemas relacionados aos dados de carreira

-- Parte 1: Garantir que todas as colunas necessárias existam
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_rating INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS career_level INTEGER DEFAULT 1;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS career_class TEXT DEFAULT 'D';

-- Parte 2: Verificar perfis existentes
SELECT id, display_name, total_rating, career_level, career_class FROM profiles;

-- Parte 3: Atualizar dados para todos os perfis com valores padrão caso estejam nulos
UPDATE profiles 
SET 
  total_rating = COALESCE(total_rating, 0),
  career_level = COALESCE(career_level, 1),
  career_class = COALESCE(career_class, 'D'),
  updated_at = NOW()
WHERE
  total_rating IS NULL OR
  career_level IS NULL OR
  career_class IS NULL;

-- Parte 4: Recriar as funções RPC
-- Função para executar SQL diretamente
CREATE OR REPLACE FUNCTION public.exec_sql(sql_query text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
  RETURN true;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Erro ao executar SQL: %', SQLERRM;
  RETURN false;
END;
$$;

-- Função para buscar dados de carreira
CREATE OR REPLACE FUNCTION public.fetch_career_data(user_id uuid)
RETURNS SETOF json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- Primeiro, tentar criar colunas se não existirem
  BEGIN
    EXECUTE '
      ALTER TABLE profiles 
      ADD COLUMN IF NOT EXISTS total_rating INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS career_level INTEGER DEFAULT 1,
      ADD COLUMN IF NOT EXISTS career_class TEXT DEFAULT ''D''
    ';
  EXCEPTION WHEN OTHERS THEN
    -- Ignorar erros aqui
    NULL;
  END;
  
  -- Então, tentar buscar os dados
  BEGIN
    -- Verificar se o perfil existe
    IF EXISTS (SELECT 1 FROM profiles WHERE id = user_id) THEN
      -- Buscar dados do perfil existente
      SELECT json_build_object(
        'total_rating', total_rating,
        'career_level', career_level,
        'career_class', career_class,
        'updated_at', updated_at
      ) INTO result
      FROM profiles
      WHERE id = user_id;
      
      RETURN NEXT result;
      RETURN;
    ELSE
      -- Em caso de perfil não existente, retornar valores padrão
      SELECT json_build_object(
        'total_rating', 0,
        'career_level', 1,
        'career_class', 'D',
        'updated_at', now()
      ) INTO result;
      
      RETURN NEXT result;
      RETURN;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Em caso de erro, retornar valores padrão
    SELECT json_build_object(
      'total_rating', 0,
      'career_level', 1,
      'career_class', 'D',
      'updated_at', now()
    ) INTO result;
    
    RETURN NEXT result;
    RETURN;
  END;
END;
$$;

-- Função para atualizar dados de carreira
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
  
  -- Primeiro, tentar criar colunas se não existirem
  BEGIN
    EXECUTE '
      ALTER TABLE profiles 
      ADD COLUMN IF NOT EXISTS total_rating INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS career_level INTEGER DEFAULT 1,
      ADD COLUMN IF NOT EXISTS career_class TEXT DEFAULT ''D''
    ';
  EXCEPTION WHEN OTHERS THEN
    -- Ignorar erros aqui
    NULL;
  END;
  
  -- Atualizar os dados
  BEGIN
    -- Verificar se o perfil existe
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = user_id) THEN
      -- Inserir perfil se não existir
      INSERT INTO profiles (
        id, 
        display_name, 
        total_rating, 
        career_level, 
        career_class
      ) VALUES (
        user_id, 
        'Cmdte. Rodrigo', 
        total_rating_val, 
        career_level_val, 
        career_class_val
      );
    ELSE
      -- Atualizar perfil existente
      UPDATE profiles 
      SET 
        total_rating = total_rating_val, 
        career_level = career_level_val, 
        career_class = career_class_val,
        updated_at = now()
      WHERE id = user_id;
    END IF;
    
    RETURN true;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Erro ao atualizar dados: %', SQLERRM;
    RETURN false;
  END;
END;
$$;

-- Conceder permissões para funções
GRANT EXECUTE ON FUNCTION public.exec_sql TO authenticated;
GRANT EXECUTE ON FUNCTION public.fetch_career_data TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_career_data TO authenticated;

-- Parte 5: Verificar se as funções foram criadas corretamente
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public' AND
      routine_name IN ('exec_sql', 'fetch_career_data', 'update_career_data');