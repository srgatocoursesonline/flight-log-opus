-- ============================================
-- RECRIAR TABELA EXPENSE_CATEGORIES
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- IMPORTANTE: Execute APÓS criar a tabela profiles

-- 0. Garantir que a extensão uuid-ossp esteja habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Recriar tabela expense_categories
-- Primeiro, remover a tabela se existir
DROP TABLE IF EXISTS public.expense_categories CASCADE;

CREATE TABLE public.expense_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'receipt',
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Comentários nas colunas para documentação
COMMENT ON COLUMN expense_categories.name IS 'Nome da categoria de despesa';
COMMENT ON COLUMN expense_categories.icon IS 'Ícone emoji da categoria';
COMMENT ON COLUMN expense_categories.description IS 'Descrição detalhada da categoria';
COMMENT ON COLUMN expense_categories.is_default IS 'Indica se é uma categoria padrão do sistema';
COMMENT ON COLUMN expense_categories.is_active IS 'Indica se a categoria está ativa para uso';

-- 3. Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_expense_categories_user_id ON expense_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_expense_categories_is_active ON expense_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_expense_categories_is_default ON expense_categories(is_default);

-- 4. Habilitar Row Level Security (RLS)
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de segurança
DROP POLICY IF EXISTS expense_categories_policy ON expense_categories;
CREATE POLICY expense_categories_policy ON expense_categories 
  FOR ALL USING (auth.uid() = user_id);

-- 6. Inserir categorias padrão de despesas
-- NOTA: Estas categorias serão inseridas para todos os usuários existentes
-- Para novos usuários, use um trigger ou função para criar automaticamente

INSERT INTO public.expense_categories (user_id, name, icon, description, is_default, is_active)
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
    ('Combustível', '⛽', 'Abastecimento de aeronaves'),
    ('Manutenção', '🔧', 'Reparos e inspeções de aeronaves'),
    ('Seguro', '🛡️', 'Seguro da aeronave e cobertura de danos'),
    ('Hangar', '🏢', 'Custos de hangar e estacionamento'),
    ('Compra de Nova Aeronave', '✈️', 'Aquisição de novas aeronaves'),
    ('Certificações', '📜', 'Custos de licenças e certificações de piloto'),
    ('Translado de Aeronave', '🚁', 'Custos de transferência de aeronave entre aeroportos'),
    ('Pintura e Livery', '🎨', 'Customização e repintura de aeronaves'),
    ('Reparos de Acidente', '🔨', 'Custos de reparo após acidentes e danos'),
    ('Taxas de Aeroporto', '🏛️', 'Taxas de pouso, decolagem e serviços aeroportuários'),
    ('Contratação de Tripulação', '👥', 'Custos de contratação e salários da tripulação')
) AS category(name, icon, description)
WHERE NOT EXISTS (
  SELECT 1 FROM public.expense_categories ec 
  WHERE ec.user_id = p.id AND ec.name = category.name
);

SELECT 'Tabela expense_categories recriada com sucesso!' as status;
SELECT COUNT(*) || ' categorias de despesa inseridas' as categories_count 
FROM expense_categories WHERE is_default = true;