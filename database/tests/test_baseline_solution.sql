-- ============================================
-- SCRIPT DE TESTE PARA VERIFICAR SOLUÇÃO DO BASELINE
-- ============================================
-- Execute este script no SQL Editor do Supabase após executar fix_baseline_persistence.sql

-- ============================================
-- PASSO 1: VERIFICAR ESTRUTURA ATUAL
-- ============================================

-- Verificar se as colunas foram criadas corretamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name IN ('initial_flights', 'initial_minutes', 'total_flights', 'total_minutes')
ORDER BY column_name;

-- ============================================
-- PASSO 2: CRIAR PERFIL DE TESTE
-- ============================================

-- Inserir perfil de teste com valores iniciais
INSERT INTO profiles (
  id, 
  display_name, 
  email,
  initial_flights,    -- 239 voos históricos
  initial_minutes,    -- 150.5 horas = 9030 minutos
  total_flights,      -- 0 voos no sistema inicialmente
  total_minutes,      -- 0 minutos no sistema inicialmente
  created_at,
  updated_at
) VALUES (
  'test-baseline-user-001',
  'Piloto Teste Baseline',
  'teste.baseline@example.com',
  239,     -- 239 voos históricos
  9030,    -- 150.5 horas em minutos (150.5 * 60)
  0,       -- 0 voos no sistema
  0        -- 0 minutos no sistema
) ON CONFLICT (id) DO UPDATE SET
  initial_flights = 239,
  initial_minutes = 9030,
  total_flights = 0,
  total_minutes = 0,
  updated_at = NOW();

-- ============================================
-- PASSO 3: VERIFICAR ESTADO INICIAL
-- ============================================

-- Verificar perfil de teste
SELECT 
  id,
  display_name,
  initial_flights,
  initial_minutes,
  total_flights,
  total_minutes,
  (initial_minutes / 60.0)::NUMERIC(10,2) as initial_hours,
  (total_minutes / 60.0)::NUMERIC(10,2) as total_hours_display,
  updated_at
FROM profiles 
WHERE id = 'test-baseline-user-001';

-- ============================================
-- PASSO 4: TESTAR FUNÇÃO get_profile_totals
-- ============================================

-- Testar função com perfil sem voos no sistema
SELECT * FROM get_profile_totals('test-baseline-user-001');

-- Resultado esperado:
-- total_flights: 239 (baseline + 0 voos do sistema)
-- total_minutes: 9030 (baseline + 0 minutos do sistema)
-- total_hours: 150.50 (9030 / 60)

-- ============================================
-- PASSO 5: ADICIONAR VOOS DE TESTE
-- ============================================

-- Inserir voos concluídos para testar incremento
INSERT INTO flights (
  id,
  user_id,
  callsign,
  aircraft,
  departure,
  arrival,
  departure_time,
  arrival_time,
  flight_time,
  distance,
  status,
  flight_date,
  created_at,
  updated_at
) VALUES 
(
  'test-flight-baseline-001',
  'test-baseline-user-001',
  'TEST001',
  'B737',
  'SBGR',
  'SBRJ',
  '08:00',
  '09:30',
  '1h 30m',  -- 90 minutos
  200,
  'Concluído',
  '2024-01-01',
  NOW(),
  NOW()
),
(
  'test-flight-baseline-002',
  'test-baseline-user-001',
  'TEST002',
  'A320',
  'SBSP',
  'SBGL',
  '10:00',
  '11:15',
  '1h 15m',  -- 75 minutos
  180,
  'Concluído',
  '2024-01-02',
  NOW(),
  NOW()
);

-- ============================================
-- PASSO 6: VERIFICAR RESULTADO APÓS VOOS
-- ============================================

-- Verificar perfil após adicionar voos
SELECT 
  id,
  display_name,
  initial_flights,
  initial_minutes,
  total_flights,
  total_minutes,
  (initial_minutes / 60.0)::NUMERIC(10,2) as initial_hours,
  (total_minutes / 60.0)::NUMERIC(10,2) as total_hours_display,
  updated_at
FROM profiles 
WHERE id = 'test-baseline-user-001';

-- Testar função get_profile_totals novamente
SELECT * FROM get_profile_totals('test-baseline-user-001');

-- Resultado esperado:
-- total_flights: 241 (239 baseline + 2 voos do sistema)
-- total_minutes: 9195 (9030 baseline + 165 minutos dos voos)
-- total_hours: 153.25 (9195 / 60)

-- ============================================
-- PASSO 7: VERIFICAR CÁLCULO MANUAL
-- ============================================

-- Verificar cálculo manual para confirmar
SELECT 
  'Baseline' as tipo,
  239 as voos,
  9030 as minutos,
  (9030 / 60.0)::NUMERIC(10,2) as horas
UNION ALL
SELECT 
  'Voos do Sistema' as tipo,
  COUNT(*) as voos,
  SUM(
    CASE 
      WHEN flight_time ~ '^[0-9]+h\s*[0-9]+m$' THEN 
        (CAST(SUBSTRING(flight_time FROM '^([0-9]+)h') AS INTEGER) * 60 + 
         CAST(SUBSTRING(flight_time FROM '([0-9]+)m$') AS INTEGER))
      WHEN flight_time ~ '^[0-9]+h$' THEN 
        CAST(SUBSTRING(flight_time FROM '^([0-9]+)h') AS INTEGER) * 60
      WHEN flight_time ~ '^[0-9]+m$' THEN 
        CAST(SUBSTRING(flight_time FROM '^([0-9]+)m') AS INTEGER)
      ELSE 0
    END
  ) as minutos,
  (SUM(
    CASE 
      WHEN flight_time ~ '^[0-9]+h\s*[0-9]+m$' THEN 
        (CAST(SUBSTRING(flight_time FROM '^([0-9]+)h') AS INTEGER) * 60 + 
         CAST(SUBSTRING(flight_time FROM '([0-9]+)m$') AS INTEGER))
      WHEN flight_time ~ '^[0-9]+h$' THEN 
        CAST(SUBSTRING(flight_time FROM '^([0-9]+)h') AS INTEGER) * 60
      WHEN flight_time ~ '^[0-9]+m$' THEN 
        CAST(SUBSTRING(flight_time FROM '^([0-9]+)m') AS INTEGER)
      ELSE 0
    END
  ) / 60.0)::NUMERIC(10,2) as horas
FROM flights
WHERE user_id = 'test-baseline-user-001' AND status = 'Concluído'
UNION ALL
SELECT 
  'TOTAL' as tipo,
  239 + (SELECT COUNT(*) FROM flights WHERE user_id = 'test-baseline-user-001' AND status = 'Concluído') as voos,
  9030 + (SELECT SUM(
    CASE 
      WHEN flight_time ~ '^[0-9]+h\s*[0-9]+m$' THEN 
        (CAST(SUBSTRING(flight_time FROM '^([0-9]+)h') AS INTEGER) * 60 + 
         CAST(SUBSTRING(flight_time FROM '([0-9]+)m$') AS INTEGER))
      WHEN flight_time ~ '^[0-9]+h$' THEN 
        CAST(SUBSTRING(flight_time FROM '^([0-9]+)h') AS INTEGER) * 60
      WHEN flight_time ~ '^[0-9]+m$' THEN 
        CAST(SUBSTRING(flight_time FROM '^([0-9]+)m') AS INTEGER)
      ELSE 0
    END
  ) FROM flights WHERE user_id = 'test-baseline-user-001' AND status = 'Concluído') as minutos,
  ((9030 + (SELECT SUM(
    CASE 
      WHEN flight_time ~ '^[0-9]+h\s*[0-9]+m$' THEN 
        (CAST(SUBSTRING(flight_time FROM '^([0-9]+)h') AS INTEGER) * 60 + 
         CAST(SUBSTRING(flight_time FROM '([0-9]+)m$') AS INTEGER))
      WHEN flight_time ~ '^[0-9]+h$' THEN 
        CAST(SUBSTRING(flight_time FROM '^([0-9]+)h') AS INTEGER) * 60
      WHEN flight_time ~ '^[0-9]+m$' THEN 
        CAST(SUBSTRING(flight_time FROM '^([0-9]+)m') AS INTEGER)
      ELSE 0
    END
  ) FROM flights WHERE user_id = 'test-baseline-user-001' AND status = 'Concluído')) / 60.0)::NUMERIC(10,2) as horas;

-- ============================================
-- PASSO 8: LIMPEZA (OPCIONAL)
-- ============================================

-- Remover dados de teste (descomente se quiser limpar)
-- DELETE FROM flights WHERE user_id = 'test-baseline-user-001';
-- DELETE FROM profiles WHERE id = 'test-baseline-user-001';

SELECT 'Teste do baseline concluído com sucesso!' as status;
