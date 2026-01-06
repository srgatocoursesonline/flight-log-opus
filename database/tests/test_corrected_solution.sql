-- ============================================
-- SCRIPT DE TESTE PARA VERIFICAR SOLUÇÃO CORRIGIDA
-- ============================================

-- 1. Criar perfil de teste com valores iniciais
INSERT INTO profiles (
  id, 
  display_name, 
  email,
  initial_flights,
  initial_hours,
  total_flights,
  total_minutes,
  created_at,
  updated_at
) VALUES (
  'test-user-id-001',
  'Piloto Teste',
  'teste@example.com',
  239,  -- Valor inicial: 239 voos
  150.5, -- Valor inicial: 150.5 horas (9030 minutos)
  239,   -- Total flights inicial
  9030,  -- Total minutos inicial (150.5 * 60)
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  initial_flights = 239,
  initial_hours = 150.5,
  total_flights = 239,
  total_minutes = 9030,
  updated_at = NOW();

-- 2. Verificar estado inicial do perfil
SELECT 
  id,
  display_name,
  initial_flights,
  initial_hours,
  total_flights,
  total_minutes,
  (total_minutes / 60.0)::NUMERIC(10,2) as total_hours_display,
  updated_at
FROM profiles 
WHERE id = 'test-user-id-001';

-- 3. Criar voos de teste concluídos
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
) VALUES (
  'test-flight-001',
  'test-user-id-001',
  'TEST001',
  'B737',
  'SBGR',
  'SBRJ',
  '08:00',
  '09:30',
  '1h 30m',
  200,
  'Concluído',
  '2024-01-01',
  NOW(),
  NOW()
);

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
) VALUES (
  'test-flight-002',
  'test-user-id-001',
  'TEST002',
  'A320',
  'SBSP',
  'SBGL',
  '10:00',
  '11:15',
  '1h 15m',
  180,
  'Concluído',
  '2024-01-02',
  NOW(),
  NOW()
);

-- 4. Verificar estado após adicionar voos (deve mostrar 241 voos e ~152.25 horas)
SELECT 
  id,
  display_name,
  initial_flights,
  initial_hours,
  total_flights,
  total_minutes,
  (total_minutes / 60.0)::NUMERIC(10,2) as total_hours_display,
  updated_at
FROM profiles 
WHERE id = 'test-user-id-001';

-- 5. Verificar estatísticas reais combinando valores iniciais + voos concluídos
SELECT 
  user_id,
  display_name,
  initial_flights,
  initial_hours,
  system_completed_flights,
  system_completed_minutes,
  real_total_flights,
  real_total_minutes,
  real_total_hours,
  updated_at
FROM profile_real_stats
WHERE user_id = 'test-user-id-001';

-- 6. Limpar dados de teste
-- DELETE FROM flights WHERE user_id = 'test-user-id-001' AND callsign LIKE 'TEST%';
-- DELETE FROM profiles WHERE id = 'test-user-id-001';