-- ============================================
-- RECRIAR VIEWS E FUNÇÕES FINANCEIRAS
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- IMPORTANTE: Execute APÓS criar as tabelas financial_transactions, flights e profiles

-- 1. Recriar View para Estatísticas de Voo
CREATE OR REPLACE VIEW flight_statistics AS
SELECT
  user_id,
  COUNT(*) AS total_flights,
  COUNT(*) FILTER (WHERE status = 'completed') AS completed_flights,
  SUM(career_rating) AS total_career_rating,
  SUM(distance) AS total_distance,
  CASE 
    WHEN COUNT(*) > 0 THEN SUM(career_rating) / COUNT(*) 
    ELSE 0 
  END AS avg_career_rating
FROM flights
GROUP BY user_id;

-- 2. Recriar View para Balanço Financeiro
CREATE OR REPLACE VIEW financial_balance AS
SELECT
  user_id,
  SUM(CASE WHEN transaction_type = 'revenue' THEN amount ELSE 0 END) AS total_revenue,
  SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END) AS total_expenses,
  SUM(CASE WHEN transaction_type = 'revenue' THEN amount ELSE -amount END) AS net_balance,
  COUNT(*) FILTER (WHERE transaction_type = 'revenue') AS revenue_count,
  COUNT(*) FILTER (WHERE transaction_type = 'expense') AS expense_count,
  COUNT(*) AS total_transactions
FROM financial_transactions
GROUP BY user_id;

-- 3. Comentários nas views para documentação
COMMENT ON VIEW flight_statistics IS 'View com estatísticas agregadas de voos por usuário';
COMMENT ON VIEW financial_balance IS 'View com balanço financeiro agregado por usuário';

-- 4. Criar View para Resumo Financeiro Mensal
CREATE OR REPLACE VIEW monthly_financial_summary AS
SELECT
  user_id,
  DATE_TRUNC('month', transaction_date) AS month_year,
  SUM(CASE WHEN transaction_type = 'revenue' THEN amount ELSE 0 END) AS monthly_revenue,
  SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END) AS monthly_expenses,
  SUM(CASE WHEN transaction_type = 'revenue' THEN amount ELSE -amount END) AS monthly_net,
  COUNT(*) FILTER (WHERE transaction_type = 'revenue') AS monthly_revenue_count,
  COUNT(*) FILTER (WHERE transaction_type = 'expense') AS monthly_expense_count
FROM financial_transactions
GROUP BY user_id, DATE_TRUNC('month', transaction_date)
ORDER BY user_id, month_year DESC;

-- 5. Criar View para Top Categorias de Despesas
CREATE OR REPLACE VIEW top_expense_categories AS
SELECT
  ft.user_id,
  ec.name AS category_name,
  ec.icon AS category_icon,
  SUM(ft.amount) AS total_amount,
  COUNT(*) AS transaction_count,
  AVG(ft.amount) AS avg_amount
FROM financial_transactions ft
LEFT JOIN expense_categories ec ON ft.category_id = ec.id
WHERE ft.transaction_type = 'expense'
GROUP BY ft.user_id, ec.name, ec.icon
ORDER BY ft.user_id, total_amount DESC;

-- 6. Criar View para Top Categorias de Receitas
CREATE OR REPLACE VIEW top_revenue_categories AS
SELECT
  ft.user_id,
  rc.name AS category_name,
  rc.icon AS category_icon,
  SUM(ft.amount) AS total_amount,
  COUNT(*) AS transaction_count,
  AVG(ft.amount) AS avg_amount
FROM financial_transactions ft
LEFT JOIN revenue_categories rc ON ft.category_id = rc.id
WHERE ft.transaction_type = 'revenue'
GROUP BY ft.user_id, rc.name, rc.icon
ORDER BY ft.user_id, total_amount DESC;

-- 7. Remover funções existentes para evitar conflitos
DROP FUNCTION IF EXISTS get_financial_summary(UUID);
DROP FUNCTION IF EXISTS get_monthly_financial_data(UUID, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS get_category_breakdown(UUID, TEXT);

-- 8. Função RPC para Obter Resumo Financeiro Completo
CREATE OR REPLACE FUNCTION get_financial_summary(user_id UUID)
RETURNS TABLE (
  total_revenue NUMERIC,
  total_expenses NUMERIC,
  net_balance NUMERIC,
  revenue_count BIGINT,
  expense_count BIGINT,
  total_transactions BIGINT,
  avg_transaction_amount NUMERIC,
  profit_margin NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fb.total_revenue,
    fb.total_expenses,
    fb.net_balance,
    fb.revenue_count,
    fb.expense_count,
    fb.total_transactions,
    CASE 
      WHEN fb.total_transactions > 0 THEN (fb.total_revenue + fb.total_expenses) / fb.total_transactions
      ELSE 0
    END AS avg_transaction_amount,
    CASE 
      WHEN fb.total_revenue > 0 THEN (fb.net_balance / fb.total_revenue) * 100
      ELSE 0
    END AS profit_margin
  FROM financial_balance fb
  WHERE fb.user_id = get_financial_summary.user_id;
END;
$$;

-- 9. Função RPC para Obter Dados Financeiros Mensais
CREATE OR REPLACE FUNCTION get_monthly_financial_data(user_id UUID, year_param INTEGER, month_param INTEGER)
RETURNS TABLE (
  monthly_revenue NUMERIC,
  monthly_expenses NUMERIC,
  monthly_net NUMERIC,
  revenue_count BIGINT,
  expense_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mfs.monthly_revenue,
    mfs.monthly_expenses,
    mfs.monthly_net,
    mfs.monthly_revenue_count,
    mfs.monthly_expense_count
  FROM monthly_financial_summary mfs
  WHERE mfs.user_id = get_monthly_financial_data.user_id
    AND EXTRACT(YEAR FROM mfs.month_year) = year_param
    AND EXTRACT(MONTH FROM mfs.month_year) = month_param;
END;
$$;

-- 10. Função RPC para Obter Breakdown por Categoria
CREATE OR REPLACE FUNCTION get_category_breakdown(user_id UUID, transaction_type_param TEXT)
RETURNS TABLE (
  category_name TEXT,
  category_icon TEXT,
  total_amount NUMERIC,
  transaction_count BIGINT,
  avg_amount NUMERIC,
  percentage NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_for_type NUMERIC;
BEGIN
  -- Calcular total para o tipo de transação
  SELECT COALESCE(SUM(amount), 0) INTO total_for_type
  FROM financial_transactions
  WHERE financial_transactions.user_id = get_category_breakdown.user_id
    AND financial_transactions.transaction_type = transaction_type_param;

  -- Retornar breakdown por categoria
  IF transaction_type_param = 'expense' THEN
    RETURN QUERY
    SELECT 
      tec.category_name,
      tec.category_icon,
      tec.total_amount,
      tec.transaction_count,
      tec.avg_amount,
      CASE 
        WHEN total_for_type > 0 THEN (tec.total_amount / total_for_type) * 100
        ELSE 0
      END AS percentage
    FROM top_expense_categories tec
    WHERE tec.user_id = get_category_breakdown.user_id
    ORDER BY tec.total_amount DESC;
  ELSE
    RETURN QUERY
    SELECT 
      trc.category_name,
      trc.category_icon,
      trc.total_amount,
      trc.transaction_count,
      trc.avg_amount,
      CASE 
        WHEN total_for_type > 0 THEN (trc.total_amount / total_for_type) * 100
        ELSE 0
      END AS percentage
    FROM top_revenue_categories trc
    WHERE trc.user_id = get_category_breakdown.user_id
    ORDER BY trc.total_amount DESC;
  END IF;
END;
$$;

-- 11. Função RPC para Obter Tendências Financeiras (últimos 6 meses)
CREATE OR REPLACE FUNCTION get_financial_trends(user_id UUID)
RETURNS TABLE (
  month_year DATE,
  monthly_revenue NUMERIC,
  monthly_expenses NUMERIC,
  monthly_net NUMERIC,
  revenue_growth NUMERIC,
  expense_growth NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH monthly_data AS (
    SELECT 
      mfs.month_year,
      mfs.monthly_revenue,
      mfs.monthly_expenses,
      mfs.monthly_net,
      LAG(mfs.monthly_revenue) OVER (ORDER BY mfs.month_year) AS prev_revenue,
      LAG(mfs.monthly_expenses) OVER (ORDER BY mfs.month_year) AS prev_expenses
    FROM monthly_financial_summary mfs
    WHERE mfs.user_id = get_financial_trends.user_id
      AND mfs.month_year >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '6 months')
    ORDER BY mfs.month_year
  )
  SELECT 
    md.month_year,
    md.monthly_revenue,
    md.monthly_expenses,
    md.monthly_net,
    CASE 
      WHEN md.prev_revenue > 0 THEN ((md.monthly_revenue - md.prev_revenue) / md.prev_revenue) * 100
      ELSE 0
    END AS revenue_growth,
    CASE 
      WHEN md.prev_expenses > 0 THEN ((md.monthly_expenses - md.prev_expenses) / md.prev_expenses) * 100
      ELSE 0
    END AS expense_growth
  FROM monthly_data md;
END;
$$;

-- 12. Habilitar RLS nas views (se necessário)
-- Views herdam as políticas das tabelas base, mas podemos criar políticas específicas se necessário

-- 13. Comentários nas funções para documentação
COMMENT ON FUNCTION get_financial_summary(UUID) IS 'Retorna resumo financeiro completo para um usuário';
COMMENT ON FUNCTION get_monthly_financial_data(UUID, INTEGER, INTEGER) IS 'Retorna dados financeiros para um mês específico';
COMMENT ON FUNCTION get_category_breakdown(UUID, TEXT) IS 'Retorna breakdown de transações por categoria';
COMMENT ON FUNCTION get_financial_trends(UUID) IS 'Retorna tendências financeiras dos últimos 6 meses';

SELECT 'Views e funções financeiras recriadas com sucesso!' as status;
SELECT 'financial_balance, monthly_financial_summary, top_expense_categories, top_revenue_categories' as views_created;
SELECT 'get_financial_summary, get_monthly_financial_data, get_category_breakdown, get_financial_trends' as functions_created;