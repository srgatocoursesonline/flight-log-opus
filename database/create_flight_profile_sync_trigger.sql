-- ============================================
-- TRIGGER PARA SINCRONIZAR VOOS COM PERFIL
-- ============================================
-- Este script cria triggers que automaticamente atualizam
-- os campos total_flights e total_hours na tabela profiles
-- sempre que voos são inseridos, atualizados ou deletados

-- Função para atualizar estatísticas de voos no perfil
CREATE OR REPLACE FUNCTION update_profile_flight_stats()
RETURNS TRIGGER AS $$
DECLARE
  affected_user_id UUID;
  flight_hours NUMERIC;
BEGIN
  -- Determinar qual user_id foi afetado
  IF TG_OP = 'DELETE' THEN
    affected_user_id := OLD.user_id;
  ELSE
    affected_user_id := NEW.user_id;
  END IF;
  
  -- Calcular total de voos para o usuário (inicial + novos voos) - apenas voos completados
  UPDATE profiles 
  SET 
    total_flights = COALESCE(initial_flights, 0) + (
      SELECT COUNT(*) 
      FROM flights 
      WHERE user_id = affected_user_id AND status = 'Completado'
    ),
    total_hours = COALESCE(initial_hours, 0) + (
      SELECT COALESCE(SUM(
        CASE 
          WHEN flight_time ~ '^[0-9]+h\s*[0-9]+m$' THEN 
            -- Formato "1h 30m" - extrair horas e minutos
            (CAST(SUBSTRING(flight_time FROM '^([0-9]+)h') AS NUMERIC) + 
             CAST(SUBSTRING(flight_time FROM '([0-9]+)m$') AS NUMERIC) / 60.0)
          WHEN flight_time ~ '^[0-9]+h$' THEN 
            -- Formato "2h" - apenas horas
            CAST(SUBSTRING(flight_time FROM '^([0-9]+)h') AS NUMERIC)
          WHEN flight_time ~ '^[0-9]+m$' THEN 
            -- Formato "45m" - apenas minutos
            CAST(SUBSTRING(flight_time FROM '^([0-9]+)m') AS NUMERIC) / 60.0
          WHEN flight_time ~ '^[0-9]+:[0-9]+$' THEN 
            -- Formato HH:MM - converter para horas decimais
            EXTRACT(HOUR FROM flight_time::TIME) + 
            EXTRACT(MINUTE FROM flight_time::TIME) / 60.0
          WHEN flight_time ~ '^[0-9]+(\.[0-9]+)?$' THEN 
            -- Formato decimal (ex: 2.5)
            flight_time::NUMERIC
          ELSE 
            0
        END
      ), 0)
      FROM flights 
      WHERE user_id = affected_user_id AND status = 'Completado'
    ),
    updated_at = NOW()
  WHERE id = affected_user_id;
  
  -- Retornar o registro apropriado
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Remover triggers existentes se houver
DROP TRIGGER IF EXISTS sync_profile_on_flight_insert ON flights;
DROP TRIGGER IF EXISTS sync_profile_on_flight_update ON flights;
DROP TRIGGER IF EXISTS sync_profile_on_flight_delete ON flights;

-- Criar triggers para INSERT, UPDATE e DELETE
CREATE TRIGGER sync_profile_on_flight_insert
  AFTER INSERT ON flights
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_flight_stats();

CREATE TRIGGER sync_profile_on_flight_update
  AFTER UPDATE ON flights
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_flight_stats();

CREATE TRIGGER sync_profile_on_flight_delete
  AFTER DELETE ON flights
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_flight_stats();

-- Conceder permissões necessárias
GRANT EXECUTE ON FUNCTION update_profile_flight_stats() TO service_role;

-- ============================================
-- ATUALIZAÇÃO INICIAL DOS DADOS EXISTENTES
-- ============================================
-- Atualizar todos os perfis existentes com os dados corretos

UPDATE profiles 
SET 
  total_flights = (
    SELECT COUNT(*) 
    FROM flights 
    WHERE flights.user_id = profiles.id AND flights.status = 'Completado'
  ),
  total_hours = (
    SELECT COALESCE(SUM(
      CASE 
        WHEN flight_time ~ '^[0-9]+h\s*[0-9]+m$' THEN 
          -- Formato "1h 30m" - extrair horas e minutos
          (CAST(SUBSTRING(flight_time FROM '^([0-9]+)h') AS NUMERIC) + 
           CAST(SUBSTRING(flight_time FROM '([0-9]+)m$') AS NUMERIC) / 60.0)
        WHEN flight_time ~ '^[0-9]+h$' THEN 
          -- Formato "2h" - apenas horas
          CAST(SUBSTRING(flight_time FROM '^([0-9]+)h') AS NUMERIC)
        WHEN flight_time ~ '^[0-9]+m$' THEN 
          -- Formato "45m" - apenas minutos
          CAST(SUBSTRING(flight_time FROM '^([0-9]+)m') AS NUMERIC) / 60.0
        WHEN flight_time ~ '^[0-9]+:[0-9]+$' THEN 
          -- Formato HH:MM - converter para horas decimais
          EXTRACT(HOUR FROM flight_time::TIME) + 
          EXTRACT(MINUTE FROM flight_time::TIME) / 60.0
        WHEN flight_time ~ '^[0-9]+(\.[0-9]+)?$' THEN 
          -- Formato decimal (ex: 2.5)
          flight_time::NUMERIC
        ELSE 
          0
      END
    ), 0)
    FROM flights 
      WHERE flights.user_id = profiles.id AND flights.status = 'Completado'
    ),
  updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM flights WHERE flights.user_id = profiles.id
);

-- ============================================
-- TRIGGERS CRIADOS COM SUCESSO!
-- ============================================
-- Agora os campos total_flights e total_hours serão
-- automaticamente atualizados sempre que:
-- 1. Um novo voo for adicionado
-- 2. Um voo existente for atualizado
-- 3. Um voo for deletado
-- 4. Os dados existentes foram sincronizados