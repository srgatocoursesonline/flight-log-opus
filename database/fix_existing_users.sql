-- ============================================
-- SCRIPT PARA CORRIGIR USUÁRIOS EXISTENTES
-- ============================================
-- Este script cria perfis para usuários que já existem
-- no auth.users mas não têm perfil na tabela profiles

-- Inserir perfis para usuários existentes que não têm perfil
INSERT INTO public.profiles (
  id,
  display_name,
  email,
  total_flights,
  total_hours,
  career_rating,
  total_rating,
  career_level,
  career_class,
  world_ranking,
  created_at,
  updated_at
)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'display_name', 'Cmdte. Rodrigo') as display_name,
  au.email,
  0 as total_flights,
  0 as total_hours,
  0 as career_rating,
  0 as total_rating,
  1 as career_level,
  'D' as career_class,
  0 as world_ranking,
  au.created_at,
  NOW() as updated_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
  AND au.email_confirmed_at IS NOT NULL; -- Apenas usuários confirmados

-- Criar configurações padrão para usuários existentes
INSERT INTO public.user_settings (
  user_id,
  theme,
  language,
  notifications_enabled,
  auto_sync_enabled,
  offline_mode_enabled,
  analytics_enabled,
  created_at,
  updated_at
)
SELECT 
  au.id,
  'dark' as theme,
  'pt-BR' as language,
  true as notifications_enabled,
  true as auto_sync_enabled,
  false as offline_mode_enabled,
  true as analytics_enabled,
  NOW() as created_at,
  NOW() as updated_at
FROM auth.users au
LEFT JOIN public.user_settings us ON au.id = us.user_id
WHERE us.user_id IS NULL
  AND au.email_confirmed_at IS NOT NULL
  AND EXISTS (SELECT 1 FROM public.profiles WHERE id = au.id);

-- Criar categorias padrão de despesas para usuários existentes
INSERT INTO public.expense_categories (user_id, name, icon, description, is_default, is_active)
SELECT 
  p.id,
  category.name,
  category.icon,
  category.description,
  true as is_default,
  true as is_active
FROM public.profiles p
CROSS JOIN (
  VALUES 
    ('Combustível', 'fuel', 'Gastos com combustível de aeronaves'),
    ('Manutenção', 'wrench', 'Custos de manutenção de aeronaves'),
    ('Hangar', 'warehouse', 'Custos de hangar e estacionamento'),
    ('Seguro', 'shield', 'Seguro da aeronave')
) AS category(name, icon, description)
WHERE NOT EXISTS (
  SELECT 1 FROM public.expense_categories ec 
  WHERE ec.user_id = p.id AND ec.name = category.name
);

-- Criar categorias padrão de receitas para usuários existentes
INSERT INTO public.revenue_categories (user_id, name, icon, description, is_default, is_active)
SELECT 
  p.id,
  category.name,
  category.icon,
  category.description,
  true as is_default,
  true as is_active
FROM public.profiles p
CROSS JOIN (
  VALUES 
    ('Voos Comerciais', 'plane', 'Receita de voos comerciais'),
    ('Instrução de Voo', 'graduation-cap', 'Receita de aulas de pilotagem'),
    ('Frete Aéreo', 'package', 'Receita de transporte de cargas'),
    ('Táxi Aéreo', 'car', 'Receita de voos de táxi aéreo')
) AS category(name, icon, description)
WHERE NOT EXISTS (
  SELECT 1 FROM public.revenue_categories rc 
  WHERE rc.user_id = p.id AND rc.name = category.name
);

-- Criar status padrão de voos para usuários existentes
INSERT INTO public.flight_statuses (user_id, name, color, icon, description, hourly_multiplier, is_default, is_active)
SELECT 
  p.id,
  status.name,
  status.color,
  status.icon,
  status.description,
  status.hourly_multiplier,
  status.is_default,
  true as is_active
FROM public.profiles p
CROSS JOIN (
  VALUES 
    ('Completado', '#22c55e', 'check-circle', 'Voo completado com sucesso', 1.0, true),
    ('Cancelado', '#ef4444', 'x-circle', 'Voo cancelado', 0.0, false),
    ('Em Progresso', '#3b82f6', 'clock', 'Voo em andamento', 1.0, false),
    ('Planejado', '#f59e0b', 'calendar', 'Voo planejado', 0.0, false)
) AS status(name, color, icon, description, hourly_multiplier, is_default)
WHERE NOT EXISTS (
  SELECT 1 FROM public.flight_statuses fs 
  WHERE fs.user_id = p.id AND fs.name = status.name
);

-- Verificar quantos usuários foram corrigidos
SELECT 
  COUNT(*) as total_users_with_profiles,
  (
    SELECT COUNT(*) 
    FROM auth.users 
    WHERE email_confirmed_at IS NOT NULL
  ) as total_confirmed_users
FROM public.profiles;

-- ============================================
-- CORREÇÃO CONCLUÍDA!
-- ============================================
-- Todos os usuários existentes agora têm:
-- 1. Perfil na tabela 'profiles' com display_name correto
-- 2. Configurações padrão do usuário
-- 3. Categorias padrão de despesas e receitas
-- 4. Status padrão de voos