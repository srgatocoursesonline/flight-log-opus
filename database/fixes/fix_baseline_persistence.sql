-- ============================================
-- SCRIPT PARA CORRIGIR PERSISTÊNCIA DO BASELINE
-- ============================================
-- Execute este script no SQL Editor do Supabase

BEGIN;

-- ============================================
-- SEÇÃO 1: CORRIGIR SCHEMA DA TABELA PROFILES
-- ============================================

-- 1. Adicionar coluna initial_minutes se não existir (em vez de initial_hours)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS initial_minutes INTEGER DEFAULT 0;

-- 2. Converter initial_hours existente para initial_minutes (se existir)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'profiles' AND column_name = 'initial_hours') THEN
        -- Converter horas para minutos (1 hora = 60 minutos)
        UPDATE profiles 
        SET initial_minutes = COALESCE(initial_hours, 0) * 60
        WHERE initial_minutes = 0 OR initial_minutes IS NULL;
        
        -- Remover coluna initial_hours obsoleta
        ALTER TABLE profiles DROP COLUMN IF EXISTS initial_hours;
    END IF;
END $$;

-- 3. Garantir que total_minutes existe
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_minutes INTEGER DEFAULT 0;

-- 4. Comentários nas colunas para documentação
COMMENT ON COLUMN profiles.initial_flights IS 'Número inicial de voos (histórico anterior ao sistema)';
COMMENT ON COLUMN profiles.initial_minutes IS 'Minutos iniciais de voo (histórico anterior ao sistema)';
COMMENT ON COLUMN profiles.total_minutes IS 'Total de minutos de voo (baseline + voos concluídos)';

-- ============================================
-- SEÇÃO 2: MIGRAR DADOS EXISTENTES
-- ============================================

-- Migrar dados existentes para preservar valores atuais como baseline
DO $$
DECLARE
    user_record RECORD;
    completed_flights_count INTEGER;
    completed_minutes_total INTEGER;
BEGIN
    FOR user_record IN 
        SELECT id, total_flights, total_minutes, initial_flights, initial_minutes
        FROM profiles
        WHERE (initial_flights IS NULL OR initial_flights = 0)
        AND (initial_minutes IS NULL OR initial_minutes = 0)
        AND (total_flights > 0 OR total_minutes > 0)
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
                initial_minutes = user_record.total_minutes - completed_minutes_total,
                updated_at = NOW()
            WHERE id = user_record.id;
            
            RAISE NOTICE 'Perfil % corrigido: % voos iniciais, % minutos iniciais', 
                         user_record.id, 
                         user_record.total_flights - completed_flights_count,
                         user_record.total_minutes - completed_minutes_total;
        END IF;
    END LOOP;
END $$;

-- ============================================
-- SEÇÃO 3: CRIAR FUNÇÃO PARA CALCULAR TOTAIS
-- ============================================

-- Função para obter estatísticas totais reais (baseline + voos concluídos)
CREATE OR REPLACE FUNCTION get_profile_totals(p_user uuid)
RETURNS TABLE(total_flights int, total_minutes int, total_hours numeric)
LANGUAGE sql AS $$
  SELECT
    p.initial_flights + COALESCE(COUNT(*) FILTER (WHERE f.status = 'Concluído'), 0) as total_flights,
    p.initial_minutes + COALESCE(SUM(
      CASE 
        WHEN f.flight_time ~ '^[0-9]+h\s*[0-9]+m$' THEN 
          (CAST(SUBSTRING(f.flight_time FROM '^([0-9]+)h') AS INTEGER) * 60 + 
           CAST(SUBSTRING(f.flight_time FROM '([0-9]+)m$') AS INTEGER))
        WHEN f.flight_time ~ '^[0-9]+h$' THEN 
          CAST(SUBSTRING(f.flight_time FROM '^([0-9]+)h') AS INTEGER) * 60
        WHEN f.flight_time ~ '^[0-9]+m$' THEN 
          CAST(SUBSTRING(f.flight_time FROM '^([0-9]+)m') AS INTEGER)
        WHEN f.flight_time ~ '^[0-9]+:[0-9]+$' THEN 
          EXTRACT(HOUR FROM f.flight_time::TIME) * 60 + 
          EXTRACT(MINUTE FROM f.flight_time::TIME)
        WHEN f.flight_time ~ '^[0-9]+(\.[0-9]+)?$' THEN 
          CAST(f.flight_time AS NUMERIC) * 60
        ELSE 0
      END
    ) FILTER (WHERE f.status = 'Concluído'), 0) as total_minutes,
    ROUND(CAST((p.initial_minutes + COALESCE(SUM(
      CASE 
        WHEN f.flight_time ~ '^[0-9]+h\s*[0-9]+m$' THEN 
          (CAST(SUBSTRING(f.flight_time FROM '^([0-9]+)h') AS INTEGER) * 60 + 
           CAST(SUBSTRING(f.flight_time FROM '([0-9]+)m$') AS INTEGER))
        WHEN f.flight_time ~ '^[0-9]+h$' THEN 
          CAST(SUBSTRING(f.flight_time FROM '^([0-9]+)h') AS INTEGER) * 60
        WHEN f.flight_time ~ '^[0-9]+m$' THEN 
          CAST(SUBSTRING(f.flight_time FROM '^([0-9]+)m') AS INTEGER)
        WHEN f.flight_time ~ '^[0-9]+:[0-9]+$' THEN 
          EXTRACT(HOUR FROM f.flight_time::TIME) * 60 + 
          EXTRACT(MINUTE FROM f.flight_time::TIME)
        WHEN f.flight_time ~ '^[0-9]+(\.[0-9]+)?$' THEN 
          CAST(f.flight_time AS NUMERIC) * 60
        ELSE 0
      END
    ) FILTER (WHERE f.status = 'Concluído'), 0)) AS NUMERIC) / 60.0, 2) as total_hours
  FROM profiles p
  LEFT JOIN flights f ON f.user_id = p_user
  WHERE p.id = p_user
  GROUP BY p.initial_flights, p.initial_minutes;
$$;

-- ============================================
-- SEÇÃO 4: VERIFICAR RESULTADOS
-- ============================================

-- Verificar estrutura atual da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Verificar dados migrados
SELECT 
    id,
    display_name,
    initial_flights,
    initial_minutes,
    total_flights,
    total_minutes,
    (total_minutes / 60.0)::NUMERIC(10,2) as total_hours_display
FROM profiles
LIMIT 5;

-- Testar função get_profile_totals (substitua pelo UUID real de um usuário)
-- SELECT * FROM get_profile_totals('uuid-do-usuario-aqui');

COMMIT;

SELECT 'Script de correção do baseline executado com sucesso!' as status;
