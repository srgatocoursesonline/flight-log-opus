-- ============================================
-- ADICIONAR COLUNAS FINAIS PARA BASELINE
-- ============================================
-- Execute este script no SQL Editor do Supabase

-- 1. Adicionar colunas do baseline se não existirem
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS initial_flights INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS initial_minutes INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_minutes INTEGER DEFAULT 0;

-- 2. Atualizar a coluna total_hours para ser obsoleta (opcional)
-- ALTER TABLE profiles DROP COLUMN IF EXISTS total_hours;

-- 3. Verificar se as colunas foram criadas
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name IN ('initial_flights', 'initial_minutes', 'total_flights', 'total_minutes', 'total_hours')
ORDER BY column_name;

-- 4. Verificar dados atuais (primeiros 5 perfis)
SELECT 
    id,
    display_name,
    initial_flights,
    initial_minutes,
    total_flights,
    total_minutes
FROM profiles
LIMIT 5;

-- 5. RPC PARA INCREMENTAR ESTATÍSTICAS DO PERFIL
-- Função RPC atômica para incrementar estatísticas do perfil
CREATE OR REPLACE FUNCTION increment_profile_stats(
  p_user_id UUID,
  p_flights INTEGER,
  p_minutes INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET 
    total_flights = GREATEST(0, COALESCE(total_flights, 0) + p_flights),
    total_minutes = GREATEST(0, COALESCE(total_minutes, 0) + p_minutes),
    updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Conceder permissões necessárias
GRANT EXECUTE ON FUNCTION increment_profile_stats(UUID, INTEGER, INTEGER) TO authenticated;

SELECT 'Colunas do baseline adicionadas e RPC criada com sucesso!' as status;