-- ============================================
-- VERIFICAR SE AS COLUNAS DO BASELINE EXISTEM
-- ============================================
-- Execute este script para verificar o estado atual

-- 1. Verificar estrutura da tabela profiles
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    CASE 
        WHEN column_name IN ('initial_flights', 'initial_minutes', 'total_flights', 'total_minutes') 
        THEN '✅ COLUNA DO BASELINE' 
        ELSE '📋 COLUNA GERAL' 
    END as tipo
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY 
    CASE 
        WHEN column_name IN ('initial_flights', 'initial_minutes', 'total_flights', 'total_minutes') 
        THEN 0 
        ELSE 1 
    END,
    column_name;

-- 2. Verificar dados atuais (primeiros 5 perfis)
SELECT 
    id,
    display_name,
    initial_flights,
    initial_minutes,
    total_flights,
    total_minutes,
    CASE 
        WHEN initial_flights IS NULL THEN '❌ FALTANDO'
        ELSE '✅ OK'
    END as initial_flights_status,
    CASE 
        WHEN initial_minutes IS NULL THEN '❌ FALTANDO'
        ELSE '✅ OK'
    END as initial_minutes_status
FROM profiles
LIMIT 5;

-- 3. Contar perfis com campos faltantes
SELECT 
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN initial_flights IS NULL THEN 1 END) as missing_initial_flights,
    COUNT(CASE WHEN initial_minutes IS NULL THEN 1 END) as missing_initial_minutes,
    COUNT(CASE WHEN total_minutes IS NULL THEN 1 END) as missing_total_minutes
FROM profiles;

-- 4. Resumo do status
SELECT 
    CASE 
        WHEN COUNT(CASE WHEN initial_flights IS NULL THEN 1 END) = 0 
        AND COUNT(CASE WHEN initial_minutes IS NULL THEN 1 END) = 0 
        AND COUNT(CASE WHEN total_minutes IS NULL THEN 1 END) = 0
        THEN '✅ TODAS AS COLUNAS DO BASELINE ESTÃO PRESENTES'
        ELSE '❌ ALGUMAS COLUNAS DO BASELINE ESTÃO FALTANDO'
    END as status_geral
FROM profiles;
