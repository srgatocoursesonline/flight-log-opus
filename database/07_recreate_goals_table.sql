-- ============================================
-- RECRIAR TABELA GOALS
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- IMPORTANTE: Execute APÓS criar a tabela profiles

-- 1. Recriar tabela goals
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  goal_type TEXT NOT NULL CHECK (
    goal_type IN ('flights', 'hours', 'rating', 'distance', 'custom')
  ),
  target_value NUMERIC(10, 2) NOT NULL,
  current_value NUMERIC(10, 2) DEFAULT 0,
  target_date TEXT,
  is_completed BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Comentários nas colunas para documentação
COMMENT ON COLUMN goals.title IS 'Título da meta';
COMMENT ON COLUMN goals.description IS 'Descrição detalhada da meta';
COMMENT ON COLUMN goals.goal_type IS 'Tipo de meta: flights (voos), hours (horas), rating (avaliação), distance (distância), custom (personalizada)';
COMMENT ON COLUMN goals.target_value IS 'Valor alvo da meta';
COMMENT ON COLUMN goals.current_value IS 'Valor atual da meta';
COMMENT ON COLUMN goals.target_date IS 'Data limite para atingir a meta';
COMMENT ON COLUMN goals.is_completed IS 'Indica se a meta foi completada';
COMMENT ON COLUMN goals.is_active IS 'Indica se a meta está ativa';

-- 3. Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_is_active ON goals(is_active);
CREATE INDEX IF NOT EXISTS idx_goals_is_completed ON goals(is_completed);
CREATE INDEX IF NOT EXISTS idx_goals_goal_type ON goals(goal_type);
CREATE INDEX IF NOT EXISTS idx_goals_target_date ON goals(target_date);

-- 4. Habilitar Row Level Security (RLS)
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de segurança
CREATE POLICY "Users can view own goals" ON goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON goals
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Inserir metas padrão para todos os usuários existentes
INSERT INTO public.goals (user_id, title, description, goal_type, target_value, current_value, target_date, is_completed, is_active)
SELECT 
  p.id as user_id,
  goal.title,
  goal.description,
  goal.goal_type,
  goal.target_value,
  0 as current_value,
  goal.target_date,
  false as is_completed,
  true as is_active
FROM public.profiles p
CROSS JOIN (
  VALUES 
    ('Primeiro Voo Solo', 'Complete seu primeiro voo solo com segurança', 'flights', 1, '2024-12-31'),
    ('10 Horas de Voo', 'Acumule 10 horas de experiência de voo', 'hours', 10, '2024-12-31'),
    ('50 Voos Completados', 'Complete 50 voos com sucesso', 'flights', 50, '2025-06-30'),
    ('100 Horas de Voo', 'Alcance 100 horas totais de voo', 'hours', 100, '2025-12-31'),
    ('Avaliação Excelente', 'Mantenha uma média de avaliação acima de 4.5', 'rating', 4.5, '2024-12-31'),
    ('1000km Voados', 'Voe uma distância total de 1000 quilômetros', 'distance', 1000, '2024-12-31'),
    ('Voo Noturno', 'Complete seu primeiro voo noturno', 'custom', 1, '2024-12-31'),
    ('Voo Cross-Country', 'Complete um voo cross-country de longa distância', 'custom', 1, '2025-03-31')
) AS goal(title, description, goal_type, target_value, target_date)
WHERE NOT EXISTS (
  SELECT 1 FROM public.goals g 
  WHERE g.user_id = p.id AND g.title = goal.title
);

SELECT 'Tabela goals recriada com sucesso!' as status;
SELECT COUNT(*) || ' metas padrão inseridas' as goals_count 
FROM goals WHERE title IN (
  'Primeiro Voo Solo', '10 Horas de Voo', '50 Voos Completados', 
  '100 Horas de Voo', 'Avaliação Excelente', '1000km Voados', 
  'Voo Noturno', 'Voo Cross-Country'
);