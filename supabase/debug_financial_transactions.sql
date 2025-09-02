-- Script para debugar transações financeiras
-- Verifica se há problemas nos dados armazenados

-- 1. Verificar todas as transações do usuário
SELECT 
    id,
    transaction_type,
    description,
    amount,
    transaction_date,
    created_at
FROM financial_transactions 
WHERE user_id = (SELECT id FROM profiles LIMIT 1)
ORDER BY created_at DESC;

-- 2. Verificar se há transações com tipos incorretos
SELECT 
    'Transações com tipo inválido' as problema,
    COUNT(*) as quantidade
FROM financial_transactions 
WHERE transaction_type NOT IN ('revenue', 'expense');

-- 3. Verificar se há valores negativos (que não deveriam existir)
SELECT 
    'Transações com valores negativos' as problema,
    transaction_type,
    COUNT(*) as quantidade,
    SUM(amount) as soma_valores
FROM financial_transactions 
WHERE amount < 0
GROUP BY transaction_type;

-- 4. Verificar se há valores zerados
SELECT 
    'Transações com valores zero' as problema,
    transaction_type,
    COUNT(*) as quantidade
FROM financial_transactions 
WHERE amount = 0
GROUP BY transaction_type;

-- 5. Resumo por tipo de transação
SELECT 
    transaction_type,
    COUNT(*) as total_transacoes,
    SUM(amount) as soma_valores,
    AVG(amount) as valor_medio,
    MIN(amount) as valor_minimo,
    MAX(amount) as valor_maximo
FROM financial_transactions 
GROUP BY transaction_type;

-- 6. Verificar se há problemas de encoding ou caracteres especiais
SELECT 
    id,
    transaction_type,
    description,
    amount,
    LENGTH(description) as tamanho_descricao
FROM financial_transactions 
WHERE description LIKE '%�%' 
   OR description LIKE '%\\%'
   OR LENGTH(description) > 200;

-- 7. Verificar constraint de amount > 0
SELECT 
    constraint_name,
    constraint_type,
    check_clause
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%financial_transactions%';

-- 8. Verificar últimas 10 transações inseridas
SELECT 
    'Últimas transações inseridas' as info,
    transaction_type,
    description,
    amount,
    transaction_date,
    created_at
FROM financial_transactions 
ORDER BY created_at DESC 
LIMIT 10;

SELECT '✅ Debug das transações financeiras concluído!' as status;