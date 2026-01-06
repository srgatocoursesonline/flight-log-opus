-- ============================================
-- TRIGGER PARA CRIAR PERFIL AUTOMATICAMENTE
-- ============================================
-- Este script cria um trigger que automaticamente cria um perfil
-- na tabela 'profiles' sempre que um novo usuário se registra
-- no sistema de autenticação do Supabase

-- Função que será executada pelo trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Inserir novo perfil com dados do usuário
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
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'Cmdte. Rodrigo'),
    NEW.email,
    0,
    0,
    0,
    0,
    1,
    'D',
    0,
    NOW(),
    NOW()
  );
  
  -- Criar configurações padrão do usuário
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
  VALUES (
    NEW.id,
    'dark',
    'pt-BR',
    true,
    true,
    false,
    true,
    NOW(),
    NOW()
  );
  
  -- Criar categorias padrão de despesas
  INSERT INTO public.expense_categories (user_id, name, icon, description, is_default, is_active)
  VALUES 
    (NEW.id, 'Combustível', '⛽', 'Gastos com combustível de aeronaves', true, true),
    (NEW.id, 'Manutenção', '🔧', 'Manutenção preventiva e corretiva de aeronaves', true, true),
    (NEW.id, 'Seguro', '🛡️', 'Seguro obrigatório e opcional da aeronave', true, true),
    (NEW.id, 'Hangar', '🏢', 'Custos de hangar e estacionamento de aeronaves', true, true),
    (NEW.id, 'Certificações', '📜', 'Custos para obter certificações e licenças', true, true),
    (NEW.id, 'Translado de Aeronave', '✈️', 'Custos para mover aeronave entre aeroportos', true, true),
    (NEW.id, 'Reparos de Acidente', '🚨', 'Reparos emergenciais após acidentes', true, true),
    (NEW.id, 'Taxas de Aeroporto', '🏛️', 'Taxas de pouso, decolagem e serviços aeroportuários', true, true),
    (NEW.id, 'Contratação de Tripulação', '👥', 'Custos com contratação de pilotos e tripulação', true, true),
    (NEW.id, 'Pintura e Livery', '🎨', 'Personalização visual da aeronave', true, true);
  
  -- Criar categorias padrão de receitas
  INSERT INTO public.revenue_categories (user_id, name, icon, description, is_default, is_active)
  VALUES 
    (NEW.id, 'Voos VIP Charter', '🛩️', 'Transporte executivo e voos charter de luxo', true, true),
    (NEW.id, 'Missões de Carga', '📦', 'Transporte de mercadorias e cargas especiais', true, true),
    (NEW.id, 'Voos Turísticos', '🌅', 'Passeios panorâmicos e turismo aéreo', true, true),
    (NEW.id, 'Busca e Salvamento', '🚁', 'Operações de resgate e emergência', true, true),
    (NEW.id, 'Transporte Médico', '🏥', 'Evacuação médica e transporte de emergência', true, true),
    (NEW.id, 'Combate a Incêndios', '🔥', 'Operações de combate a incêndios florestais', true, true),
    (NEW.id, 'Paraquedismo', '🪂', 'Voos para saltos de paraquedas', true, true),
    (NEW.id, 'Instrução de Voo', '🎓', 'Aulas de pilotagem e treinamento', true, true),
    (NEW.id, 'Renda Passiva', '💰', 'Receita automática de certificações e contratos', true, true),
    (NEW.id, 'Bônus de Reputação', '⭐', 'Bônus por alta reputação e performance', true, true),
    (NEW.id, 'Contratos Especiais', '📋', 'Missões especiais e contratos únicos', true, true),
    (NEW.id, 'Outras Receitas', '💼', 'Outras fontes de receita não categorizadas', true, true);
  
  -- Criar status padrão de voos
  INSERT INTO public.flight_statuses (user_id, name, color, icon, description, hourly_multiplier, is_default, is_active)
  VALUES 
    (NEW.id, 'Completado', '#22c55e', 'check-circle', 'Voo completado com sucesso', 1.0, true, true),
    (NEW.id, 'Cancelado', '#ef4444', 'x-circle', 'Voo cancelado', 0.0, false, true),
    (NEW.id, 'Em Progresso', '#3b82f6', 'clock', 'Voo em andamento', 1.0, false, true),
    (NEW.id, 'Planejado', '#f59e0b', 'calendar', 'Voo planejado', 0.0, false, true);
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro mas não falha o registro do usuário
    RAISE WARNING 'Erro ao criar perfil para usuário %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Criar o trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Conceder permissões necessárias
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- ============================================
-- TRIGGER CRIADO COM SUCESSO!
-- ============================================
-- Agora todos os novos usuários terão:
-- 1. Perfil criado automaticamente na tabela 'profiles'
-- 2. Configurações padrão do usuário
-- 3. Categorias padrão de despesas e receitas
-- 4. Status padrão de voos
-- 5. Display name definido corretamente