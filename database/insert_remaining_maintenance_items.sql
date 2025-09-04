-- ============================================
-- INSERIR ITENS RESTANTES DE MANUTENÇÃO
-- ============================================

-- Categoria: Geral
INSERT INTO maintenance_items (category_id, name, estimated_hours, estimated_cost, priority) 
SELECT id, 'Atenção (suspensão)', 1.5, 100.00, 'medium' FROM maintenance_categories WHERE name = 'Geral'
UNION ALL
SELECT id, 'Controle da suspensão (Stick)', 1.0, 80.00, 'medium' FROM maintenance_categories WHERE name = 'Geral'
UNION ALL
SELECT id, 'Controle da suspensão (Stick)', 1.0, 80.00, 'medium' FROM maintenance_categories WHERE name = 'Geral'
UNION ALL
SELECT id, 'Superfície do profundor', 2.0, 150.00, 'high' FROM maintenance_categories WHERE name = 'Geral'
UNION ALL
SELECT id, 'Controle da suspensão (Stick)', 1.0, 80.00, 'medium' FROM maintenance_categories WHERE name = 'Geral'
UNION ALL
SELECT id, 'Console de flaps esquerdo', 1.5, 120.00, 'medium' FROM maintenance_categories WHERE name = 'Geral'
UNION ALL
SELECT id, 'Console de flaps direito', 1.5, 120.00, 'medium' FROM maintenance_categories WHERE name = 'Geral'
UNION ALL
SELECT id, 'Console de flaps direito', 1.5, 120.00, 'medium' FROM maintenance_categories WHERE name = 'Geral'
UNION ALL
SELECT id, 'Console de flaps esquerdo', 1.5, 120.00, 'medium' FROM maintenance_categories WHERE name = 'Geral'
UNION ALL
SELECT id, 'Console de flaps direito', 1.5, 120.00, 'medium' FROM maintenance_categories WHERE name = 'Geral'
UNION ALL
SELECT id, 'Console do leme direcional', 1.5, 130.00, 'high' FROM maintenance_categories WHERE name = 'Geral'
UNION ALL
SELECT id, 'Console do leme direcional', 1.5, 130.00, 'high' FROM maintenance_categories WHERE name = 'Geral';

-- Categoria: Sistema de luzes
INSERT INTO maintenance_items (category_id, name, estimated_hours, estimated_cost, priority) 
SELECT id, 'Farol de navegação', 1.0, 80.00, 'medium' FROM maintenance_categories WHERE name = 'Sistema de luzes'
UNION ALL
SELECT id, 'Luz de posição', 1.0, 60.00, 'medium' FROM maintenance_categories WHERE name = 'Sistema de luzes'
UNION ALL
SELECT id, 'Luz estroboscópica', 1.0, 90.00, 'medium' FROM maintenance_categories WHERE name = 'Sistema de luzes'
UNION ALL
SELECT id, 'Luz de pouso', 1.5, 120.00, 'high' FROM maintenance_categories WHERE name = 'Sistema de luzes'
UNION ALL
SELECT id, 'Luz de táxi', 1.0, 70.00, 'medium' FROM maintenance_categories WHERE name = 'Sistema de luzes'
UNION ALL
SELECT id, 'Iluminação do painel', 1.0, 100.00, 'low' FROM maintenance_categories WHERE name = 'Sistema de luzes'
UNION ALL
SELECT id, 'Luz de cabine', 0.5, 40.00, 'low' FROM maintenance_categories WHERE name = 'Sistema de luzes';

-- Categoria: Contato com solo
INSERT INTO maintenance_items (category_id, name, estimated_hours, estimated_cost, priority) 
SELECT id, 'Rádio VHF', 2.0, 200.00, 'high' FROM maintenance_categories WHERE name = 'Contato com solo'
UNION ALL
SELECT id, 'Transponder', 1.5, 150.00, 'high' FROM maintenance_categories WHERE name = 'Contato com solo'
UNION ALL
SELECT id, 'GPS/NAV', 2.0, 300.00, 'high' FROM maintenance_categories WHERE name = 'Contato com solo'
UNION ALL
SELECT id, 'Sistema de comunicação', 1.5, 180.00, 'high' FROM maintenance_categories WHERE name = 'Contato com solo'
UNION ALL
SELECT id, 'Antena de comunicação', 1.0, 100.00, 'medium' FROM maintenance_categories WHERE name = 'Contato com solo'
UNION ALL
SELECT id, 'Sistema de navegação', 2.0, 250.00, 'high' FROM maintenance_categories WHERE name = 'Contato com solo';

-- Categoria: Motor
INSERT INTO maintenance_items (category_id, name, estimated_hours, estimated_cost, priority) 
SELECT id, 'Inspeção geral do motor', 4.0, 500.00, 'critical' FROM maintenance_categories WHERE name = 'Motor'
UNION ALL
SELECT id, 'Troca de óleo', 1.0, 80.00, 'high' FROM maintenance_categories WHERE name = 'Motor'
UNION ALL
SELECT id, 'Filtro de óleo', 0.5, 40.00, 'high' FROM maintenance_categories WHERE name = 'Motor'
UNION ALL
SELECT id, 'Velas de ignição', 2.0, 200.00, 'high' FROM maintenance_categories WHERE name = 'Motor'
UNION ALL
SELECT id, 'Sistema de ignição', 2.5, 300.00, 'high' FROM maintenance_categories WHERE name = 'Motor'
UNION ALL
SELECT id, 'Sistema de arrefecimento', 2.0, 250.00, 'high' FROM maintenance_categories WHERE name = 'Motor'
UNION ALL
SELECT id, 'Hélice', 3.0, 400.00, 'critical' FROM maintenance_categories WHERE name = 'Motor'
UNION ALL
SELECT id, 'Sistema de admissão', 1.5, 150.00, 'medium' FROM maintenance_categories WHERE name = 'Motor'
UNION ALL
SELECT id, 'Sistema de escape', 2.0, 200.00, 'high' FROM maintenance_categories WHERE name = 'Motor'
UNION ALL
SELECT id, 'Carburador/Injeção', 3.0, 350.00, 'high' FROM maintenance_categories WHERE name = 'Motor'
UNION ALL
SELECT id, 'Magnetos', 2.0, 250.00, 'high' FROM maintenance_categories WHERE name = 'Motor'
UNION ALL
SELECT id, 'Bomba de combustível mecânica', 1.5, 180.00, 'high' FROM maintenance_categories WHERE name = 'Motor'
UNION ALL
SELECT id, 'Filtro de ar', 0.5, 30.00, 'medium' FROM maintenance_categories WHERE name = 'Motor'
UNION ALL
SELECT id, 'Correias e mangueiras', 1.0, 100.00, 'medium' FROM maintenance_categories WHERE name = 'Motor';

COMMIT;