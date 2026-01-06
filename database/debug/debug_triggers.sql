-- Script de diagnóstico para verificar o estado atual dos triggers

-- 1. Verificar se os triggers existem
SELECT 
  tgname as trigger_name,
  relname as table_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE relname = 'flights';

-- 2. Verificar a definição da função do trigger
SELECT 
  proname as function_name,
  pg_get_functiondef(oid) as function_definition
FROM pg_proc 
WHERE proname = 'update_profile_flight_stats';

-- 3. Verificar o estado atual de um perfil específico (substituir 'SEU_USER_ID' pelo ID real)
-- SELECT 
--   id,
--   display_name,
--   total_flights,
--   total_minutes,
--   total_hours,
--   initial_flights,
--   initial_hours
-- FROM profiles 
-- WHERE id = 'SEU_USER_ID';

-- 4. Verificar se há triggers antigos que ainda usam total_hours
-- SELECT *
-- FROM pg_proc 
-- WHERE proname LIKE '%profile%'
-- AND pg_get_functiondef(oid) LIKE '%total_hours%';