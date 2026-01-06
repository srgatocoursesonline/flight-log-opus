-- ============================================
-- RECRIAR TABELA REVENUE_CATEGORIES
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- IMPORTANTE: Execute APÓS criar a tabela profiles

-- 1. Recriar tabela revenue_categories
CREATE TABLE IF NOT EXISTS public.revenue_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'dollar-sign',
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Comentários nas colunas para documentação
COMMENT ON COLUMN revenue_categories.name IS 'Nome da categoria de receita';
COMMENT ON COLUMN revenue_categories.icon IS 'Ícone emoji da categoria';
COMMENT ON COLUMN revenue_categories.description IS 'Descrição detalhada da categoria';
COMMENT ON COLUMN revenue_categories.is_default IS 'Indica se é uma categoria padrão do sistema';
COMMENT ON COLUMN revenue_categories.is_active IS 'Indica se a categoria está ativa para uso';

-- 3. Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_revenue_categories_user_id ON revenue_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_revenue_categories_is_active ON revenue_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_revenue_categories_is_default ON revenue_categories(is_default);

-- 4. Habilitar Row Level Security (RLS)
ALTER TABLE revenue_categories ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de segurança
CREATE POLICY "Users can view own revenue categories" ON revenue_categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own revenue categories" ON revenue_categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own revenue categories" ON revenue_categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own revenue categories" ON revenue_categories
  FOR DELETE USING (auth.uid() = user_id AND is_default = false);

-- 6. Inserir categorias padrão de receitas
-- NOTA: Estas categorias serão inseridas para todos os usuários existentes
-- Para novos usuários, use um trigger ou função para criar automaticamente

INSERT INTO public.revenue_categories (user_id, name, icon, description, is_default, is_active)
SELECT 
  p.id as user_id,
  category.name,
  category.icon,
  category.description,
  true as is_default,
  true as is_active
FROM public.profiles p
CROSS JOIN (
  VALUES 
    ('Voos VIP Charter', '✈️', 'Voos charter VIP com Vision Jet e aeronaves de luxo'),
    ('Missões de Carga', '📦', 'Transporte de carga e mercadorias'),
    ('Voos Turísticos', '🌄', 'Voos panorâmicos e turismo aéreo'),
    ('Busca e Salvamento', '🚁', 'Operações de busca e salvamento'),
    ('Transporte Médico', '🏥', 'Evacuação médica e transporte de emergência'),
    ('Combate a Incêndios', '🔥', 'Operações de combate a incêndios florestais'),
    ('Paraquedismo', '🪂', 'Voos para atividades de paraquedismo'),
    ('Instrução de Voo', '👨‍🏫', 'Receitas por instrução e treinamento de pilotos'),
    ('Renda Passiva', '💰', 'Receitas passivas de certificações e contratos'),
    ('Bônus de Reputação', '⭐', 'Bônus por alta reputação e excelência operacional'),
    ('Contratos Especiais', '📋', 'Contratos exclusivos e missões especializadas'),
    ('Outras Receitas', '💵', 'Receitas diversas não categorizadas')
) AS category(name, icon, description)
WHERE NOT EXISTS (
  SELECT 1 FROM public.revenue_categories rc 
  WHERE rc.user_id = p.id AND rc.name = category.name
);

SELECT 'Tabela revenue_categories recriada com sucesso!' as status;
SELECT COUNT(*) || ' categorias de receita inseridas' as categories_count 
FROM revenue_categories WHERE is_default = true;