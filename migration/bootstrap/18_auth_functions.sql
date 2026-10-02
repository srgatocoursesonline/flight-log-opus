-- ============================================
-- FUNÇÕES auth.* (compatível GoTrue) — SOMENTE FUNÇÕES
-- ============================================
-- Usada no fluxo de MIGRAÇÃO (dumps do Supabase): as tabelas do schema auth
-- vêm do dump autêntico; aqui garantimos apenas auth.uid()/role()/email()/jwt()
-- ANTES do restore (policies RLS de public as usam, e o pg_dump do Supabase
-- não as inclui — o dump cobre somente as tabelas filtradas).

-- Cria (ou recria preservando) as funções; idempotente.
CREATE SCHEMA IF NOT EXISTS auth;

CREATE OR REPLACE FUNCTION auth.uid()
RETURNS uuid
LANGUAGE sql STABLE
AS $$
  SELECT
    CASE
      WHEN (current_setting('request.jwt.claims', true)::jsonb ->> 'sub') IS NULL
      THEN NULL
      ELSE current_setting('request.jwt.claims', true)::jsonb ->> 'sub'
    END::uuid;
$$;

CREATE OR REPLACE FUNCTION auth.role()
RETURNS text
LANGUAGE sql STABLE
AS $$
  SELECT COALESCE(current_setting('request.jwt.claims', true)::jsonb ->> 'role', 'anon');
$$;

CREATE OR REPLACE FUNCTION auth.email()
RETURNS text
LANGUAGE sql STABLE
AS $$
  SELECT current_setting('request.jwt.claims', true)::jsonb ->> 'email';
$$;

CREATE OR REPLACE FUNCTION auth.jwt()
RETURNS jsonb
LANGUAGE sql STABLE
AS $$
  SELECT COALESCE(current_setting('request.jwt.claims', true)::jsonb, '{}'::jsonb);
$$;

GRANT USAGE ON SCHEMA auth TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA auth TO flightlog_conn;
GRANT EXECUTE ON FUNCTION auth.uid() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION auth.role() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION auth.email() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION auth.jwt() TO anon, authenticated, service_role;
