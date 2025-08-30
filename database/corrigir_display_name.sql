-- ============================================
-- SCRIPT PARA CORRIGIR DISPLAY NAME
-- ============================================
-- Este script força a correção do display_name para todos os usuários

-- 1. Atualizar display_name para usuários que têm o valor nos metadados
UPDATE public.profiles 
SET 
  display_name = au.raw_user_meta_data->>'display_name',
  updated_at = NOW()
FROM auth.users au
WHERE profiles.id = au.id
  AND au.raw_user_meta_data->>'display_name' IS NOT NULL
  AND au.raw_user_meta_data->>'display_name' != ''
  AND au.raw_user_meta_data->>'display_name' != 'null';

-- 2. Para usuários sem display_name nos metadados, usar o padrão
UPDATE public.profiles 
SET 
  display_name = 'Cmdte. Rodrigo',
  updated_at = NOW()
FROM auth.users au
WHERE profiles.id = au.id
  AND (
    au.raw_user_meta_data->>'display_name' IS NULL 
    OR au.raw_user_meta_data->>'display_name' = ''
    OR au.raw_user_meta_data->>'display_name' = 'null'
  )
  AND (profiles.display_name IS NULL OR profiles.display_name = '');

-- 3. Verificar se há usuários sem perfil e criar para eles
INSERT INTO public.profiles (
  id,
  display_name,
  email,
  total_flights,
  total_hours,
  career_rating,
  total_rating,
  career_level,
  career_class,
  world_ranking,
  created_at,
  updated_at
)
SELECT 
  au.id,
  COALESCE(
    NULLIF(au.raw_user_meta_data->>'display_name', ''),
    NULLIF(au.raw_user_meta_data->>'display_name', 'null'),
    'Cmdte. Rodrigo'
  ) as display_name,
  au.email,
  0 as total_flights,
  0 as total_hours,
  0 as career_rating,
  0 as total_rating,
  1 as career_level,
  'D' as career_class,
  0 as world_ranking,
  au.created_at,
  NOW() as updated_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
  AND au.email_confirmed_at IS NOT NULL;

-- 4. Recriar a função do trigger com melhor tratamento do display_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Inserir novo perfil com dados do usuário
  INSERT INTO public.profiles (
    id,
    display_name,
    email,
    total_flights,
    total_hours,
    career_rating,
    total_rating,
    career_level,
    career_class,
    world_ranking,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'display_name', ''),
      NULLIF(NEW.raw_user_meta_data->>'display_name', 'null'),
      'Cmdte. Rodrigo'
    ),
    NEW.email,
    0,
    0,
    0,
    0,
    1,
    'D',
    0,
    NOW(),
    NOW()
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro mas não falha o registro do usuário
    RAISE WARNING 'Erro ao criar perfil para usuário %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- 5. Verificar resultado final
SELECT 
  au.email,
  au.raw_user_meta_data->>'display_name' as meta_display_name,
  p.display_name as profile_display_name,
  p.updated_at
FROM auth.users au
INNER JOIN public.profiles p ON au.id = p.id
ORDER BY p.updated_at DESC;

-- ============================================
-- INSTRUÇÕES:
-- 1. Execute este script completo no SQL Editor do Supabase
-- 2. Verifique os resultados da última query
-- 3. Teste criando um novo usuário para ver se o trigger funciona
-- ============================================