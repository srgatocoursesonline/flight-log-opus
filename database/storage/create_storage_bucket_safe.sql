-- ============================================
-- SCRIPT SEGURO PARA CRIAR BUCKET DE STORAGE
-- ============================================
-- Execute este script no SQL Editor do Supabase para criar o bucket de imagens de perfil
-- Este script é seguro para re-execução

BEGIN;

-- Criar bucket para imagens de perfil se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;

-- Criar política para permitir que usuários vejam todas as imagens públicas
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-images');

-- Criar política para permitir que usuários autenticados façam upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'avatars'
);

-- Criar política para permitir que usuários atualizem suas próprias imagens
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

-- Criar política para permitir que usuários deletem suas próprias imagens
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'avatars'
  AND (storage.filename(name) LIKE auth.uid()::text || '-%')
);

-- Verificar se o bucket foi criado
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id = 'profile-images';

-- Verificar políticas criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects'
AND (policyname LIKE '%profile%' OR policyname LIKE '%Public Access%' OR policyname LIKE '%Authenticated%' OR policyname LIKE '%Users can%');

COMMIT;

-- ============================================
-- INSTRUÇÕES DE USO
-- ============================================
-- 1. Copie todo este código
-- 2. Vá para o Supabase Dashboard
-- 3. Acesse SQL Editor
-- 4. Cole o código e execute
-- 5. Verifique se o bucket foi criado em Storage
-- 6. Teste o upload de imagem na aplicação
-- ============================================

-- ============================================
-- CONFIGURAÇÕES DO BUCKET
-- ============================================
-- - Nome: profile-images
-- - Público: Sim (para permitir acesso direto às imagens)
-- - Limite de tamanho: 5MB por arquivo
-- - Tipos permitidos: JPEG, PNG, WebP, GIF
-- - Pasta: avatars/ (organização)
-- - Segurança: Usuários só podem gerenciar suas próprias imagens
-- ============================================