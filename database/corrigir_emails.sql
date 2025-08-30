-- ============================================
-- SCRIPT PARA CORRIGIR EMAILS NA TABELA PROFILES
-- ============================================
-- Este script corrige os emails que estão aparecendo como NULL
-- na tabela profiles, sincronizando com auth.users

-- 1. Verificar situação atual dos emails
SELECT 
  'Situação Atual dos Emails' as status,
  COUNT(*) as total_usuarios,
  COUNT(CASE WHEN p.email IS NULL THEN 1 END) as emails_null,
  COUNT(CASE WHEN p.email IS NOT NULL THEN 1 END) as emails_ok
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id;

-- 2. Mostrar usuários com emails NULL
SELECT 
  au.email as email_auth,
  p.email as email_profile,
  p.display_name,
  CASE 
    WHEN p.email IS NULL THEN '❌ EMAIL NULL NO PROFILE'
    WHEN p.email != au.email THEN '⚠️ EMAIL DIFERENTE'
    ELSE '✅ EMAIL OK'
  END as status
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.email IS NULL OR p.email != au.email
ORDER BY au.created_at DESC;

-- 3. CORRIGIR: Atualizar emails NULL ou diferentes na tabela profiles
UPDATE public.profiles 
SET 
  email = au.email,
  updated_at = NOW()
FROM auth.users au
WHERE profiles.id = au.id
  AND (profiles.email IS NULL OR profiles.email != au.email);

-- 4. Para usuários que existem em auth.users mas não têm perfil
-- (criar perfil completo com email correto)
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
  au.email, -- ← IMPORTANTE: Usar o email do auth.users
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

-- 5. Atualizar a função do trigger para sempre incluir o email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Inserir novo perfil com dados do usuário (incluindo email)
  INSERT INTO public.profiles (
    id,
    display_name,
    email, -- ← SEMPRE incluir o email
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
    NEW.email, -- ← IMPORTANTE: Sempre usar o email do auth.users
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

-- 6. Verificar resultado final
SELECT 
  'Resultado Final' as status,
  COUNT(*) as total_usuarios,
  COUNT(CASE WHEN p.email IS NULL THEN 1 END) as emails_null,
  COUNT(CASE WHEN p.email IS NOT NULL THEN 1 END) as emails_ok
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id;

-- 7. Mostrar todos os usuários com seus emails
SELECT 
  au.email as email_auth,
  p.email as email_profile,
  p.display_name,
  p.updated_at,
  CASE 
    WHEN p.email IS NULL THEN '❌ EMAIL NULL'
    WHEN p.email = au.email THEN '✅ EMAIL OK'
    ELSE '⚠️ EMAIL DIFERENTE'
  END as status
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
ORDER BY p.updated_at DESC;

-- ============================================
-- INSTRUÇÕES:
-- 1. Execute este script completo no SQL Editor do Supabase
-- 2. Verifique os resultados das queries de verificação
-- 3. Os emails devem aparecer corretamente no painel do Supabase
-- 4. Teste criando um novo usuário para verificar se o trigger funciona
-- ============================================