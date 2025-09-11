# Guia de Configuração do Supabase

Este documento explica como configurar corretamente o Supabase para o projeto Flight Log Opus.

## 1. Configuração inicial

### 1.1 Crie uma conta no Supabase

- Acesse [https://supabase.com](https://supabase.com)
- Crie uma conta e um novo projeto

### 1.2 Execute o script SQL para criar o esquema

Depois de criar o projeto no Supabase:

1. Navegue até **SQL Editor**
2. Cole o conteúdo do arquivo `src/db/supabase/schema/complete-schema.sql`
3. Execute o script para criar todas as tabelas necessárias
4. Execute o arquivo `src/db/supabase/schema/update-flights-schema.sql` para adicionar os campos mais recentes

## 2. Configuração das variáveis de ambiente

### 2.1 Obtenha as credenciais do Supabase

1. No dashboard do Supabase, vá para **Project Settings > API**
2. Copie a URL do projeto (`Project URL`) e a chave anônima (`anon key`)

### 2.2 Configure o arquivo .env.local

1. Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```
VITE_SUPABASE_URL=sua_url_do_projeto
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

2. Substitua os valores pelos que você copiou do dashboard do Supabase

## 3. Verificação da configuração

### 3.1 Teste a conexão

1. Execute `npm run dev` para iniciar o servidor de desenvolvimento
2. Abra o console do navegador e verifique se não há erros relacionados ao Supabase
3. Tente fazer login ou criar uma conta para verificar se a autenticação está funcionando

### 3.2 Solução de problemas comuns

- **Erro "Variáveis de ambiente são obrigatórias"**: Verifique se o arquivo `.env.local` está na raiz do projeto e se as variáveis estão definidas corretamente.
- **Erro de CORS**: No Supabase, vá para **Project Settings > API** e certifique-se de que a URL do seu site está na lista de URLs permitidos.
- **Erro de autenticação**: Verifique se a chave anônima está correta.
- **Erro de tabelas não encontradas**: Verifique se você executou os scripts SQL corretamente.

## 4. Alterações no esquema do banco de dados

Para manter o esquema do banco de dados atualizado:

1. Crie arquivos SQL com as alterações necessárias em `src/db/supabase/schema/`
2. Execute os scripts no SQL Editor do Supabase
3. Atualize as interfaces TypeScript em `src/lib/supabase.ts` para refletir as alterações

## 5. Recursos adicionais

- [Documentação do Supabase](https://supabase.io/docs)
- [Guia do Supabase para React](https://supabase.io/docs/guides/with-react)
- [Autenticação do Supabase](https://supabase.io/docs/guides/auth)

---

Se você tiver qualquer problema de conexão com o banco de dados, verifique primeiro se:

1. As variáveis de ambiente estão configuradas corretamente
2. O projeto no Supabase está ativo
3. O esquema do banco de dados foi criado corretamente
4. Não há restrições de rede impedindo a conexão