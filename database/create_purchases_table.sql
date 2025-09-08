-- ============================================
-- TABELA DE COMPRAS (PURCHASES) - NOVA
-- ============================================
-- Execute este script no painel SQL do Supabase
-- Esta tabela armazena compras específicas com detalhes adicionais

CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  purchase_code TEXT NOT NULL UNIQUE, -- Formato C-001, C-002, etc.
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Aeronave', 'Combustível', 'Equipamentos', 'Suprimentos')),
  subcategory TEXT NOT NULL,
  budgeted_value NUMERIC DEFAULT 0,
  negotiated_value NUMERIC DEFAULT 0,
  final_value NUMERIC NOT NULL,
  purchase_date DATE NOT NULL,
  buyer TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_code ON purchases(purchase_code);
CREATE INDEX IF NOT EXISTS idx_purchases_date ON purchases(purchase_date);

-- Ativar RLS (Row Level Security)
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Política de segurança - usuários só podem ver suas próprias compras
CREATE POLICY purchases_policy ON purchases 
  FOR ALL USING (auth.uid() = user_id);

-- Função para gerar código de compra automático (C-001, C-002, etc.)
CREATE OR REPLACE FUNCTION generate_purchase_code(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  next_number INTEGER;
  new_code TEXT;
BEGIN
  -- Buscar o próximo número sequencial para o usuário
  SELECT COALESCE(MAX(CAST(SUBSTRING(purchase_code FROM 3) AS INTEGER)), 0) + 1
  INTO next_number
  FROM purchases 
  WHERE user_id = $1;
  
  -- Gerar o novo código no formato C-XXX
  new_code := 'C-' || LPAD(next_number::TEXT, 3, '0');
  
  RETURN new_code;
END;
$$;

-- Inserir dados de exemplo (apenas para demonstração)
-- Remova ou comente estas linhas em produção
/*
INSERT INTO purchases (
  user_id, purchase_code, title, category, subcategory, 
  budgeted_value, negotiated_value, final_value, 
  purchase_date, buyer, notes, status
) VALUES (
  (SELECT id FROM profiles LIMIT 1),
  'C-001',
  'Compra de Combustível - Voo SP-RJ',
  'Combustível',
  'AVGAS 100LL',
  1500.00,
  1450.00,
  1450.00,
  '2024-01-15',
  'Rodrigo Santos',
  'Combustível para voo particular',
  'completed'
);
*/