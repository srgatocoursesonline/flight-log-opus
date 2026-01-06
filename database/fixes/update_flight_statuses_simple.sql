-- ============================================
-- ATUALIZAR STATUS DE VOO - VERSÃO SIMPLIFICADA
-- ============================================
-- Execute este script no SQL Editor do Supabase

-- Limpar todos os status existentes
DELETE FROM flight_statuses WHERE user_id IS NULL;

-- Inserir apenas os 5 status principais solicitados
INSERT INTO flight_statuses (
  user_id,
  name,
  color,
  icon,
  description,
  hourly_multiplier,
  is_default,
  is_active
) VALUES
  (NULL, 'Planejado', '#f59e0b', '📅', 'Voo planejado para execução', 0.0, true, true),
  (NULL, 'Em voo', '#22c55e', '✈️', 'Aeronave em voo normal', 1.0, true, true),
  (NULL, 'Concluído', '#10b981', '✅', 'Voo completado com sucesso', 1.0, true, true),
  (NULL, 'Cancelado', '#ef4444', '❌', 'Voo cancelado', 0.0, true, true),
  (NULL, 'Acidente', '#dc2626', '💥', 'Voo com acidente/emergência', 0.0, true, true);

-- Verificar os status inseridos
SELECT 
  name,
  color,
  icon,
  description,
  hourly_multiplier
FROM flight_statuses 
WHERE user_id IS NULL
ORDER BY 
  CASE name
    WHEN 'Planejado' THEN 1
    WHEN 'Em voo' THEN 2
    WHEN 'Concluído' THEN 3
    WHEN 'Cancelado' THEN 4
    WHEN 'Acidente' THEN 5
  END;

SELECT '✅ Status de voo atualizados com sucesso!' as resultado;
SELECT COUNT(*) || ' status de voo configurados' as total_status 
FROM flight_statuses WHERE user_id IS NULL;