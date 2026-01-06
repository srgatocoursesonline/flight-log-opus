-- ============================================
-- SOLUÇÃO CORRIGIDA PARA ATUALIZAÇÃO INCREMENTAL DE VOOS E HORAS
-- ============================================

-- Função corrigida para calcular estatísticas do perfil considerando valores iniciais
CREATE OR REPLACE FUNCTION update_profile_flight_stats_corrected()
RETURNS TRIGGER AS $$
DECLARE
  affected_user_id UUID;
  flight_minutes INTEGER := 0;
  flight_increment INTEGER := 0;
  initial_flights_count INTEGER := 0;
  initial_minutes_count INTEGER := 0;
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

-- ============================================
-- SCRIPT PARA CONFIGURAR VALORES INICIAIS CORRETAMENTE
-- ============================================

-- Função para calcular e definir valores iniciais corretamente
-- Esta função deve ser executada UMA VEZ para cada perfil existente
CREATE OR REPLACE FUNCTION setup_initial_profile_values(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  current_total_flights INTEGER;
  current_total_minutes INTEGER;
  initial_flights_value INTEGER;
  initial_hours_value NUMERIC(10,2);
BEGIN
  -- Obter valores atuais do perfil
  SELECT total_flights, total_minutes, initial_flights, initial_hours
  INTO current_total_flights, current_total_minutes, initial_flights_value, initial_hours_value
  FROM profiles
  WHERE id = p_user_id;
  
  -- Se os valores iniciais não estiverem definidos, definir com base nos valores atuais
  IF initial_flights_value IS NULL OR initial_flights_value = 0 THEN
    UPDATE profiles
    SET 
      initial_flights = current_total_flights,
      initial_hours = ROUND(CAST(current_total_minutes AS NUMERIC) / 60.0, 2),
      updated_at = NOW()
    WHERE id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ATUALIZAÇÃO INICIAL DOS DADOS EXISTENTES (CORRIGIDA)
-- ============================================

-- Atualizar todos os perfis existentes para garantir que os valores iniciais estejam corretos
-- Esta atualização deve ser executada APENAS UMA VEZ
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT id, total_flights, total_minutes, initial_flights, initial_hours
    FROM profiles
    WHERE initial_flights IS NULL OR initial_flights = 0
  LOOP
    -- Configurar valores iniciais corretamente
    UPDATE profiles
    SET 
      initial_flights = COALESCE(user_record.total_flights, 0),
      initial_hours = ROUND(COALESCE(CAST(user_record.total_minutes AS NUMERIC) / 60.0, 0), 2),
      updated_at = NOW()
    WHERE id = user_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNÇÃO PARA CALCULAR TOTAL REAL CONSIDERANDO VALORES INICIAIS
-- ============================================

-- Função para obter estatísticas totais reais (valores iniciais + voos concluídos)
CREATE OR REPLACE FUNCTION get_real_profile_stats(p_user_id UUID)
RETURNS TABLE(
  real_total_flights INTEGER,
  real_total_minutes INTEGER,
  real_total_hours NUMERIC(10,2)
) AS $$
DECLARE
  initial_flights_count INTEGER := 0;
  initial_hours_count NUMERIC(10,2) := 0;
  completed_flights_count INTEGER := 0;
  completed_minutes_count INTEGER := 0;
BEGIN
  -- Obter valores iniciais do perfil
  SELECT COALESCE(initial_flights, 0), COALESCE(initial_hours, 0)
  INTO initial_flights_count, initial_hours_count
  FROM profiles
  WHERE id = p_user_id;
  
  -- Calcular voos concluídos no sistema
  SELECT 
    COUNT(*),
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
  INTO completed_flights_count, completed_minutes_count
  FROM flights
  WHERE user_id = p_user_id AND status = 'Concluído';
  
  -- Retornar totais reais (iniciais + concluídos)
  real_total_flights := initial_flights_count + completed_flights_count;
  real_total_minutes := (initial_hours_count * 60)::INTEGER + completed_minutes_count;
  real_total_hours := ROUND(CAST(real_total_minutes AS NUMERIC) / 60.0, 2);
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VISÃO PARA FACILITAR CONSULTA DAS ESTATÍSTICAS REAIS
-- ============================================

-- Criar view que mostra estatísticas reais combinando valores iniciais + voos concluídos
CREATE OR REPLACE VIEW profile_real_stats AS
SELECT 
  p.id as user_id,
  p.display_name,
  -- Valores iniciais
  COALESCE(p.initial_flights, 0) as initial_flights,
  COALESCE(p.initial_hours, 0) as initial_hours,
  -- Voos concluídos no sistema
  COALESCE(completed_flights.completed_count, 0) as system_completed_flights,
  COALESCE(completed_flights.completed_minutes, 0) as system_completed_minutes,
  -- Totais reais (iniciais + concluídos)
  (COALESCE(p.initial_flights, 0) + COALESCE(completed_flights.completed_count, 0)) as real_total_flights,
  ((COALESCE(p.initial_hours, 0) * 60)::INTEGER + COALESCE(completed_flights.completed_minutes, 0)) as real_total_minutes,
  ROUND(CAST(((COALESCE(p.initial_hours, 0) * 60)::INTEGER + COALESCE(completed_flights.completed_minutes, 0)) AS NUMERIC) / 60.0, 2) as real_total_hours,
  p.updated_at
FROM profiles p
LEFT JOIN (
  SELECT 
    user_id,
    COUNT(*) as completed_count,
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
    ) as completed_minutes
  FROM flights
  WHERE status = 'Concluído'
  GROUP BY user_id
) completed_flights ON p.id = completed_flights.user_id;

-- Conceder permissões necessárias
GRANT SELECT ON profile_real_stats TO service_role;
GRANT SELECT ON profile_real_stats TO authenticated;