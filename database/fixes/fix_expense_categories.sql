-- ============================================
-- CORRIGIR CATEGORIAS DE DESPESA AUSENTES
-- ============================================
-- Este script adiciona categorias de despesa padrão para usuários que não as possuem

-- Inserir categorias padrão de despesas para usuários que não as possuem
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
    ('Combustível', '⛽', 'Gastos com combustível de aeronaves'),
    ('Manutenção', '🔧', 'Manutenção preventiva e corretiva de aeronaves'),
    ('Seguro', '🛡️', 'Seguro obrigatório e opcional da aeronave'),
    ('Hangar', '🏢', 'Custos de hangar e estacionamento de aeronaves'),
    ('Certificações', '📜', 'Custos para obter certificações e licenças'),
    ('Translado de Aeronave', '✈️', 'Custos para mover aeronave entre aeroportos'),
    ('Reparos de Acidente', '🚨', 'Reparos emergenciais após acidentes'),
    ('Taxas de Aeroporto', '🏛️', 'Taxas de pouso, decolagem e serviços aeroportuários'),
    ('Contratação de Tripulação', '👥', 'Custos com contratação de pilotos e tripulação'),
    ('Pintura e Livery', '🎨', 'Personalização visual da aeronave')
) AS category(name, icon, description)
WHERE NOT EXISTS (
  SELECT 1 FROM public.expense_categories ec 
  WHERE ec.user_id = p.id AND ec.name = category.name
);

-- Verificar quantas categorias foram inseridas
SELECT 
  p.display_name,
  COUNT(ec.id) as total_expense_categories
FROM public.profiles p
LEFT JOIN public.expense_categories ec ON p.id = ec.user_id
GROUP BY p.id, p.display_name
ORDER BY p.display_name;

-- Listar todas as categorias de despesa por usuário
SELECT 
  p.display_name,
  ec.name as category_name,
  ec.icon,
  ec.is_active
FROM public.profiles p
LEFT JOIN public.expense_categories ec ON p.id = ec.user_id
ORDER BY p.display_name, ec.name;