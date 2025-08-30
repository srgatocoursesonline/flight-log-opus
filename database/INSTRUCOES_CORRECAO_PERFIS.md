# 🔧 Instruções para Correção dos Perfis de Usuário

## 📋 Problema Identificado

O sistema não estava criando automaticamente os perfis dos usuários na tabela `profiles` quando eles se registravam. Isso causava:

1. **Emails não apareciam no painel do Supabase** - porque os usuários existiam apenas na tabela `auth.users`, não na `profiles`
2. **Display name não era definido** - porque o perfil não era criado com os dados do signup
3. **Usuários não tinham configurações padrão** - categorias, status de voos, etc.

## 🛠️ Solução Implementada

Criamos dois scripts SQL que resolvem completamente o problema:

### 1. `create_profile_trigger.sql` - Trigger Automático
- Cria um trigger que automaticamente cria o perfil sempre que um novo usuário se registra
- Define o `display_name` corretamente baseado no que foi fornecido no signup
- Cria todas as configurações padrão (categorias, status, etc.)

### 2. `fix_existing_users.sql` - Correção de Usuários Existentes
- Corrige todos os usuários que já se registraram mas não têm perfil
- Cria perfis com `display_name` correto para usuários existentes
- Adiciona todas as configurações padrão que estavam faltando

## 🚀 Como Executar (Passo a Passo)

### Passo 1: Acessar o Painel do Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Selecione o projeto `zgukopxlnolrdbgamwrw`
4. No menu lateral, clique em **"SQL Editor"**

### Passo 2: Executar o Trigger (Novos Usuários)
1. No SQL Editor, clique em **"New Query"**
2. Copie todo o conteúdo do arquivo `create_profile_trigger.sql`
3. Cole no editor SQL
4. Clique em **"Run"** (botão verde)
5. ✅ Deve aparecer "Success. No rows returned" ou similar

### Passo 3: Corrigir Usuários Existentes
1. Crie uma nova query ("New Query")
2. Copie todo o conteúdo do arquivo `fix_existing_users.sql`
3. Cole no editor SQL
4. Clique em **"Run"** (botão verde)
5. ✅ Deve mostrar quantos usuários foram corrigidos

### Passo 4: Verificar se Funcionou
1. Vá para **"Authentication" > "Users"** no painel do Supabase
2. Você deve ver os emails dos usuários registrados
3. Vá para **"Table Editor" > "profiles"**
4. Você deve ver os perfis criados com `display_name` correto

## 🧪 Testar a Correção

### Teste 1: Usuários Existentes
1. Acesse o site em produção: `https://flight-log-opus.pages.dev`
2. Faça login com uma conta existente
3. ✅ O nome deve aparecer corretamente no perfil

### Teste 2: Novos Usuários
1. Crie uma nova conta no site
2. Confirme o email
3. Faça login
4. ✅ O nome fornecido no cadastro deve aparecer no perfil
5. ✅ O email deve aparecer no painel do Supabase

## 📊 O Que Foi Corrigido

### ✅ Antes da Correção:
- ❌ Emails não apareciam no painel do Supabase
- ❌ Display name sempre "Cmdte. Rodrigo" (padrão)
- ❌ Usuários sem configurações padrão
- ❌ Perfis não eram criados automaticamente

### ✅ Depois da Correção:
- ✅ Emails aparecem no painel do Supabase
- ✅ Display name usa o nome fornecido no cadastro
- ✅ Usuários têm todas as configurações padrão
- ✅ Perfis são criados automaticamente para novos usuários
- ✅ Usuários existentes foram corrigidos retroativamente

## 🔍 Verificações Adicionais

Após executar os scripts, você pode verificar no SQL Editor:

```sql
-- Verificar usuários com perfis
SELECT 
  au.email,
  p.display_name,
  p.created_at
FROM auth.users au
JOIN profiles p ON au.id = p.id
ORDER BY p.created_at DESC;

-- Verificar se o trigger foi criado
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

## 🆘 Se Algo Der Errado

Se houver algum erro durante a execução:

1. **Copie a mensagem de erro completa**
2. **Não execute novamente** sem verificar o problema
3. **Entre em contato** com os detalhes do erro

Os scripts são seguros e não afetam dados existentes, apenas adicionam o que está faltando.

---

**🎉 Após executar estes scripts, o problema estará completamente resolvido!**