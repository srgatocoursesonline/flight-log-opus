-- ============================================
-- SCHEMA auth COMPATÍVEL COM SUPABASE (GoTrue)
-- ============================================
-- Reproduz o subset do schema auth que o gateway utiliza:
-- users, sessions, refresh_tokens + funções auth.uid()/auth.role()
--
-- IMPORTANTE: quando a migração real (pg_dump do Supabase) for executada,
-- este schema é derrubado e substituído pelo dump autêntico (restore.sh).
-- Este bootstrap serve para a instalação FRESH (sem dump disponível).

CREATE SCHEMA IF NOT EXISTS auth;

-- ============================================
-- TABELA USERS
-- ============================================
CREATE TABLE IF NOT EXISTS auth.users (
  instance_id              uuid,
  id                       uuid NOT NULL UNIQUE,
  aud                      varchar(255),
  role                     varchar(255),
  email                    varchar(255),
  encrypted_password       varchar(255),
  email_confirmed_at       timestamptz,
  invited_at               timestamptz,
  confirmation_token       varchar(255),
  confirmed_at             timestamptz,
  confirmation_sent_at     timestamptz,
  recovery_token           varchar(255),
  recovery_sent_at         timestamptz,
  email_change_token_new   varchar(255),
  email_change             varchar(255),
  email_change_sent_at     timestamptz,
  email_change_token_current varchar(255),
  email_change_confirm_status smallint DEFAULT 0 NOT NULL CHECK (email_change_confirm_status between 0 and 2),
  next_email_change_confirm_status smallint DEFAULT 0 NOT NULL CHECK (next_email_change_confirm_status between 0 and 2),
  last_sign_in_at          timestamptz,
  raw_app_meta_data        jsonb DEFAULT '{"provider":"email","providers":["email"]}'::jsonb,
  raw_user_meta_data       jsonb DEFAULT '{}'::jsonb,
  is_super_admin           boolean,
  created_at               timestamptz DEFAULT now(),
  updated_at               timestamptz DEFAULT now(),
  phone                    varchar(255) DEFAULT NULL,
  phone_confirmed_at       timestamptz,
  phone_change             varchar(255) DEFAULT '',
  phone_change_token       varchar(255) DEFAULT '',
  phone_change_sent_at     timestamptz,
  phone_change_confirm_status smallint DEFAULT 0 NOT NULL CHECK (phone_change_confirm_status between 0 and 2),
  next_phone_change_confirm_status smallint DEFAULT 0 NOT NULL CHECK (next_phone_change_confirm_status between 0 and 2),
  banned_until             timestamptz,
  reauthentication_token   varchar(255) DEFAULT '',
  reauthentication_sent_at timestamptz,
  flow_state_id            uuid,
  deleted_at               timestamptz,
  is_sso_user              boolean DEFAULT false NOT NULL,
  is_anonymous             boolean DEFAULT false NOT NULL,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_email_key UNIQUE (email),
  CONSTRAINT users_phone_key UNIQUE (phone)
);

CREATE INDEX IF NOT EXISTS users_instance_id_email_idx ON auth.users (instance_id, lower(email));
COMMENT ON TABLE auth.users IS 'Usuários GoTrue (compatível com Supabase)';

-- ============================================
-- TABELA SESSIONS
-- ============================================
CREATE TABLE IF NOT EXISTS auth.sessions (
  id                 uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id            uuid NOT NULL,
  created_at         timestamptz DEFAULT now(),
  updated_at         timestamptz DEFAULT now(),
  factor_id          uuid,
  aal                text,
  amr                jsonb,
  user_agent         text,
  ip                 inet,
  tag                text,
  not_after          timestamptz DEFAULT now() + interval '5 seconds',
  refresh_token_id   bigint,
  deleted_at         timestamptz,
  CONSTRAINT sessions_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON auth.sessions (user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS sessions_not_after_idx ON auth.sessions (not_after) WHERE deleted_at IS NULL;

-- ============================================
-- TABELA REFRESH_TOKENS
-- ============================================
CREATE SEQUENCE IF NOT EXISTS auth.refresh_tokens_id_seq START 1000000000;

CREATE TABLE IF NOT EXISTS auth.refresh_tokens (
  id             bigint NOT NULL DEFAULT nextval('auth.refresh_tokens_id_seq'),
  token          varchar(255) NOT NULL,
  session_id     uuid NOT NULL REFERENCES auth.sessions(id),
  user_id        uuid NOT NULL REFERENCES auth.users(id),
  revoked        boolean DEFAULT false,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now(),
  parent         varchar(255),
  instance_id    uuid,
  CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id),
  CONSTRAINT refresh_tokens_token_key UNIQUE (token)
);

CREATE INDEX IF NOT EXISTS refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens (session_id, revoked);
CREATE INDEX IF NOT EXISTS refresh_tokens_instance_id_idx ON auth.refresh_tokens (instance_id);
CREATE INDEX IF NOT EXISTS refresh_tokens_parent_idx ON auth.refresh_tokens (parent);
CREATE INDEX IF NOT EXISTS refresh_tokens_updated_at_id_idx ON auth.refresh_tokens (updated_at, id);

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;

-- ============================================
-- IDENTITIES (espelha GoTrue; útil para OAuth/import)
-- ============================================
CREATE TABLE IF NOT EXISTS auth.identities (
  id             text NOT NULL,
  user_id        uuid NOT NULL REFERENCES auth.users(id),
  provider_id    text NOT NULL,
  identity_data  jsonb DEFAULT '{}'::jsonb NOT NULL,
  provider       text NOT NULL,
  last_sign_in_at timestamptz,
  created_at     timestamptz DEFAULT now() NOT NULL,
  updated_at     timestamptz DEFAULT now() NOT NULL,
  email          varchar(255) GENERATED ALWAYS AS (identity_data->>'email') STORED,
  CONSTRAINT identities_pkey PRIMARY KEY (provider, id)
);
CREATE INDEX IF NOT EXISTS identities_user_id_idx ON auth.identities (user_id);
CREATE INDEX IF NOT EXISTS identities_email_idx ON auth.identities (email);

-- ============================================
-- FUNÇÕES auth.* (mesma assinatura do Supabase)
-- Leitura dos claims do JWT via GUC request.jwt.claims,
-- exatamente como o PostgREST/GoTrue fazem.
-- ============================================
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

-- ============================================
-- GRANTS
-- ============================================
GRANT USAGE ON SCHEMA auth TO anon, authenticated, service_role;
-- flightlog_conn é o usuário de conexão do gateway (operações de auth)
GRANT USAGE ON SCHEMA auth TO flightlog_conn;
GRANT ALL ON TABLE auth.users TO flightlog_conn;
GRANT ALL ON TABLE auth.sessions TO flightlog_conn;
GRANT ALL ON TABLE auth.refresh_tokens TO flightlog_conn;
GRANT ALL ON TABLE auth.identities TO flightlog_conn;
GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO flightlog_conn;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE auth.sessions TO service_role;
GRANT SELECT ON TABLE auth.users TO service_role;
GRANT SELECT ON TABLE auth.identities TO service_role, authenticated;
GRANT EXECUTE ON FUNCTION auth.uid() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION auth.role() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION auth.email() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION auth.jwt() TO anon, authenticated, service_role;
