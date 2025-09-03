-- Script para verificar o estado atual dos triggers e funções

-- 1. Verificar triggers existentes na tabela flights
SELECT 
  tgname as trigger_name,
  relname as table_name,
  tgenabled as enabled
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE relname = 'flights'
ORDER BY tgname;

-- 2. Verificar a definição da função do trigger
SELECT 
  proname as function_name,
  pg_get_functiondef(oid) as function_definition
FROM pg_proc 
WHERE proname = 'update_profile_flight_stats';

-- 3. Verificar se a função RPC existe
SELECT 
  proname as function_name,
  proargtypes as argument_types
FROM pg_proc 
WHERE proname = 'increment_profile_stats';

-- 4. Verificar o estado atual de um perfil específico (substituir 'SEU_USER_ID' pelo ID real)
-- SELECT 
--   id,
--   display_name,
--   total_flights,
--   total_minutes,
--   total_hours,
--   initial_flights,
--   initial_hours,
--   updated_at
-- FROM profiles 
-- WHERE id = 'SEU_USER_ID'
-- ORDER BY updated_at DESC
-- LIMIT 5;