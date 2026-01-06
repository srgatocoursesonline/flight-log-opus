-- ============================================
-- ADICIONAR NOVOS ITENS DE MANUTENÇÃO
-- Baseado nas imagens fornecidas pelo usuário
-- ============================================

-- Sistema de luzes - Itens adicionais
INSERT INTO maintenance_items (category_id, name, estimated_hours, estimated_cost, priority) 
SELECT id, 'Luzes da cabine', 1.0, 80.00, 'medium' FROM maintenance_categories WHERE name = 'Sistema de luzes'
UNION ALL
SELECT id, 'Luzes de pouso', 1.5, 120.00, 'high' FROM maintenance_categories WHERE name = 'Sistema de luzes'
UNION ALL
SELECT id, 'Luzes de logotipo', 0.5, 60.00, 'low' FROM maintenance_categories WHERE name = 'Sistema de luzes'
UNION ALL
SELECT id, 'Luzes de navegação', 1.0, 100.00, 'high' FROM maintenance_categories WHERE name = 'Sistema de luzes'
UNION ALL
SELECT id, 'Luzes do painel', 1.0, 90.00, 'medium' FROM maintenance_categories WHERE name = 'Sistema de luzes'
UNION ALL
SELECT id, 'Luzes de reconhecimento', 1.0, 85.00, 'medium' FROM maintenance_categories WHERE name = 'Sistema de luzes'
UNION ALL
SELECT id, 'Luzes estroboscópicas', 1.5, 150.00, 'high' FROM maintenance_categories WHERE name = 'Sistema de luzes'
UNION ALL
SELECT id, 'Luzes da asa', 1.0, 95.00, 'medium' FROM maintenance_categories WHERE name = 'Sistema de luzes';

-- Contato com solo - Itens adicionais
INSERT INTO maintenance_items (category_id, name, estimated_hours, estimated_cost, priority) 
SELECT id, 'Áudio', 1.0, 120.00, 'medium' FROM maintenance_categories WHERE name = 'Contato com solo'
UNION ALL
SELECT id, 'Rádio comunicador 1', 2.0, 300.00, 'high' FROM maintenance_categories WHERE name = 'Contato com solo'
UNION ALL
SELECT id, 'Rádio comunicador 2', 2.0, 300.00, 'high' FROM maintenance_categories WHERE name = 'Contato com solo'
UNION ALL
SELECT id, 'Marcador de farol', 1.5, 200.00, 'medium' FROM maintenance_categories WHERE name = 'Contato com solo'
UNION ALL
SELECT id, 'Rádio de navegação 1', 2.0, 350.00, 'high' FROM maintenance_categories WHERE name = 'Contato com solo'
UNION ALL
SELECT id, 'Rádio de navegação 2', 2.0, 350.00, 'high' FROM maintenance_categories WHERE name = 'Contato com solo'
UNION ALL
SELECT id, 'Rádio de navegação 3', 2.0, 350.00, 'high' FROM maintenance_categories WHERE name = 'Contato com solo';

-- Motor - Itens adicionais
INSERT INTO maintenance_items (category_id, name, estimated_hours, estimated_cost, priority) 
SELECT id, 'Quantidade de óleo', 0.5, 50.00, 'high' FROM maintenance_categories WHERE name = 'Motor'
UNION ALL
SELECT id, 'Tanque de óleo', 2.0, 200.00, 'high' FROM maintenance_categories WHERE name = 'Motor'
UNION ALL
SELECT id, 'Motor de turbina', 4.0, 800.00, 'critical' FROM maintenance_categories WHERE name = 'Motor';

-- Verificar se os itens foram inseridos
SELECT 
    mc.name as categoria,
    mi.name as item,
    mi.estimated_hours as horas_estimadas,
    mi.estimated_cost as custo_estimado,
    mi.priority as prioridade
FROM maintenance_items mi
JOIN maintenance_categories mc ON mi.category_id = mc.id
WHERE mc.name IN ('Sistema de luzes', 'Contato com solo', 'Motor')
ORDER BY mc.name, mi.name;

COMMIT;