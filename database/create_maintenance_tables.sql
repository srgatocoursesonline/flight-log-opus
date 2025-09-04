-- ============================================
-- SISTEMA DE MANUTENÇÃO - TABELAS SUPABASE
-- ============================================

-- Tabela de categorias de manutenção
CREATE TABLE IF NOT EXISTS maintenance_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    color VARCHAR(20) NOT NULL DEFAULT '#6B7280',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de itens de manutenção por categoria
CREATE TABLE IF NOT EXISTS maintenance_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID NOT NULL REFERENCES maintenance_categories(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    estimated_hours DECIMAL(4,2) DEFAULT 0,
    estimated_cost DECIMAL(10,2) DEFAULT 0,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de registros de manutenção
CREATE TABLE IF NOT EXISTS maintenance_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    aircraft_registration VARCHAR(20) NOT NULL,
    aircraft_model VARCHAR(100),
    maintenance_date DATE NOT NULL,
    mechanic_name VARCHAR(200),
    mechanic_license VARCHAR(100),
    location VARCHAR(200),
    total_hours DECIMAL(6,2) DEFAULT 0,
    total_cost DECIMAL(12,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    notes TEXT,
    next_maintenance_date DATE,
    next_maintenance_hours DECIMAL(8,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de itens executados em cada manutenção
CREATE TABLE IF NOT EXISTS maintenance_record_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    maintenance_record_id UUID NOT NULL REFERENCES maintenance_records(id) ON DELETE CASCADE,
    maintenance_item_id UUID NOT NULL REFERENCES maintenance_items(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'skipped', 'failed')),
    actual_hours DECIMAL(4,2) DEFAULT 0,
    actual_cost DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_maintenance_items_category ON maintenance_items(category_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_records_profile ON maintenance_records(profile_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_records_aircraft ON maintenance_records(aircraft_registration);
CREATE INDEX IF NOT EXISTS idx_maintenance_records_date ON maintenance_records(maintenance_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_record_items_record ON maintenance_record_items(maintenance_record_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_record_items_item ON maintenance_record_items(maintenance_item_id);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_maintenance_categories_updated_at BEFORE UPDATE ON maintenance_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_maintenance_items_updated_at BEFORE UPDATE ON maintenance_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_maintenance_records_updated_at BEFORE UPDATE ON maintenance_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_maintenance_record_items_updated_at BEFORE UPDATE ON maintenance_record_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security)
ALTER TABLE maintenance_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_record_items ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
-- Categorias e itens são públicos para leitura
CREATE POLICY "Categorias são públicas para leitura" ON maintenance_categories FOR SELECT USING (true);
CREATE POLICY "Itens são públicos para leitura" ON maintenance_items FOR SELECT USING (true);

-- Registros de manutenção são privados por usuário
CREATE POLICY "Usuários podem ver seus próprios registros" ON maintenance_records FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Usuários podem inserir seus próprios registros" ON maintenance_records FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "Usuários podem atualizar seus próprios registros" ON maintenance_records FOR UPDATE USING (auth.uid() = profile_id);
CREATE POLICY "Usuários podem deletar seus próprios registros" ON maintenance_records FOR DELETE USING (auth.uid() = profile_id);

-- Itens de registro seguem a mesma regra através do relacionamento
CREATE POLICY "Usuários podem ver itens de seus registros" ON maintenance_record_items FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM maintenance_records mr 
        WHERE mr.id = maintenance_record_id AND mr.profile_id = auth.uid()
    )
);
CREATE POLICY "Usuários podem inserir itens em seus registros" ON maintenance_record_items FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM maintenance_records mr 
        WHERE mr.id = maintenance_record_id AND mr.profile_id = auth.uid()
    )
);
CREATE POLICY "Usuários podem atualizar itens de seus registros" ON maintenance_record_items FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM maintenance_records mr 
        WHERE mr.id = maintenance_record_id AND mr.profile_id = auth.uid()
    )
);
CREATE POLICY "Usuários podem deletar itens de seus registros" ON maintenance_record_items FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM maintenance_records mr 
        WHERE mr.id = maintenance_record_id AND mr.profile_id = auth.uid()
    )
);

-- Inserir dados iniciais das categorias
INSERT INTO maintenance_categories (name, icon, color, description) VALUES
('Controles de voo', 'Settings', '#3B82F6', 'Verificações dos sistemas de controle de voo da aeronave'),
('Sistema de combustível', 'Fuel', '#10B981', 'Inspeções do sistema de combustível e tanques'),
('Sistema elétrico', 'Zap', '#F59E0B', 'Verificações do sistema elétrico e eletrônico'),
('Trem de pouso', 'Plane', '#EF4444', 'Inspeções do trem de pouso e sistemas relacionados'),
('Geral', 'Wrench', '#6B7280', 'Verificações gerais da aeronave'),
('Sistema de luzes', 'Lightbulb', '#8B5CF6', 'Inspeções do sistema de iluminação'),
('Contato com solo', 'Radio', '#06B6D4', 'Verificações de comunicação e navegação'),
('Motor', 'Cog', '#DC2626', 'Inspeções do motor e sistemas de propulsão')
ON CONFLICT DO NOTHING;

-- Inserir itens de manutenção para cada categoria
-- Controles de voo
INSERT INTO maintenance_items (category_id, name, estimated_hours, estimated_cost, priority) 
SELECT id, 'Aileron (esquerdo)', 2.0, 150.00, 'high' FROM maintenance_categories WHERE name = 'Controles de voo'
UNION ALL
SELECT id, 'Aileron (direito)', 2.0, 150.00, 'high' FROM maintenance_categories WHERE name = 'Controles de voo'
UNION ALL
SELECT id, 'Comando de aileron (Stick)', 1.5, 100.00, 'high' FROM maintenance_categories WHERE name = 'Controles de voo'
UNION ALL
SELECT id, 'Superfície do profundor', 2.5, 200.00, 'high' FROM maintenance_categories WHERE name = 'Controles de voo'
UNION ALL
SELECT id, 'Controle do profundor', 2.0, 150.00, 'high' FROM maintenance_categories WHERE name = 'Controles de voo'
UNION ALL
SELECT id, 'Comando de flaps esquerdo', 1.5, 120.00, 'medium' FROM maintenance_categories WHERE name = 'Controles de voo'
UNION ALL
SELECT id, 'Comando de flaps direito', 1.5, 120.00, 'medium' FROM maintenance_categories WHERE name = 'Controles de voo'
UNION ALL
SELECT id, 'Controle de flaps esquerdo', 1.0, 80.00, 'medium' FROM maintenance_categories WHERE name = 'Controles de voo'
UNION ALL
SELECT id, 'Controle do leme direcional', 2.0, 180.00, 'high' FROM maintenance_categories WHERE name = 'Controles de voo'
UNION ALL
SELECT id, 'Controle do leme direcional', 1.5, 130.00, 'high' FROM maintenance_categories WHERE name = 'Controles de voo';

-- Sistema de combustível
INSERT INTO maintenance_items (category_id, name, estimated_hours, estimated_cost, priority) 
SELECT id, 'Tanque de combustível 1', 3.0, 250.00, 'high' FROM maintenance_categories WHERE name = 'Sistema de combustível'
UNION ALL
SELECT id, 'Tanque de combustível 2', 3.0, 250.00, 'high' FROM maintenance_categories WHERE name = 'Sistema de combustível';

-- Sistema elétrico
INSERT INTO maintenance_items (category_id, name, estimated_hours, estimated_cost, priority) 
SELECT id, 'Alternador', 2.5, 300.00, 'high' FROM maintenance_categories WHERE name = 'Sistema elétrico'
UNION ALL
SELECT id, 'Bateria auxiliar', 1.5, 200.00, 'medium' FROM maintenance_categories WHERE name = 'Sistema elétrico'
UNION ALL
SELECT id, 'Bateria de bordo', 1.5, 200.00, 'high' FROM maintenance_categories WHERE name = 'Sistema elétrico'
UNION ALL
SELECT id, 'ADC AHRS', 2.0, 400.00, 'high' FROM maintenance_categories WHERE name = 'Sistema elétrico'
UNION ALL
SELECT id, 'Indicador de combustível', 1.0, 150.00, 'medium' FROM maintenance_categories WHERE name = 'Sistema elétrico'
UNION ALL
SELECT id, 'Antenas', 1.5, 100.00, 'medium' FROM maintenance_categories WHERE name = 'Sistema elétrico'
UNION ALL
SELECT id, 'Funcionamento da bomba de combustível', 2.0, 250.00, 'high' FROM maintenance_categories WHERE name = 'Sistema elétrico'
UNION ALL
SELECT id, 'Válvula de combustível', 1.5, 180.00, 'high' FROM maintenance_categories WHERE name = 'Sistema elétrico'
UNION ALL
SELECT id, 'Funcionamento da bomba de combustível', 2.0, 250.00, 'high' FROM maintenance_categories WHERE name = 'Sistema elétrico'
UNION ALL
SELECT id, 'Caixa', 1.0, 80.00, 'low' FROM maintenance_categories WHERE name = 'Sistema elétrico'
UNION ALL
SELECT id, 'Geral', 2.0, 150.00, 'medium' FROM maintenance_categories WHERE name = 'Sistema elétrico'
UNION ALL
SELECT id, 'Funcionamento', 1.5, 120.00, 'medium' FROM maintenance_categories WHERE name = 'Sistema elétrico'
UNION ALL
SELECT id, 'Fios do Pitot Principal', 1.0, 100.00, 'medium' FROM maintenance_categories WHERE name = 'Sistema elétrico'
UNION ALL
SELECT id, 'Fios do Pitot Auxiliar', 1.0, 100.00, 'low' FROM maintenance_categories WHERE name = 'Sistema elétrico';

-- Trem de pouso
INSERT INTO maintenance_items (category_id, name, estimated_hours, estimated_cost, priority) 
SELECT id, 'Freio 1', 2.0, 200.00, 'high' FROM maintenance_categories WHERE name = 'Trem de pouso'
UNION ALL
SELECT id, 'Freio 2', 2.0, 200.00, 'high' FROM maintenance_categories WHERE name = 'Trem de pouso'
UNION ALL
SELECT id, 'Trem de pouso 1', 3.0, 350.00, 'high' FROM maintenance_categories WHERE name = 'Trem de pouso'
UNION ALL
SELECT id, 'Trem de pouso 2', 3.0, 350.00, 'high' FROM maintenance_categories WHERE name = 'Trem de pouso'
UNION ALL
SELECT id, 'Trem de pouso 3', 3.0, 350.00, 'high' FROM maintenance_categories WHERE name = 'Trem de pouso'
UNION ALL
SELECT id, 'Pneu 1', 1.5, 120.00, 'medium' FROM maintenance_categories WHERE name = 'Trem de pouso'
UNION ALL
SELECT id, 'Pneu 2', 1.5, 120.00, 'medium' FROM maintenance_categories WHERE name = 'Trem de pouso'
UNION ALL
SELECT id, 'Pressão dos pneus 1', 0.5, 30.00, 'medium' FROM maintenance_categories WHERE name = 'Trem de pouso'
UNION ALL
SELECT id, 'Pressão dos pneus 2', 0.5, 30.00, 'medium' FROM maintenance_categories WHERE name = 'Trem de pouso'
UNION ALL
SELECT id, 'Pressão dos pneus 3', 0.5, 30.00, 'medium' FROM maintenance_categories WHERE name = 'Trem de pouso';

COMMIT;