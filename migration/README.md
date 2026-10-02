# 🚀 Migração Completa: Supabase Cloud → PostgreSQL próprio

Banco de dados do Flight Log Opus mora agora no **PostgreSQL 16 local** deste servidor,
através de um **gateway compatível com a API do Supabase** (`/gateway`) — o aplicativo
React (via `supabase-js`) não precisou mudar: continua falando REST, mas com o
endpoint próprio em `https://fs.rsolutionsbr.com`.

```
[B app React] ──TLS──> nginx fs.rsolutionsbr.com
                         ├─ / → dist/ (estático SPA)
                         ├─ /rest/v1/*    ─┐
                         ├─ /auth/v1/*     ├──> gateway (PM2, :4001) ──> PostgreSQL 16 (:5433)
                         ├─ /storage/v1/* ─┘              (pools + RLS + claims como PostgREST)
                         └─ /api/*        ────> backend Express (PM2, :4002)
                                              └─ WS de tracking (:4003)
```

## Arquivos

| Arquivo | Papel |
|---------|-------|
| `bootstrap/10_roles.sql` | roles Supabase (anon/authenticated/service_role...) + roles app |
| `bootstrap/15_auth_compat.sql` | schema auth (users/sessions/refresh/identities) + auth.uid()/role()/email()/jwt() |
| `bootstrap/20_storage_compat.sql` | schema storage (buckets/objects NESTE banco) + policies |
| `bootstrap/25_compat_functions.sql` | exec_sql/analyze_table/update_career_data/refresh_report_views (fresh) |
| `bootstrap/30_permissions.sql` | grants finais + restrições (exec_sql/analyze via service_role) |
| `bootstrap/40_rls_compat.sql` | RLS para tabelas sem políticas (manual_airports, flight_points/sessions, devices) |
| `setup_local_db.sh` | Setup FRESH completo (schema novo, sem dados do Supabase) |
| `01_export_from_supabase.sh` | pg_dump do schema public + auth.users/sessions/refresh/identities |
| `02_restore_to_postgres.sh` | restauração + normalização de grants/RLS |
| `03_validate.sh` | contagens/sanity pós-migração |
| `migrate_all.sh` | executa tudo com SUPABASE_DB_URL |

## Passo a passo

### 1. Instalação FRESH (feito) — schema sem dados

```bash
bash migration/setup_local_db.sh
```

### 2. Migração dos dados reais do Supabase (quando fornecer a credencial)

Pegue em **Supabase → Settings → Database → Connection string (URI / Direct)**:

```bash
SUPABASE_DB_URL='postgresql://postgres.<ref>:<SENHA>@aws-0-<regiao>.pooler.supabase.com:5432/postgres' \
  bash migration/migrate_all.sh
```

Esse fluxo:
1. `pg_dump` completo de `public` (tabelas + RLS + funções + dados) e de
   `auth.users`/`auth.sessions`/`auth.refresh_tokens`/`auth.identities`
   (senhas bcrypt VÊM em hash — os logins preservam);
2. Restore no PostgreSQL local com `--clean --if-exists` (substitui objetos fresh);
3. Normaliza grants/RLS e re-executa a validação.

> ⚠️ **Segurança dos dados**: o `.db_credentials` e os dumps ficam em `migration/`
> (gitignored). O dump contém TODOS os dados dos usuários — apague depois da migração.
> A sessões/refresh tokens antigas do Supabase são restauradas; JWTs antigos caem
> (o gateway assina com próprio segredo) → usuários devem re-login uma única vez.

### 3. O que muda para o app (mecânica interna)

- `VITE_SUPABASE_URL` aponta para `https://fs.rsolutionsbr.com` (mesma origem);
- auth via gateway em `/auth/v1/*` (JWT HS256 assinado com `JWT_SECRET`);
- RLS continua valendo — `auth.uid()` lê os claims injetados por transação;
- Google OAuth disponível se `GOOGLE_CLIENT_ID/SECRET` forem definidos;
- Sem SMTP configurado, signup auto-confirma (toast diz para verificar e-mail, pode ser ignorado).

### Suporte a APIs não suportadas (fechamento consciente)

- Realtime channels (`postgres_changes`): o app NÃO usa — sem necessidade.
- Storage: buckets/objects ficam no próprio PostgreSQL (bytea) — fluxo do app coberto.
- Edge Functions / Foreign Data Wrappers: n/a para este projeto.
