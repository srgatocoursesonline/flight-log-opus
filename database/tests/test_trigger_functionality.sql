-- Script de teste para verificar se o trigger está funcionando

-- 1. Verificar o estado atual de um perfil (substituir 'SEU_USER_ID' pelo ID real)
-- SELECT 
--   id,
--   display_name,
--   total_flights,
--   total_minutes,
--   updated_at
-- FROM profiles 
-- WHERE id = 'SEU_USER_ID';

-- 2. Inserir um voo de teste concluído (substituir 'SEU_USER_ID' pelo ID real)
-- INSERT INTO flights (
--   user_id, callsign, aircraft, departure, arrival, 
--   departure_time, arrival_time, flight_time, distance,
--   status, flight_date
-- ) VALUES (
--   'SEU_USER_ID', 'TEST001', 'B738', 'SBGR', 'SBRJ',
--   '08:00', '09:30', '1h 30m', 200,
--   'Concluído', '2024-01-01'
-- );

-- 3. Verificar se o perfil foi atualizado (substituir 'SEU_USER_ID' pelo ID real)
-- SELECT 
--   id,
--   display_name,
--   total_flights,
--   total_minutes,
--   updated_at
-- FROM profiles 
-- WHERE id = 'SEU_USER_ID';

-- 4. Limpar o voo de teste (substituir 'SEU_USER_ID' pelo ID real)
-- DELETE FROM flights 
-- WHERE user_id = 'SEU_USER_ID' AND callsign = 'TEST001';