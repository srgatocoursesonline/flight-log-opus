-- ============================================
-- PERMISSÕES FINAIS + FILTRO DE FUNÇÕES SENSÍVEIS
-- ============================================
-- Aplicado APÓS o schema base (fresh ou dump). Normaliza grants para
-- anon/authenticated/service_role e restringe funções administrativas.
-- Idempotente e resiliente: cada operação sensível usa DO para
-- funcionar com ou sem a função correspondente.

-- 1. Grants de schema/tabelas públicas
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 2. Functions: Supabase permite EXECUTE por default em todas
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- 3. Funções administrativas/diagnósticas: apenas service_role
--    (redefine os granted casando por NOME em todas as assinaturas,
--    sem explodir quando a função não existe no banco fresh)
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC;

DO $$
DECLARE
  fn_name text;
  restricted_names text[] := ARRAY['exec_sql', 'analyze_table'];
BEGIN
  FOR fn_name IN
    SELECT p.proname::text
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = ANY (restricted_names)
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%I(text) FROM PUBLIC, anon, authenticated', fn_name);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%I(text) TO service_role', fn_name);
  END LOOP;
END
$$;

REVOKE ALL ON SCHEMA auth FROM PUBLIC;
REVOKE ALL ON SCHEMA storage FROM PUBLIC;

-- ============================================================
-- 4. ALIAS: get_msfs_popular_routes — o front chama este nome
--    mas os scripts locais só definem faixas com outro nome.
--    Cria apenas se o nome ainda não existir (dump do prod vence).
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'get_msfs_popular_routes'
  ) THEN
    EXECUTE $fn$
    CREATE OR REPLACE FUNCTION public.get_msfs_popular_routes(
      p_user_id UUID DEFAULT NULL,
      p_route_limit INTEGER DEFAULT 10
    )
    RETURNS JSON
    LANGUAGE plpgsql
    STABLE
    AS $body$
    DECLARE
      user_uuid UUID := COALESCE(p_user_id, auth.uid());
      route_count INTEGER := COALESCE(p_route_limit, 10);
    BEGIN
      RETURN (
        SELECT COALESCE(json_agg(route_row), '[]'::json)
        FROM (
          SELECT
            departure_icao || ' -> ' || arrival_icao AS route,
            COUNT(*) AS flight_count,
            ROUND(SUM(COALESCE(distance, 0))::numeric, 2) AS total_distance
          FROM msfs_flights
          WHERE user_id = user_uuid
          GROUP BY departure_icao, arrival_icao
          ORDER BY flight_count DESC
          LIMIT route_count
        ) AS route_row
      );
    END;
    $body$;
    $fn$;
    GRANT EXECUTE ON FUNCTION public.get_msfs_popular_routes(UUID, INTEGER) TO authenticated;
  END IF;
END
$$;
