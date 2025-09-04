-- ============================================
-- DEBUG: Testar consulta de manutenção
-- ============================================

-- Verificar se as tabelas existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'maintenance_%';

-- Verificar estrutura das tabelas
\d maintenance_categories;
\d maintenance_items;
\d maintenance_records;
\d maintenance_record_items;

-- Testar consulta simples
SELECT COUNT(*) FROM maintenance_categories;
SELECT COUNT(*) FROM maintenance_items;
SELECT COUNT(*) FROM maintenance_records;
SELECT COUNT(*) FROM maintenance_record_items;

-- Testar a consulta que está falhando (versão simplificada)
SELECT 
    mr.*
FROM maintenance_records mr
WHERE mr.profile_id = 'd5b91265-0e4e-4206-af18-7f0e9f61d8ab'
ORDER BY mr.maintenance_date DESC;

-- Testar com JOIN simples
SELECT 
    mr.*,
    mri.id as item_id
FROM maintenance_records mr
LEFT JOIN maintenance_record_items mri ON mr.id = mri.maintenance_record_id
WHERE mr.profile_id = 'd5b91265-0e4e-4206-af18-7f0e9f61d8ab'
ORDER BY mr.maintenance_date DESC;

-- Testar consulta completa (igual ao hook)
SELECT 
    mr.*,
    json_agg(
        json_build_object(
            'id', mri.id,
            'status', mri.status,
            'actual_hours', mri.actual_hours,
            'actual_cost', mri.actual_cost,
            'notes', mri.notes,
            'completed_at', mri.completed_at,
            'maintenance_item', json_build_object(
                'id', mi.id,
                'name', mi.name,
                'description', mi.description,
                'estimated_hours', mi.estimated_hours,
                'estimated_cost', mi.estimated_cost,
                'priority', mi.priority,
                'category', json_build_object(
                    'id', mc.id,
                    'name', mc.name,
                    'icon', mc.icon,
                    'color', mc.color,
                    'description', mc.description
                )
            )
        )
    ) FILTER (WHERE mri.id IS NOT NULL) as items
FROM maintenance_records mr
LEFT JOIN maintenance_record_items mri ON mr.id = mri.maintenance_record_id
LEFT JOIN maintenance_items mi ON mri.maintenance_item_id = mi.id
LEFT JOIN maintenance_categories mc ON mi.category_id = mc.id
WHERE mr.profile_id = 'd5b91265-0e4e-4206-af18-7f0e9f61d8ab'
GROUP BY mr.id
ORDER BY mr.maintenance_date DESC;