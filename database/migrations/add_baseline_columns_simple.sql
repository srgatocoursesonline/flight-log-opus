-- ============================================
-- SCRIPT SIMPLES PARA ADICIONAR COLUNAS DO BASELINE
-- ============================================
-- Execute este script no SQL Editor do Supabase ANTES de usar o sistema

-- 1. Adicionar coluna initial_minutes se não existir
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS initial_minutes INTEGER DEFAULT 0;

-- 2. Garantir que total_minutes existe
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_minutes INTEGER DEFAULT 0;

-- 3. Verificar se as colunas foram criadas
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name IN ('initial_flights', 'initial_minutes', 'total_flights', 'total_minutes')
ORDER BY column_name;

-- 4. Verificar dados atuais
SELECT 
    id,
    display_name,
    initial_flights,
    initial_minutes,
    total_flights,
    total_minutes
FROM profiles
LIMIT 5;

SELECT 'Colunas do baseline adicionadas com sucesso!' as status;
