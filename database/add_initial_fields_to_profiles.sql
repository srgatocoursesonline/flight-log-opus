-- ============================================
-- ADICIONAR CAMPOS INICIAIS À TABELA PROFILES
-- ============================================
-- Este script adiciona os campos initial_flights e initial_hours
-- à tabela profiles para armazenar valores históricos iniciais

-- Adicionar campo initial_flights se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'initial_flights') THEN
        ALTER TABLE profiles ADD COLUMN initial_flights INTEGER DEFAULT 0;
    END IF;
END $$;

-- Adicionar campo initial_hours se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'initial_hours') THEN
        ALTER TABLE profiles ADD COLUMN initial_hours NUMERIC(10, 2) DEFAULT 0;
    END IF;
END $$;

-- Comentários nas colunas para documentação
COMMENT ON COLUMN profiles.initial_flights IS 'Número inicial de voos (histórico anterior ao sistema)';
COMMENT ON COLUMN profiles.initial_hours IS 'Horas iniciais de voo (histórico anterior ao sistema)';

-- Migrar dados existentes: mover total_flights e total_hours para initial_flights e initial_hours
-- apenas se os campos iniciais estiverem vazios
UPDATE profiles 
SET 
    initial_flights = total_flights,
    initial_hours = total_hours
WHERE 
    initial_flights = 0 
    AND initial_hours = 0 
    AND (total_flights > 0 OR total_hours > 0);

SELECT 'Campos initial_flights e initial_hours adicionados com sucesso!' as status;