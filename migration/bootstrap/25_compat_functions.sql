-- ============================================
-- FUNÇÕES DE COMPATIBILIDADE (banco fresh)
-- ============================================
-- O Supabase prod possui estas funções, mas elas não fazem parte dos
-- scripts SQL do repo. Criações equivalentes para o banco FRESH.
-- Na migração real (pg_dump do Supabase), as versões autênticas
-- substituem/convivem — este arquivo é apenas bootstrap fresh.

-- --------------------------------------------
-- exec_sql(sql_query text) → jsonb
-- Diagnóstico admin. SECURITY DEFINER; o gateway restringe EXECUTE
-- a service_role (ver 30_permissions.sql).
-- --------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'exec_sql'
  ) THEN
    EXECUTE $fn$
    CREATE OR REPLACE FUNCTION public.exec_sql(sql_query text)
    RETURNS jsonb
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $body$
    DECLARE
      result jsonb;
    BEGIN
      BEGIN
        EXECUTE format(
          'SELECT COALESCE(jsonb_agg(to_jsonb(t)), %L::jsonb) FROM (%s) t',
          '[]', sql_query
        ) INTO result;
      EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'exec_sql: %', SQLERRM;
        result := '{}'::jsonb;
      END;
      RETURN result;
    END;
    $body$;
    $fn$;
  END IF;
END
$$;

-- --------------------------------------------
-- analyze_table(table_name text) → void
-- EXECUTE/ANALYZE dinâmico sobre tabela em public (apenas service_role).
-- --------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'analyze_table'
  ) THEN
    EXECUTE $fn$
    CREATE OR REPLACE FUNCTION public.analyze_table(table_name text)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $body$
    DECLARE
      qualified text;
    BEGIN
      SELECT format('%I.%I', schemaname, tablename)
        INTO qualified
        FROM pg_tables
       WHERE schemaname IN ('public', 'storage') AND tablename = table_name
       LIMIT 1;
      IF qualified IS NULL THEN
        RAISE EXCEPTION 'tabela não encontrada: %', table_name;
      END IF;
      EXECUTE format('ANALYZE %s', qualified);
    END;
    $body$;
    $fn$;
  END IF;
END
$$;

-- --------------------------------------------
-- update_career_data(user_id uuid, data_json text) → text
-- Atualiza rating/level/class do perfil (usado pelo gerenciador de carreira)
-- --------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'update_career_data'
  ) THEN
    EXECUTE $fn$
    CREATE OR REPLACE FUNCTION public.update_career_data(user_id uuid, data_json text)
    RETURNS text
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $body$
    DECLARE
      d jsonb := data_json::jsonb;
    BEGIN
      UPDATE public.profiles SET
        total_rating   = COALESCE((d->>'totalRating')::int,  total_rating),
        career_level   = COALESCE((d->>'level')::int,        career_level),
        career_class   = COALESCE(d->>'careerClass',         career_class),
        updated_at     = now()
      WHERE id = user_id;
      RETURN json_build_object('user_id', user_id, 'ok', true)::text;
    END;
    $body$;
    $fn$;
    GRANT EXECUTE ON FUNCTION public.update_career_data(UUID, TEXT) TO authenticated;
  END IF;
END
$$;

-- --------------------------------------------
-- refresh_report_views() → void
-- Refresca as materialized views de relatórios do prod (se existirem).
-- No banco fresh sem matviews, é no-op seguro.
-- --------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'refresh_report_views'
  ) THEN
    EXECUTE $fn$
    CREATE OR REPLACE FUNCTION public.refresh_report_views()
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $body$
    DECLARE
      mv record;
    BEGIN
      FOR mv IN
        SELECT matviewname::text AS mvname FROM pg_matviews WHERE schemaname = 'public'
      LOOP
        BEGIN
          EXECUTE format('REFRESH MATERIALIZED VIEW public.%I', mv.mvname);
        EXCEPTION WHEN OTHERS THEN
          RAISE WARNING 'refresh_report_views: % (%)', mv.mvname, SQLERRM;
        END;
      END LOOP;
    END;
    $body$;
    $fn$;
    GRANT EXECUTE ON FUNCTION public.refresh_report_views() TO authenticated;
  END IF;
END
$$;
