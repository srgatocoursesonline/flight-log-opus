-- ============================================
-- SCHEMA storage COMPATÍVEL COM SUPABASE
-- ============================================
-- Reproduz buckets/objects no próprio PostgreSQL (conteúdo em bytea),
-- de modo que a Migração via pg_dump carregue também os objetos.
-- Equivale ao script database/storage/create_storage_bucket_safe.sql,
-- permitindo às aplicações (SDK supabase-js) manter o fluxo de storage.

CREATE SCHEMA IF NOT EXISTS storage;

CREATE TABLE IF NOT EXISTS storage.buckets (
  id                 text NOT NULL PRIMARY KEY,
  name               text NOT NULL,
  public             boolean DEFAULT false NOT NULL,
  file_size_limit    bigint,
  allowed_mime_types text[],
  created_at         timestamptz DEFAULT now() NOT NULL,
  updated_at         timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS storage.objects (
  id         uuid DEFAULT gen_random_uuid(),
  bucket_id  text NOT NULL REFERENCES storage.buckets(id) ON DELETE CASCADE,
  name       text NOT NULL,
  owner_id   uuid,
  owner      text,
  metadata   jsonb DEFAULT '{"size":0}'::jsonb,
  content    bytea,                 -- conteúdo do arquivo (self-hosted)
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT objects_pkey PRIMARY KEY (id),
  CONSTRAINT bucket_id_objname_unique UNIQUE (bucket_id, name)
);
CREATE INDEX IF NOT EXISTS objects_bucket_id_idx ON storage.objects (bucket_id);
CREATE INDEX IF NOT exists objects_name_idx ON storage.objects (name);

-- Funções utilitárias usadas nas policies do Supabase
CREATE OR REPLACE FUNCTION storage.foldername(name text)
RETURNS text[]
LANGUAGE plpgsql
AS $$
DECLARE
  _parts text[];
BEGIN
  IF right(name, 1) = '/' THEN
    name := left(name, length(name) - 1);
  END IF;
  _parts := string_to_array(name, '/');
  RETURN _parts[:array_length(_parts, 1) - 1];
END;
$$;

CREATE OR REPLACE FUNCTION storage.filename(name text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  _parts text[];
BEGIN
  IF right(name, 1) = '/' THEN
    name := left(name, length(name) - 1);
  END IF;
  _parts := string_to_array(name, '/');
  RETURN _parts[array_length(_parts, 1)];
END;
$$;

CREATE OR REPLACE FUNCTION storage.extension(name text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  _fname text;
  _parts text[];
BEGIN
  _fname := storage.filename(name);
  _parts := string_to_array(_fname, '.');
  IF array_length(_parts, 1) > 1 THEN
    return _parts[array_length(_parts, 1)];
  ELSE
    return '';
  END IF;
END;
$$;

-- Bucket usado pela aplicação (equivalente ao create_storage_bucket_safe.sql)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- POLICY ÉQUIVALENTES AO SCRIPT DO SUPABASE
-- ============================================
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;

CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-images');

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-images'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'avatars'
);

CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-images'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'avatars'
  AND (storage.filename(name) LIKE auth.uid()::text || '-%')
)
WITH CHECK (
  bucket_id = 'profile-images'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'avatars'
);

CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-images'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'avatars'
  AND (storage.filename(name) LIKE auth.uid()::text || '-%')
);

-- ============================================
-- GRANTS
-- ============================================
GRANT USAGE ON SCHEMA storage TO anon, authenticated, service_role, supabase_storage_admin;
GRANT ALL ON storage.buckets TO supabase_storage_admin, service_role;
GRANT ALL ON storage.objects TO supabase_storage_admin, service_role;
GRANT SELECT ON storage.buckets TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO anon, authenticated;
