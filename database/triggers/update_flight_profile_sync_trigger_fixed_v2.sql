-- ============================================
-- TRIGGER PARA SINCRONIZAR VOOS COM PERFIL (CORRIGIDO v2)
-- ============================================
-- Este script cria triggers que automaticamente atualizam
-- os campos total_flights e total_minutes na tabela profiles
-- sempre que voos são inseridos, atualizados ou deletados

-- Função para atualizar estatísticas de voos no perfil
CREATE OR REPLACE FUNCTION update_profile_flight_stats()
RETURNS TRIGGER AS $$
DECLARE
  affected_user_id UUID;
  flight_minutes INTEGER := 0;
  flight_increment INTEGER := 0;
BEGIN
  -- Determinar qual user_id foi afetado
  IF TG_OP = 'DELETE' THEN
    affected_user_id := OLD.user_id;
    -- Apenas decrementar se o voo estava concluído
    IF OLD.status = 'Concluído' THEN
      flight_increment := -1;
      -- Calcular minutos do voo deletado
      flight_minutes := CASE 
        WHEN OLD.flight_time ~ '^[0-9]+h\s*[0-9]+m$' THEN 
          (CAST(SUBSTRING(OLD.flight_time FROM '^([0-9]+)h') AS INTEGER) * 60 + 
           CAST(SUBSTRING(OLD.flight_time FROM '([0-9]+)m$') AS INTEGER))
        WHEN OLD.flight_time ~ '^[0-9]+h$' THEN 
          CAST(SUBSTRING(OLD.flight_time FROM '^([0-9]+)h') AS INTEGER) * 60
        WHEN OLD.flight_time ~ '^[0-9]+m$' THEN 
          CAST(SUBSTRING(OLD.flight_time FROM '^([0-9]+)m') AS INTEGER)
        WHEN OLD.flight_time ~ '^[0-9]+:[0-9]+$' THEN 
          EXTRACT(HOUR FROM OLD.flight_time::TIME) * 60 + 
          EXTRACT(MINUTE FROM OLD.flight_time::TIME)
        WHEN OLD.flight_time ~ '^[0-9]+(\.[0-9]+)?$' THEN 
          CAST(OLD.flight_time AS NUMERIC) * 60
        ELSE 0
      END;
    END IF;
  ELSIF TG_OP = 'INSERT' THEN
    affected_user_id := NEW.user_id;
    -- Apenas incrementar se o voo está concluído
    IF NEW.status = 'Concluído' THEN
      flight_increment := 1;
      -- Calcular minutos do novo voo
      flight_minutes := CASE 
        WHEN NEW.flight_time ~ '^[0-9]+h\s*[0-9]+m$' THEN 
          (CAST(SUBSTRING(NEW.flight_time FROM '^([0-9]+)h') AS INTEGER) * 60 + 
           CAST(SUBSTRING(NEW.flight_time FROM '([0-9]+)m$') AS INTEGER))
        WHEN NEW.flight_time ~ '^[0-9]+h$' THEN 
          CAST(SUBSTRING(NEW.flight_time FROM '^([0-9]+)h') AS INTEGER) * 60
        WHEN NEW.flight_time ~ '^[0-9]+m$' THEN 
          CAST(SUBSTRING(NEW.flight_time FROM '^([0-9]+)m') AS INTEGER)
        WHEN NEW.flight_time ~ '^[0-9]+:[0-9]+$' THEN 
          EXTRACT(HOUR FROM NEW.flight_time::TIME) * 60 + 
          EXTRACT(MINUTE FROM NEW.flight_time::TIME)
        WHEN NEW.flight_time ~ '^[0-9]+(\.[0-9]+)?$' THEN 
          CAST(NEW.flight_time AS NUMERIC) * 60
        ELSE 0
      END;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    affected_user_id := NEW.user_id;
    -- Verificar mudança de status
    IF OLD.status != NEW.status THEN
      IF OLD.status = 'Concluído' AND NEW.status != 'Concluído' THEN
        -- Voo foi desmarcado como concluído - decrementar
        flight_increment := -1;
        flight_minutes := CASE 
          WHEN OLD.flight_time ~ '^[0-9]+h\s*[0-9]+m$' THEN 
            (CAST(SUBSTRING(OLD.flight_time FROM '^([0-9]+)h') AS INTEGER) * 60 + 
             CAST(SUBSTRING(OLD.flight_time FROM '([0-9]+)m$') AS INTEGER))
          WHEN OLD.flight_time ~ '^[0-9]+h$' THEN 
            CAST(SUBSTRING(OLD.flight_time FROM '^([0-9]+)h') AS INTEGER) * 60
          WHEN OLD.flight_time ~ '^[0-9]+m$' THEN 
            CAST(SUBSTRING(OLD.flight_time FROM '^([0-9]+)m') AS INTEGER)
          WHEN OLD.flight_time ~ '^[0-9]+:[0-9]+$' THEN 
            EXTRACT(HOUR FROM OLD.flight_time::TIME) * 60 + 
            EXTRACT(MINUTE FROM OLD.flight_time::TIME)
          WHEN OLD.flight_time ~ '^[0-9]+(\.[0-9]+)?$' THEN 
            CAST(OLD.flight_time AS NUMERIC) * 60
          ELSE 0
        END;
      ELSIF OLD.status != 'Concluído' AND NEW.status = 'Concluído' THEN
        -- Voo foi marcado como concluído - incrementar
        flight_increment := 1;
        flight_minutes := CASE 
          WHEN NEW.flight_time ~ '^[0-9]+h\s*[0-9]+m$' THEN 
            (CAST(SUBSTRING(NEW.flight_time FROM '^([0-9]+)h') AS INTEGER) * 60 + 
             CAST(SUBSTRING(NEW.flight_time FROM '([0-9]+)m$') AS INTEGER))
          WHEN NEW.flight_time ~ '^[0-9]+h$' THEN 
            CAST(SUBSTRING(NEW.flight_time FROM '^([0-9]+)h') AS INTEGER) * 60
          WHEN NEW.flight_time ~ '^[0-9]+m$' THEN 
            CAST(SUBSTRING(NEW.flight_time FROM '^([0-9]+)m') AS INTEGER)
          WHEN NEW.flight_time ~ '^[0-9]+:[0-9]+$' THEN 
            EXTRACT(HOUR FROM NEW.flight_time::TIME) * 60 + 
            EXTRACT(MINUTE FROM NEW.flight_time::TIME)
          WHEN NEW.flight_time ~ '^[0-9]+(\.[0-9]+)?$' THEN 
            CAST(NEW.flight_time AS NUMERIC) * 60
          ELSE 0
        END;
      END IF;
    END IF;
  END IF;
  
  -- Apenas atualizar se houver incremento/descremento real
  IF flight_increment != 0 THEN
    UPDATE profiles 
    SET 
      total_flights = GREATEST(0, total_flights + flight_increment),
      total_minutes = GREATEST(0, total_minutes + flight_minutes),
      updated_at = NOW()
    WHERE id = affected_user_id;
  END IF;
  
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
-- ATUALIZAÇÃO INICIAL DOS DADOS EXISTENTES (APENAS PARA PERFIS QUE NÃO TEM DADOS)
-- ============================================
-- Atualizar apenas perfis que não têm dados de voos ainda

UPDATE profiles 
SET 
  total_flights = (
    SELECT COUNT(*) 
    FROM flights 
    WHERE flights.user_id = profiles.id AND flights.status = 'Concluído'
  ),
  total_minutes = (
    SELECT COALESCE(SUM(
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
    FROM flights 
    WHERE flights.user_id = profiles.id AND flights.status = 'Concluído'
  ),
  updated_at = NOW()
WHERE total_flights = 0 AND total_minutes = 0 
  AND EXISTS (
    SELECT 1 FROM flights WHERE flights.user_id = profiles.id AND flights.status = 'Concluído'
  );