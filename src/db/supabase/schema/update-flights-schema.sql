-- Atualização do esquema para adicionar novos campos na tabela flights
-- Execute este arquivo no SQL Editor do Supabase

-- Adicionar campo de tipo de serviço (Funcionário/Autônomo)
ALTER TABLE flights 
ADD COLUMN IF NOT EXISTS service_type TEXT DEFAULT 'employee' CHECK (service_type IN ('employee', 'freelance'));

-- Adicionar campos para países
ALTER TABLE flights 
ADD COLUMN IF NOT EXISTS origin_country TEXT;

ALTER TABLE flights 
ADD COLUMN IF NOT EXISTS destination_country TEXT;

-- Adicionar campos para informações dos aeroportos (formato JSON)
ALTER TABLE flights 
ADD COLUMN IF NOT EXISTS origin_airport_info JSONB DEFAULT '{}'::jsonb;

ALTER TABLE flights 
ADD COLUMN IF NOT EXISTS destination_airport_info JSONB DEFAULT '{}'::jsonb;

-- Comentários nas colunas para documentação
COMMENT ON COLUMN flights.service_type IS 'Tipo de serviço do voo (employee=Funcionário, freelance=Autônomo)';
COMMENT ON COLUMN flights.origin_country IS 'País de origem do voo';
COMMENT ON COLUMN flights.destination_country IS 'País de destino do voo';
COMMENT ON COLUMN flights.origin_airport_info IS 'Informações detalhadas do aeroporto de origem (nome, cidade, estado, etc)';
COMMENT ON COLUMN flights.destination_airport_info IS 'Informações detalhadas do aeroporto de destino (nome, cidade, estado, etc)';

-- Primeiro, exclua a view existente
DROP VIEW IF EXISTS flight_statistics;

-- Recrie a view com as novas colunas
CREATE VIEW flight_statistics AS
SELECT 
  user_id,
  COUNT(*) as total_flights,
  COUNT(*) FILTER (WHERE status = 'Concluído') as completed_flights,
  SUM(career_rating) as total_career_rating,
  SUM(distance) as total_distance,
  COUNT(*) FILTER (WHERE service_type = 'employee') as employee_flights,
  COUNT(*) FILTER (WHERE service_type = 'freelance') as freelance_flights,
  CASE 
    WHEN COUNT(*) > 0 THEN SUM(career_rating) / COUNT(*) 
    ELSE 0 
  END as avg_career_rating
FROM flights
GROUP BY user_id;