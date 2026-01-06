-- Script de diagnóstico para verificar o estado atual dos dados

-- 1. Verificar o estado atual de um perfil específico
SELECT 
  id,
  display_name,
  total_flights,
  total_minutes,
  initial_flights,
  initial_hours,
  created_at,
  updated_at
FROM profiles 
WHERE id = 'SEU_USER_ID_AQUI'; -- Substituir pelo seu user ID real

-- 2. Verificar voos concluídos para o usuário
SELECT 
  COUNT(*) as total_voos_concluidos,
  SUM(
    CASE 
      WHEN flight_time ~ '^[0-9]+h\s*[0-9]+m$' THEN 
        (CAST(SUBSTRING(flight_time FROM '^([0-9]+)h') AS INTEGER) * 60 + 
         CAST(SUBSTRING(flight_time FROM '([0-9]+)m$') AS INTEGER))
      WHEN flight_time ~ '^[0-9]+h$' THEN 
        CAST(SUBSTRING(flight_time FROM '^([0-9]+)h') AS INTEGER) * 60
      WHEN flight_time ~ '^[0-9]+m$' THEN 
        CAST(SUBSTRING(flight_time FROM '^([0-9]+)m') AS INTEGER)
      WHEN flight_time ~ '^[0-9]+:[0-9]+$' THEN 
        EXTRACT(HOUR FROM flight_time::TIME) * 60 + 
        EXTRACT(MINUTE FROM flight_time::TIME)
      WHEN flight_time ~ '^[0-9]+(\.[0-9]+)?$' THEN 
        CAST(flight_time AS NUMERIC) * 60
      ELSE 0
    END
  ) as total_minutos_calculados
FROM flights 
WHERE user_id = 'SEU_USER_ID_AQUI' -- Substituir pelo seu user ID real
  AND status = 'Concluído';

-- 3. Verificar se os triggers existem
SELECT 
  tgname as trigger_name,
  relname as table_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE relname = 'flights';

-- 4. Verificar a definição da função do trigger
SELECT 
  proname as function_name,
  pg_get_functiondef(oid) as function_definition
FROM pg_proc 
WHERE proname = 'update_profile_flight_stats';