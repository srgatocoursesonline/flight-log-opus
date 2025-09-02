-- Criar tabela flight_statuses se não existir
CREATE TABLE IF NOT EXISTS flight_statuses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6B7280',
  icon TEXT NOT NULL DEFAULT '📅',
  description TEXT,
  hourly_multiplier NUMERIC(3, 2) DEFAULT 1.00,
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Limpar status padrão existentes (user_id NULL) para evitar duplicatas
DELETE FROM flight_statuses WHERE user_id IS NULL;

-- Insert default flight statuses with user_id NULL (system defaults)
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
  (NULL, 'Em Voo', '#22c55e', 'plane', 'Aeronave em voo normal', 1.0, true, true),
  (NULL, 'Taxi', '#eab308', 'move', 'Aeronave taxiando no aeroporto', 0.1, true, true),
  (NULL, 'Decolagem', '#f97316', 'trending-up', 'Aeronave em processo de decolagem', 1.2, true, true),
  (NULL, 'Pouso', '#f97316', 'trending-down', 'Aeronave em processo de pouso', 1.2, true, true),
  (NULL, 'Estacionado', '#6b7280', 'square', 'Aeronave estacionada no gate', 0.0, true, true),
  (NULL, 'Manutenção', '#dc2626', 'wrench', 'Aeronave em manutenção', 0.0, true, true),
  (NULL, 'Reabastecimento', '#3b82f6', 'fuel', 'Aeronave sendo reabastecida', 0.0, true, true),
  (NULL, 'Emergência', '#ef4444', 'alert-triangle', 'Situação de emergência', 1.5, true, true),
  (NULL, 'Treinamento', '#8b5cf6', 'graduation-cap', 'Voo de treinamento', 0.8, true, true),
  (NULL, 'Teste', '#06b6d4', 'flask', 'Voo de teste', 1.0, true, true),
  (NULL, 'Transporte', '#10b981', 'truck', 'Voo de transporte/ferry', 1.0, true, true),
  (NULL, 'Inativo', '#374151', 'pause', 'Aeronave temporariamente inativa', 0.0, true, false);

-- Criar políticas RLS para flight_statuses
-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "flight_statuses_select_policy" ON flight_statuses;
DROP POLICY IF EXISTS "flight_statuses_insert_policy" ON flight_statuses;
DROP POLICY IF EXISTS "flight_statuses_update_policy" ON flight_statuses;
DROP POLICY IF EXISTS "flight_statuses_delete_policy" ON flight_statuses;

-- Habilitar RLS na tabela
ALTER TABLE flight_statuses ENABLE ROW LEVEL SECURITY;

-- Política para SELECT: usuários podem ver status padrão (user_id NULL) e seus próprios status
CREATE POLICY "flight_statuses_select_policy" ON flight_statuses
  FOR SELECT USING (
    user_id IS NULL OR auth.uid() = user_id
  );

-- Política para INSERT: usuários só podem criar status para si mesmos
CREATE POLICY "flight_statuses_insert_policy" ON flight_statuses
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
  );

-- Política para UPDATE: usuários só podem atualizar seus próprios status
CREATE POLICY "flight_statuses_update_policy" ON flight_statuses
  FOR UPDATE USING (
    auth.uid() = user_id
  );

-- Política para DELETE: usuários só podem deletar seus próprios status
CREATE POLICY "flight_statuses_delete_policy" ON flight_statuses
  FOR DELETE USING (
    auth.uid() = user_id
  );