-- =====================================================
-- Script: fix_financial_transactions_constraints.sql
-- Descrição: Corrige as constraints da tabela financial_transactions
-- Problema: Constraints conflitantes de chave estrangeira
-- Data: 2025-01-22
-- =====================================================

-- IMPORTANTE: Execute este script no SQL Editor do Supabase

-- 1. Remover constraints conflitantes existentes
ALTER TABLE financial_transactions 
DROP CONSTRAINT IF EXISTS fk_financial_transactions_revenue_category;

ALTER TABLE financial_transactions 
DROP CONSTRAINT IF EXISTS fk_financial_transactions_expense_category;

-- 2. Remover trigger de validação existente se houver
DROP TRIGGER IF EXISTS trigger_validate_financial_transaction_category ON financial_transactions;
DROP FUNCTION IF EXISTS validate_financial_transaction_category();

-- 3. Criar função de validação corrigida
CREATE OR REPLACE FUNCTION validate_financial_transaction_category()
RETURNS TRIGGER AS $$
BEGIN
    -- Se category_id é NULL, permitir (categoria opcional)
    IF NEW.category_id IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Validar se category_id existe na tabela correta baseado no tipo
    IF NEW.transaction_type = 'revenue' THEN
        IF NOT EXISTS (SELECT 1 FROM revenue_categories WHERE id = NEW.category_id AND user_id = NEW.user_id) THEN
            RAISE EXCEPTION 'Category ID % não existe em revenue_categories para o usuário %', NEW.category_id, NEW.user_id;
        END IF;
    ELSIF NEW.transaction_type = 'expense' THEN
        IF NOT EXISTS (SELECT 1 FROM expense_categories WHERE id = NEW.category_id AND user_id = NEW.user_id) THEN
            RAISE EXCEPTION 'Category ID % não existe em expense_categories para o usuário %', NEW.category_id, NEW.user_id;
        END IF;
    ELSE
        RAISE EXCEPTION 'Tipo de transação inválido: %', NEW.transaction_type;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Criar trigger de validação
CREATE TRIGGER trigger_validate_financial_transaction_category
    BEFORE INSERT OR UPDATE ON financial_transactions
    FOR EACH ROW
    EXECUTE FUNCTION validate_financial_transaction_category();

-- 5. Verificar se existem transações com category_id inválido e corrigi-las
-- Limpar category_id inválido para receitas
UPDATE financial_transactions 
SET category_id = NULL 
WHERE transaction_type = 'revenue' 
  AND category_id IS NOT NULL 
  AND NOT EXISTS (
    SELECT 1 FROM revenue_categories 
    WHERE id = financial_transactions.category_id 
      AND user_id = financial_transactions.user_id
  );

-- Limpar category_id inválido para despesas
UPDATE financial_transactions 
SET category_id = NULL 
WHERE transaction_type = 'expense' 
  AND category_id IS NOT NULL 
  AND NOT EXISTS (
    SELECT 1 FROM expense_categories 
    WHERE id = financial_transactions.category_id 
      AND user_id = financial_transactions.user_id
  );

-- 6. Verificar se a correção funcionou
SELECT 
    'financial_transactions' as tabela,
    COUNT(*) as total_transacoes,
    COUNT(CASE WHEN category_id IS NULL THEN 1 END) as sem_categoria,
    COUNT(CASE WHEN transaction_type = 'revenue' THEN 1 END) as receitas,
    COUNT(CASE WHEN transaction_type = 'expense' THEN 1 END) as despesas
FROM financial_transactions;

-- 7. Verificar se há categorias disponíveis para o usuário
SELECT 
    'expense_categories' as tipo,
    user_id,
    COUNT(*) as total_categorias
FROM expense_categories 
GROUP BY user_id
UNION ALL
SELECT 
    'revenue_categories' as tipo,
    user_id,
    COUNT(*) as total_categorias
FROM revenue_categories 
GROUP BY user_id
ORDER BY tipo, user_id;

SELECT '✅ Constraints da tabela financial_transactions corrigidas com sucesso!' as status;