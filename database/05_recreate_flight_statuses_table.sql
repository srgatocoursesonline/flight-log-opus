-- ============================================
-- RECRIAR TABELA FLIGHT_STATUSES
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- IMPORTANTE: Execute APÓS criar a tabela profiles

-- 0. Garantir que a extensão uuid-ossp esteja habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Recriar tabela flight_statuses
-- Primeiro, remover a tabela se existir
DROP TABLE IF EXISTS public.flight_statuses CASCADE;

CREATE TABLE public.flight_statuses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6B7280',
  icon TEXT NOT NULL DEFAULT 'check-circle',
  description TEXT,
  hourly_multiplier NUMERIC(3, 2) DEFAULT 1.00,
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Comentários nas colunas para documentação
COMMENT ON COLUMN flight_statuses.name IS 'Nome do status do voo';
COMMENT ON COLUMN flight_statuses.color IS 'Cor hexadecimal para exibição do status';
COMMENT ON COLUMN flight_statuses.icon IS 'Ícone do status para interface';
COMMENT ON COLUMN flight_statuses.description IS 'Descrição detalhada do status';
COMMENT ON COLUMN flight_statuses.hourly_multiplier IS 'Multiplicador de horas para cálculo de experiência';
COMMENT ON COLUMN flight_statuses.is_default IS 'Indica se é um status padrão do sistema';
COMMENT ON COLUMN flight_statuses.is_active IS 'Indica se o status está ativo para uso';

-- 3. Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_flight_statuses_user_id ON flight_statuses(user_id);
CREATE INDEX IF NOT EXISTS idx_flight_statuses_is_active ON flight_statuses(is_active);
CREATE INDEX IF NOT EXISTS idx_flight_statuses_is_default ON flight_statuses(is_default);

-- 4. Habilitar Row Level Security (RLS)
ALTER TABLE flight_statuses ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de segurança
DROP POLICY IF EXISTS flight_statuses_select_policy ON flight_statuses;
DROP POLICY IF EXISTS flight_statuses_insert_policy ON flight_statuses;
DROP POLICY IF EXISTS flight_statuses_update_policy ON flight_statuses;
DROP POLICY IF EXISTS flight_statuses_delete_policy ON flight_statuses;

-- Política para SELECT: usuários podem ver status padrão (user_id NULL) e seus próprios status
CREATE POLICY flight_statuses_select_policy ON flight_statuses
  FOR SELECT USING (
    user_id IS NULL OR auth.uid() = user_id
  );

-- Política para INSERT: usuários só podem criar status para si mesmos
CREATE POLICY flight_statuses_insert_policy ON flight_statuses
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
  );

-- Política para UPDATE: usuários só podem atualizar seus próprios status
CREATE POLICY flight_statuses_update_policy ON flight_statuses
  FOR UPDATE USING (
    auth.uid() = user_id
  );

-- Política para DELETE: usuários só podem deletar seus próprios status
CREATE POLICY flight_statuses_delete_policy ON flight_statuses
  FOR DELETE USING (
    auth.uid() = user_id
  );

-- 6. Inserir status padrão do sistema (user_id NULL)
-- Limpar status padrão existentes para evitar duplicatas
DELETE FROM flight_statuses WHERE user_id IS NULL;

-- Inserir status padrão do sistema
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
  (NULL, 'Completado', '#22c55e', 'check-circle', 'Voo completado com sucesso', 1.0, true, true),
  (NULL, 'Cancelado', '#ef4444', 'x-circle', 'Voo cancelado', 0.0, true, true),
  (NULL, 'Em Progresso', '#3b82f6', 'clock', 'Voo em andamento', 1.0, true, true),
  (NULL, 'Planejado', '#f59e0b', 'calendar', 'Voo planejado', 0.0, true, true),
  (NULL, 'Em Voo', '#22c55e', 'plane', 'Aeronave em voo normal', 1.0, true, true),
  (NULL, 'Taxi', '#eab308', 'move', 'Aeronave taxiando no aeroporto', 0.1, true, true),
  (NULL, 'Decolagem', '#f97316', 'trending-up', 'Aeronave em processo de decolagem', 1.2, true, true),
  (NULL, 'Pouso', '#f97316', 'trending-down', 'Aeronave em processo de pouso', 1.2, true, true),
  (NULL, 'Estacionado', '#6b7280', 'square', 'Aeronave estacionada no gate', 0.0, true, true),
  (NULL, 'Manutenção', '#dc2626', 'wrench', 'Aeronave em manutenção', 0.0, true, true),
  (NULL, 'Emergência', '#ef4444', 'alert-triangle', 'Situação de emergência', 1.5, true, true),
  (NULL, 'Treinamento', '#8b5cf6', 'graduation-cap', 'Voo de treinamento', 0.8, true, true),
  (NULL, 'Teste', '#06b6d4', 'flask', 'Voo de teste', 1.0, true, true),
  (NULL, 'Transporte', '#10b981', 'truck', 'Voo de transporte/ferry', 1.0, true, true),
  (NULL, 'Inativo', '#374151', 'pause', 'Aeronave temporariamente inativa', 0.0, true, false);

SELECT 'Tabela flight_statuses recriada com sucesso!' as status;
SELECT COUNT(*) || ' status de voo padrão inseridos' as statuses_count 
FROM flight_statuses WHERE user_id IS NULL;