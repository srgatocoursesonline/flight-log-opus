-- ============================================
-- SCRIPT PARA CORRIGIR PERFIS EXISTENTES
-- ============================================

-- 1. Identificar perfis que precisam de correção
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
WHERE initial_flights IS NULL OR initial_flights = 0
ORDER BY created_at DESC;

-- 2. Corrigir perfis existentes para preservar valores atuais como valores iniciais
-- Esta atualização deve ser executada APENAS SE os valores atuais representarem o histórico real
DO $$
DECLARE
  user_record RECORD;
  completed_flights_count INTEGER;
  completed_minutes_total INTEGER;
BEGIN
  FOR user_record IN 
    SELECT id, total_flights, total_minutes
    FROM profiles
    WHERE (initial_flights IS NULL OR initial_flights = 0)
    AND total_flights > 0
  LOOP
    -- Calcular quantos voos concluídos existem no sistema para este usuário
    SELECT COUNT(*), 
           COALESCE(SUM(
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
           ), 0)
    INTO completed_flights_count, completed_minutes_total
    FROM flights
    WHERE user_id = user_record.id AND status = 'Concluído';
    
    -- Se os valores totais forem maiores que os voos concluídos no sistema,
    -- então a diferença representa os voos iniciais (histórico pré-sistema)
    IF user_record.total_flights > completed_flights_count THEN
      UPDATE profiles
      SET 
        initial_flights = user_record.total_flights - completed_flights_count,
        initial_hours = ROUND(CAST((user_record.total_minutes - completed_minutes_total) AS NUMERIC) / 60.0, 2),
        updated_at = NOW()
      WHERE id = user_record.id;
      
      RAISE NOTICE 'Perfil % corrigido: % voos iniciais, % horas iniciais', 
                   user_record.id, 
                   user_record.total_flights - completed_flights_count,
                   ROUND(CAST((user_record.total_minutes - completed_minutes_total) AS NUMERIC) / 60.0, 2);
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 3. Verificar resultados após correção
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
WHERE initial_flights > 0
ORDER BY updated_at DESC
LIMIT 10;