-- ============================================
-- ADICIONAR CAMPO INITIAL_BALANCE NA TABELA USER_SETTINGS
-- ============================================
-- Execute este script no painel SQL do Supabase para adicionar o campo initial_balance

-- Adicionar coluna initial_balance na tabela user_settings
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS initial_balance NUMERIC DEFAULT 5922235;

-- Comentário da coluna
COMMENT ON COLUMN public.user_settings.initial_balance IS 'Saldo inicial para cálculos financeiros do usuário';

-- Atualizar registros existentes que não têm o campo
UPDATE public.user_settings 
SET initial_balance = 5922235 
WHERE initial_balance IS NULL;

-- Verificar se a coluna foi adicionada corretamente
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'user_settings' 
AND column_name = 'initial_balance';

SELECT 'Campo initial_balance adicionado com sucesso!' as status;