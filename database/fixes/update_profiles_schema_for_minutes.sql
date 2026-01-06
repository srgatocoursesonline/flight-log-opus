-- ============================================
-- ATUALIZAR SCHEMA DE PROFILES PARA USAR MINUTOS
-- ============================================

-- 1. Adicionar coluna para total de minutos
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS total_minutes INTEGER DEFAULT 0;

-- 2. Migrar dados existentes de total_hours para total_minutes
-- (assumindo que total_hours estava armazenando minutos, não horas)
UPDATE profiles 
SET total_minutes = total_hours 
WHERE total_minutes = 0 AND total_hours > 0;

-- 3. Atualizar comentários
COMMENT ON COLUMN profiles.total_minutes IS 'Total de minutos de voo registrados no sistema';

-- 4. Atualizar trigger para usar total_minutes em vez de total_hours
-- (O trigger já foi atualizado no código TypeScript para usar minutos)

-- 5. Opcional: remover a coluna total_hours antiga após confirmar que tudo funciona
-- ALTER TABLE profiles DROP COLUMN IF EXISTS total_hours;

SELECT 'Tabela profiles atualizada com sucesso para usar minutos!' as status;