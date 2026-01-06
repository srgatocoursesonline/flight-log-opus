-- ============================================
-- CORREÇÃO DA FUNÇÃO get_msfs_flight_stats
-- ============================================
-- Este script corrige a função que estava tentando acessar colunas inexistentes

BEGIN;

-- Remover função existente
DROP FUNCTION IF EXISTS get_msfs_flight_stats(UUID);

-- Criar função corrigida com as colunas corretas da tabela msfs_flights
CREATE OR REPLACE FUNCTION get_msfs_flight_stats(user_uuid UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_flights', COALESCE(COUNT(*), 0),
    'total_hours', COALESCE(ROUND(SUM(flight_time) / 60.0, 2), 0), -- flight_time está em minutos
    'total_distance', COALESCE(ROUND(SUM(distance), 2), 0), -- distance está em km
    'avg_score', 0, -- Não temos flight_score na tabela atual
    'best_landing', 0, -- Não temos landing_rate na tabela atual
    'favorite_aircraft', (
      SELECT aircraft_type 
      FROM msfs_flights 
      WHERE user_id = user_uuid 
      GROUP BY aircraft_type 
      ORDER BY COUNT(*) DESC 
      LIMIT 1
    ),
    'recent_flights', (
      SELECT json_agg(
        json_build_object(
          'id', id,
          'aircraft_type', aircraft_type,
          'departure_icao', departure_icao,
          'arrival_icao', arrival_icao,
          'departure_time', departure_time,
          'flight_time', flight_time, -- Usar flight_time em vez de flight_duration
          'distance', distance,
          'max_altitude', max_altitude,
          'max_speed', max_speed
        )
      )
      FROM (
        SELECT * FROM msfs_flights 
        WHERE user_id = user_uuid 
        ORDER BY departure_time DESC 
        LIMIT 5
      ) recent
    )
  ) INTO result
  FROM msfs_flights
  WHERE user_id = user_uuid;
  
  RETURN result;
END;
$$;

-- Conceder permissões
GRANT EXECUTE ON FUNCTION get_msfs_flight_stats TO authenticated;

COMMIT;

SELECT 'Função get_msfs_flight_stats corrigida com sucesso!' as status;