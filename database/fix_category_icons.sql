-- ============================================
-- CORREÇÃO DOS ÍCONES DAS CATEGORIAS
-- ============================================
-- Este script corrige o campo 'icon' das categorias financeiras
-- que estava sendo preenchido com texto ao invés de emojis

-- Atualizar ícones das categorias de despesas
UPDATE public.expense_categories 
SET icon = CASE 
  WHEN name LIKE '%Combustível%' OR name = 'Combustível' THEN '⛽'
  WHEN name LIKE '%Manutenção%' OR name = 'Manutenção' THEN '🔧'
  WHEN name LIKE '%Seguro%' OR name = 'Seguro' THEN '🛡️'
  WHEN name LIKE '%Hangar%' OR name = 'Hangar' THEN '🏢'
  WHEN name LIKE '%Certificações%' OR name = 'Certificações' THEN '📜'
  WHEN name LIKE '%Translado%' OR name = 'Translado de Aeronave' THEN '✈️'
  WHEN name LIKE '%Reparos%' OR name = 'Reparos de Acidente' THEN '🚨'
  WHEN name LIKE '%Taxas%' OR name = 'Taxas de Aeroporto' THEN '🏛️'
  WHEN name LIKE '%Tripulação%' OR name = 'Contratação de Tripulação' THEN '👥'
  WHEN name LIKE '%Pintura%' OR name = 'Pintura e Livery' THEN '🎨'
  ELSE icon
END
WHERE icon IN ('fuel', 'wrench', 'shield', 'warehouse', 'award', 'plane', 'alert-triangle', 'building', 'users', 'palette')
   OR name IN ('⛽ Combustível', '🔧 Manutenção', '🛡️ Seguro', '🏢 Hangar', '📜 Certificações', '✈️ Translado de Aeronave', '🚨 Reparos de Acidente', '🏛️ Taxas de Aeroporto', '👥 Contratação de Tripulação', '🎨 Pintura e Livery');

-- Atualizar nomes das categorias de despesas (remover emoji do nome)
UPDATE public.expense_categories 
SET name = CASE 
  WHEN name = '⛽ Combustível' THEN 'Combustível'
  WHEN name = '🔧 Manutenção' THEN 'Manutenção'
  WHEN name = '🛡️ Seguro' THEN 'Seguro'
  WHEN name = '🏢 Hangar' THEN 'Hangar'
  WHEN name = '📜 Certificações' THEN 'Certificações'
  WHEN name = '✈️ Translado de Aeronave' THEN 'Translado de Aeronave'
  WHEN name = '🚨 Reparos de Acidente' THEN 'Reparos de Acidente'
  WHEN name = '🏛️ Taxas de Aeroporto' THEN 'Taxas de Aeroporto'
  WHEN name = '👥 Contratação de Tripulação' THEN 'Contratação de Tripulação'
  WHEN name = '🎨 Pintura e Livery' THEN 'Pintura e Livery'
  ELSE name
END
WHERE name IN ('⛽ Combustível', '🔧 Manutenção', '🛡️ Seguro', '🏢 Hangar', '📜 Certificações', '✈️ Translado de Aeronave', '🚨 Reparos de Acidente', '🏛️ Taxas de Aeroporto', '👥 Contratação de Tripulação', '🎨 Pintura e Livery');

-- Atualizar ícones das categorias de receitas
UPDATE public.revenue_categories 
SET icon = CASE 
  WHEN name LIKE '%VIP Charter%' OR name = 'Voos VIP Charter' THEN '🛩️'
  WHEN name LIKE '%Carga%' OR name = 'Missões de Carga' THEN '📦'
  WHEN name LIKE '%Turísticos%' OR name = 'Voos Turísticos' THEN '🌅'
  WHEN name LIKE '%Busca%' OR name = 'Busca e Salvamento' THEN '🚁'
  WHEN name LIKE '%Médico%' OR name = 'Transporte Médico' THEN '🏥'
  WHEN name LIKE '%Incêndios%' OR name = 'Combate a Incêndios' THEN '🔥'
  WHEN name LIKE '%Paraquedismo%' OR name = 'Paraquedismo' THEN '🪂'
  WHEN name LIKE '%Instrução%' OR name = 'Instrução de Voo' THEN '🎓'
  WHEN name LIKE '%Renda Passiva%' OR name = 'Renda Passiva' THEN '💰'
  WHEN name LIKE '%Reputação%' OR name = 'Bônus de Reputação' THEN '⭐'
  WHEN name LIKE '%Contratos%' OR name = 'Contratos Especiais' THEN '📋'
  WHEN name LIKE '%Outras Receitas%' OR name = 'Outras Receitas' THEN '💼'
  ELSE icon
END
WHERE icon IN ('crown', 'package', 'camera', 'life-buoy', 'heart-pulse', 'flame', 'parachute', 'graduation-cap', 'piggy-bank', 'star', 'clipboard-list', 'briefcase')
   OR name IN ('🛩️ Voos VIP Charter', '📦 Missões de Carga', '🌅 Voos Turísticos', '🚁 Busca e Salvamento', '🏥 Transporte Médico', '🔥 Combate a Incêndios', '🪂 Paraquedismo', '🎓 Instrução de Voo', '💰 Renda Passiva', '⭐ Bônus de Reputação', '📋 Contratos Especiais', '💼 Outras Receitas');

-- Atualizar nomes das categorias de receitas (remover emoji do nome)
UPDATE public.revenue_categories 
SET name = CASE 
  WHEN name = '🛩️ Voos VIP Charter' THEN 'Voos VIP Charter'
  WHEN name = '📦 Missões de Carga' THEN 'Missões de Carga'
  WHEN name = '🌅 Voos Turísticos' THEN 'Voos Turísticos'
  WHEN name = '🚁 Busca e Salvamento' THEN 'Busca e Salvamento'
  WHEN name = '🏥 Transporte Médico' THEN 'Transporte Médico'
  WHEN name = '🔥 Combate a Incêndios' THEN 'Combate a Incêndios'
  WHEN name = '🪂 Paraquedismo' THEN 'Paraquedismo'
  WHEN name = '🎓 Instrução de Voo' THEN 'Instrução de Voo'
  WHEN name = '💰 Renda Passiva' THEN 'Renda Passiva'
  WHEN name = '⭐ Bônus de Reputação' THEN 'Bônus de Reputação'
  WHEN name = '📋 Contratos Especiais' THEN 'Contratos Especiais'
  WHEN name = '💼 Outras Receitas' THEN 'Outras Receitas'
  ELSE name
END
WHERE name IN ('🛩️ Voos VIP Charter', '📦 Missões de Carga', '🌅 Voos Turísticos', '🚁 Busca e Salvamento', '🏥 Transporte Médico', '🔥 Combate a Incêndios', '🪂 Paraquedismo', '🎓 Instrução de Voo', '💰 Renda Passiva', '⭐ Bônus de Reputação', '📋 Contratos Especiais', '💼 Outras Receitas');

-- Verificar as correções
SELECT 'Categorias de Despesas' as tipo, name, icon FROM public.expense_categories WHERE is_default = true LIMIT 10;
SELECT 'Categorias de Receitas' as tipo, name, icon FROM public.revenue_categories WHERE is_default = true LIMIT 12;

-- ============================================
-- CORREÇÃO CONCLUÍDA!
-- ============================================
-- Agora o campo 'icon' contém os emojis corretos
-- e o campo 'name' contém apenas o texto sem emoji