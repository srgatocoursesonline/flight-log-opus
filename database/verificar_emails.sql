-- ============================================
-- SCRIPT DE VERIFICAÇÃO DOS EMAILS
-- ============================================
-- Execute este script para verificar a situação dos emails
-- na tabela profiles antes e depois da correção

-- 1. Estatísticas gerais dos emails
SELECT 
  '📊 ESTATÍSTICAS GERAIS' as categoria,
  COUNT(*) as total_usuarios,
  COUNT(CASE WHEN p.id IS NOT NULL THEN 1 END) as usuarios_com_perfil,
  COUNT(CASE WHEN p.id IS NULL THEN 1 END) as usuarios_sem_perfil,
  COUNT(CASE WHEN p.email IS NOT NULL THEN 1 END) as emails_preenchidos,
  COUNT(CASE WHEN p.email IS NULL THEN 1 END) as emails_null
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id;

-- 2. Detalhes dos usuários com problemas de email
SELECT 
  '🔍 USUÁRIOS COM PROBLEMAS' as categoria,
  au.email as email_correto,
  p.email as email_profile,
  p.display_name,
  au.created_at as usuario_criado,
  p.created_at as perfil_criado,
  CASE 
    WHEN p.id IS NULL THEN '❌ SEM PERFIL'
    WHEN p.email IS NULL THEN '❌ EMAIL NULL NO PROFILE'
    WHEN p.email != au.email THEN '⚠️ EMAIL DIFERENTE'
    ELSE '✅ EMAIL OK'
  END as status_problema
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL 
   OR p.email IS NULL 
   OR p.email != au.email
ORDER BY au.created_at DESC;

-- 3. Usuários com emails corretos (para verificar se está funcionando)
SELECT 
  '✅ USUÁRIOS COM EMAILS OK' as categoria,
  au.email,
  p.display_name,
  p.created_at as perfil_criado
FROM auth.users au
JOIN public.profiles p ON au.id = p.id
WHERE p.email = au.email
ORDER BY p.created_at DESC
LIMIT 5;

-- 4. Verificar se o trigger existe e está ativo
SELECT 
  '🔧 STATUS DO TRIGGER' as categoria,
  trigger_name, 
  event_manipulation, 
  event_object_table,
  action_timing,
  CASE 
    WHEN trigger_name IS NOT NULL THEN '✅ TRIGGER ATIVO'
    ELSE '❌ TRIGGER NÃO ENCONTRADO'
  END as status
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created'
UNION ALL
SELECT 
  '🔧 STATUS DO TRIGGER' as categoria,
  'N/A' as trigger_name,
  'N/A' as event_manipulation,
  'N/A' as event_object_table,
  'N/A' as action_timing,
  '❌ TRIGGER NÃO ENCONTRADO' as status
WHERE NOT EXISTS (
  SELECT 1 FROM information_schema.triggers 
  WHERE trigger_name = 'on_auth_user_created'
);

-- 5. Verificar se a função do trigger existe
SELECT 
  '⚙️ FUNÇÃO DO TRIGGER' as categoria,
  proname as nome_funcao,
  CASE 
    WHEN proname IS NOT NULL THEN '✅ FUNÇÃO EXISTE'
    ELSE '❌ FUNÇÃO NÃO ENCONTRADA'
  END as status
FROM pg_proc 
WHERE proname = 'handle_new_user'
UNION ALL
SELECT 
  '⚙️ FUNÇÃO DO TRIGGER' as categoria,
  'handle_new_user' as nome_funcao,
  '❌ FUNÇÃO NÃO ENCONTRADA' as status
WHERE NOT EXISTS (
  SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user'
);

-- 6. Resumo final com recomendações
SELECT 
  '📋 RESUMO E RECOMENDAÇÕES' as categoria,
  CASE 
    WHEN COUNT(CASE WHEN p.email IS NULL THEN 1 END) > 0 THEN 
      '⚠️ EXECUTE o script corrigir_emails.sql para corrigir ' || 
      COUNT(CASE WHEN p.email IS NULL THEN 1 END) || ' emails NULL'
    WHEN COUNT(CASE WHEN p.email != au.email THEN 1 END) > 0 THEN
      '⚠️ EXECUTE o script corrigir_emails.sql para sincronizar ' ||
      COUNT(CASE WHEN p.email != au.email THEN 1 END) || ' emails diferentes'
    ELSE '✅ TODOS OS EMAILS ESTÃO CORRETOS!'
  END as recomendacao
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id;

-- ============================================
-- INSTRUÇÕES DE USO:
-- 
-- 1. ANTES DA CORREÇÃO:
--    Execute este script para ver quantos emails estão com problema
--
-- 2. EXECUTAR A CORREÇÃO:
--    Execute o script 'corrigir_emails.sql'
--
-- 3. DEPOIS DA CORREÇÃO:
--    Execute este script novamente para verificar se foi corrigido
--
-- 4. RESULTADO ESPERADO:
--    - Todos os emails devem aparecer no painel do Supabase
--    - Não deve haver emails NULL na tabela profiles
--    - Emails devem ser iguais entre auth.users e profiles
-- ============================================