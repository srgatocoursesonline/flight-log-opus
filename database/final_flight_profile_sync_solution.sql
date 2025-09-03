-- ============================================
-- RPC PARA INCREMENTAR ESTATÍSTICAS DO PERFIL
-- ============================================

-- Função RPC atômica para incrementar estatísticas do perfil
CREATE OR REPLACE FUNCTION increment_profile_stats(
  p_user_id UUID,
  p_flights INTEGER,
  p_minutes INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET 
    total_flights = GREATEST(0, COALESCE(total_flights, 0) + p_flights),
    total_minutes = GREATEST(0, COALESCE(total_minutes, 0) + p_minutes),
    updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Conceder permissões necessárias
GRANT EXECUTE ON FUNCTION increment_profile_stats(UUID, INTEGER, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION increment_profile_stats(UUID, INTEGER, INTEGER) TO authenticated;

-- ============================================
-- ATUALIZAR TRIGGER PARA USAR RPC
-- ============================================

-- Função para atualizar estatísticas de voos no perfil usando RPC
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
    -- Usar RPC atômica para incrementar
    PERFORM increment_profile_stats(affected_user_id, flight_increment, flight_minutes);
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
GRANT EXECUTE ON FUNCTION update_profile_flight_stats() TO authenticated;