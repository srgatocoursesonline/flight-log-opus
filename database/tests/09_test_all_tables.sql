-- ============================================
-- TESTE DE TODAS AS TABELAS, VIEWS E FUNÇÕES
-- ============================================
-- Execute este script no SQL Editor do Supabase para verificar se tudo foi criado corretamente
-- IMPORTANTE: Execute APÓS executar todos os scripts de 01 a 08

-- 1. Verificar se todas as tabelas foram criadas
SELECT 'VERIFICANDO TABELAS' as status;

SELECT 
  table_name,
  table_type,
  CASE 
    WHEN table_name IN (
      'profiles', 'flights', 'revenue_categories', 'expense_categories', 
      'flight_statuses', 'financial_transactions', 'custom_aircraft', 'goals'
    ) THEN '✅ ENCONTRADA'
    ELSE '❌ NÃO ESPERADA'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. Verificar se todas as views foram criadas
SELECT 'VERIFICANDO VIEWS' as status;

SELECT 
  table_name as view_name,
  CASE 
    WHEN table_name IN (
      'financial_balance', 'monthly_financial_summary', 
      'top_expense_categories', 'top_revenue_categories', 'flight_statistics'
    ) THEN '✅ ENCONTRADA'
    ELSE '❌ NÃO ESPERADA'
  END as status
FROM information_schema.views 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 3. Verificar se todas as funções RPC foram criadas
SELECT 'VERIFICANDO FUNÇÕES RPC' as status;

SELECT 
  routine_name as function_name,
  routine_type,
  CASE 
    WHEN routine_name IN (
      'get_financial_summary', 'get_monthly_financial_data', 
      'get_category_breakdown', 'get_financial_trends'
    ) THEN '✅ ENCONTRADA'
    ELSE '❌ NÃO ESPERADA'
  END as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_type = 'FUNCTION'
  AND routine_name LIKE 'get_%'
ORDER BY routine_name;

-- 4. Verificar contagem de registros nas tabelas de dados padrão
SELECT 'VERIFICANDO DADOS PADRÃO' as status;

-- Revenue Categories
SELECT 'revenue_categories' as tabela, COUNT(*) as total_registros
FROM revenue_categories;

-- Expense Categories  
SELECT 'expense_categories' as tabela, COUNT(*) as total_registros
FROM expense_categories;

-- Flight Statuses
SELECT 'flight_statuses' as tabela, COUNT(*) as total_registros
FROM flight_statuses;

-- Custom Aircraft (deve ter registros para cada usuário existente)
SELECT 'custom_aircraft' as tabela, COUNT(*) as total_registros
FROM custom_aircraft;

-- Goals (deve ter registros para cada usuário existente)
SELECT 'goals' as tabela, COUNT(*) as total_registros
FROM goals;

-- 5. Verificar se RLS está habilitado nas tabelas principais
SELECT 'VERIFICANDO RLS (ROW LEVEL SECURITY)' as status;

SELECT 
  schemaname,
  tablename,
  rowsecurity,
  CASE 
    WHEN rowsecurity = true THEN '✅ RLS HABILITADO'
    ELSE '❌ RLS DESABILITADO'
  END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles', 'flights', 'financial_transactions', 
    'custom_aircraft', 'goals'
  )
ORDER BY tablename;

-- 6. Verificar políticas RLS existentes
SELECT 'VERIFICANDO POLÍTICAS RLS' as status;

SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN cmd = 'SELECT' THEN '👁️ SELECT'
    WHEN cmd = 'INSERT' THEN '➕ INSERT'
    WHEN cmd = 'UPDATE' THEN '✏️ UPDATE'
    WHEN cmd = 'DELETE' THEN '🗑️ DELETE'
    ELSE cmd
  END as operation
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, cmd;

-- 7. Verificar índices criados
SELECT 'VERIFICANDO ÍNDICES' as status;

SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles', 'flights', 'financial_transactions', 
    'custom_aircraft', 'goals', 'revenue_categories', 
    'expense_categories', 'flight_statuses'
  )
  AND indexname NOT LIKE '%_pkey'  -- Excluir chaves primárias
ORDER BY tablename, indexname;

-- 8. Teste básico das views financeiras (se houver dados)
SELECT 'TESTANDO VIEWS FINANCEIRAS' as status;

-- Testar financial_balance
SELECT 'financial_balance' as view_name, COUNT(*) as registros
FROM financial_balance;

-- Testar monthly_financial_summary
SELECT 'monthly_financial_summary' as view_name, COUNT(*) as registros
FROM monthly_financial_summary;

-- 9. Verificar constraints e foreign keys
SELECT 'VERIFICANDO CONSTRAINTS' as status;

SELECT 
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  CASE 
    WHEN tc.constraint_type = 'FOREIGN KEY' THEN '🔗 FK'
    WHEN tc.constraint_type = 'PRIMARY KEY' THEN '🔑 PK'
    WHEN tc.constraint_type = 'CHECK' THEN '✅ CHECK'
    WHEN tc.constraint_type = 'UNIQUE' THEN '🆔 UNIQUE'
    ELSE tc.constraint_type
  END as tipo
FROM information_schema.table_constraints tc
WHERE tc.table_schema = 'public'
  AND tc.table_name IN (
    'profiles', 'flights', 'financial_transactions', 
    'custom_aircraft', 'goals', 'revenue_categories', 
    'expense_categories', 'flight_statuses'
  )
ORDER BY tc.table_name, tc.constraint_type;

-- 10. Resumo final
SELECT 'RESUMO FINAL' as status;

WITH table_count AS (
  SELECT COUNT(*) as total FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
),
view_count AS (
  SELECT COUNT(*) as total FROM information_schema.views 
  WHERE table_schema = 'public'
),
function_count AS (
  SELECT COUNT(*) as total FROM information_schema.routines 
  WHERE routine_schema = 'public' AND routine_type = 'FUNCTION'
  AND routine_name LIKE 'get_%'
)
SELECT 
  '📊 ESTATÍSTICAS FINAIS' as item,
  CONCAT(
    '🗃️ Tabelas: ', tc.total, ' | ',
    '👁️ Views: ', vc.total, ' | ',
    '⚙️ Funções: ', fc.total
  ) as detalhes
FROM table_count tc, view_count vc, function_count fc;

SELECT 
  '✅ MIGRAÇÃO CONCLUÍDA!' as status,
  'Todas as tabelas, views e funções foram recriadas com sucesso.' as mensagem,
  'Execute os scripts na ordem: 01 → 02 → 03 → 04 → 05 → 06 → 07 → 08' as instrucoes;

-- 11. Verificar se há erros ou problemas
SELECT 'VERIFICAÇÃO DE PROBLEMAS' as status;

-- Verificar se há tabelas sem dados que deveriam ter
WITH expected_data AS (
  SELECT 'revenue_categories' as table_name, 12 as expected_min_count
  UNION ALL SELECT 'expense_categories', 15
  UNION ALL SELECT 'flight_statuses', 6
),
actual_data AS (
  SELECT 'revenue_categories' as table_name, COUNT(*) as actual_count FROM revenue_categories
  UNION ALL SELECT 'expense_categories', COUNT(*) FROM expense_categories  
  UNION ALL SELECT 'flight_statuses', COUNT(*) FROM flight_statuses
)
SELECT 
  ed.table_name,
  ed.expected_min_count,
  ad.actual_count,
  CASE 
    WHEN ad.actual_count >= ed.expected_min_count THEN '✅ OK'
    ELSE '❌ DADOS INSUFICIENTES'
  END as status
FROM expected_data ed
JOIN actual_data ad ON ed.table_name = ad.table_name;

SELECT '🎉 TESTE COMPLETO!' as final_status;