# Instruções para Correção Completa do Schema

## Problema Identificado
O erro "Could not find the 'achievements' column of 'profiles' in the schema cache" indica que as colunas necessárias não existem no banco de dados do Supabase.

## Solução: Execute os Scripts SQL

### 1. Adicionar Colunas à Tabela Profiles

1. Acesse o **Supabase Dashboard**
2. Vá para **SQL Editor**
3. Execute o script `add_achievements_column.sql`:

```sql
-- Copie e cole este código no SQL Editor
BEGIN;

-- Adicionar coluna achievements se não existir
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS achievements TEXT DEFAULT '';

-- Adicionar coluna perfect_flights se não existir
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS perfect_flights INTEGER DEFAULT 0;

-- Adicionar coluna career_started se não existir
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS career_started TEXT;

-- Adicionar coluna description se não existir
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';

COMMIT;
```

### 2. Criar Bucket de Storage para Imagens

1. No mesmo **SQL Editor**, execute o script `create_storage_bucket.sql`:

```sql
-- Copie e cole este código no SQL Editor
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

-- Criar política para permitir que usuários vejam todas as imagens públicas
CREATE POLICY IF NOT EXISTS "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-images');

-- Criar política para permitir que usuários autenticados façam upload
CREATE POLICY IF NOT EXISTS "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'avatars'
);

-- Criar política para permitir que usuários atualizem suas próprias imagens
CREATE POLICY IF NOT EXISTS "Users can update own images"
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
CREATE POLICY IF NOT EXISTS "Users can delete own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'avatars'
  AND (storage.filename(name) LIKE auth.uid()::text || '-%')
);

COMMIT;
```

## Verificação

Após executar os scripts:

1. **Verifique as colunas criadas:**
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
```

2. **Verifique o bucket criado:**
```sql
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets 
WHERE id = 'profile-images';
```

3. **Teste a aplicação:**
   - Recarregue a página
   - Tente editar o perfil
   - Teste o upload de foto

## Resultado Esperado

Após executar os scripts:
- ✅ O erro de schema será resolvido
- ✅ O modal de edição funcionará corretamente
- ✅ O upload de fotos estará disponível
- ✅ Todos os campos editáveis estarão funcionais

## Suporte

Se ainda houver problemas:
1. Verifique se você está no projeto correto no Supabase
2. Confirme se os scripts foram executados sem erros
3. Recarregue completamente a aplicação (Ctrl+F5)