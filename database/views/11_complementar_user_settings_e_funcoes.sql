-- ============================================
-- SCRIPT COMPLEMENTAR - USER SETTINGS E FUNÇÕES RPC
-- ============================================
-- Execute este script APÓS os scripts 01-08 para adicionar funcionalidades faltantes
-- IMPORTANTE: Este script adiciona a tabela user_settings e funções RPC do database_init.sql

-- 1. Criar Tabela de Configurações do Usuário (user_settings)
DROP TABLE IF EXISTS public.user_settings CASCADE;

CREATE TABLE public.user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark')),
  language TEXT DEFAULT 'pt-BR' CHECK (language IN ('pt-BR', 'en-US')),
  notifications_enabled BOOLEAN DEFAULT true,
  auto_sync_enabled BOOLEAN DEFAULT true,
  offline_mode_enabled BOOLEAN DEFAULT false,
  analytics_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Comentários na tabela user_settings
COMMENT ON TABLE user_settings IS 'Configurações personalizadas do usuário';
COMMENT ON COLUMN user_settings.id IS 'Identificador único da configuração';
COMMENT ON COLUMN user_settings.user_id IS 'Referência ao usuário proprietário';
COMMENT ON COLUMN user_settings.theme IS 'Tema da interface (light/dark)';
COMMENT ON COLUMN user_settings.language IS 'Idioma preferido (pt-BR/en-US)';
COMMENT ON COLUMN user_settings.notifications_enabled IS 'Habilitar notificações';
COMMENT ON COLUMN user_settings.auto_sync_enabled IS 'Sincronização automática';
COMMENT ON COLUMN user_settings.offline_mode_enabled IS 'Modo offline habilitado';
COMMENT ON COLUMN user_settings.analytics_enabled IS 'Coleta de analytics habilitada';

-- 3. Índices para user_settings
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_settings_unique_user ON user_settings(user_id);

-- 4. Habilitar RLS na tabela user_settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS para user_settings
DROP POLICY IF EXISTS user_settings_select_policy ON user_settings;
DROP POLICY IF EXISTS user_settings_insert_policy ON user_settings;
DROP POLICY IF EXISTS user_settings_update_policy ON user_settings;
DROP POLICY IF EXISTS user_settings_delete_policy ON user_settings;

CREATE POLICY user_settings_select_policy ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY user_settings_insert_policy ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_settings_update_policy ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY user_settings_delete_policy ON user_settings
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Inserir configurações padrão para usuários existentes
INSERT INTO user_settings (user_id, theme, language, notifications_enabled, auto_sync_enabled, offline_mode_enabled, analytics_enabled)
SELECT 
  id,
  'dark',
  'pt-BR',
  true,
  true,
  false,
  true
FROM profiles
WHERE id NOT IN (SELECT user_id FROM user_settings)
ON CONFLICT (user_id) DO NOTHING;

-- 7. Remover funções existentes para evitar conflitos
DROP FUNCTION IF EXISTS exec_sql(TEXT);
DROP FUNCTION IF EXISTS fetch_career_data(UUID);
DROP FUNCTION IF EXISTS update_career_data(UUID, TEXT);

-- 8. Função RPC para Execução de SQL (do database_init.sql)
CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT) 
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  EXECUTE sql_query;
  RETURN '{"success": true}'::JSONB;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'detail', SQLSTATE
  );
END;
$$;

-- 9. Função RPC para Buscar Dados de Carreira (do database_init.sql)
CREATE OR REPLACE FUNCTION fetch_career_data(user_id UUID) 
RETURNS SETOF profiles
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM profiles WHERE id = user_id;
$$;

-- 10. Função RPC para Atualizar Dados de Carreira (do database_init.sql)
CREATE OR REPLACE FUNCTION update_career_data(user_id UUID, data_json TEXT) 
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  data JSONB := data_json::JSONB;
  result JSONB;
BEGIN
  UPDATE profiles 
  SET 
    total_rating = COALESCE((data->>'totalRating')::INTEGER, total_rating),
    career_level = COALESCE((data->>'level')::INTEGER, career_level),
    career_class = COALESCE(data->>'careerClass', career_class),
    updated_at = NOW()
  WHERE id = user_id;
  
  RETURN '{"success": true}'::JSONB;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'detail', SQLSTATE
  );
END;
$$;

-- 11. Função RPC para Obter Configurações do Usuário
CREATE OR REPLACE FUNCTION get_user_settings(user_id UUID)
RETURNS TABLE (
  theme TEXT,
  language TEXT,
  notifications_enabled BOOLEAN,
  auto_sync_enabled BOOLEAN,
  offline_mode_enabled BOOLEAN,
  analytics_enabled BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    us.theme,
    us.language,
    us.notifications_enabled,
    us.auto_sync_enabled,
    us.offline_mode_enabled,
    us.analytics_enabled
  FROM user_settings us
  WHERE us.user_id = get_user_settings.user_id;
END;
$$;

-- 12. Função RPC para Atualizar Configurações do Usuário
CREATE OR REPLACE FUNCTION update_user_settings(
  user_id UUID,
  theme_param TEXT DEFAULT NULL,
  language_param TEXT DEFAULT NULL,
  notifications_param BOOLEAN DEFAULT NULL,
  auto_sync_param BOOLEAN DEFAULT NULL,
  offline_mode_param BOOLEAN DEFAULT NULL,
  analytics_param BOOLEAN DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Inserir ou atualizar configurações
  INSERT INTO user_settings (
    user_id, theme, language, notifications_enabled, 
    auto_sync_enabled, offline_mode_enabled, analytics_enabled
  )
  VALUES (
    user_id,
    COALESCE(theme_param, 'dark'),
    COALESCE(language_param, 'pt-BR'),
    COALESCE(notifications_param, true),
    COALESCE(auto_sync_param, true),
    COALESCE(offline_mode_param, false),
    COALESCE(analytics_param, true)
  )
  ON CONFLICT (user_id) DO UPDATE SET
    theme = COALESCE(theme_param, user_settings.theme),
    language = COALESCE(language_param, user_settings.language),
    notifications_enabled = COALESCE(notifications_param, user_settings.notifications_enabled),
    auto_sync_enabled = COALESCE(auto_sync_param, user_settings.auto_sync_enabled),
    offline_mode_enabled = COALESCE(offline_mode_param, user_settings.offline_mode_enabled),
    analytics_enabled = COALESCE(analytics_param, user_settings.analytics_enabled),
    updated_at = NOW();

  RETURN '{"success": true}'::JSONB;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'detail', SQLSTATE
  );
END;
$$;

-- 13. Comentários nas funções para documentação
COMMENT ON FUNCTION exec_sql(TEXT) IS 'Executa comandos SQL dinâmicos (uso administrativo)';
COMMENT ON FUNCTION fetch_career_data(UUID) IS 'Busca dados de carreira de um usuário específico';
COMMENT ON FUNCTION update_career_data(UUID, TEXT) IS 'Atualiza dados de carreira via JSON';
COMMENT ON FUNCTION get_user_settings(UUID) IS 'Retorna configurações do usuário';
COMMENT ON FUNCTION update_user_settings(UUID, TEXT, TEXT, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN) IS 'Atualiza configurações do usuário';

-- 14. Verificar se tudo foi criado corretamente
SELECT 'VERIFICAÇÃO FINAL' as status;

-- Verificar tabela user_settings
SELECT 
  'user_settings' as tabela,
  COUNT(*) as registros_inseridos
FROM user_settings;

-- Verificar funções criadas
SELECT 
  routine_name as funcao,
  routine_type as tipo
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('exec_sql', 'fetch_career_data', 'update_career_data', 'get_user_settings', 'update_user_settings')
ORDER BY routine_name;

SELECT '✅ SCRIPT COMPLEMENTAR EXECUTADO COM SUCESSO!' as resultado;
SELECT 'Tabela user_settings e funções RPC adicionadas' as detalhes;
SELECT 'Agora você tem todas as funcionalidades do database_init.sql + melhorias dos scripts 01-08' as observacao;