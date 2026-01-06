-- =====================================================
-- Script: 13_recreate_financial_transactions_table.sql
-- Descrição: Recria a tabela financial_transactions
-- Autor: Sistema de Migração
-- Data: 2025-01-22
-- =====================================================

-- IMPORTANTE: Execute APÓS criar as tabelas profiles, expense_categories e revenue_categories

-- Habilitar extensão UUID se não estiver habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Remover tabela existente se houver
DROP TABLE IF EXISTS financial_transactions CASCADE;

-- Criar tabela financial_transactions
CREATE TABLE financial_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    transaction_type VARCHAR(10) NOT NULL CHECK (transaction_type IN ('revenue', 'expense')),
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    category_id UUID,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints para garantir integridade referencial
    CONSTRAINT fk_financial_transactions_revenue_category 
        FOREIGN KEY (category_id) 
        REFERENCES revenue_categories(id) 
        ON DELETE SET NULL
        DEFERRABLE INITIALLY DEFERRED,
    
    CONSTRAINT fk_financial_transactions_expense_category 
        FOREIGN KEY (category_id) 
        REFERENCES expense_categories(id) 
        ON DELETE SET NULL
        DEFERRABLE INITIALLY DEFERRED
        
    -- Nota: A validação de category_id baseada no tipo será feita via trigger
    -- pois PostgreSQL não permite subqueries em CHECK constraints
);

-- Comentários na tabela e colunas
COMMENT ON TABLE financial_transactions IS 'Tabela para armazenar todas as transações financeiras (receitas e despesas)';
COMMENT ON COLUMN financial_transactions.id IS 'Identificador único da transação';
COMMENT ON COLUMN financial_transactions.user_id IS 'Referência ao usuário proprietário da transação';
COMMENT ON COLUMN financial_transactions.transaction_type IS 'Tipo da transação: revenue (receita) ou expense (despesa)';
COMMENT ON COLUMN financial_transactions.description IS 'Descrição da transação';
COMMENT ON COLUMN financial_transactions.amount IS 'Valor da transação (sempre positivo)';
COMMENT ON COLUMN financial_transactions.category_id IS 'Referência à categoria (revenue_categories ou expense_categories)';
COMMENT ON COLUMN financial_transactions.transaction_date IS 'Data da transação';
COMMENT ON COLUMN financial_transactions.created_at IS 'Data de criação do registro';
COMMENT ON COLUMN financial_transactions.updated_at IS 'Data da última atualização do registro';

-- Criar índices para otimização
CREATE INDEX idx_financial_transactions_user_id ON financial_transactions(user_id);
CREATE INDEX idx_financial_transactions_type ON financial_transactions(transaction_type);
CREATE INDEX idx_financial_transactions_date ON financial_transactions(transaction_date);
CREATE INDEX idx_financial_transactions_category ON financial_transactions(category_id);
CREATE INDEX idx_financial_transactions_user_type ON financial_transactions(user_id, transaction_type);
CREATE INDEX idx_financial_transactions_user_date ON financial_transactions(user_id, transaction_date DESC);

-- Habilitar Row Level Security (RLS)
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;

-- Política para SELECT: usuários só podem ver suas próprias transações
CREATE POLICY "Users can view own financial transactions" ON financial_transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Política para INSERT: usuários só podem inserir transações para si mesmos
CREATE POLICY "Users can insert own financial transactions" ON financial_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para UPDATE: usuários só podem atualizar suas próprias transações
CREATE POLICY "Users can update own financial transactions" ON financial_transactions
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Política para DELETE: usuários só podem deletar suas próprias transações
CREATE POLICY "Users can delete own financial transactions" ON financial_transactions
    FOR DELETE USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_financial_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_financial_transactions_updated_at
    BEFORE UPDATE ON financial_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_financial_transactions_updated_at();

-- Trigger para validar category_id baseado no transaction_type
CREATE OR REPLACE FUNCTION validate_financial_transaction_category()
RETURNS TRIGGER AS $$
BEGIN
    -- Se category_id é NULL, permitir (opcional)
    IF NEW.category_id IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Validar se category_id existe na tabela correta baseado no tipo
    IF NEW.transaction_type = 'revenue' THEN
        IF NOT EXISTS (SELECT 1 FROM revenue_categories WHERE id = NEW.category_id) THEN
            RAISE EXCEPTION 'Category ID % não existe em revenue_categories para transaction_type revenue', NEW.category_id;
        END IF;
    ELSIF NEW.transaction_type = 'expense' THEN
        IF NOT EXISTS (SELECT 1 FROM expense_categories WHERE id = NEW.category_id) THEN
            RAISE EXCEPTION 'Category ID % não existe em expense_categories para transaction_type expense', NEW.category_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_financial_transaction_category
    BEFORE INSERT OR UPDATE ON financial_transactions
    FOR EACH ROW
    EXECUTE FUNCTION validate_financial_transaction_category();

-- Inserir algumas transações de exemplo para usuários existentes (opcional)
-- Nota: Estas transações serão inseridas apenas se existirem usuários na tabela profiles
INSERT INTO financial_transactions (user_id, transaction_type, description, amount, transaction_date)
SELECT 
    p.id,
    'revenue',
    'Receita inicial de exemplo',
    1000.00,
    CURRENT_DATE - INTERVAL '30 days'
FROM profiles p
WHERE NOT EXISTS (
    SELECT 1 FROM financial_transactions ft 
    WHERE ft.user_id = p.id AND ft.description = 'Receita inicial de exemplo'
);

INSERT INTO financial_transactions (user_id, transaction_type, description, amount, transaction_date)
SELECT 
    p.id,
    'expense',
    'Despesa inicial de exemplo',
    250.00,
    CURRENT_DATE - INTERVAL '25 days'
FROM profiles p
WHERE NOT EXISTS (
    SELECT 1 FROM financial_transactions ft 
    WHERE ft.user_id = p.id AND ft.description = 'Despesa inicial de exemplo'
);

-- Verificar se a tabela foi criada corretamente
SELECT 
    'financial_transactions' as table_name,
    COUNT(*) as record_count,
    'Tabela criada com sucesso!' as status
FROM financial_transactions;

-- Verificar estrutura da tabela (comando psql)
-- \d financial_transactions;

-- Mensagem de sucesso
SELECT 'Script 13_recreate_financial_transactions_table.sql executado com sucesso!' as message;