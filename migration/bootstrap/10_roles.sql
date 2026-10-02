-- ============================================
-- ROLES COMPATÍVEIS COM SUPABASE (PostgreSQL próprio)
-- ============================================
-- Cria os mesmos roles que o Supabase gerenciado cria, para que
-- o schema (RLS, grants) restaurado do Supabase funcione verbatim.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN NOINHERIT BYPASSRLS;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticator') THEN
    CREATE ROLE authenticator NOLOGIN NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'supabase_auth_admin') THEN
    CREATE ROLE supabase_auth_admin NOLOGIN NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'supabase_admin') THEN
    CREATE ROLE supabase_admin NOLOGIN NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'supabase_storage_admin') THEN
    CREATE ROLE supabase_storage_admin NOLOGIN NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'supabase_realtime') THEN
    CREATE ROLE supabase_realtime NOLOGIN NOINHERIT REPLICATION;
  END IF;
END
$$;

-- papéis de app rocoped aos roles Supabase para SET ROLE funcionar
-- (o app principal conecta como :app_role)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'flightlog_app') THEN
    CREATE ROLE flightlog_app LOGIN NOSUPERUSER INHERIT NOCREATEDB NOCREATEROLE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'flightlog_conn') THEN
    CREATE ROLE flightlog_conn LOGIN NOSUPERUSER INHERIT NOCREATEDB NOCREATEROLE;
  END IF;
END
$$;
