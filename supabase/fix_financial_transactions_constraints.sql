-- Script para corrigir constraints conflitantes na tabela financial_transactions
-- Este script resolve o erro: Key is not present in table "revenue_categories"

-- 1. Remover constraints conflitantes existentes
ALTER TABLE financial_transactions 
DROP CONSTRAINT IF EXISTS fk_financial_transactions_revenue_category;

ALTER TABLE financial_transactions 
DROP CONSTRAINT IF EXISTS fk_financial_transactions_expense_category;

-- 2. Remover trigger e função existentes
DROP TRIGGER IF EXISTS validate_financial_transaction_category_trigger ON financial_transactions;
DROP FUNCTION IF EXISTS validate_financial_transaction_category();

-- 3. Criar nova função de validação
CREATE OR REPLACE FUNCTION validate_financial_transaction_category()
RETURNS TRIGGER AS $$
BEGIN
  -- Validar se category_id existe na tabela correta baseado no transaction_type
  IF NEW.transaction_type = 'expense' THEN
    -- Para despesas, verificar se category_id existe em expense_categories
    IF NEW.category_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM expense_categories 
      WHERE id = NEW.category_id AND user_id = NEW.user_id
    ) THEN
      RAISE EXCEPTION 'Category ID % not found in expense_categories for user %', NEW.category_id, NEW.user_id;
    END IF;
  ELSIF NEW.transaction_type = 'revenue' THEN
    -- Para receitas, verificar se category_id existe em revenue_categories
    IF NEW.category_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM revenue_categories 
      WHERE id = NEW.category_id AND user_id = NEW.user_id
    ) THEN
      RAISE EXCEPTION 'Category ID % not found in revenue_categories for user %', NEW.category_id, NEW.user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Criar trigger para validação
CREATE TRIGGER validate_financial_transaction_category_trigger
  BEFORE INSERT OR UPDATE ON financial_transactions
  FOR EACH ROW
  EXECUTE FUNCTION validate_financial_transaction_category();

-- 5. Limpar transações com category_id inválidos (opcional)
-- Comentado para segurança - descomente se necessário
-- UPDATE financial_transactions 
-- SET category_id = NULL 
-- WHERE transaction_type = 'expense' 
--   AND category_id IS NOT NULL 
--   AND NOT EXISTS (
--     SELECT 1 FROM expense_categories 
--     WHERE id = financial_transactions.category_id 
--       AND user_id = financial_transactions.user_id
--   );

-- UPDATE financial_transactions 
-- SET category_id = NULL 
-- WHERE transaction_type = 'revenue' 
--   AND category_id IS NOT NULL 
--   AND NOT EXISTS (
--     SELECT 1 FROM revenue_categories 
--     WHERE id = financial_transactions.category_id 
--       AND user_id = financial_transactions.user_id
--   );

-- 6. Verificações finais
SELECT 'Constraints removidas e trigger recriado com sucesso!' as status;

-- Verificar se o usuário atual tem categorias
SELECT 
  'Expense Categories: ' || COUNT(*) as expense_count
FROM expense_categories 
WHERE user_id = auth.uid();

SELECT 
  'Revenue Categories: ' || COUNT(*) as revenue_count
FROM revenue_categories 
WHERE user_id = auth.uid();

SELECT 'Script executado com sucesso! Teste agora adicionar uma despesa.' as final_message;