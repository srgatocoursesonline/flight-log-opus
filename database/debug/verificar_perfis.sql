-- ============================================
-- SCRIPT DE VERIFICAÇÃO DOS PERFIS
-- ============================================
-- Execute este script no SQL Editor do Supabase para verificar
-- se o trigger está funcionando e se os perfis estão corretos

-- 1. Verificar se o trigger foi criado
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 2. Verificar usuários e seus perfis
SELECT 
  au.id,
  au.email,
  au.email_confirmed_at,
  au.raw_user_meta_data->>'display_name' as meta_display_name,
  p.display_name as profile_display_name,
  p.created_at as profile_created,
  CASE 
    WHEN p.id IS NULL THEN '❌ SEM PERFIL'
    WHEN p.display_name IS NULL OR p.display_name = '' THEN '⚠️ DISPLAY NAME VAZIO'
    WHEN p.display_name = 'Cmdte. Rodrigo' THEN '🔧 DISPLAY NAME PADRÃO'
    ELSE '✅ DISPLAY NAME OK'
  END as status
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
ORDER BY au.created_at DESC;

-- 3. Verificar se a função do trigger existe
SELECT 
  proname as function_name,
  prosrc as function_body
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- 4. Contar usuários com e sem perfil
SELECT 
  'Total de usuários' as tipo,
  COUNT(*) as quantidade
FROM auth.users
UNION ALL
SELECT 
  'Usuários com perfil' as tipo,
  COUNT(*) as quantidade
FROM auth.users au
INNER JOIN public.profiles p ON au.id = p.id
UNION ALL
SELECT 
  'Usuários SEM perfil' as tipo,
  COUNT(*) as quantidade
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- 5. Verificar display_names específicos
SELECT 
  p.display_name,
  COUNT(*) as quantidade
FROM public.profiles p
GROUP BY p.display_name
ORDER BY quantidade DESC;