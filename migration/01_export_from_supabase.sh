#!/usr/bin/env bash
# ============================================
# 01 — EXPORT DADOS DO SUPABASE MANAGED → dump local
# ============================================
# Requer: SUPABASE_DB_URL de acesso postalcodo direto (Session/Direct pooler):
#   postgresql://postgres.<ref>:<SENHA>@aws-0-<regiao>.pooler.supabase.com:5432/postgres
# Encontre em Dashboard Supabase → Settings → Database → Connection string (URI).
set -euo pipefail

DEST="${DEST:-supabase_full.dump}"
: "${SUPABASE_DB_URL:?export SUPABASE_DB_URL='postgres://...' e rode novamente}"

echo "==> testando conexão"
psql "$SUPABASE_DB_URL" -X -tAc "SELECT version();" | head -1 || {
  echo "ERRO: não conectou em SUPABASE_DB_URL"; exit 1;
}

echo "==> dumping schema public (tabelas + RLS + funções + triggers) e users GoTrue"
# --no-privileges: grants serão refeitos no destino (grant local pode divergir
# de roles como supabase_admin); policies RLS seguem --nos grants.
pg_dump "$SUPABASE_DB_URL" \
  --format=custom \
  --no-owner --no-privileges \
  --schema=public \
  --table='auth.users' \
  --table='auth.sessions' \
  --table='auth.refresh_tokens' \
  --table='auth.identities' \
  --file "$DEST"

echo "==> resumo do dump:"
pg_restore -l "$DEST" | grep -cE 'TABLE|SEQUENCE' | xargs echo "  objetos tabela/seq:"
pg_restore -l "$DEST" | grep -cE 'TABLE DATA' | xargs echo "  tabelas com dados:"
echo "✅ dump escrito em $DEST"
